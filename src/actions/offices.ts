"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertRole } from "@/lib/authorization";

const officeSchema = z.object({
  name: z.string().min(1, "Office name is required").max(100, "Office name must be 100 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional().nullable(),
});

/**
 * Creates a new office. Requires Super_Admin role.
 */
export async function createOffice(data: { name: string; description?: string | null }) {
  const session = await getServerSession(authOptions);
  await assertRole(session, ["SUPER_ADMIN"]);

  const parsed = officeSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid office data");
  }

  const office = await prisma.office.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    },
  });

  revalidatePath("/super-admin/offices");
  return office;
}

/**
 * Updates an existing office. Requires Super_Admin role.
 */
export async function updateOffice(
  officeId: string,
  data: { name: string; description?: string | null }
) {
  const session = await getServerSession(authOptions);
  await assertRole(session, ["SUPER_ADMIN"]);

  const parsed = officeSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid office data");
  }

  const office = await prisma.office.update({
    where: { id: officeId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    },
  });

  revalidatePath("/super-admin/offices");
  return office;
}

/**
 * Deletes an office. Requires Super_Admin role.
 * Unassigns all users from the office before deletion.
 */
export async function deleteOffice(officeId: string) {
  const session = await getServerSession(authOptions);
  await assertRole(session, ["SUPER_ADMIN"]);

  // Unassign all users from this office before deleting
  await prisma.user.updateMany({
    where: { officeId },
    data: { officeId: null },
  });

  await prisma.office.delete({
    where: { id: officeId },
  });

  revalidatePath("/super-admin/offices");
}

/**
 * Returns all offices with user counts. Requires Super_Admin role.
 */
export async function getOffices() {
  const session = await getServerSession(authOptions);
  await assertRole(session, ["SUPER_ADMIN"]);

  const offices = await prisma.office.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { users: true, assessments: true },
      },
      users: {
        select: { id: true, role: true },
      },
    },
  });

  return offices.map((office) => ({
    id: office.id,
    name: office.name,
    description: office.description,
    createdAt: office.createdAt,
    updatedAt: office.updatedAt,
    adminCount: office.users.filter((u) => u.role === "ADMIN").length,
    endUserCount: office.users.filter((u) => u.role === "END_USER").length,
    totalUsers: office._count.users,
    assessmentCount: office._count.assessments,
  }));
}

/**
 * Assigns an Admin user to an office. Requires Super_Admin role.
 */
export async function assignAdminToOffice(userId: string, officeId: string) {
  const session = await getServerSession(authOptions);
  await assertRole(session, ["SUPER_ADMIN"]);

  // Verify the target user exists and is an Admin
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!targetUser) {
    throw new Error("User not found");
  }

  if (targetUser.role !== "ADMIN") {
    throw new Error("Only Admin users can be assigned to offices");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { officeId },
  });

  revalidatePath("/super-admin/offices");
}
