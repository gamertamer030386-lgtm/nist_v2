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

const FUNCTION_INFO: Record<string, { color: string; bgColor: string; borderColor: string }> = {
  GV: { color: "text-purple-700", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
  ID: { color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
  PR: { color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-200" },
  DE: { color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
  RS: { color: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200" },
  RC: { color: "text-teal-700", bgColor: "bg-teal-50", borderColor: "border-teal-200" },
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
  const [activeFunction, setActiveFunction] = useState(activeFunctionId);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const currentFunction = functions.find((f) => f.id === activeFunction);

  const handleFunctionClick = (fnId: string) => {
    setActiveFunction(fnId);
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
    const allCatIds = currentFunction?.categories.map((c) => c.id) ?? [];
    setExpandedCategories(new Set(allCatIds));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-3">
      {/* ─── Left Pane: Function Navigation ────────────────────────────── */}
      <div className="w-56 flex-shrink-0 overflow-y-auto space-y-1.5 border-r border-[var(--border-color)] pr-3">
        {functions.map((fn) => {
          const info = FUNCTION_INFO[fn.id] ?? { color: "text-gray-700", bgColor: "bg-gray-50", borderColor: "border-gray-200" };
          const isActive = activeFunction === fn.id;
          const controlCount = fn.categories.reduce((sum, c) => sum + c.subcategories.length, 0);

          return (
            <button
              key={fn.id}
              onClick={() => handleFunctionClick(fn.id)}
              className={`w-full text-left rounded-lg border p-2.5 transition-all ${
                isActive
                  ? `${info.borderColor} ${info.bgColor} ring-1 ring-indigo-300`
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${info.color}`}>{fn.id}</span>
                <span className="text-xs text-gray-400">{controlCount}</span>
              </div>
              <p className={`text-xs font-semibold mt-0.5 ${isActive ? info.color : "text-gray-800"}`}>
                {fn.name}
              </p>
            </button>
          );
        })}
      </div>

      {/* ─── Right Pane: Scoring Table ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-color)] flex-shrink-0 bg-[var(--card-bg)]">
          <div>
            <h2 className="text-sm font-bold text-[var(--foreground)]">
              {currentFunction?.id}: {currentFunction?.name}
            </h2>
            <p className="text-xs text-[var(--muted)]">{assessmentName}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={expandAll} className="text-xs text-indigo-600 hover:underline">Expand All</button>
            <button onClick={collapseAll} className="text-xs text-indigo-600 hover:underline">Collapse All</button>
          </div>
        </div>

        {/* Frozen Header Row */}
        <div className="flex-shrink-0 overflow-x-auto bg-gray-100 border-b border-gray-300">
          <table className="w-full min-w-[1200px] text-xs">
            <thead>
              <tr>
                <th className="px-2 py-2 text-left font-bold text-gray-700 w-[100px] sticky left-0 bg-gray-100 z-10">Control ID</th>
                <th className="px-2 py-2 text-left font-bold text-gray-700 w-[200px]">Description</th>
                <th className="px-2 py-2 text-left font-bold text-gray-700 w-[160px]">Expected Evidence</th>
                <th className="px-2 py-2 text-center font-bold text-gray-700 w-[200px]">Maturity Level (1-5 / N/A)</th>
                <th className="px-2 py-2 text-center font-bold text-gray-700 w-[50px]">Gap</th>
                <th className="px-2 py-2 text-left font-bold text-gray-700 w-[150px]">Assigned To</th>
                <th className="px-2 py-2 text-left font-bold text-gray-700 w-[160px]">Justification</th>
                <th className="px-2 py-2 text-center font-bold text-gray-700 w-[80px]">Evidence</th>
                <th className="px-2 py-2 text-center font-bold text-gray-700 w-[110px]">Target Date</th>
              </tr>
            </thead>
          </table>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-[1200px] text-xs">
            <tbody>
              {currentFunction?.categories.map((cat) => {
                const isExpanded = expandedCategories.has(cat.id);
                const info = FUNCTION_INFO[currentFunction.id];
                return (
                  <CategorySection
                    key={cat.id}
                    category={cat}
                    isExpanded={isExpanded}
                    onToggle={() => toggleCategory(cat.id)}
                    scores={scores}
                    assessmentId={assessmentId}
                    users={users}
                    colorInfo={info}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Category Section ────────────────────────────────────────────────────────

interface CategorySectionProps {
  category: Category;
  isExpanded: boolean;
  onToggle: () => void;
  scores: Score[];
  assessmentId: string;
  users: User[];
  colorInfo: { color: string; bgColor: string; borderColor: string };
}

function CategorySection({ category, isExpanded, onToggle, scores, assessmentId, users, colorInfo }: CategorySectionProps) {
  return (
    <>
      {/* Category Header - Clickable to expand */}
      <tr
        onClick={onToggle}
        className={`cursor-pointer hover:bg-gray-50 ${colorInfo.bgColor}`}
      >
        <td colSpan={9} className="px-3 py-2.5">
          <div className="flex items-center gap-2">
            <svg
              className={`h-4 w-4 text-gray-500 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <span className={`text-xs font-bold ${colorInfo.color}`}>{category.id}</span>
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

function ScoringRow({ subcategory, score, assessmentId, users }: ScoringRowProps) {
  const [isPending, startTransition] = useTransition();
  const [currentScore, setCurrentScore] = useState<number | null>(score?.currentScore ?? null);
  const [isNA, setIsNA] = useState(false);
  const [assignedTo, setAssignedTo] = useState("");
  const [justification, setJustification] = useState(score?.comment ?? "");
  const [targetDate, setTargetDate] = useState("");
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

  // Derive expected evidence from implementation examples
  const expectedEvidence = subcategory.implementationExamples
    ? subcategory.implementationExamples.split("\n").slice(0, 2).join("; ").substring(0, 120)
    : "Documentation demonstrating control implementation";

  return (
    <tr className={`hover:bg-gray-50 border-b border-gray-100 ${isPending ? "opacity-50" : ""}`}>
      {/* Control ID */}
      <td className="px-2 py-2 align-top sticky left-0 bg-white z-[5]">
        <span className="font-bold text-gray-900">{subcategory.id}</span>
      </td>

      {/* Description */}
      <td className="px-2 py-2 align-top">
        <p className="text-xs text-gray-700 leading-relaxed">
          {subcategory.description}
        </p>
      </td>

      {/* Expected Evidence */}
      <td className="px-2 py-2 align-top">
        <p className="text-xs text-gray-500 leading-relaxed italic">
          {expectedEvidence}...
        </p>
      </td>

      {/* Maturity Level */}
      <td className="px-2 py-2 align-top">
        <div className="flex items-center gap-0.5 justify-center">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => handleLevelSelect(level)}
              disabled={isPending}
              className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                currentScore === level && !isNA
                  ? "bg-indigo-600 text-white"
                  : "border border-gray-300 bg-white text-gray-600 hover:bg-indigo-50"
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

      {/* Gap */}
      <td className="px-2 py-2 align-top text-center">
        {gap !== null ? (
          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${getGapBadge(gap)}`}>
            {gap}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>

      {/* Assigned To */}
      <td className="px-2 py-2 align-top">
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
      <td className="px-2 py-2 align-top">
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
      </td>

      {/* Evidence */}
      <td className="px-2 py-2 align-top text-center">
        <label className="inline-flex cursor-pointer items-center gap-1 rounded border border-gray-300 px-1.5 py-1 text-xs hover:bg-gray-50">
          📎 {evidenceFiles.length > 0 ? evidenceFiles.length : "Upload"}
          <input type="file" multiple onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.txt" />
        </label>
      </td>

      {/* Target Date */}
      <td className="px-2 py-2 align-top">
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="w-full rounded border border-gray-300 px-1 py-1 text-xs"
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
