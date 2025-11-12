import React from "react";

export interface FileUploadProps {
  label?: string;
  value?: File | string | null;
  onChange: (file: File | string | null) => void;
  accept?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  maxSizeMB?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  value,
  onChange,
  accept = "*",
  placeholder = "Chưa chọn file",
  error,
  required = false,
  disabled = false,
  maxSizeMB = 10,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file && maxSizeMB) {
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        console.warn(`File vượt quá ${maxSizeMB}MB`);
        e.target.value = "";
        return;
      }
    }

    onChange(file);
    e.target.value = ""; // reset input để có thể chọn lại cùng file
  };

  const handleRemove = () => {
    onChange(null);
  };

  // Xử lý hiển thị tên file hoặc URL
  const getDisplayName = () => {
    if (!value) return placeholder;
    if (typeof value === "string") {
      const fileName = value.split("/").pop() || value;
      return fileName.length > 30 ? fileName.substring(0, 30) + "..." : fileName;
    }
    return value.name.length > 30 ? value.name.substring(0, 30) + "..." : value.name;
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="flex items-center gap-3">
        {value ? (
          <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
            📄 {getDisplayName()}
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="text-red-500 hover:text-red-700 ml-1"
                aria-label="Remove file"
              >
                ✕
              </button>
            )}
          </div>
        ) : (
          <span className="text-gray-400 text-sm">{placeholder}</span>
        )}

        {!disabled && (
          <label className="px-3 py-2 bg-gray-800 text-white text-sm rounded cursor-pointer hover:bg-gray-700 transition">
            Chọn file
            <input
              type="file"
              accept={accept}
              className="hidden"
              onChange={handleFileChange}
              disabled={disabled}
            />
          </label>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      <p className="text-xs text-gray-500">
        Tối đa {maxSizeMB}MB. Định dạng:{" "}
        {accept === "*" ? "mọi loại" : accept.replace(/\./g, "").replace(/,/g, ", ")}
      </p>
    </div>
  );
};
