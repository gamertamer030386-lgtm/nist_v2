import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EndUserTasksClient from "./EndUserTasksClient";

export default async function EndUserTasksPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch tasks assigned to the current user
  const tasks = await prisma.taskAssignment.findMany({
    where: { assignedToId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      assignedBy: {
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
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="mt-1 text-sm text-gray-500">
          Assessment tasks assigned to you by your administrator.
        </p>
      </div>
      <EndUserTasksClient tasks={tasks} />
    </div>
  );
}
