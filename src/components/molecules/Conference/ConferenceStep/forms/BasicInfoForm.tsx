import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormInput } from "@/components/molecules/FormInput";
import { FormSelect } from "@/components/molecules/FormSelect";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import { DatePickerInput } from "@/components/atoms/DatePickerInput";
import { FileUpload } from "@/components/atoms/FileUpload";
import { ImageUpload } from "@/components/atoms/ImageUpload";
import { formatDate } from "@/helper/format";
import type { ConferenceBasicForm } from "@/types/conference.type";
import { TARGET_OPTIONS } from "../constants";
import { useStepNavigation } from "../hooks";

interface BasicInfoFormProps {
  value: ConferenceBasicForm;
  onChange: (data: ConferenceBasicForm) => void;
  validationErrors: Record<string, string>;
  onFieldBlur: (field: string) => void;
  categoryOptions: Array<{ value: string; label: string }>;
  cityOptions: Array<{ value: string; label: string }>;
  isCategoriesLoading: boolean;
  isCitiesLoading: boolean;
  isInternalHosted: boolean;
}

export function BasicInfoForm({
  value: formData,
  onChange,
  validationErrors,
  onFieldBlur,
  categoryOptions,
  cityOptions,
  isCategoriesLoading,
  isCitiesLoading,
  isInternalHosted,
}: BasicInfoFormProps) {
  const { isStepCompleted, handleUnmarkCompleted } = useStepNavigation();

  const handleChange = <K extends keyof ConferenceBasicForm>(
    field: K,
    value: ConferenceBasicForm[K]
  ) => {
    if (isStepCompleted(1)) {
      handleUnmarkCompleted(1);
    }

    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <FormInput
        label="Tên hội thảo"
        name="conferenceName"
        value={formData.conferenceName}
        onChange={(val) => handleChange("conferenceName", val)}
        onBlur={() => onFieldBlur("conferenceName")}
        error={validationErrors.conferenceName}
        success={!validationErrors.conferenceName && formData.conferenceName.length >= 10}
        required
      />

      <FormTextArea
        label="Mô tả"
        value={formData.description ?? ""}
        onChange={(val) => handleChange("description", val)}
        rows={3}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DatePickerInput
          label="Ngày bắt đầu"
          value={formData.startDate}
          onChange={(val) => handleChange("startDate", val)}
          required
        />

        <FormInput
          label="Số ngày diễn ra"
          type="number"
          value={formData.dateRange}
          onChange={(val) => handleChange("dateRange", Number(val))}
          error={validationErrors.dateRange}
          min="1"
          max="365"
          required
          placeholder="VD: 3 ngày"
        />

        <div>
          <label className="block text-sm font-medium mb-2">Ngày kết thúc</label>
          <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 flex items-center h-[42px]">
            {formData.endDate ? (
              <span className="text-gray-900">
                {new Date(formData.endDate).toLocaleDateString("vi-VN")}
              </span>
            ) : (
              <span className="text-gray-400">--/--/----</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DatePickerInput
          label="Ngày bắt đầu bán vé"
          sublabel={`Trước ngày bắt đầu sự kiện ${formatDate(formData.startDate)}`}
          value={formData.ticketSaleStart}
          onChange={(val) => handleChange("ticketSaleStart", val)}
          maxDate={formData.endDate}
          required
        />

        <FormInput
          label="Số ngày bán vé"
          type="number"
          min="1"
          value={formData.ticketSaleDuration}
          onChange={(val) => handleChange("ticketSaleDuration", Number(val))}
          required
          placeholder="VD: 30 ngày"
        />

        <div>
          <label className="block text-sm font-medium mb-2">Ngày kết thúc bán vé</label>
          <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 flex items-center h-[42px]">
            {formData.ticketSaleEnd ? (
              <span className="text-gray-900">
                {new Date(formData.ticketSaleEnd).toLocaleDateString("vi-VN")}
              </span>
            ) : (
              <span className="text-gray-400">--/--/----</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Tổng số người tham dự"
          name="totalSlot"
          type="number"
          value={formData.totalSlot}
          onChange={(val) => handleChange("totalSlot", Number(val))}
        />
        <div>
          <label className="block text-sm font-medium mb-2">
            Danh mục <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.conferenceCategoryId ?? ""}
            onValueChange={(val) => handleChange("conferenceCategoryId", val)}
            disabled={isCategoriesLoading}
          >
            <SelectTrigger className={`w-full ${validationErrors.conferenceCategoryId ? "border-red-500" : ""}`}>
              <SelectValue placeholder="Chọn danh mục..." />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto">
              <SelectGroup>
                {categoryOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {validationErrors.conferenceCategoryId && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.conferenceCategoryId}</p>
          )}
        </div>
      </div>

      {/* Address & City */}
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Địa chỉ"
          name="address"
          value={formData.address}
          onChange={(val) => handleChange("address", val)}
        />
        <div>
          <label className="block text-sm font-medium mb-2">
            Thành phố <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.cityId ?? ""}
            onValueChange={(val) => handleChange("cityId", val)}
            disabled={isCitiesLoading}
          >
            <SelectTrigger className={`w-full ${validationErrors.cityId ? "border-red-500" : ""}`}>
              <SelectValue placeholder="Chọn thành phố..." />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto">
              <SelectGroup>
                {cityOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {validationErrors.cityId && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.cityId}</p>
          )}
        </div>
      </div>

      {/* Target Audience */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Đối tượng mục tiêu
          </label>
          <Select
            value={formData.targetAudienceTechnicalConference ?? ""}
            onValueChange={(val) => handleChange("targetAudienceTechnicalConference", val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn đối tượng..." />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto">
              <SelectGroup>
              {TARGET_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {formData.targetAudienceTechnicalConference === "Khác" && (
          <FormInput
            label="Nhập đối tượng khác"
            value={formData.customTarget || ""}
            onChange={(val) => handleChange("customTarget", val)}
          />
        )}
      </div>


      {/* Banner Image */}
      <ImageUpload
        label="Banner Image (1 ảnh)"
        subtext="Dưới 4MB, định dạng PNG hoặc JPG"
        maxSizeMB={4}
        height="h-48"
        onChange={(file) => handleChange("bannerImageFile", file as File | null)}
      />
    </div>
  );
}