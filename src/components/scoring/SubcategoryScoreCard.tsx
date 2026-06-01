"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import MaturityLevelSelector from "./MaturityLevelSelector";
import { updateScore } from "@/actions/assessment";
import { useToast } from "@/components/Toast";

interface SubcategoryData {
  id: string;
  name: string;
  description: string;
  implementationExamples: string;
  informativeReferences: string;
}

interface ScoreData {
  currentScore: number | null;
  targetScore: number | null;
  comment: string | null;
}

interface SubcategoryScoreCardProps {
  assessmentId: string;
  subcategory: SubcategoryData;
  score: ScoreData | null;
}

export default function SubcategoryScoreCard({
  assessmentId,
  subcategory,
  score,
}: SubcategoryScoreCardProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticScore, setOptimisticScore] = useState<ScoreData>({
    currentScore: score?.currentScore ?? null,
    targetScore: score?.targetScore ?? null,
    comment: score?.comment ?? null,
  });
  const [currentIsNA, setCurrentIsNA] = useState(false);
  const [targetIsNA, setTargetIsNA] = useState(false);
  const [justification, setJustification] = useState(score?.comment ?? "");
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { showToast } = useToast();

  const unsavedDataRef = useRef<ScoreData | null>(null);

  const validateAndPersist = useCallback(
    (updates: Partial<ScoreData>, naState?: { currentNA?: boolean; targetNA?: boolean }) => {
      const newCurrentNA = naState?.currentNA ?? currentIsNA;
      const newTargetNA = naState?.targetNA ?? targetIsNA;

      // Validate: if N/A is selected, justification is mandatory
      if ((newCurrentNA || newTargetNA) && !justification.trim()) {
        setValidationError("Justification is required when N/A is selected");
        return;
      }
      setValidationError(null);

      const newScore = { ...optimisticScore, ...updates };
      // Include justification in comment field
      if (justification.trim()) {
        newScore.comment = justification.trim();
      }
      setOptimisticScore(newScore);
      setError(null);
      unsavedDataRef.current = newScore;

      startTransition(async () => {
        try {
          await updateScore(assessmentId, subcategory.id, {
            currentScore: newScore.currentScore,
            targetScore: newScore.targetScore,
            comment: newScore.comment,
          });
          unsavedDataRef.current = null;
        } catch {
          setError("Failed to save. Click retry.");
          showToast(`Failed to save ${subcategory.id}.`, "error");
        }
      });
    },
    [assessmentId, subcategory.id, optimisticScore, justification, currentIsNA, targetIsNA, showToast]
  );

  const handleRetry = useCallback(() => {
    const data = unsavedDataRef.current;
    if (!data) return;
    setError(null);
    startTransition(async () => {
      try {
        await updateScore(assessmentId, subcategory.id, {
          currentScore: data.currentScore,
          targetScore: data.targetScore,
          comment: data.comment,
        });
        unsavedDataRef.current = null;
        showToast(`${subcategory.id} saved.`, "success");
      } catch {
        setError("Retry failed.");
        showToast(`Retry failed for ${subcategory.id}.`, "error");
      }
    });
  }, [assessmentId, subcategory.id, showToast]);

  const handleCurrentScoreChange = useCallback(
    (value: number | null) => {
      validateAndPersist({ currentScore: value });
    },
    [validateAndPersist]
  );

  const handleTargetScoreChange = useCallback(
    (value: number | null) => {
      validateAndPersist({ targetScore: value });
    },
    [validateAndPersist]
  );

  const handleCurrentNAChange = useCallback(
    (isNA: boolean) => {
      setCurrentIsNA(isNA);
      if (isNA) {
        validateAndPersist({ currentScore: null }, { currentNA: isNA });
      }
    },
    [validateAndPersist]
  );

  const handleTargetNAChange = useCallback(
    (isNA: boolean) => {
      setTargetIsNA(isNA);
      if (isNA) {
        validateAndPersist({ targetScore: null }, { targetNA: isNA });
      }
    },
    [validateAndPersist]
  );

  const handleJustificationSave = useCallback(() => {
    if ((currentIsNA || targetIsNA) && !justification.trim()) {
      setValidationError("Justification is required when N/A is selected");
      return;
    }
    setValidationError(null);
    validateAndPersist({ comment: justification.trim() || null });
  }, [justification, currentIsNA, targetIsNA, validateAndPersist]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEvidenceFiles((prev) => [...prev, ...files]);
    showToast(`${files.length} file(s) attached as evidence`, "success");
  };

  const removeFile = (index: number) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <article
      className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
      aria-labelledby={`subcategory-${subcategory.id}`}
    >
      {/* Header */}
      <div className="mb-4 border-b border-gray-100 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3
              id={`subcategory-${subcategory.id}`}
              className="text-base font-bold text-gray-900"
            >
              {subcategory.id}
            </h3>
            <p className="mt-1 text-sm text-gray-700 leading-relaxed">
              {subcategory.description}
            </p>
          </div>
          {/* Status indicator */}
          <div className="ml-3 flex-shrink-0">
            {optimisticScore.currentScore !== null ? (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Scored
              </span>
            ) : currentIsNA ? (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                N/A
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                Not Scored
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Implementation Examples & References (expandable) */}
      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        className="mb-4 flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 focus:outline-none focus:underline"
        aria-expanded={showDetails}
      >
        <svg
          className={`h-3.5 w-3.5 transition-transform ${showDetails ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        {showDetails ? "Hide guidance" : "Show implementation examples & references"}
      </button>

      {showDetails && (
        <div className="mb-5 space-y-3 rounded-md border border-indigo-100 bg-indigo-50/50 p-4">
          {subcategory.implementationExamples && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                Implementation Examples
              </h4>
              <p className="mt-1.5 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {subcategory.implementationExamples}
              </p>
            </div>
          )}
          {subcategory.informativeReferences && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                Informative References
              </h4>
              <p className="mt-1.5 text-xs text-gray-600 whitespace-pre-line">
                {subcategory.informativeReferences}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Scoring Section */}
      <div className="space-y-5">
        {/* Current Maturity Level */}
        <MaturityLevelSelector
          label="Current Maturity Level"
          value={optimisticScore.currentScore}
          isNA={currentIsNA}
          onChange={handleCurrentScoreChange}
          onNAChange={handleCurrentNAChange}
          disabled={isPending}
        />

        {/* Target Maturity Level */}
        <MaturityLevelSelector
          label="Target Maturity Level"
          value={optimisticScore.targetScore}
          isNA={targetIsNA}
          onChange={handleTargetScoreChange}
          onNAChange={handleTargetNAChange}
          disabled={isPending}
        />

        {/* Justification / Comments */}
        <div className="space-y-2">
          <label
            htmlFor={`justification-${subcategory.id}`}
            className="flex items-center gap-1 text-sm font-semibold text-gray-800"
          >
            Justification / Comments
            {(currentIsNA || targetIsNA) && (
              <span className="text-red-500 text-xs font-normal">(Required for N/A)</span>
            )}
          </label>
          <textarea
            id={`justification-${subcategory.id}`}
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            onBlur={handleJustificationSave}
            disabled={isPending}
            rows={3}
            maxLength={2000}
            placeholder={
              currentIsNA || targetIsNA
                ? "Explain why this control is not applicable to your organization..."
                : "Provide justification for the selected maturity level, evidence references, or additional context..."
            }
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
              validationError
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            } ${isPending ? "cursor-not-allowed opacity-50" : ""}`}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{justification.length}/2000</span>
            {validationError && (
              <span className="text-xs text-red-600">{validationError}</span>
            )}
          </div>
        </div>

        {/* Evidence Upload */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-800">
            Evidence Upload
            <span className="ml-1 text-xs font-normal text-gray-500">(Optional)</span>
          </label>
          <div className="flex items-center gap-3">
            <label
              htmlFor={`evidence-${subcategory.id}`}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
              </svg>
              Attach Evidence
            </label>
            <input
              id={`evidence-${subcategory.id}`}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv"
            />
            <span className="text-xs text-gray-500">
              PDF, DOC, XLS, images, or text files
            </span>
          </div>

          {/* Attached files list */}
          {evidenceFiles.length > 0 && (
            <div className="mt-2 space-y-1">
              {evidenceFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <svg className="h-4 w-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <span className="truncate text-xs text-gray-700">{file.name}</span>
                    <span className="flex-shrink-0 text-xs text-gray-400">
                      ({(file.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-2 flex-shrink-0 rounded p-0.5 text-gray-400 hover:text-red-600"
                    aria-label={`Remove ${file.name}`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status indicators */}
      {isPending && (
        <p className="mt-3 text-xs text-indigo-600 animate-pulse" aria-live="polite">
          Saving...
        </p>
      )}
      {error && (
        <div className="mt-3 flex items-center gap-2" role="alert">
          <p className="text-xs text-red-600">{error}</p>
          <button
            type="button"
            onClick={handleRetry}
            disabled={isPending}
            className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
          >
            Retry
          </button>
        </div>
      )}
    </article>
  );
}
