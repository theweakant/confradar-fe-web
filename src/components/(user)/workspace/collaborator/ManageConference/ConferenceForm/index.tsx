import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { FormSelect } from "@/components/molecules/FormSelect";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import { 
  CONFERENCE_CATEGORIES,
  CONFERENCE_RANKINGS,
  GLOBAL_STATUS_OPTIONS,
} from "@/types/conference.type";
import type { 
  ConferenceFormData, 
  ConferenceFormProps 
} from "@/types/conference.type";

export function ConferenceForm({ 
  conference, 
  onSave, 
  onCancel 
}: ConferenceFormProps) {
  const [formData, setFormData] = useState<ConferenceFormData>({
    conferenceId: conference?.conferenceId || "",
    conferenceName: conference?.conferenceName || "",
    description: conference?.description || "",
    startDate: conference?.startDate || "",
    endDate: conference?.endDate || "",
    capacity: conference?.capacity || 0,
    address: conference?.address || "",
    bannerImageUrl: conference?.bannerImageUrl || "",
    createdAt: conference?.createdAt || "",
    isInternalHosted: conference?.isInternalHosted || false,
    conferenceRankingId: conference?.conferenceRankingId || "",
    userId: conference?.userId || "",
    locationId: conference?.locationId || "",
    conferenceCategoryId: conference?.conferenceCategoryId || "",
    conferenceTypeId: conference?.conferenceTypeId || "",
    globalStatusId: conference?.globalStatusId || "draft",
    isActive: conference?.isActive ?? true
  });

  const handleChange = (
    field: keyof ConferenceFormData, 
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const handleSubmit = () => {
    onSave(formData);
  };

  // Convert conference type options
  const conferenceTypeOptions = [
    { value: "type-1", label: "Technology Conference" },
    { value: "type-2", label: "Research Conference" },
    { value: "type-3", label: "Business Summit" },
    { value: "type-4", label: "Education Workshop" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <FormInput
            label="Tên hội thảo"
            name="conferenceName"
            value={formData.conferenceName}
            onChange={(value: string) => handleChange("conferenceName", value)}
            required
            placeholder="VD: Hội thảo AI và Machine Learning 2025"
          />
        </div>

        <div className="md:col-span-2">
          <FormTextArea
            label="Mô tả"
            name="description"
            value={formData.description}
            onChange={(value: string) => handleChange("description", value)}
            required
            placeholder="Mô tả chi tiết về hội thảo..."
            rows={4}
          />
        </div>

        <FormInput
          label="Ngày bắt đầu"
          name="startDate"
          type="date"
          value={formData.startDate.slice(0, 16)}
          onChange={(value: string) => handleChange("startDate", value + ":00Z")}
          required
        />

        <FormInput
          label="Ngày kết thúc"
          name="endDate"
          type="date"
          value={formData.endDate.slice(0, 16)}
          onChange={(value: string) => handleChange("endDate", value + ":00Z")}
          required
        />

        <div className="md:col-span-2">
          <FormInput
            label="Địa chỉ"
            name="address"
            value={formData.address}
            onChange={(value: string) => handleChange("address", value)}
            required
            placeholder="VD: Trung tâm Hội nghị Quốc gia, Quận 1"
          />
        </div>

        <FormInput
          label="Location ID"
          name="locationId"
          value={formData.locationId}
          onChange={(value: string) => handleChange("locationId", value)}
          required
          placeholder="VD: location-123"
        />

        <FormInput
          label="Sức chứa"
          name="capacity"
          type="number"
          value={formData.capacity}
          onChange={(value: string) => handleChange("capacity", Number(value))}
          required
          placeholder="VD: 500"
        />

        <FormInput
          label="URL Banner"
          name="bannerImageUrl"
          value={formData.bannerImageUrl || ""}
          onChange={(value: string) => handleChange("bannerImageUrl", value)}
          placeholder="https://example.com/banner.jpg"
        />

        <FormSelect
          label="Danh mục"
          name="conferenceCategoryId"
          value={formData.conferenceCategoryId}
          onChange={(value: string) => handleChange("conferenceCategoryId", value)}
          options={CONFERENCE_CATEGORIES}
          required
        />

        <FormSelect
          label="Loại hội thảo"
          name="conferenceTypeId"
          value={formData.conferenceTypeId}
          onChange={(value: string) => handleChange("conferenceTypeId", value)}
          options={conferenceTypeOptions}
          required
        />

        <FormSelect
          label="Ranking"
          name="conferenceRankingId"
          value={formData.conferenceRankingId}
          onChange={(value: string) => handleChange("conferenceRankingId", value)}
          options={CONFERENCE_RANKINGS}
          required
        />

        <FormSelect
          label="Trạng thái"
          name="globalStatusId"
          value={formData.globalStatusId}
          onChange={(value: string) => handleChange("globalStatusId", value)}
          options={GLOBAL_STATUS_OPTIONS}
          required
        />

        <FormInput
          label="User ID"
          name="userId"
          value={formData.userId}
          onChange={(value: string) => handleChange("userId", value)}
          required
          placeholder="VD: user-123"
        />

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isInternalHosted"
            checked={formData.isInternalHosted}
            onChange={(e) => handleChange("isInternalHosted", e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isInternalHosted" className="text-sm font-medium text-gray-700">
            Tổ chức nội bộ
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => handleChange("isActive", e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Kích hoạt
          </label>
        </div>
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
          {conference ? "Cập nhật" : "Thêm mới"}
        </Button>
      </div>
    </div>
  );
}