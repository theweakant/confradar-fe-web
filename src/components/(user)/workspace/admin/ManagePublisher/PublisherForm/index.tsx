"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import type { Publisher, PublisherFormData } from "@/types/publisher.type";

interface PublisherFormProps {
  publisher?: Publisher | null;
  isLoading?: boolean;
  onSave: (data: PublisherFormData) => void; 
  onCancel: () => void;
}

export function PublisherForm({
  publisher,
  isLoading,
  onSave,
  onCancel,
}: PublisherFormProps) {
  const [formData, setFormData] = useState<PublisherFormData>({
    name: publisher?.name || "",
    paperFormat: publisher?.paperFormat || "",
    description: publisher?.description || "",
    websiteUrl: publisher?.websiteUrl || "",
    logoUrl: publisher?.logoUrl || "",
    linkTemplate: publisher?.linkTemplate || "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PublisherFormData, string>>>({});
  const [touched, setTouched] = useState<Set<keyof PublisherFormData>>(new Set());

  const handleChange = (field: keyof PublisherFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
    setTouched((prev) => new Set(prev).add(field));
  };

  const validateField = (field: keyof PublisherFormData, value: string): boolean => {
    let errorMessage = "";

    if (field === "name") {
      if (!value.trim()) {
        errorMessage = "Tên nhà xuất bản không được để trống";
      } else if (value.trim().length < 2) {
        errorMessage = "Tên phải có ít nhất 2 ký tự";
      } else if (value.trim().length > 100) {
        errorMessage = "Tên không được vượt quá 100 ký tự";
      }
    }

    setErrors((prev) => ({ ...prev, [field]: errorMessage }));
    return !errorMessage;
  };

  const validate = (): boolean => {
    let isValid = true;
    const allFields: (keyof PublisherFormData)[] = [
      "name",
      "paperFormat",
      "description",
      "websiteUrl",
      "logoUrl",
      "linkTemplate",
    ];

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
      <div className="grid grid-cols-1 gap-4">
        <FormInput
          label="Tên nhà xuất bản"
          value={formData.name}
          onChange={(value) => handleChange("name", value)}
          onBlur={() => validateField("name", formData.name)}
          required
          error={touched.has("name") ? errors.name : undefined}
          success={touched.has("name") && !errors.name}
          placeholder="VD: Springer, IEEE, ACM..."
          disabled={isLoading}
        />

        <FormInput
          label="Định dạng bài báo"
          value={formData.paperFormat}
          onChange={(value) => handleChange("paperFormat", value)}
          error={touched.has("paperFormat") ? errors.paperFormat : undefined}
          placeholder="VD: IEEE, ACM, APA, A4..."
          disabled={isLoading}
        />

        <FormInput
          label="Mô tả"
          type="textarea"
          rows={4}
          value={formData.description}
          onChange={(value) => handleChange("description", value)}
          error={touched.has("description") ? errors.description : undefined}
          placeholder="Mô tả ngắn về nhà xuất bản..."
          disabled={isLoading}
        />

        <FormInput
          label="Website"
          type="url"
          value={formData.websiteUrl}
          onChange={(value) => handleChange("websiteUrl", value)}
          error={touched.has("websiteUrl") ? errors.websiteUrl : undefined}
          placeholder="https://example.com"
          disabled={isLoading}
        />

        <FormInput
          label="URL Logo"
          type="url"
          value={formData.logoUrl}
          onChange={(value) => handleChange("logoUrl", value)}
          error={touched.has("logoUrl") ? errors.logoUrl : undefined}
          placeholder="https://example.com/logo.png"
          disabled={isLoading}
        />

        <FormInput
          label="Link mẫu bài báo"
          type="url"
          value={formData.linkTemplate}
          onChange={(value) => handleChange("linkTemplate", value)}
          error={touched.has("linkTemplate") ? errors.linkTemplate : undefined}
          placeholder="https://example.com/paper/{paperId}"
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
          {isLoading ? "Đang xử lý..." : publisher ? "Cập nhật" : "Thêm mới"}
        </Button>
      </div>
    </div>
  );
}