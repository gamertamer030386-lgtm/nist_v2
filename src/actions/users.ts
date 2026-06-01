"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertRole } from "@/lib/authorization";

// ─── Validation Schemas ──────────────────────────────────────────────────────

const createUserSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().max(100, "Name must be 100 characters or less").optional().nullable(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "END_USER"]),
  officeId: z.string().optional().nullable(),
});

const updateUserSchema = z.object({
  name: z.string().max(100, "Name must be 100 characters or less").optional().nullable(),
  email: z.string().email("Valid email is required").optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "END_USER"]).optional(),
  officeId: z.string().optional().nullable(),
});

// ─── Helper ──────────────────────────────────────────────────────────────────

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, officeId: true, isActive: true },
  });
  if (!user || !user.isActive) {
    throw new Error("Unauthorized");
  }
  return { session, user };
}

// ─── Server Actions ──────────────────────────────────────────────────────────

/**
 * Creates a new user. 
 * Super_Admin can create any user with any role.
 * Admin can only create End_Users within their assigned office.
 */
export async function createUser(data: {
  email: string;
  password: string;
  name?: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "END_USER";
  officeId?: string | null;
}) {
  const { session, user: currentUser } = await getSessionUser();
  await assertRole(session, ["SUPER_ADMIN", "ADMIN"]);

  const parsed = createUserSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid user data");
  }

  const { email, password, name, role, officeId } = parsed.data;

  // Admin restrictions: can only create End_Users in their own office
  if (currentUser.role === "ADMIN") {
    if (role !== "END_USER") {
      throw new Error("Forbidden: Admins can only create End_User accounts");
    }
    if (!currentUser.officeId) {
      throw new Error("Forbidden: Admin is not assigned to an office");
    }
    // Admin's created users are always assigned to the Admin's office
    if (officeId && officeId !== currentUser.officeId) {
      throw new Error("Forbidden: Admins can only create users in their own office");
    }
  }

  // Check for duplicate email
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existingUser) {
    throw new Error("A user with this email already exists");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Determine office assignment
  const assignedOfficeId = currentUser.role === "ADMIN" ? currentUser.officeId : (officeId ?? null);

  const newUser = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: name ?? null,
      role,
      officeId: assignedOfficeId,
    },
  });

  revalidatePath("/super-admin/users");
  revalidatePath("/admin/users");

  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
    officeId: newUser.officeId,
    isActive: newUser.isActive,
  };
}

/**
 * Updates an existing user.
 * Super_Admin can edit any user and assign any role.
 * Admin can only edit End_Users within their assigned office.
 */
export async function updateUser(
  userId: string,
  data: {
    name?: string | null;
    email?: string;
    role?: "SUPER_ADMIN" | "ADMIN" | "END_USER";
    officeId?: string | null;
  }
) {
  const { session, user: currentUser } = await getSessionUser();
  await assertRole(session, ["SUPER_ADMIN", "ADMIN"]);

  const parsed = updateUserSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid user data");
  }

  // Fetch target user
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, officeId: true, email: true },
  });

  if (!targetUser) {
    throw new Error("User not found");
  }

  // Admin restrictions
  if (currentUser.role === "ADMIN") {
    // Admin can only edit End_Users
    if (targetUser.role !== "END_USER") {
      throw new Error("Forbidden: Admins can only edit End_User accounts");
    }
    // Admin can only edit users in their own office
    if (!currentUser.officeId || targetUser.officeId !== currentUser.officeId) {
      throw new Error("Forbidden: Admins can only edit users in their own office");
    }
    // Admin cannot change role
    if (parsed.data.role && parsed.data.role !== "END_USER") {
      throw new Error("Forbidden: Admins cannot change user roles beyond End_User");
    }
    // Admin cannot reassign to different office
    if (parsed.data.officeId !== undefined && parsed.data.officeId !== currentUser.officeId) {
      throw new Error("Forbidden: Admins cannot reassign users to a different office");
    }
  }

  // Check email uniqueness if email is being changed
  if (parsed.data.email && parsed.data.email !== targetUser.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    });
    if (existingUser) {
      throw new Error("A user with this email already exists");
    }
  }

  // Build update data
  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name ?? null;
  if (parsed.data.email) updateData.email = parsed.data.email;
  if (parsed.data.role && currentUser.role === "SUPER_ADMIN") updateData.role = parsed.data.role;
  if (parsed.data.officeId !== undefined && currentUser.role === "SUPER_ADMIN") {
    updateData.officeId = parsed.data.officeId ?? null;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  revalidatePath("/super-admin/users");
  revalidatePath("/admin/users");

  return {
    id: updatedUser.id,
    email: updatedUser.email,
    name: updatedUser.name,
    role: updatedUser.role,
    officeId: updatedUser.officeId,
    isActive: updatedUser.isActive,
  };
}

/**
 * Deactivates a user (soft delete - sets isActive to false).
 * Super_Admin can deactivate any user.
 * Admin can only deactivate End_Users within their assigned office.
 */
export async function deactivateUser(userId: string) {
  const { session, user: currentUser } = await getSessionUser();
  await assertRole(session, ["SUPER_ADMIN", "ADMIN"]);

  // Fetch target user
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, officeId: true },
  });

  if (!targetUser) {
    throw new Error("User not found");
  }

  // Prevent self-deactivation
  if (targetUser.id === currentUser.id) {
    throw new Error("Cannot deactivate your own account");
  }

  // Admin restrictions
  if (currentUser.role === "ADMIN") {
    if (targetUser.role !== "END_USER") {
      throw new Error("Forbidden: Admins can only deactivate End_User accounts");
    }
    if (!currentUser.officeId || targetUser.officeId !== currentUser.officeId) {
      throw new Error("Forbidden: Admins can only deactivate users in their own office");
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });

  revalidatePath("/super-admin/users");
  revalidatePath("/admin/users");
}

/**
 * Gets all users in a specific office. 
 * Super_Admin can view any office's users.
 * Admin can only view users in their own office.
 */
export async function getOfficeUsers(officeId: string) {
  const { session, user: currentUser } = await getSessionUser();
  await assertRole(session, ["SUPER_ADMIN", "ADMIN"]);

  // Admin can only view their own office
  if (currentUser.role === "ADMIN") {
    if (!currentUser.officeId || currentUser.officeId !== officeId) {
      throw new Error("Forbidden: Admins can only view users in their own office");
    }
  }

  const users = await prisma.user.findMany({
    where: { officeId },
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      officeId: true,
      isActive: true,
      createdAt: true,
      office: { select: { id: true, name: true } },
    },
  });

  return users;
}

/**
 * Gets all users in the system. Requires Super_Admin role.
 */
export async function getAllUsers() {
  const session = await getServerSession(authOptions);
  await assertRole(session, ["SUPER_ADMIN"]);

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      officeId: true,
      isActive: true,
      createdAt: true,
      office: { select: { id: true, name: true } },
    },
  });

  return users;
}
