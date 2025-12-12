import React from 'react';

interface FormInputProps {
  label: string;
  sublabel?: string;
  name?: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  type?:
    | "text"
    | "email"
    | "password"
    | "date"
    | "number"
    | "url"
    | "tel"
    | "datetime-local"
    | "time"
    | "textarea"; 
  required?: boolean;
  error?: string;
  warning?: string;
  onBlur?: () => void;
  success?: boolean;
  placeholder?: string;
  disabled?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  rows?: number; 
}

export function FormInput({
  label,
  sublabel,
  name,
  value = '',
  onChange,
  type = "text",
  required = false,
  error,
  warning,
  onBlur,
  success,
  placeholder,
  disabled = false,
  min,
  max,
  step,
  rows = 3,
}: FormInputProps) {
  const isTextarea = type === "textarea";
  const displayValue = value ?? '';

  return (
    <div className="w-full">
      {/* Label Section */}
      <div className="mb-1">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {sublabel && (
          <span className="text-xs text-gray-500 block mt-1">{sublabel}</span>
        )}
      </div>

      <div className="relative">
        {isTextarea ? (
          <textarea
            name={name}
            value={displayValue}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={`
              w-full px-4 py-2.5 border rounded-lg 
              focus:outline-none focus:ring-2 
              transition-all duration-200
              font-sans
              ${
                error
                  ? "border-red-400 focus:ring-red-200 focus:border-red-500 bg-red-50"
                  : warning
                  ? "border-yellow-400 focus:ring-yellow-200 focus:border-yellow-500 bg-yellow-50"
                  : success
                  ? "border-green-400 focus:ring-green-200 focus:border-green-500 bg-green-50"
                  : "border-gray-300 focus:ring-blue-200 focus:border-blue-500 bg-white"
              }
              ${disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : ""}
            `}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={displayValue}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={`
              w-full px-4 py-2.5 border rounded-lg 
              focus:outline-none focus:ring-2 
              transition-all duration-200
              ${
                error
                  ? "border-red-400 focus:ring-red-200 focus:border-red-500 bg-red-50"
                  : warning
                  ? "border-yellow-400 focus:ring-yellow-200 focus:border-yellow-500 bg-yellow-50"
                  : success
                  ? "border-green-400 focus:ring-green-200 focus:border-green-500 bg-green-50"
                  : "border-gray-300 focus:ring-blue-200 focus:border-blue-500 bg-white"
              }
              ${disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : ""}
            `}
          />
        )}

        {!isTextarea && (success || warning || error) && (
          <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2">
            {success && !error && !warning && (
              <svg
                className="w-3 h-3 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {warning && !error && (
              <svg
                className="w-3 h-3 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            )}
            {error && (
              <svg
                className="w-3 h-3 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-1 flex items-start gap-1 text-xs text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
          <svg
            className="w-3 h-3 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span className="leading-tight">{error}</span>
        </div>
      )}

      {warning && !error && (
        <div className="mt-1 flex items-start gap-1 text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded animate-in fade-in slide-in-from-top-1 duration-200">
          <svg
            className="w-3 h-3 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="leading-tight">{warning}</span>
        </div>
      )}

      {success && !error && !warning && (
        <div className="mt-1 flex items-center gap-1 text-xs text-green-600 animate-in fade-in slide-in-from-top-1 duration-200">
          <svg
            className="w-3 h-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Hợp lệ</span>
        </div>
      )}
    </div>
  );
}