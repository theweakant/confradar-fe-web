"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import type { UserProfileResponse, CollaboratorRequest } from "@/types/user.type";

interface LocalReviewerFormProps {
  reviewer?: UserProfileResponse | null;
  onSave: (data: CollaboratorRequest) => void;
  onCancel: () => void;
}

export function LocalReviewerForm({ reviewer, onSave, onCancel }: LocalReviewerFormProps) {
  const [formData, setFormData] = useState<CollaboratorRequest>({
    email: reviewer?.email || "",
    password: "",
    confirmPassword: "",
    fullName: reviewer?.fullName || "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CollaboratorRequest, string>>>({});
  const [touched, setTouched] = useState<Set<keyof CollaboratorRequest>>(new Set());

  const handleChange = (
    field: keyof CollaboratorRequest,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
    setTouched((prev) => new Set(prev).add(field));
  };

  const validateField = (
    field: keyof CollaboratorRequest,
    value: string
  ): boolean => {
    // Validate password
    if (field === "password") {
      if (!value || value.length < 6) {
        setErrors((prev) => ({
          ...prev,
          [field]: "Mật khẩu phải có ít nhất 6 ký tự"
        }));
        return false;
      }
    }

    // Validate confirmPassword
    if (field === "confirmPassword") {
      if (value !== formData.password) {
        setErrors((prev) => ({
          ...prev,
          [field]: "Mật khẩu xác nhận không khớp"
        }));
        return false;
      }
    }

    // Validate fullName
    if (field === "fullName") {
      if (!value || value.trim().length < 2) {
        setErrors((prev) => ({
          ...prev,
          [field]: "Tên phải có ít nhất 2 ký tự"
        }));
        return false;
      }
    }

    // Validate email
    if (field === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value || !emailRegex.test(value)) {
        setErrors((prev) => ({
          ...prev,
          [field]: "Email không hợp lệ"
        }));
        return false;
      }
    }

    setErrors((prev) => ({
      ...prev,
      [field]: ""
    }));
    return true;
  };

  const validate = (): boolean => {
    let isValid = true;
    const allFields = Object.keys(formData) as Array<keyof CollaboratorRequest>;

    allFields.forEach((field) => {
      const fieldValue = formData[field] ?? "";
      const fieldIsValid = validateField(field, fieldValue);

      if (!fieldIsValid) {
        isValid = false;
        setTouched((prev) => new Set(prev).add(field));
      }
    });

    // Additional check for password match
    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Mật khẩu xác nhận không khớp"
      }));
      isValid = false;
    }

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
          label="Tên phản biện nội bộ"
          name="fullName"
          value={formData.fullName}
          onChange={(value: string) => handleChange("fullName", value)}
          onBlur={() => validateField("fullName", formData.fullName)}
          required
          error={touched.has("fullName") ? errors.fullName : undefined}
          success={touched.has("fullName") && !errors.fullName}
          placeholder="VD: Nguyễn Văn D"
        />

        <FormInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={(value: string) => handleChange("email", value)}
          onBlur={() => validateField("email", formData.email)}
          required
          error={touched.has("email") ? errors.email : undefined}
          success={touched.has("email") && !errors.email}
          placeholder="VD: localreviewer@example.com"
        />

        <FormInput
          label="Mật khẩu"
          name="password"
          type="password"
          value={formData.password}
          onChange={(value: string) => handleChange("password", value)}
          onBlur={() => validateField("password", formData.password)}
          required
          error={touched.has("password") ? errors.password : undefined}
          success={touched.has("password") && !errors.password}
          placeholder="Tối thiểu 6 ký tự"
        />

        <FormInput
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(value: string) => handleChange("confirmPassword", value)}
          onBlur={() => validateField("confirmPassword", formData.confirmPassword)}
          required
          error={touched.has("confirmPassword") ? errors.confirmPassword : undefined}
          success={touched.has("confirmPassword") && !errors.confirmPassword}
          placeholder="Nhập lại mật khẩu"
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
          {reviewer ? "Cập nhật" : "Thêm Phản biện nội bộ"}
        </Button>
      </div>
    </div>
  );
}