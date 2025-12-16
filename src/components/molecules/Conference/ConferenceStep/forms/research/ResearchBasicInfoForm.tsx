import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormInput } from "@/components/molecules/FormInput";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import { DatePickerInput } from "@/components/atoms/DatePickerInput";
import { ImageUpload } from "@/components/atoms/ImageUpload";
import { formatDate } from "@/helper/format";
import type { ConferenceBasicForm } from "@/types/conference.type";

interface ResearchBasicInfoFormProps {
  value: ConferenceBasicForm;
  onChange: (data: ConferenceBasicForm) => void;
  validationErrors: Record<string, string>;
  onFieldBlur: (field: string) => void;
  categoryOptions: Array<{ value: string; label: string }>;
  cityOptions: Array<{ value: string; label: string }>;
  isCategoriesLoading: boolean;
  isCitiesLoading: boolean;
}

export function ResearchBasicInfoForm({
  value,
  onChange,
  validationErrors,
  onFieldBlur,
  categoryOptions,
  cityOptions,
  isCategoriesLoading,
  isCitiesLoading,
}: ResearchBasicInfoFormProps) {
  const handleChange = <K extends keyof ConferenceBasicForm>(
    field: K,
    newValue: ConferenceBasicForm[K]
  ) => {
    onChange({ ...value, [field]: newValue });
  };

  return (
    <div className="space-y-4">
      <FormInput
        label="Tên hội nghị nghiên cứu"
        name="conferenceName"
        value={value.conferenceName}
        onChange={(val) => handleChange("conferenceName", val)}
        onBlur={() => onFieldBlur("conferenceName")}
        error={validationErrors.conferenceName}
        success={!validationErrors.conferenceName && value.conferenceName.length >= 10}
        required
        placeholder="VD: International Conference on AI Research 2025"
      />

      <FormTextArea
        label="Mô tả"
        value={value.description ?? ""}
        onChange={(val) => handleChange("description", val)}
        rows={3}
        required
        placeholder="Mô tả chi tiết về hội nghị nghiên cứu..."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DatePickerInput
          label="Ngày bắt đầu hội nghị"
          value={value.startDate}
          onChange={(val) => handleChange("startDate", val)}
          required
        />

        <FormInput
          label="Số ngày diễn ra"
          type="number"
          value={value.dateRange ?? ""}
          onChange={(val) => handleChange("dateRange", val === "" ? undefined : Number(val))}
          onBlur={() => onFieldBlur("dateRange")}
          error={validationErrors.dateRange}
          min="1"
          max="365"
          required
          placeholder="VD: 3 ngày"
        />

        <div>
          <label className="block text-sm font-medium mb-2">
            Ngày kết thúc hội nghị
          </label>
          <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 flex items-center h-[42px]">
            {value.endDate ? (
              <span className="text-gray-900">
                {new Date(value.endDate).toLocaleDateString("vi-VN")}
              </span>
            ) : (
              <span className="text-gray-400">--/--/----</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DatePickerInput
          label="Ngày bắt đầu đăng kí cho thính giả"
          sublabel={
            value.startDate
              ? `Trước ngày bắt đầu sự kiện ${formatDate(value.startDate)}`
              : undefined
          }
          value={value.ticketSaleStart}
          onChange={(val) => {
            handleChange("ticketSaleStart", val);
            onFieldBlur("ticketSaleStart");
          }}
          maxDate={value.startDate}
          required
        />

        <FormInput
          label="Số ngày diễn ra"
          type="number"
          min="1"
          value={value.ticketSaleDuration ?? ""}
          onChange={(val) => handleChange("ticketSaleDuration", val === "" ? undefined : Number(val))}
          onBlur={() => onFieldBlur("ticketSaleDuration")}
          error={validationErrors.ticketSaleDuration}
          required
          placeholder="VD: 30 ngày"
        />

        <div>
          <label className="block text-sm font-medium mb-2">
            Ngày kết thúc đăng kí cho thính giả
          </label>
          <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 flex items-center h-[42px]">
            {value.ticketSaleEnd ? (
              <span className="text-gray-900">
                {new Date(value.ticketSaleEnd).toLocaleDateString("vi-VN")}
              </span>
            ) : (
              <span className="text-gray-400">--/--/----</span>
            )}
          </div>
        </div>
      </div>

      {value.ticketSaleStart && value.startDate && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            <strong>Lưu ý:</strong> Timeline nghiên cứu (Registration, Full Paper, Review, etc.) 
            phải hoàn thành TRƯỚC ngày bắt đầu bán ({formatDate(value.ticketSaleStart)})
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Tổng số người tham dự"
          name="totalSlot"
          type="number"
          value={value.totalSlot}
          onChange={(val) => handleChange("totalSlot", Number(val))}
          onBlur={() => onFieldBlur("totalSlot")}
          error={validationErrors.totalSlot}
          success={!validationErrors.totalSlot && value.totalSlot > 0}
          min="1"
          required
          placeholder="VD: 200"
        />
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Danh mục <span className="text-red-500">*</span>
          </label>
          <Select
            value={value.conferenceCategoryId ?? ""}
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

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Địa chỉ"
          name="address"
          value={value.address}
          onChange={(val) => handleChange("address", val)}
          placeholder="VD: 123 Nguyen Hue, District 1"
        />
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Thành phố <span className="text-red-500">*</span>
          </label>
          <Select
            value={value.cityId ?? ""}
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

      <ImageUpload
        label="Banner Image (1 ảnh)"
        subtext="Dưới 4MB, định dạng PNG hoặc JPG"
        maxSizeMB={4}
        height="h-48"
        onChange={(file) => handleChange("bannerImageFile", file as File | null)}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <strong>Chú ý:</strong> Hội nghị nghiên cứu yêu cầu thiết lập Timeline 
          (Registration, Full Paper, Review, Revision, Camera Ready) ở bước 3.
        </p>
      </div>
    </div>
  );
}