"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { FormSelect } from "@/components/molecules/FormSelect";
import { validationUserRules } from "@/utils/validationUserRules";
import type { User, UserFormData } from "@/types/user.type";

interface UserFormProps {
  user?: User | null;
  onSave: (data: UserFormData) => void;
  onCancel: () => void;
}

export function UserForm({ user, onSave, onCancel }: UserFormProps) {
const [formData, setFormData] = useState<UserFormData>({
  fullName: user?.fullName || "",
  email: user?.email || "",
  phoneNumber: user?.phoneNumber || "",
  address: user?.address || "",
  role: user?.role || "customer"  
});

  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [touched, setTouched] = useState<Set<keyof UserFormData>>(new Set());

  const handleChange = (
    field: keyof UserFormData,
    value: string
  ) => {
    setFormData((prev: UserFormData) => ({ ...prev, [field]: value }));
    validateField(field, value);
    setTouched((prev: Set<keyof UserFormData>) => new Set(prev).add(field));
  };

  const validateField = (
    field: keyof UserFormData,
    value: string
  ): boolean => {
    if (typeof field !== "string") return true;
    const fieldRules = validationUserRules[field as string];
    if (!fieldRules) return true;

    for (const rule of fieldRules) {
      if (!rule.validate(value)) {
        setErrors((prev: Partial<Record<keyof UserFormData, string>>) => ({
          ...prev,
          [field]: rule.message
        }));
        return false;
      }
    }

    setErrors((prev: Partial<Record<keyof UserFormData, string>>) => ({
      ...prev,
      [field]: ""
    }));
    return true;
  };

  const validate = (): boolean => {
    let isValid = true;
    const allFields = Object.keys(formData) as Array<keyof UserFormData>;

    allFields.forEach((field: keyof UserFormData) => {
      const fieldValue = formData[field];
      const fieldIsValid = validateField(field, fieldValue);

      if (!fieldIsValid) {
        isValid = false;
        setTouched((prev: Set<keyof UserFormData>) => new Set(prev).add(field));
      }
    });

    return isValid;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData);
    }
  };

const roleOptions = [
    { value: "customer", label: "Khách hàng" },
    // { value: "conferenceorganizer", label: "Người tổ chức hội nghị" },
    { value: "collaborator", label: "Cộng tác viên" },
    { value: "localreviewer", label: "Phản biện nội bộ" },
    { value: "externalreviewer", label: "Phản biện bên ngoài" },
    // { value: "admin", label: "Quản trị viên" }
  ]; 


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <FormInput
            label="Tên người dùng"
            name="fullName"
            value={formData.fullName}
            onChange={(value: string) => handleChange("fullName", value)}
            onBlur={() => validateField("fullName", formData.fullName)}
            required
            error={touched.has("fullName") ? errors.fullName : undefined}
            success={touched.has("fullName") && !errors.fullName}
            placeholder="VD: Nguyễn Văn A"
          />
        </div>

        <div className="md:col-span-2">
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
            placeholder="VD: user@example.com"
          />
        </div>

        <FormSelect
          label="Vai trò"
          name="role"
          value={formData.role}
          onChange={(value: string) => handleChange("role", value)}
          options={roleOptions}
          required
          error={errors.role}
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
          {user ? "Cập nhật" : "Thêm mới"}
        </Button>
      </div>
    </div>
  );
}