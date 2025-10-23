"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import type { Destination, DestinationFormData } from "@/types/destination.type";
import { validationDestinationRules } from "@/utils/validationRoomRules";

interface DestinationFormProps {
  destination?: Destination | null;
  onSave: (data: DestinationFormData) => void;
  onCancel: () => void;
}

export function DestinationForm({ destination, onSave, onCancel }: DestinationFormProps) {
  const [formData, setFormData] = useState<DestinationFormData>({
    name: destination?.name || "",
    city: destination?.city || "",
    district: destination?.district || "",
    street: destination?.street || "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof DestinationFormData, string>>>({});
  const [touched, setTouched] = useState<Set<keyof DestinationFormData>>(new Set());

  const handleChange = (field: keyof DestinationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
    setTouched((prev) => new Set(prev).add(field));
  };

  const validateField = (field: keyof DestinationFormData, value: string): boolean => {
    const fieldRules = validationDestinationRules[field as string];
    if (!fieldRules) return true;

    for (const rule of fieldRules) {
      if (!rule.validate(value)) {
        setErrors((prev) => ({ ...prev, [field]: rule.message }));
        return false;
      }
    }

    setErrors((prev) => ({ ...prev, [field]: "" }));
    return true;
  };

  const validate = (): boolean => {
    let isValid = true;
    const allFields = Object.keys(formData) as Array<keyof DestinationFormData>;

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Tên địa điểm"
          name="name"
          value={formData.name}
          onChange={(value) => handleChange("name", value)}
          onBlur={() => validateField("name", formData.name)}
          required
          error={touched.has("name") ? errors.name : undefined}
          success={touched.has("name") && !errors.name}
          placeholder=""
        />

        <FormInput
          label="Thành phố"
          name="city"
          value={formData.city}
          onChange={(value) => handleChange("city", value)}
          onBlur={() => validateField("city", formData.city)}
          required
          error={touched.has("city") ? errors.city : undefined}
          success={touched.has("city") && !errors.city}
          placeholder=""
        />

        <FormInput
          label="Quận / Huyện"
          name="district"
          value={formData.district}
          onChange={(value) => handleChange("district", value)}
          onBlur={() => validateField("district", formData.district)}
          required
          error={touched.has("district") ? errors.district : undefined}
          success={touched.has("district") && !errors.district}
          placeholder=""
        />

        <FormInput
          label="Đường"
          name="street"
          value={formData.street}
          onChange={(value) => handleChange("street", value)}
          onBlur={() => validateField("street", formData.street)}
          required
          error={touched.has("street") ? errors.street : undefined}
          success={touched.has("street") && !errors.street}
          placeholder=""
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
          {destination ? "Cập nhật" : "Thêm mới"}
        </Button>
      </div>
    </div>
  );
}
