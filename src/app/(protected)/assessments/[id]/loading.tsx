export default function AssessmentDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
        <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
      </div>

      {/* Progress bar skeleton */}
      <div className="h-4 w-full animate-pulse rounded-full bg-gray-200" />

      {/* Function nav skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-20 animate-pulse rounded-md bg-gray-200"
          />
        ))}
      </div>

      {/* Score cards skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="h-4 w-1/4 rounded bg-gray-200" />
            <div className="mt-2 h-3 w-3/4 rounded bg-gray-100" />
            <div className="mt-4 flex gap-4">
              <div className="h-8 w-32 rounded bg-gray-200" />
              <div className="h-8 w-32 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
