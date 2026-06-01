import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminTaskManagementClient from "./AdminTaskManagementClient";

export default async function AdminTasksPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Assign assessments to End Users in your office.
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

  // Fetch End_Users in the Admin's office for the assignment form
  const officeUsers = await prisma.user.findMany({
    where: {
      officeId: currentUser.officeId,
      role: "END_USER",
      isActive: true,
    },
    orderBy: [{ name: "asc" }, { email: "asc" }],
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  // Fetch existing tasks created by this admin (or all tasks for the office)
  const tasks = await prisma.taskAssignment.findMany({
    where: {
      assignedBy: { officeId: currentUser.officeId },
    },
    orderBy: { createdAt: "desc" },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
      assessment: {
        select: { id: true, name: true },
      },
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Assign assessments to End Users in{" "}
          <span className="font-medium">{currentUser.office.name}</span>.
        </p>
      </div>
      <AdminTaskManagementClient
        officeUsers={officeUsers}
        tasks={tasks}
        officeName={currentUser.office.name}
      />
    </div>
  );
}
