interface FormInputProps {
  label: string;
  name: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password" | "date" | "number" | "url" | "tel" | "datetime-local";
  required?: boolean;
  error?: string;
  onBlur?: () => void;
  success?: boolean;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export function FormInput({ 
  label, 
  name, 
  value, 
  onChange, 
  type = "text", 
  required = false, 
  error,
  onBlur,
  success,
  placeholder,
  disabled = false,
  min,
  max,
  step
}: FormInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={`
            w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 
            ${error ? "border-red-500 focus:ring-red-200" : 
              success ? "border-green-500 focus:ring-green-200" : 
              "border-gray-300 focus:ring-blue-200"}
            ${error ? "bg-red-50" : success ? "bg-green-50" : "bg-white"}
            ${disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : ""}
            transition-all duration-200
          `}
        />
        {success && !error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}