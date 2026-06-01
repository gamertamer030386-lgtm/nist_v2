"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateScore } from "@/actions/assessment";
import { useToast } from "@/components/Toast";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Subcategory {
  id: string;
  name: string;
  description: string;
  implementationExamples: string;
  informativeReferences: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  subcategories: Subcategory[];
}

interface NistFunction {
  id: string;
  name: string;
  description: string;
  categories: Category[];
}

interface Score {
  subcategoryId: string;
  currentScore: number | null;
  targetScore: number | null;
  comment: string | null;
}

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface Props {
  assessmentId: string;
  assessmentName: string;
  functions: NistFunction[];
  scores: Score[];
  activeFunctionId: string;
  users: User[];
}

// ─── Function metadata ───────────────────────────────────────────────────────

const FUNCTION_INFO: Record<string, { color: string; bgColor: string; borderColor: string; hoverBg: string }> = {
  GV: { color: "text-purple-700", bgColor: "bg-purple-50", borderColor: "border-purple-300", hoverBg: "hover:bg-purple-100" },
  ID: { color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-300", hoverBg: "hover:bg-blue-100" },
  PR: { color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-300", hoverBg: "hover:bg-green-100" },
  DE: { color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-300", hoverBg: "hover:bg-amber-100" },
  RS: { color: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-300", hoverBg: "hover:bg-red-100" },
  RC: { color: "text-teal-700", bgColor: "bg-teal-50", borderColor: "border-teal-300", hoverBg: "hover:bg-teal-100" },
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AssessmentScoringLayout({
  assessmentId,
  assessmentName,
  functions,
  scores,
  activeFunctionId,
  users,
}: Props) {
  const router = useRouter();
  const [activeFunction, setActiveFunction] = useState<string | null>(activeFunctionId);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // When a function filter is active, show only that function's categories
  // When null, show ALL functions' categories
  const visibleFunctions = activeFunction
    ? functions.filter((f) => f.id === activeFunction)
    : functions;

  const handleFunctionClick = (fnId: string) => {
    if (activeFunction === fnId) {
      // Clicking the active function deselects it (show all)
      setActiveFunction(null);
    } else {
      setActiveFunction(fnId);
    }
    setExpandedCategories(new Set());
    router.push(`/assessments/${assessmentId}/score/${fnId}`, { scroll: false });
  };

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allCatIds = visibleFunctions.flatMap((fn) => fn.categories.map((c) => c.id));
    setExpandedCategories(new Set(allCatIds));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* ─── Top: Function Filter Tabs ────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 py-3 bg-[var(--card-bg)] border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-sm font-bold text-[var(--foreground)]">{assessmentName}</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={expandAll} className="text-xs text-purple-600 hover:underline font-medium">Expand All</button>
            <button onClick={collapseAll} className="text-xs text-purple-600 hover:underline font-medium">Collapse All</button>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {functions.map((fn) => {
            const info = FUNCTION_INFO[fn.id] ?? { color: "text-gray-700", bgColor: "bg-gray-50", borderColor: "border-gray-300", hoverBg: "hover:bg-gray-100" };
            const isActive = activeFunction === fn.id;
            const controlCount = fn.categories.reduce((sum, c) => sum + c.subcategories.length, 0);

            return (
              <button
                key={fn.id}
                onClick={() => handleFunctionClick(fn.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? `${info.borderColor} ${info.bgColor} ring-2 ring-purple-300 shadow-sm`
                    : `border-gray-200 bg-white ${info.hoverBg}`
                }`}
              >
                <span className={info.color}>{fn.id}</span>
                <span className={isActive ? info.color : "text-gray-600"}>{fn.name}</span>
                <span className="text-gray-400 text-[10px]">({controlCount})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Single Table with Sticky Header (no page scroll) ─────── */}
      <div className="flex-1 overflow-auto border border-purple-200 rounded-lg">
        <table className="w-full text-xs border-collapse table-fixed" style={{ minWidth: "1500px" }}>
          <thead className="sticky top-0 z-20 bg-purple-50 border-b-2 border-purple-300">
            <tr>
              <th className="px-2 py-2.5 text-left font-bold text-purple-800 border-r border-purple-200" style={{ width: "90px" }}>Control ID</th>
              <th className="px-2 py-2.5 text-left font-bold text-purple-800 border-r border-purple-200" style={{ width: "220px" }}>Description</th>
              <th className="px-2 py-2.5 text-left font-bold text-purple-800 border-r border-purple-200" style={{ width: "240px" }}>Expected Evidence</th>
              <th className="px-2 py-2.5 text-center font-bold text-purple-800 border-r border-purple-200" style={{ width: "180px" }}>Maturity Level (1-5 / N/A)</th>
              <th className="px-2 py-2.5 text-center font-bold text-purple-800 border-r border-purple-200" style={{ width: "45px" }}>Gap</th>
              <th className="px-2 py-2.5 text-left font-bold text-purple-800 border-r border-purple-200" style={{ width: "170px" }}>Assigned To</th>
              <th className="px-2 py-2.5 text-left font-bold text-purple-800 border-r border-purple-200" style={{ width: "160px" }}>Justification</th>
              <th className="px-2 py-2.5 text-center font-bold text-purple-800 border-r border-purple-200" style={{ width: "70px" }}>Evidence</th>
              <th className="px-2 py-2.5 text-center font-bold text-purple-800 border-r border-purple-200" style={{ width: "110px" }}>Target Date</th>
              <th className="px-2 py-2.5 text-left font-bold text-purple-800" style={{ width: "140px" }}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {visibleFunctions.map((fn) => {
              const info = FUNCTION_INFO[fn.id] ?? { color: "text-gray-700", bgColor: "bg-gray-50", borderColor: "border-gray-300", hoverBg: "hover:bg-gray-100" };
              return fn.categories.map((cat) => {
                const isExpanded = expandedCategories.has(cat.id);
                return (
                  <CategorySection
                    key={cat.id}
                    category={cat}
                    functionId={fn.id}
                    isExpanded={isExpanded}
                    onToggle={() => toggleCategory(cat.id)}
                    scores={scores}
                    assessmentId={assessmentId}
                    users={users}
                    colorInfo={info}
                  />
                );
              });
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Category Section ────────────────────────────────────────────────────────

interface CategorySectionProps {
  category: Category;
  functionId: string;
  isExpanded: boolean;
  onToggle: () => void;
  scores: Score[];
  assessmentId: string;
  users: User[];
  colorInfo: { color: string; bgColor: string; borderColor: string; hoverBg: string };
}

function CategorySection({ category, functionId, isExpanded, onToggle, scores, assessmentId, users, colorInfo }: CategorySectionProps) {
  return (
    <>
      {/* Category Header - Clickable to expand */}
      <tr
        onClick={onToggle}
        className={`cursor-pointer hover:bg-gray-50 ${colorInfo.bgColor} border-b border-gray-200`}
      >
        <td colSpan={10} className="px-3 py-2.5 border-r border-purple-100">
          <div className="flex items-center gap-2">
            <svg
              className={`h-4 w-4 text-gray-500 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <span className={`text-xs font-bold ${colorInfo.color}`}>{functionId} → {category.id}</span>
            <span className="text-xs font-semibold text-gray-800">{category.name}</span>
            <span className="text-xs text-gray-500">({category.subcategories.length} controls)</span>
          </div>
        </td>
      </tr>

      {/* Subcategory Rows */}
      {isExpanded && category.subcategories.map((sub) => (
        <ScoringRow
          key={sub.id}
          subcategory={sub}
          score={scores.find((s) => s.subcategoryId === sub.id) ?? null}
          assessmentId={assessmentId}
          users={users}
        />
      ))}
    </>
  );
}

// ─── Scoring Row ─────────────────────────────────────────────────────────────

interface ScoringRowProps {
  subcategory: Subcategory;
  score: Score | null;
  assessmentId: string;
  users: User[];
}

/**
 * Parse implementation examples into separate line items.
 * Splits on patterns like "Ex1:", "Ex2:", etc.
 */
function parseImplementationExamples(text: string): string[] {
  if (!text) return [];
  // Split on Ex followed by a number and colon
  const parts = text.split(/Ex\d+:\s*/i).filter((p) => p.trim().length > 0);
  if (parts.length > 0) return parts.map((p) => p.trim());
  // Fallback: split on newlines
  return text.split("\n").filter((p) => p.trim().length > 0);
}

function ScoringRow({ subcategory, score, assessmentId, users }: ScoringRowProps) {
  const [isPending, startTransition] = useTransition();
  const [currentScore, setCurrentScore] = useState<number | null>(score?.currentScore ?? null);
  const [isNA, setIsNA] = useState(false);
  const [assignedTo, setAssignedTo] = useState("");
  const [justification, setJustification] = useState(score?.comment ?? "");
  const [targetDate, setTargetDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { showToast } = useToast();

  const persistScore = useCallback(
    (newScore: number | null, comment: string | null) => {
      startTransition(async () => {
        try {
          await updateScore(assessmentId, subcategory.id, {
            currentScore: newScore,
            targetScore: 5,
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
      setValidationError("Required for N/A");
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
      setValidationError("Required for N/A");
      return;
    }
    setValidationError(null);
    if (currentScore !== null || justification.trim()) {
      persistScore(currentScore, justification || null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEvidenceFiles((prev) => [...prev, ...files]);
    showToast(`${files.length} file(s) attached`, "success");
  };

  const gap = currentScore !== null && !isNA ? 5 - currentScore : null;

  // Parse implementation examples into separate line items
  const evidenceItems = parseImplementationExamples(subcategory.implementationExamples);

  return (
    <tr className={`border-b border-gray-200 hover:bg-gray-50 ${isPending ? "opacity-50" : ""}`}>
      {/* Control ID - FIXED */}
      <td className="px-2 py-3 align-top bg-white border-r border-gray-200 w-[90px] min-w-[90px] max-w-[90px]">
        <span className="font-bold text-gray-900">{subcategory.id}</span>
      </td>

      {/* Description - full text, no truncation */}
      <td className="px-2 py-3 align-top border-r border-gray-200 whitespace-normal break-words">
        <p className="text-xs text-gray-700 leading-relaxed">
          {subcategory.description}
        </p>
      </td>

      {/* Expected Evidence - each Ex as separate line item */}
      <td className="px-2 py-3 align-top border-r border-gray-200 whitespace-normal break-words">
        {evidenceItems.length > 0 ? (
          <ul className="list-disc list-inside space-y-1">
            {evidenceItems.map((item, idx) => (
              <li key={idx} className="text-xs text-gray-600 leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-gray-500 italic">Documentation demonstrating control implementation</p>
        )}
      </td>

      {/* Maturity Level - FIXED */}
      <td className="px-2 py-3 align-top border-r border-gray-200 w-[180px] min-w-[180px] max-w-[180px]">
        <div className="flex items-center gap-0.5 justify-center flex-wrap">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => handleLevelSelect(level)}
              disabled={isPending}
              className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                currentScore === level && !isNA
                  ? "bg-purple-600 text-white"
                  : "border border-gray-300 bg-white text-gray-600 hover:bg-purple-50"
              }`}
              title={getLevelLabel(level)}
            >
              {level}
            </button>
          ))}
          <button
            type="button"
            onClick={handleNASelect}
            disabled={isPending}
            className={`px-1.5 h-7 rounded text-xs font-bold transition-all ${
              isNA ? "bg-amber-500 text-white" : "border border-gray-300 bg-white text-gray-600 hover:bg-amber-50"
            }`}
          >
            N/A
          </button>
        </div>
      </td>

      {/* Gap - FIXED */}
      <td className="px-2 py-3 align-top text-center border-r border-gray-200 w-[50px] min-w-[50px] max-w-[50px]">
        {gap !== null ? (
          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${getGapBadge(gap)}`}>
            {gap}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>

      {/* Assigned To - FIXED */}
      <td className="px-2 py-3 align-top border-r border-gray-200 w-[160px] min-w-[160px] max-w-[160px]">
        <select
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="w-full rounded border border-gray-300 px-1 py-1 text-xs"
        >
          <option value="">Select...</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.email}</option>
          ))}
        </select>
      </td>

      {/* Justification */}
      <td className="px-2 py-3 align-top border-r border-gray-200 whitespace-normal break-words">
        <textarea
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          onBlur={handleJustificationBlur}
          rows={2}
          maxLength={500}
          placeholder={isNA ? "Required..." : "Justification..."}
          className={`w-full rounded border px-1.5 py-1 text-xs resize-y ${
            validationError ? "border-red-400 bg-red-50" : "border-gray-300"
          }`}
        />
        {validationError && (
          <p className="text-[10px] text-red-500 mt-0.5">{validationError}</p>
        )}
      </td>

      {/* Evidence - FIXED */}
      <td className="px-2 py-3 align-top text-center border-r border-gray-200 w-[70px] min-w-[70px] max-w-[70px]">
        <label className="inline-flex cursor-pointer items-center gap-1 rounded border border-gray-300 px-1.5 py-1 text-xs hover:bg-gray-50">
          📎 {evidenceFiles.length > 0 ? evidenceFiles.length : "Upload"}
          <input type="file" multiple onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.txt" />
        </label>
      </td>

      {/* Target Date - FIXED */}
      <td className="px-2 py-3 align-top border-r border-gray-200 w-[110px] min-w-[110px] max-w-[110px]">
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="w-full rounded border border-gray-300 px-1 py-1 text-xs"
        />
      </td>

      {/* Remarks - EXPANDABLE */}
      <td className="px-2 py-3 align-top whitespace-normal break-words">
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Additional remarks..."
          className="w-full rounded border border-gray-300 px-1.5 py-1 text-xs resize-y"
        />
      </td>
    </tr>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
  return "bg-red-100 text-red-800";
}
