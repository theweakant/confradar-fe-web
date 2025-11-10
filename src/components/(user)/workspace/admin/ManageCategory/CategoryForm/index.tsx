"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import type { Category, CategoryFormData } from "@/types/category.type";

interface CategoryFormProps {
  category?: Category | null;
  isLoading?: boolean;
  onSave: (data: CategoryFormData) => void;
  onCancel: () => void;
}

export function CategoryForm({
  category,
  isLoading,
  onSave,
  onCancel,
}: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    conferenceCategoryName: category?.conferenceCategoryName || "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof CategoryFormData, string>>
  >({});
  const [touched, setTouched] = useState<Set<keyof CategoryFormData>>(
    new Set(),
  );

  const handleChange = (field: keyof CategoryFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
    setTouched((prev) => new Set(prev).add(field));
  };

  const validateField = (
    field: keyof CategoryFormData,
    value: string,
  ): boolean => {
    let errorMessage = "";

    if (field === "conferenceCategoryName") {
      if (!value.trim()) {
        errorMessage = "Tên danh mục không được để trống";
      } else if (value.trim().length < 2) {
        errorMessage = "Tên danh mục phải có ít nhất 2 ký tự";
      } else if (value.trim().length > 100) {
        errorMessage = "Tên danh mục không được vượt quá 50 ký tự";
      }
    }

    setErrors((prev) => ({ ...prev, [field]: errorMessage }));
    return !errorMessage;
  };

  const validate = (): boolean => {
    let isValid = true;
    const allFields = Object.keys(formData) as Array<keyof CategoryFormData>;

    allFields.forEach((field) => {
      const fieldValue = formData[field];
      const fieldIsValid = validateField(field, fieldValue);
      if (!fieldIsValid) {
        isValid = false;
        setTouched((prev) => new Set(prev).add(field));
      }
    });

    return isValid;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <FormInput
          label="Tên danh mục"
          name="conferenceCategoryName"
          value={formData.conferenceCategoryName}
          onChange={(value) => handleChange("conferenceCategoryName", value)}
          onBlur={() =>
            validateField(
              "conferenceCategoryName",
              formData.conferenceCategoryName,
            )
          }
          required
          error={
            touched.has("conferenceCategoryName")
              ? errors.conferenceCategoryName
              : undefined
          }
          success={
            touched.has("conferenceCategoryName") &&
            !errors.conferenceCategoryName
          }
          placeholder="VD: Technology, Business, Science..."
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isLoading}
        >
          Hủy
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Đang xử lý..." : category ? "Cập nhật" : "Thêm mới"}
        </Button>
      </div>
    </div>
  );
}
