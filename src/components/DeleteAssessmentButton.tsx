"use client";

import { useTransition } from "react";
import { deleteAssessment } from "@/actions/assessment";

interface DeleteAssessmentButtonProps {
  assessmentId: string;
}

export default function DeleteAssessmentButton({
  assessmentId,
}: DeleteAssessmentButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this assessment?")) {
      return;
    }

    startTransition(async () => {
      await deleteAssessment(assessmentId);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
