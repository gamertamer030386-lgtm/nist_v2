"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { createAssessment } from "@/actions/assessment";

const assessmentNameSchema = z
  .string()
  .min(1, "Assessment name is required")
  .max(200, "Assessment name must be 200 characters or less");

export default function NewAssessmentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const result = assessmentNameSchema.safeParse(name.trim());
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);

    try {
      const assessment = await createAssessment(result.data);
      router.push(`/assessments/${assessment.id}`);
    } catch {
      setError("Failed to create assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Create New Assessment
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Start a new NIST CSF 2.0 maturity assessment
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div
              className="rounded-md bg-red-50 p-4 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Assessment Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              placeholder="e.g., Q1 2025 Assessment"
              maxLength={200}
            />
            <p className="mt-1 text-xs text-gray-500">
              {name.length}/200 characters
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/assessments"
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Assessment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
