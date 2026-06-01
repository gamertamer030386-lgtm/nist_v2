export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-8 w-64 animate-pulse rounded bg-gray-200" />
          <div className="mt-1 h-4 w-40 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="text-right">
          <div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-200" />
          <div className="ml-auto mt-1 h-8 w-12 animate-pulse rounded bg-gray-200" />
          <div className="ml-auto mt-1 h-3 w-20 animate-pulse rounded bg-gray-200" />
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Overall Score Card skeleton */}
        <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 h-5 w-48 rounded bg-gray-200" />
          <div className="flex items-center justify-around">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto h-3 w-12 rounded bg-gray-200" />
                <div className="mx-auto mt-2 h-10 w-16 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>

        {/* Radar Chart skeleton */}
        <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 h-5 w-32 rounded bg-gray-200" />
          <div className="flex h-56 items-center justify-center">
            <div className="h-48 w-48 rounded-full border-8 border-gray-100 opacity-50" />
          </div>
        </div>

        {/* Function Summary Table skeleton */}
        <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 h-5 w-40 rounded bg-gray-200" />
          <div className="space-y-3">
            {/* Table header */}
            <div className="flex border-b border-gray-200 pb-3">
              <div className="h-3 w-32 rounded bg-gray-200" />
              <div className="ml-auto flex gap-8">
                <div className="h-3 w-14 rounded bg-gray-200" />
                <div className="h-3 w-14 rounded bg-gray-200" />
                <div className="h-3 w-10 rounded bg-gray-200" />
              </div>
            </div>
            {/* Table rows */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center border-b border-gray-50 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-8 rounded bg-indigo-50" />
                  <div className="h-4 w-24 rounded bg-gray-200" />
                </div>
                <div className="ml-auto flex gap-8">
                  <div className="h-4 w-10 rounded bg-gray-200" />
                  <div className="h-4 w-10 rounded bg-gray-200" />
                  <div className="h-5 w-12 rounded-full bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Detail skeleton */}
        <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 h-5 w-32 rounded bg-gray-200" />
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i}>
                <div className="mb-2 h-4 w-36 rounded bg-gray-200" />
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="flex items-center py-2">
                      <div className="h-3 w-40 rounded bg-gray-200" />
                      <div className="ml-auto flex gap-6">
                        <div className="h-3 w-8 rounded bg-gray-200" />
                        <div className="h-3 w-8 rounded bg-gray-200" />
                        <div className="h-4 w-10 rounded-full bg-gray-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart skeletons */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-2">
              <div className="h-5 w-8 rounded bg-indigo-50" />
              <div className="h-5 w-28 rounded bg-gray-200" />
            </div>
            <div className="flex h-56 items-end justify-around gap-2 px-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex w-full gap-1">
                  <div
                    className="w-1/2 rounded-t bg-indigo-100"
                    style={{ height: `${30 + Math.random() * 60}%` }}
                  />
                  <div
                    className="w-1/2 rounded-t bg-emerald-100"
                    style={{ height: `${40 + Math.random() * 50}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
