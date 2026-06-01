"use client";

import { useState, useCallback, useTransition } from "react";
import { updateScore } from "@/actions/assessment";
import { useToast } from "@/components/Toast";

interface Subcategory {
  id: string;
  name: string;
  description: string;
  implementationExamples?: string;
  informativeReferences?: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  subcategories: Subcategory[];
}

interface SubcategoryScore {
  subcategoryId: string;
  currentScore: number | null;
  targetScore: number | null;
  comment?: string | null;
}

interface CategoryAccordionProps {
  categories: Category[];
  scores: SubcategoryScore[];
  assessmentId: string;
  functionId: string;
}

export default function CategoryAccordion({
  categories,
  scores,
  assessmentId,
}: CategoryAccordionProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(categories.length > 0 ? [categories[0].id] : [])
  );

  function toggleCategory(categoryId: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }

  function getCategoryScoredCount(category: Category): number {
    return category.subcategories.filter((sub) => {
      const score = scores.find((s) => s.subcategoryId === sub.id);
      return score && (score.currentScore !== null || score.targetScore !== null);
    }).length;
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const isExpanded = expandedCategories.has(category.id);
        const scoredCount = getCategoryScoredCount(category);
        const totalCount = category.subcategories.length;

        return (
          <div
            key={category.id}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
          >
            {/* Category Header */}
            <button
              type="button"
              onClick={() => toggleCategory(category.id)}
              className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
              aria-expanded={isExpanded}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">
                  {category.id}
                </span>
                <div>
                  <span className="text-sm font-semibold text-gray-900">
                    {category.name}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium ${
                  scoredCount === totalCount ? "text-green-600" : "text-gray-500"
                }`}>
                  {scoredCount}/{totalCount}
                </span>
                <svg
                  className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </button>

            {/* Tabulated Scoring Table */}
            {isExpanded && (
              <div className="border-t border-gray-200 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 w-44">
                        Sub Category ID
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 w-72">
                        Maturity Level (1-5 / N/A)
                      </th>
                      <th className="px-2 py-3 text-center font-semibold text-gray-700 w-16">
                        Gap
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 w-56">
                        Justification
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 w-28">
                        Evidence
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {category.subcategories.map((sub) => {
                      const score = scores.find((s) => s.subcategoryId === sub.id) ?? null;
                      return (
                        <ScoringRow
                          key={sub.id}
                          subcategory={sub}
                          score={score}
                          assessmentId={assessmentId}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Individual Scoring Row ──────────────────────────────────────────────────

interface ScoringRowProps {
  subcategory: Subcategory;
  score: SubcategoryScore | null;
  assessmentId: string;
}

function ScoringRow({ subcategory, score, assessmentId }: ScoringRowProps) {
  const [isPending, startTransition] = useTransition();
  const [currentScore, setCurrentScore] = useState<number | null>(score?.currentScore ?? null);
  const [isNA, setIsNA] = useState(false);
  const [justification, setJustification] = useState(score?.comment ?? "");
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { showToast } = useToast();

  const persistScore = useCallback(
    (newScore: number | null, comment: string | null) => {
      startTransition(async () => {
        try {
          await updateScore(assessmentId, subcategory.id, {
            currentScore: newScore,
            targetScore: 5, // Fixed target
            comment,
          });
        } catch {
          showToast(`Failed to save ${subcategory.id}`, "error");
        }
      });
    },
    [assessmentId, subcategory.id, showToast]
  );

  const handleLevelSelect = (level: number) => {
    setIsNA(false);
    setCurrentScore(level);
    setValidationError(null);
    persistScore(level, justification || null);
  };

  const handleNASelect = () => {
    if (!justification.trim()) {
      setValidationError("Justification required for N/A");
      setIsNA(true);
      setCurrentScore(null);
      return;
    }
    setValidationError(null);
    setIsNA(true);
    setCurrentScore(null);
    persistScore(null, justification);
  };

  const handleJustificationBlur = () => {
    if (isNA && !justification.trim()) {
      setValidationError("Justification required for N/A");
      return;
    }
    setValidationError(null);
    persistScore(currentScore, justification || null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEvidenceFiles((prev) => [...prev, ...files]);
    showToast(`${files.length} file(s) attached`, "success");
  };

  return (
    <tr className={`hover:bg-gray-50 ${isPending ? "opacity-60" : ""}`}>
      {/* Sub Category ID */}
      <td className="px-4 py-3 align-top">
        <div>
          <span className="font-semibold text-gray-900">{subcategory.id}</span>
          <p className="mt-0.5 text-xs text-gray-500 leading-relaxed line-clamp-2">
            {subcategory.description}
          </p>
        </div>
      </td>

      {/* Maturity Level Radio Buttons */}
      <td className="px-4 py-3 align-top">
        <div className="flex items-center gap-1 justify-center flex-wrap">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => handleLevelSelect(level)}
              disabled={isPending}
              className={`w-9 h-9 rounded-md border text-xs font-bold transition-all ${
                currentScore === level && !isNA
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                  : "border-gray-300 bg-white text-gray-700 hover:border-indigo-400 hover:bg-indigo-50"
              } ${isPending ? "cursor-not-allowed" : "cursor-pointer"}`}
              title={`Level ${level}: ${getLevelLabel(level)}`}
            >
              {level}
            </button>
          ))}
          <button
            type="button"
            onClick={handleNASelect}
            disabled={isPending}
            className={`px-2 h-9 rounded-md border text-xs font-bold transition-all ${
              isNA
                ? "border-amber-500 bg-amber-500 text-white shadow-sm"
                : "border-gray-300 bg-white text-gray-700 hover:border-amber-400 hover:bg-amber-50"
            } ${isPending ? "cursor-not-allowed" : "cursor-pointer"}`}
            title="Not Applicable"
          >
            N/A
          </button>
        </div>
        {currentScore !== null && !isNA && (
          <p className="mt-1 text-center text-xs text-gray-500">
            {getLevelLabel(currentScore)}
          </p>
        )}
      </td>

      {/* Gap (Target 5 - Current) */}
      <td className="px-2 py-3 align-top text-center">
        {currentScore !== null && !isNA ? (
          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${getGapBadge(5 - currentScore)}`}>
            {5 - currentScore}
          </span>
        ) : isNA ? (
          <span className="text-xs text-gray-400">—</span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>

      {/* Justification Box */}
      <td className="px-4 py-3 align-top">
        <textarea
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          onBlur={handleJustificationBlur}
          disabled={isPending}
          rows={2}
          maxLength={2000}
          placeholder={isNA ? "Required: explain why N/A..." : "Justification..."}
          className={`w-full rounded-md border px-2 py-1.5 text-xs resize-none focus:outline-none focus:ring-1 ${
            validationError
              ? "border-red-300 focus:ring-red-500 bg-red-50"
              : "border-gray-300 focus:ring-indigo-500"
          }`}
        />
        {validationError && (
          <p className="mt-0.5 text-xs text-red-600">{validationError}</p>
        )}
      </td>

      {/* Evidence Upload */}
      <td className="px-4 py-3 align-top text-center">
        <label
          htmlFor={`evidence-${subcategory.id}`}
          className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
          </svg>
          Upload
        </label>
        <input
          id={`evidence-${subcategory.id}`}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv"
        />
        {evidenceFiles.length > 0 && (
          <p className="mt-1 text-xs text-green-600 font-medium">
            {evidenceFiles.length} file(s)
          </p>
        )}
      </td>
    </tr>
  );
}

function getLevelLabel(level: number): string {
  switch (level) {
    case 1: return "Performed";
    case 2: return "Managed";
    case 3: return "Defined";
    case 4: return "Quantitatively Managed";
    case 5: return "Optimizing";
    default: return "";
  }
}

function getGapBadge(gap: number): string {
  if (gap === 0) return "bg-green-100 text-green-800";
  if (gap === 1) return "bg-yellow-100 text-yellow-800";
  if (gap === 2) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800"; // gap >= 3
}
