import type { ScoreRollup } from "@/lib/scoring";

interface OverallScoreCardProps {
  rollup: ScoreRollup;
}

export function OverallScoreCard({ rollup }: OverallScoreCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Overall Maturity Score
      </h2>
      <div className="flex items-center justify-around">
        <div className="text-center">
          <p className="text-sm text-gray-500">Current</p>
          <p className="text-4xl font-bold text-indigo-600">
            {rollup.currentScore !== null
              ? rollup.currentScore.toFixed(1)
              : "—"}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Target</p>
          <p className="text-4xl font-bold text-emerald-600">
            {rollup.targetScore !== null
              ? rollup.targetScore.toFixed(1)
              : "—"}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Gap</p>
          <p className={`text-4xl font-bold ${getGapTextColor(rollup.gap)}`}>
            {rollup.gap !== null ? rollup.gap.toFixed(1) : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

function getGapTextColor(gap: number | null): string {
  if (gap === null) return "text-gray-400";
  if (gap === 0) return "text-green-600";
  if (gap <= 1) return "text-yellow-600";
  if (gap <= 2) return "text-orange-500";
  return "text-red-600";
}
