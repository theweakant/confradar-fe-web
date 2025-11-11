// "use client";
// import { forwardRef } from "react";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { parseDate, formatDateToAPI } from "@/helper/format";

// interface DatePickerInputProps {
//   label?: string;
//   sublabel?: string; 
//   value: string;
//   onChange: (value: string) => void;
//   placeholder?: string;
//   required?: boolean;
//   disabled?: boolean;
//   minDate?: string;
//   maxDate?: string;
//   className?: string;
//   error?: boolean; 
// }

// export const DatePickerInput = forwardRef<HTMLDivElement, DatePickerInputProps>(
//   (
//     {
//       label,
//       sublabel,
//       value,
//       onChange,
//       placeholder = "dd/mm/yyyy",
//       required = false,
//       disabled = false,
//       minDate,
//       maxDate,
//       className = "",
//       error = false,
//     },
//     ref,
//   ) => {
//     return (
//       <div ref={ref} className={className}>
//         {label && (
//           <div className="flex items-center gap-1 mb-2">
//             <label className="block text-sm font-medium">
//               {label} {required && <span className="text-red-500">*</span>}
//             </label>
//             {sublabel && (
//               <div className="relative group cursor-pointer">
//                 {/* Icon dấu chấm than viền đỏ, nền trong suốt */}
//                 <div className="w-3 h-3 flex items-center justify-center rounded-full border border-red-500 text-red-500 text-[9px] font-bold transition-all group-hover:bg-red-500 group-hover:text-white">
//                   !
//                 </div>

//                 {/* Tooltip hiển thị khi hover */}
//                 <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block bg-white text-red-600 border border-red-300 text-xs rounded-md px-2 py-1 shadow-md whitespace-nowrap z-10">
//                   {sublabel}
//                 </div>
//               </div>
//             )}


//           </div>
//         )}
//         <DatePicker
//           selected={parseDate(value)}
//           onChange={(date) => onChange(formatDateToAPI(date))}
//           dateFormat="dd/MM/yyyy"
//           placeholderText={placeholder}
//           className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
//             error
//               ? "border-red-500 focus:ring-red-400"
//               : "border-gray-300 focus:ring-blue-500"
//           }`}
//           disabled={disabled}
//           minDate={minDate ? parseDate(minDate) : undefined}
//           maxDate={maxDate ? parseDate(maxDate) : undefined}
//           required={required}
//         />
//       </div>
//     );
//   },
// );

// DatePickerInput.displayName = "DatePickerInput";

"use client";
import { forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parseDate, formatDateToAPI } from "@/helper/format";

// Helper: kiểm tra chuỗi có phải ngày hợp lệ không
const isValidDateStr = (str: string | undefined): str is string => {
  if (!str) return false;
  const d = new Date(str);
  return !isNaN(d.getTime());
};

interface DatePickerInputProps {
  label?: string;
  sublabel?: string; 
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  className?: string;
  error?: boolean; 
}

export const DatePickerInput = forwardRef<HTMLDivElement, DatePickerInputProps>(
  (
    {
      label,
      sublabel,
      value,
      onChange,
      placeholder = "dd/mm/yyyy",
      required = false,
      disabled = false,
      minDate,
      maxDate,
      className = "",
      error = false,
    },
    ref,
  ) => {
    return (
      <div ref={ref} className={className}>
        {label && (
          <div className="flex items-center gap-1 mb-2">
            <label className="block text-sm font-medium">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            {sublabel && (
              <div className="relative group cursor-pointer">
                <div className="w-3 h-3 flex items-center justify-center rounded-full border border-red-500 text-red-500 text-[9px] font-bold transition-all group-hover:bg-red-500 group-hover:text-white">
                  !
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block bg-white text-red-600 border border-red-300 text-xs rounded-md px-2 py-1 shadow-md whitespace-nowrap z-10">
                  {sublabel}
                </div>
              </div>
            )}
          </div>
        )}
        <DatePicker
          selected={value ? parseDate(value) : null}
          onChange={(date) => {
            if (date) {
              onChange(formatDateToAPI(date));
            }
          }}
          dateFormat="dd/MM/yyyy"
          placeholderText={placeholder}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            error
              ? "border-red-500 focus:ring-red-400"
              : "border-gray-300 focus:ring-blue-500"
          }`}
          disabled={disabled}
          minDate={isValidDateStr(minDate) ? parseDate(minDate) : undefined}
          maxDate={isValidDateStr(maxDate) ? parseDate(maxDate) : undefined}
          required={required}
        />
      </div>
    );
  },
);

DatePickerInput.displayName = "DatePickerInput";