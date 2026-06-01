import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

/**
 * Asserts that the session user has one of the allowed roles.
 * Blocks deactivated users from accessing any protected resource.
 * Throws "Unauthorized" if no session or user is inactive.
 * Throws "Forbidden: insufficient permissions" if role is not in allowedRoles.
 */
export async function assertRole(
  session: { user: { id: string } } | null,
  allowedRoles: UserRole[]
): Promise<void> {
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    throw new Error("Unauthorized");
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden: insufficient permissions");
  }
}

/**
 * Asserts that a user has access to the specified office.
 * Super_Admin has global access to all offices.
 * Admin is restricted to their assigned office only.
 * Blocks deactivated users.
 */
export async function assertOfficeAccess(
  userId: string,
  officeId: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, officeId: true, isActive: true },
  });

  if (!user || !user.isActive) {
    throw new Error("Unauthorized");
  }

  // Super_Admin has global access
  if (user.role === "SUPER_ADMIN") {
    return;
  }

  // Admin and End_User are restricted to their assigned office
  if (user.officeId !== officeId) {
    throw new Error("Forbidden: no access to this office");
  }
}
