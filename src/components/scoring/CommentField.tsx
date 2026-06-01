"use client";

import { useState, useCallback } from "react";

const MAX_COMMENT_LENGTH = 2000;

interface CommentFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function CommentField({
  value,
  onChange,
  disabled = false,
}: CommentFieldProps) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (newValue.length <= MAX_COMMENT_LENGTH) {
        setLocalValue(newValue);
      }
    },
    []
  );

  const handleBlur = useCallback(() => {
    if (localValue !== value) {
      onChange(localValue);
    }
  }, [localValue, value, onChange]);

  const remaining = MAX_COMMENT_LENGTH - localValue.length;

  return (
    <div className="space-y-1">
      <label
        htmlFor="subcategory-comment"
        className="block text-sm font-medium text-gray-700"
      >
        Comments
      </label>
      <textarea
        id="subcategory-comment"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        rows={3}
        maxLength={MAX_COMMENT_LENGTH}
        placeholder="Add notes or observations..."
        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <p
        className={`text-xs ${
          remaining < 100 ? "text-orange-600" : "text-gray-500"
        }`}
        aria-live="polite"
      >
        {remaining} characters remaining
      </p>
    </div>
  );
}
