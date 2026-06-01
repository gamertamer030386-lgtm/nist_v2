"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { startTaskAssessment, submitAssessment } from "@/actions/tasks";

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
  assignedBy: {
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
  tasks: TaskData[];
}

function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "COMPLETED":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isOverdue(deadline: Date, status: string): boolean {
  if (status === "COMPLETED") return false;
  return new Date(deadline) < new Date();
}

export default function EndUserTasksClient({ tasks }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [actionTaskId, setActionTaskId] = useState<string | null>(null);

  function handleStartAssessment(taskId: string) {
    setError(null);
    setActionTaskId(taskId);
    startTransition(async () => {
      try {
        const result = await startTaskAssessment(taskId);
        router.push(`/assessments/${result.assessment.id}`);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to start assessment"
        );
        setActionTaskId(null);
      }
    });
  }

  function handleSubmitAssessment(taskId: string, assessmentId: string) {
    if (
      !confirm(
        "Are you sure you want to submit this assessment? This action cannot be undone."
      )
    ) {
      return;
    }
    setError(null);
    setActionTaskId(taskId);
    startTransition(async () => {
      try {
        await submitAssessment(taskId, assessmentId);
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to submit assessment"
        );
      } finally {
        setActionTaskId(null);
      }
    });
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <svg
            className="h-6 w-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
            />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-900">No tasks assigned</h3>
        <p className="mt-1 text-sm text-gray-500">
          You don&apos;t have any assessment tasks yet. Your administrator will
          assign tasks when needed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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

      {tasks.map((task) => (
        <div
          key={task.id}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClasses(task.status)}`}
                >
                  {task.status.replace("_", " ")}
                </span>
                {isOverdue(task.deadline, task.status) && (
                  <span className="inline-flex items-center rounded-full bg-red-100 border border-red-200 px-2.5 py-0.5 text-xs font-medium text-red-800">
                    Overdue
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned By
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {task.assignedBy.name || task.assignedBy.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deadline
                  </p>
                  <p
                    className={`mt-1 text-sm ${isOverdue(task.deadline, task.status) ? "text-red-600 font-medium" : "text-gray-900"}`}
                  >
                    {formatDate(task.deadline)}
                  </p>
                </div>
              </div>

              {task.instructions && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instructions
                  </p>
                  <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                    {task.instructions}
                  </p>
                </div>
              )}

              {task.assessment && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assessment
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {task.assessment.name}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="ml-4 flex flex-col gap-2">
              {task.status === "PENDING" && (
                <button
                  onClick={() => handleStartAssessment(task.id)}
                  disabled={isPending && actionTaskId === task.id}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  {isPending && actionTaskId === task.id
                    ? "Starting..."
                    : "Start Assessment"}
                </button>
              )}

              {task.status === "IN_PROGRESS" && task.assessment && (
                <>
                  <Link
                    href={`/assessments/${task.assessment.id}`}
                    className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors text-center whitespace-nowrap"
                  >
                    Continue Assessment
                  </Link>
                  <button
                    onClick={() =>
                      handleSubmitAssessment(task.id, task.assessment!.id)
                    }
                    disabled={isPending && actionTaskId === task.id}
                    className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {isPending && actionTaskId === task.id
                      ? "Submitting..."
                      : "Submit"}
                  </button>
                </>
              )}

              {task.status === "COMPLETED" && task.assessment && (
                <Link
                  href={`/assessments/${task.assessment.id}/dashboard`}
                  className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors text-center whitespace-nowrap"
                >
                  View Results
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
