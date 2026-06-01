"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTaskAssignment } from "@/actions/tasks";

interface OfficeUser {
  id: string;
  email: string;
  name: string | null;
}

interface TaskData {
  id: string;
  assignedToId: string;
  assignedById: string;
  assessmentId: string | null;
  deadline: Date;
  instructions: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  createdAt: Date;
  updatedAt: Date;
  assignedTo: {
    id: string;
    name: string | null;
    email: string;
  };
  assessment: {
    id: string;
    name: string;
  } | null;
}

interface Props {
  officeUsers: OfficeUser[];
  tasks: TaskData[];
  officeName: string;
}

function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-800";
    case "COMPLETED":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminTaskManagementClient({
  officeUsers,
  tasks,
  officeName,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [assignedToId, setAssignedToId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [instructions, setInstructions] = useState("");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!assignedToId) {
      setError("Please select a user to assign the task to");
      return;
    }
    if (!deadline) {
      setError("Please set a deadline");
      return;
    }

    startTransition(async () => {
      try {
        await createTaskAssignment({
          assignedToId,
          deadline,
          instructions: instructions.trim() || null,
        });
        setShowCreateForm(false);
        setAssignedToId("");
        setDeadline("");
        setInstructions("");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create task");
      }
    });
  }

  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");
  const activeTasks = tasks.filter((t) => t.status !== "COMPLETED");

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 font-medium underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Create Task Button / Form */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          {showCreateForm ? "Cancel" : "Assign New Task"}
        </button>
      </div>

      {showCreateForm && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Assign New Assessment Task
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label
                htmlFor="task-user"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Assign to End User <span className="text-red-500">*</span>
              </label>
              <select
                id="task-user"
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select a user...</option>
                {officeUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="task-deadline"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Deadline <span className="text-red-500">*</span>
              </label>
              <input
                id="task-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="task-instructions"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Instructions
              </label>
              <textarea
                id="task-instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                maxLength={2000}
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Optional instructions for the assessment..."
              />
              <p className="mt-1 text-xs text-gray-500">
                {instructions.length}/2000 characters
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isPending ? "Assigning..." : "Assign Task"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Tasks */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Active Tasks
        </h2>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Deadline
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Instructions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {activeTasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    No active tasks. Click &quot;Assign New Task&quot; to create
                    one.
                  </td>
                </tr>
              ) : (
                activeTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {task.assignedTo.name || task.assignedTo.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDate(task.deadline)}
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClasses(task.status)}`}
                      >
                        {task.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {task.instructions || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Completed Submissions */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Submitted Assessments
        </h2>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Assessment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Completed
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {completedTasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    No submitted assessments yet.
                  </td>
                </tr>
              ) : (
                completedTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {task.assignedTo.name || task.assignedTo.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {task.assessment?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDate(task.updatedAt)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      {task.assessment && (
                        <Link
                          href={`/assessments/${task.assessment.id}/dashboard`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Results
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
