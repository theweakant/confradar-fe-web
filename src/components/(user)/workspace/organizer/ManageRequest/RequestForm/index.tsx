"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { FormSelect } from "@/components/molecules/FormSelect";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import type { CreateRequestDto } from "@/types/request.type";

interface RequestFormProps {
  onSave: (data: CreateRequestDto) => void;
  onCancel: () => void;
}

export function RequestForm({ onSave, onCancel }: RequestFormProps) {
  const [formData, setFormData] = useState<CreateRequestDto>({
    conferenceId: "",
    conferenceName: "",
    type: "refund",
    reason: "",
    details: "",
    attachment: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateRequestDto, string>>
  >({});
  const [touched, setTouched] = useState<Set<keyof CreateRequestDto>>(
    new Set()
  );

  const handleChange = (field: keyof CreateRequestDto, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
    setTouched((prev) => new Set(prev).add(field));
  };

  const validateField = (
    field: keyof CreateRequestDto,
    value: string
  ): boolean => {
    let errorMessage = "";

    if (field === "conferenceName") {
      if (!value.trim()) {
        errorMessage = "Tên hội nghị không được để trống";
      }
    }

    if (field === "reason") {
      if (!value.trim()) {
        errorMessage = "Lý do không được để trống";
      } else if (value.trim().length < 5) {
        errorMessage = "Lý do phải có ít nhất 5 ký tự";
      }
    }

    if (field === "details") {
      if (!value.trim()) {
        errorMessage = "Chi tiết không được để trống";
      } else if (value.trim().length < 10) {
        errorMessage = "Chi tiết phải có ít nhất 10 ký tự";
      }
    }

    setErrors((prev) => ({ ...prev, [field]: errorMessage }));
    return !errorMessage;
  };

  const validate = (): boolean => {
    let isValid = true;
    const requiredFields: Array<keyof CreateRequestDto> = [
      "conferenceName",
      "reason",
      "details",
    ];

    requiredFields.forEach((field) => {
      const fieldValue = formData[field] ?? "";
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

  const typeOptions = [
    { value: "refund", label: "Hoàn tiền" },
    { value: "change_presenter", label: "Đổi diễn giả" },
    { value: "change_session", label: "Đổi phiên" },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <FormInput
          label="Tên hội nghị"
          name="conferenceName"
          value={formData.conferenceName}
          onChange={(value) => handleChange("conferenceName", value)}
          onBlur={() => validateField("conferenceName", formData.conferenceName)}
          required
          error={touched.has("conferenceName") ? errors.conferenceName : undefined}
          success={touched.has("conferenceName") && !errors.conferenceName}
          placeholder="VD: Tech Conference 2024"
        />

        <FormSelect
          label="Loại yêu cầu"
          name="type"
          value={formData.type}
          onChange={(value) => handleChange("type", value)}
          options={typeOptions}
          required
        />

        <FormInput
          label="Lý do"
          name="reason"
          value={formData.reason}
          onChange={(value) => handleChange("reason", value)}
          onBlur={() => validateField("reason", formData.reason)}
          required
          error={touched.has("reason") ? errors.reason : undefined}
          success={touched.has("reason") && !errors.reason}
          placeholder="VD: Không thể tham dự do lý do cá nhân"
        />

        <FormTextArea
          label="Chi tiết"
          name="details"
          value={formData.details}
          onChange={(value) => handleChange("details", value)}
          required
          error={touched.has("details") ? errors.details : undefined}
          placeholder="Mô tả chi tiết về yêu cầu của bạn..."
          rows={4}
        />

        <FormInput
          label="Tài liệu đính kèm (tùy chọn)"
          name="attachment"
          value={formData.attachment || ""}
          onChange={(value) => handleChange("attachment", value)}
          placeholder="URL hoặc tên file đính kèm"
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
          Gửi yêu cầu
        </Button>
      </div>
    </div>
  );
}