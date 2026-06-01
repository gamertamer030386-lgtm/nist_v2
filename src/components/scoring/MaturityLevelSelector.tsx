"use client";

const MATURITY_LEVELS = [
  { value: 1, label: "Performed", description: "Ad hoc security practices" },
  { value: 2, label: "Managed", description: "Documented and repeatable" },
  { value: 3, label: "Defined", description: "Reviewed with adequate resources" },
  { value: 4, label: "Quantitatively Managed", description: "Measured and corrective actions taken" },
  { value: 5, label: "Optimizing", description: "Standardized and continuously improved" },
] as const;

interface MaturityLevelSelectorProps {
  label: string;
  value: number | null;
  isNA?: boolean;
  onChange: (value: number | null) => void;
  onNAChange?: (isNA: boolean) => void;
  disabled?: boolean;
}

export default function MaturityLevelSelector({
  label,
  value,
  isNA = false,
  onChange,
  onNAChange,
  disabled = false,
}: MaturityLevelSelectorProps) {
  const fieldId = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="text-sm font-semibold text-gray-800">{label}</legend>

      <div className="space-y-1.5">
        {MATURITY_LEVELS.map((level) => {
          const isSelected = !isNA && value === level.value;
          const radioId = `${fieldId}-${level.value}`;
          return (
            <label
              key={level.value}
              htmlFor={radioId}
              className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 transition-colors ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <input
                id={radioId}
                type="radio"
                name={fieldId}
                checked={isSelected}
                onChange={() => {
                  if (onNAChange) onNAChange(false);
                  onChange(level.value);
                }}
                disabled={disabled}
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">
                  Level {level.value}: {level.label}
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  — {level.description}
                </span>
              </div>
            </label>
          );
        })}

        {/* N/A Option */}
        {onNAChange && (
          <label
            htmlFor={`${fieldId}-na`}
            className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 transition-colors ${
              isNA
                ? "border-amber-500 bg-amber-50 ring-1 ring-amber-500"
                : "border-gray-200 bg-white hover:bg-gray-50"
            } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <input
              id={`${fieldId}-na`}
              type="radio"
              name={fieldId}
              checked={isNA}
              onChange={() => {
                onNAChange(true);
                onChange(null);
              }}
              disabled={disabled}
              className="h-4 w-4 border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">N/A</span>
              <span className="ml-2 text-xs text-gray-500">
                — Not Applicable to this organization
              </span>
            </div>
          </label>
        )}
      </div>
    </fieldset>
  );
}
