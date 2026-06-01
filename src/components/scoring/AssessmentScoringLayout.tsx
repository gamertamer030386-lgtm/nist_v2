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

const FUNCTION_INFO: Record<string, { color: string; bgColor: string; borderColor: string; shortDesc: string }> = {
  GV: { color: "text-purple-700", bgColor: "bg-purple-50", borderColor: "border-purple-300", shortDesc: "Establish and monitor cybersecurity risk management strategy, expectations, and policy" },
  ID: { color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-300", shortDesc: "Understand current cybersecurity risks to the organization" },
  PR: { color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-300", shortDesc: "Use safeguards to manage cybersecurity risks" },
  DE: { color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-300", shortDesc: "Find and analyze possible cybersecurity attacks and compromises" },
  RS: { color: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-300", shortDesc: "Take action regarding a detected cybersecurity incident" },
  RC: { color: "text-teal-700", bgColor: "bg-teal-50", borderColor: "border-teal-300", shortDesc: "Restore assets and operations affected by a cybersecurity incident" },
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

  const currentFunction = functions.find((f) => f.id === activeFunction);
  const allSubcategories = currentFunction?.categories.flatMap((c) => c.subcategories) ?? [];

  const getControlCount = (fn: NistFunction) =>
    fn.categories.reduce((sum, c) => sum + c.subcategories.length, 0);

  const handleFunctionClick = (fnId: string) => {
    setActiveFunction(fnId);
    router.push(`/assessments/${assessmentId}/score/${fnId}`, { scroll: false });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      {/* ─── Left Pane: Function Boxes ─────────────────────────────────── */}
      <div className="w-64 flex-shrink-0 overflow-y-auto space-y-2 pr-2 flex flex-col">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          NIST CSF 2.0 Functions
        </h2>
        <div className="flex-1 space-y-2">
        {functions.map((fn) => {
          const info = FUNCTION_INFO[fn.id] ?? { color: "text-gray-700", bgColor: "bg-gray-50", borderColor: "border-gray-300", shortDesc: "" };
          const isActive = activeFunction === fn.id;
          const controlCount = getControlCount(fn);
          const scoredCount = fn.categories
            .flatMap((c) => c.subcategories)
            .filter((sub) => scores.find((s) => s.subcategoryId === sub.id)?.currentScore !== null)
            .length;

          return (
            <button
              key={fn.id}
              onClick={() => handleFunctionClick(fn.id)}
              className={`w-full text-left rounded-lg border-2 p-3 transition-all ${
                isActive
                  ? `${info.borderColor} ${info.bgColor} ring-2 ring-offset-1 ring-indigo-300`
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-bold ${info.color}`}>
                  {fn.id}
                </span>
                <span className="text-xs text-gray-500">
                  {scoredCount}/{controlCount}
                </span>
              </div>
              <p className={`text-xs font-semibold ${isActive ? info.color : "text-gray-800"}`}>
                {fn.name}
              </p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {info.shortDesc}
              </p>
            </button>
          );
        })}
        </div>
      </div>

      {/* ─── Right Pane: Subcategory Scoring Table ─────────────────────── */}
      <div className="flex-1 overflow-auto rounded-lg border border-gray-200 bg-white">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <h2 className="text-lg font-bold text-gray-900">
            {currentFunction?.id}: {currentFunction?.name}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {assessmentName} — {allSubcategories.length} controls
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-[60px] z-10">
              <tr>
                <th className="px-3 py-2.5 text-left font-semibold text-gray-700 w-36">Sub Category ID</th>
                <th className="px-3 py-2.5 text-center font-semibold text-gray-700 w-56">Maturity Level (1-5 / N/A)</th>
                <th className="px-2 py-2.5 text-center font-semibold text-gray-700 w-14">Gap</th>
                <th className="px-3 py-2.5 text-left font-semibold text-gray-700 w-44">Assigned To</th>
                <th className="px-3 py-2.5 text-left font-semibold text-gray-700 w-48">Justification</th>
                <th className="px-3 py-2.5 text-center font-semibold text-gray-700 w-24">Evidence</th>
                <th className="px-3 py-2.5 text-center font-semibold text-gray-700 w-36">Target Completion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentFunction?.categories.map((cat) => (
                <>
                  {/* Category Header Row */}
                  <tr key={`cat-${cat.id}`} className="bg-gray-100">
                    <td colSpan={7} className="px-3 py-2">
                      <span className="text-xs font-bold text-indigo-700">{cat.id}</span>
                      <span className="ml-2 text-xs font-medium text-gray-700">{cat.name}</span>
                    </td>
                  </tr>
                  {/* Subcategory Rows */}
                  {cat.subcategories.map((sub) => (
                    <ScoringRow
                      key={sub.id}
                      subcategory={sub}
                      score={scores.find((s) => s.subcategoryId === sub.id) ?? null}
                      assessmentId={assessmentId}
                      users={users}
                    />
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Scoring Row Component ───────────────────────────────────────────────────

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
      setValidationError("Required");
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
      setValidationError("Required");
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

  return (
    <tr className={`hover:bg-gray-50 ${isPending ? "opacity-50" : ""}`}>
      {/* Sub Category ID */}
      <td className="px-3 py-2 align-top">
        <span className="font-medium text-gray-900 text-xs">{subcategory.id}</span>
        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5" title={subcategory.description}>
          {subcategory.description}
        </p>
      </td>

      {/* Maturity Level */}
      <td className="px-3 py-2 align-top">
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
              isNA
                ? "bg-amber-500 text-white"
                : "border border-gray-300 bg-white text-gray-600 hover:bg-amber-50"
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
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>

      {/* Assigned To */}
      <td className="px-3 py-2 align-top">
        <select
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="w-full rounded border border-gray-300 px-1.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Select...</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.email}
            </option>
          ))}
        </select>
      </td>

      {/* Justification */}
      <td className="px-3 py-2 align-top">
        <textarea
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          onBlur={handleJustificationBlur}
          rows={1}
          maxLength={500}
          placeholder={isNA ? "Required..." : "Justification..."}
          className={`w-full rounded border px-1.5 py-1 text-xs resize-none focus:ring-1 ${
            validationError ? "border-red-400 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-indigo-500"
          }`}
        />
      </td>

      {/* Evidence */}
      <td className="px-3 py-2 align-top text-center">
        <label className="inline-flex cursor-pointer items-center gap-1 rounded border border-gray-300 px-1.5 py-1 text-xs hover:bg-gray-50">
          <svg className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
          </svg>
          {evidenceFiles.length > 0 ? `${evidenceFiles.length}` : "Upload"}
          <input type="file" multiple onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.txt" />
        </label>
      </td>

      {/* Target Completion Date */}
      <td className="px-3 py-2 align-top">
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="w-full rounded border border-gray-300 px-1.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500"
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
