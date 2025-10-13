"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { FormSelect } from "@/components/molecules/FormSelect";
import { validationRoomRules } from "@/lib/utils/validationRoomRules";
import type { Room, RoomFormData } from "@/types/room.type";

interface RoomFormProps {
  room?: Room | null;
  onSave: (data: RoomFormData) => void;
  onCancel: () => void;
}

export function RoomForm({ room, onSave, onCancel }: RoomFormProps) {
  const [formData, setFormData] = useState<RoomFormData>({
    displayName: room?.displayName || "",
    number: room?.number || "",
    destinationId: room?.destinationId || "",
    status: room?.status || "available"
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RoomFormData, string>>>({});
  const [touched, setTouched] = useState<Set<keyof RoomFormData>>(new Set());

  const handleChange = (field: keyof RoomFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
    setTouched((prev) => new Set(prev).add(field));
  };

  const validateField = (field: keyof RoomFormData, value: string): boolean => {
    const fieldRules = validationRoomRules[field as string];
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
    const allFields = Object.keys(formData) as Array<keyof RoomFormData>;

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

  const statusOptions = [
    { value: "available", label: "Có sẵn" },
    { value: "unavailable", label: "Không có sẵn" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <FormInput
            label="Tên hiển thị"
            name="displayName"
            value={formData.displayName}
            onChange={(value) => handleChange("displayName", value)}
            onBlur={() => validateField("displayName", formData.displayName)}
            required
            error={touched.has("displayName") ? errors.displayName : undefined}
            success={touched.has("displayName") && !errors.displayName}
            placeholder="VD: Phòng Deluxe hướng biển"
          />
        </div>

        <FormInput
          label="Số phòng"
          name="number"
          value={formData.number}
          onChange={(value) => handleChange("number", value)}
          onBlur={() => validateField("number", formData.number)}
          required
          error={touched.has("number") ? errors.number : undefined}
          success={touched.has("number") && !errors.number}
          placeholder="VD: A101"
        />

        <FormInput
          label="Mã điểm đến"
          name="destinationId"
          value={formData.destinationId}
          onChange={(value) => handleChange("destinationId", value)}
          onBlur={() => validateField("destinationId", formData.destinationId)}
          required
          error={touched.has("destinationId") ? errors.destinationId : undefined}
          success={touched.has("destinationId") && !errors.destinationId}
          placeholder="VD: DEST12345"
        />

        <FormSelect
          label="Trạng thái"
          name="status"
          value={formData.status}
          onChange={(value) => handleChange("status", value)}
          options={statusOptions}
          required
          error={errors.status}
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
          {room ? "Cập nhật" : "Thêm mới"}
        </Button>
      </div>
    </div>
  );
}
