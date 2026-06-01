import Link from "next/link";
import { getAssessments } from "@/actions/assessment";
import DeleteAssessmentButton from "@/components/DeleteAssessmentButton";

export default async function AssessmentsPage() {
  const assessments = await getAssessments();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
        <Link
          href="/assessments/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          New Assessment
        </Link>
      </div>

      {assessments.length === 0 ? (
        <div className="mt-8 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-sm text-gray-500">
            No assessments yet. Create your first assessment to get started.
          </p>
          <Link
            href="/assessments/new"
            className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            New Assessment
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Created
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {assessments.map((assessment) => (
                <tr key={assessment.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link
                      href={`/assessments/${assessment.id}`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                    >
                      {assessment.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(assessment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <DeleteAssessmentButton assessmentId={assessment.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
