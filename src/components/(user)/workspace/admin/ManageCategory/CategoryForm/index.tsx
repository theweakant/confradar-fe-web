"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import type { Category, CreateCategoryDto } from "@/types/category.type";

interface CategoryFormProps {
  category?: Category | null;
  onSave: (data: CreateCategoryDto) => void;
  onCancel: () => void;
}

export function CategoryForm({ category, onSave, onCancel }: CategoryFormProps) {
  const [formData, setFormData] = useState<CreateCategoryDto>({
    name: category?.name || "",
    description: category?.description || "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateCategoryDto, string>>>({});
  const [touched, setTouched] = useState<Set<keyof CreateCategoryDto>>(new Set());

  const handleChange = (field: keyof CreateCategoryDto, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
    setTouched((prev) => new Set(prev).add(field));
  };

  const validateField = (field: keyof CreateCategoryDto, value: string): boolean => {
    let errorMessage = "";

    if (field === "name") {
      if (!value.trim()) {
        errorMessage = "Tên danh mục không được để trống";
      } else if (value.trim().length < 2) {
        errorMessage = "Tên danh mục phải có ít nhất 2 ký tự";
      } else if (value.trim().length > 100) {
        errorMessage = "Tên danh mục không được vượt quá 100 ký tự";
      }
    }

    if (field === "description") {
      if (!value.trim()) {
        errorMessage = "Mô tả không được để trống";
      } else if (value.trim().length < 10) {
        errorMessage = "Mô tả phải có ít nhất 10 ký tự";
      } else if (value.trim().length > 500) {
        errorMessage = "Mô tả không được vượt quá 500 ký tự";
      }
    }

    setErrors((prev) => ({ ...prev, [field]: errorMessage }));
    return !errorMessage;
  };

  const validate = (): boolean => {
    let isValid = true;
    const allFields = Object.keys(formData) as Array<keyof CreateCategoryDto>;

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
          name="name"
          value={formData.name}
          onChange={(value) => handleChange("name", value)}
          onBlur={() => validateField("name", formData.name)}
          required
          error={touched.has("name") ? errors.name : undefined}
          success={touched.has("name") && !errors.name}
          placeholder="VD: Technology, Business, Science..."
        />

        <FormTextArea
          label="Mô tả"
          name="description"
          value={formData.description}
          onChange={(value) => handleChange("description", value)}
          required
          error={touched.has("description") ? errors.description : undefined}
          placeholder="Mô tả chi tiết về danh mục này..."
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Hủy
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {category ? "Cập nhật" : "Thêm mới"}
        </Button>
      </div>
    </div>
  );
}
