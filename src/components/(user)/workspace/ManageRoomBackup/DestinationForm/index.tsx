"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import type {
  Destination,
  DestinationFormData,
} from "@/types/destination.type";
import { validationDestinationRules } from "@/utils/validationRoomRules";

interface DestinationFormProps {
  destination?: Destination | null;
  onSave: (data: DestinationFormData) => void;
  onCancel: () => void;
}

export function DestinationForm({
  destination,
  onSave,
  onCancel,
}: DestinationFormProps) {
  const [formData, setFormData] = useState<DestinationFormData>({
    name: destination?.name || "",
    city: destination?.city || "",
    district: destination?.district || "",
    street: destination?.street || "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof DestinationFormData, string>>
  >({});
  const [touched, setTouched] = useState<Set<keyof DestinationFormData>>(
    new Set(),
  );

  // --- Thêm state cho API tỉnh/huyện ---
  const [provinces, setProvinces] = useState<{ code: number; name: string }[]>(
    [],
  );
  const [districts, setDistricts] = useState<{ code: number; name: string }[]>(
    [],
  );
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<
    number | null
  >(null);

  // Lấy danh sách tỉnh/thành khi mở form
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error("Lỗi tải provinces:", err));
  }, []);

  // Khi chọn tỉnh => load quận/huyện tương ứng
  useEffect(() => {
    if (selectedProvinceCode) {
      fetch(
        `https://provinces.open-api.vn/api/p/${selectedProvinceCode}?depth=2`,
      )
        .then((res) => res.json())
        .then((data) => setDistricts(data.districts || []))
        .catch((err) => console.error("Lỗi tải districts:", err));
    } else {
      setDistricts([]);
    }
  }, [selectedProvinceCode]);

  const handleChange = (field: keyof DestinationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
    setTouched((prev) => new Set(prev).add(field));
  };

  const validateField = (
    field: keyof DestinationFormData,
    value: string,
  ): boolean => {
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
      // Khi gửi => chỉ gửi name của city và district
      onSave({
        ...formData,
        city: formData.city, // đã là name của tỉnh
        district: formData.district, // đã là name của huyện
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tên địa điểm */}
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

        {/* Thành phố (dropdown từ API) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thành phố <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
            value={formData.city}
            onChange={(e) => {
              const selectedCode = Number(
                e.target.selectedOptions[0].getAttribute("data-code"),
              );
              setSelectedProvinceCode(selectedCode);
              handleChange("city", e.target.value);
              handleChange("district", ""); // reset huyện khi đổi tỉnh
            }}
          >
            <option value="">-- Chọn Tỉnh / Thành phố --</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.name} data-code={p.code}>
                {p.name}
              </option>
            ))}
          </select>
          {touched.has("city") && errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city}</p>
          )}
        </div>

        {/* Quận / Huyện (dropdown theo tỉnh) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quận / Huyện <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
            value={formData.district}
            onChange={(e) => handleChange("district", e.target.value)}
            disabled={!selectedProvinceCode}
          >
            <option value="">-- Chọn Quận / Huyện --</option>
            {districts.map((d) => (
              <option key={d.code} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
          {touched.has("district") && errors.district && (
            <p className="text-red-500 text-sm mt-1">{errors.district}</p>
          )}
        </div>

        {/* Đường */}
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
