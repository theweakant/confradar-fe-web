import React, { useState, useEffect, ChangeEvent } from "react";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  label?: string;
  subtext?: string;
  maxSizeMB?: number;
  height?: string;
  isList?: boolean;
  onChange?: (file: File | File[] | null) => void;
  resetTrigger?: boolean; 
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label = "Upload a project image",
  subtext = "(4MB max)",
  maxSizeMB = 4,
  height = "h-40",
  isList = false,
  onChange,
  resetTrigger = false,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > maxSizeMB * 1024 * 1024) {
        setError(`File vượt quá ${maxSizeMB}MB`);
        return;
      }
      setError("");

      if (isList) {
        const newFiles = [...files, selected];
        setFiles(newFiles);
        onChange?.(newFiles);
      } else {
        setFile(selected);
        onChange?.(selected);
      }
      e.target.value = "";
    }
  };

  const handleRemove = () => {
    setFile(null);
    onChange?.(null);
  };

  const handleRemoveFromList = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onChange?.(newFiles);
  };

  useEffect(() => {
    if (resetTrigger) {
      setFile(null);
      setFiles([]);
      setError("");
    }
  }, [resetTrigger]);

  if (isList) {
    return (
      <div className="w-1/2 space-y-3">
        <label
          htmlFor="image-upload-list"
          className={`flex flex-col items-center justify-center w-full ${height} border-2 border-dashed border-gray-300 rounded-lg bg-transparent text-center cursor-pointer hover:border-gray-400 transition`}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full border-2 border-gray-300 bg-transparent flex items-center justify-center">
              <Upload className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">
                or, <span className="underline">click to browse</span> {subtext}
              </p>
            </div>
          </div>
          <input
            id="image-upload-list"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {files.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {files.map((f, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(f)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border-2 border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFromList(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="w-1/2">
      {!file ? (
        <label
          htmlFor="image-upload"
          className={`flex flex-col items-center justify-center w-full ${height} border-2 border-dashed border-gray-300 rounded-lg bg-transparent text-center cursor-pointer hover:border-gray-400 transition`}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full border-2 border-gray-400 bg-transparent flex items-center justify-center">
              <Upload className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">
                or, <span className="underline">click to browse</span> {subtext}
              </p>
            </div>
          </div>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      ) : (
        <div className="relative inline-block">
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className={`object-cover rounded-lg border-2 border-gray-300 ${height}`}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
    </div>
  );
};
