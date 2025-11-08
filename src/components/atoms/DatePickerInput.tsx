"use client";
import { forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parseDate, formatDateToAPI } from "@/helper/format";

interface DatePickerInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

export const DatePickerInput = forwardRef<HTMLDivElement, DatePickerInputProps>(
  (
    {
      label,
      value,
      onChange,
      placeholder = "dd/mm/yyyy",
      required = false,
      disabled = false,
      minDate,
      maxDate,
      className = "",
    },
    ref,
  ) => {
    return (
      <div ref={ref} className={className}>
        {label && (
          <label className="block text-sm font-medium mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <DatePicker
          selected={parseDate(value)}
          onChange={(date) => onChange(formatDateToAPI(date))}
          dateFormat="dd/MM/yyyy"
          placeholderText={placeholder}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={disabled}
          minDate={minDate ? parseDate(minDate) : undefined}
          maxDate={maxDate ? parseDate(maxDate) : undefined}
          required={required}
        />
      </div>
    );
  },
);

DatePickerInput.displayName = "DatePickerInput";
