import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OfficeManagementClient from "./OfficeManagementClient";

export default async function SuperAdminOfficesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/assessments");
  }

  const offices = await prisma.office.findMany({
    orderBy: { name: "asc" },
    include: {
      users: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });

  const officeData = offices.map((office) => ({
    id: office.id,
    name: office.name,
    description: office.description,
    adminCount: office.users.filter((u) => u.role === "ADMIN").length,
    endUserCount: office.users.filter((u) => u.role === "END_USER").length,
  }));

  // Get all Admin users for the assignment dropdown
  const adminUsers = await prisma.user.findMany({
    where: { role: "ADMIN", isActive: true },
    select: { id: true, name: true, email: true, officeId: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Office Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create and manage offices, assign administrators.
        </p>
      </div>
      <OfficeManagementClient offices={officeData} adminUsers={adminUsers} />
    </div>
  );
}
