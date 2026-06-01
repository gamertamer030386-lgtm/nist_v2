import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UserManagementClient from "./UserManagementClient";

export default async function SuperAdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/assessments");
  }

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

  const offices = await prisma.office.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create and manage users, assign roles and offices.
        </p>
      </div>
      <UserManagementClient users={users} offices={offices} />
    </div>
  );
}
