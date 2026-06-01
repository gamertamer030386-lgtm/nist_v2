export default function AssessmentsLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-10 w-36 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="h-4 w-1/3 rounded bg-gray-200" />
            <div className="mt-3 h-3 w-1/4 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
