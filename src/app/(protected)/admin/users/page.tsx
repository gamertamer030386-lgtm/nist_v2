import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminUserManagementClient from "./AdminUserManagementClient";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  // Only ADMIN and SUPER_ADMIN can access
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    redirect("/assessments");
  }

  // Get the current user's office
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { officeId: true, office: { select: { id: true, name: true } } },
  });

  if (!currentUser?.officeId || !currentUser.office) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage End Users in your office.
          </p>
        </div>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
          <p className="text-sm text-yellow-800">
            You are not assigned to an office. Please contact a Super Admin to be assigned to an office.
          </p>
        </div>
      </div>
    );
  }

  // Fetch End_Users in the Admin's office
  const users = await prisma.user.findMany({
    where: {
      officeId: currentUser.officeId,
      role: "END_USER",
    },
    orderBy: [{ name: "asc" }, { email: "asc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      officeId: true,
      isActive: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage End Users in <span className="font-medium">{currentUser.office.name}</span>.
        </p>
      </div>
      <AdminUserManagementClient
        users={users}
        officeName={currentUser.office.name}
        officeId={currentUser.officeId}
      />
    </div>
  );
}
