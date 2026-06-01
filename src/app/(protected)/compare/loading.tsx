export default function CompareLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="h-8 w-56 animate-pulse rounded bg-gray-200" />
      <div className="mt-2 h-4 w-96 animate-pulse rounded bg-gray-200" />

      {/* Assessment selector skeleton */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-64 animate-pulse rounded-md bg-gray-200" />
          <div className="h-10 w-64 animate-pulse rounded-md bg-gray-200" />
          <div className="h-10 w-28 animate-pulse rounded-md bg-gray-200" />
        </div>

        {/* Chart placeholder */}
        <div className="mt-8 animate-pulse rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 h-5 w-40 rounded bg-gray-200" />
          <div className="flex h-64 items-end justify-around gap-4 px-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex w-full gap-1">
                <div
                  className="w-1/2 rounded-t bg-indigo-100"
                  style={{ height: `${30 + ((i * 15) % 60)}%` }}
                />
                <div
                  className="w-1/2 rounded-t bg-emerald-100"
                  style={{ height: `${40 + ((i * 12) % 50)}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Table placeholder */}
        <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 h-5 w-36 rounded bg-gray-200" />
          <div className="space-y-3">
            <div className="flex border-b border-gray-200 pb-3">
              <div className="h-3 w-24 rounded bg-gray-200" />
              <div className="ml-auto flex gap-8">
                <div className="h-3 w-20 rounded bg-gray-200" />
                <div className="h-3 w-20 rounded bg-gray-200" />
                <div className="h-3 w-16 rounded bg-gray-200" />
              </div>
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center border-b border-gray-50 py-3">
                <div className="h-4 w-28 rounded bg-gray-200" />
                <div className="ml-auto flex gap-8">
                  <div className="h-4 w-12 rounded bg-gray-200" />
                  <div className="h-4 w-12 rounded bg-gray-200" />
                  <div className="h-5 w-14 rounded-full bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
