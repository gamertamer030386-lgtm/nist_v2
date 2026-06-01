"use client";

interface ProgressIndicatorProps {
  scores: { currentScore: number | null; targetScore: number | null }[];
  totalSubcategories?: number;
}

export default function ProgressIndicator({
  scores,
  totalSubcategories = 106,
}: ProgressIndicatorProps) {
  const scored = scores.filter(
    (s) => s.currentScore !== null || s.targetScore !== null
  ).length;
  const percentage =
    totalSubcategories > 0 ? (scored / totalSubcategories) * 100 : 0;

  return (
    <div className="w-full" role="group" aria-label="Assessment progress">
      <div className="flex items-center justify-between text-sm text-gray-700 mb-1">
        <span>
          <span className="font-medium">{scored}/{totalSubcategories}</span> scored
        </span>
        <span className="font-medium">{Math.round(percentage)}%</span>
      </div>
      <div
        className="h-2.5 w-full rounded-full bg-gray-200 overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${scored} of ${totalSubcategories} subcategories scored (${Math.round(percentage)}%)`}
      >
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
