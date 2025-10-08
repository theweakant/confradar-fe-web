import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { FormSelect } from "@/components/molecules/FormSelect";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import { validationConfRules } from "@/lib/utils/validationConfRules";
import type { 
  Conference, 
  ConferenceFormData, 
  ConferenceFormProps 
} from "@/types/conference.type";

export function ConferenceForm({ 
  conference, 
  onSave, 
  onCancel 
}: ConferenceFormProps) {
  const [formData, setFormData] = useState<ConferenceFormData>({
    title: conference?.title || "",
    description: conference?.description || "",
    startDate: conference?.startDate || "",
    endDate: conference?.endDate || "",
    location: conference?.location || "",
    venue: conference?.venue || "",
    category: conference?.category || "technology",
    status: conference?.status || "upcoming",
    registrationDeadline: conference?.registrationDeadline || "",
    maxAttendees: conference?.maxAttendees || 0,
    registrationFee: conference?.registrationFee || 0,
    organizerName: conference?.organizerName || "",
    organizerEmail: conference?.organizerEmail || "",
    website: conference?.website || "",
    tags: conference?.tags || []
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ConferenceFormData, string>>>({});
  const [touched, setTouched] = useState<Set<keyof ConferenceFormData>>(new Set());
  const [tagInput, setTagInput] = useState("");

  const handleChange = (
    field: keyof ConferenceFormData, 
    value: string | number | string[]
  ) => {
    setFormData((prev: ConferenceFormData) => ({ ...prev, [field]: value }));
    
    if (field !== "tags") {
      validateField(field, value);
      setTouched((prev: Set<keyof ConferenceFormData>) => new Set(prev).add(field));
    }
  };

  const validateField = (
    field: keyof ConferenceFormData, 
    value: string | number | string[]
  ): boolean => {
    if (Array.isArray(value)) return true;

    if (typeof field !== "string") return true;
    const fieldRules = validationConfRules[field];
    if (!fieldRules) return true;

    for (const rule of fieldRules) {
      if (!rule.validate(value)) {
        setErrors((prev: Partial<Record<keyof ConferenceFormData, string>>) => ({ 
          ...prev, 
          [field]: rule.message 
        }));
        return false;
      }
    }

    setErrors((prev: Partial<Record<keyof ConferenceFormData, string>>) => ({ 
      ...prev, 
      [field]: "" 
    }));
    return true;
  };

  const validate = (): boolean => {
    let isValid = true;
    const allFields = Object.keys(formData) as Array<keyof ConferenceFormData>;
    
    allFields.forEach((field: keyof ConferenceFormData) => {
      if (field === "tags" || field === "website") return;
      
      const fieldValue = formData[field];
      const fieldIsValid = validateField(field, fieldValue);
      
      if (!fieldIsValid) {
        isValid = false;
        setTouched((prev: Set<keyof ConferenceFormData>) => new Set(prev).add(field));
      }
    });

    // Date validations
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setErrors((prev: Partial<Record<keyof ConferenceFormData, string>>) => ({ 
        ...prev, 
        endDate: "Ngày kết thúc phải sau ngày bắt đầu" 
      }));
      isValid = false;
    }

    if (new Date(formData.registrationDeadline) > new Date(formData.startDate)) {
      setErrors((prev: Partial<Record<keyof ConferenceFormData, string>>) => ({ 
        ...prev, 
        registrationDeadline: "Hạn đăng ký phải trước ngày bắt đầu" 
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

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      handleChange("tags", [...formData.tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    handleChange("tags", formData.tags.filter((t: string) => t !== tag));
  };

  const categoryOptions = [
    { value: "technology", label: "Công nghệ" },
    { value: "research", label: "Nghiên cứu" },
    { value: "business", label: "Kinh doanh" },
    { value: "education", label: "Giáo dục" }
  ];

  const statusOptions = [
    { value: "upcoming", label: "Sắp diễn ra" },
    { value: "ongoing", label: "Đang diễn ra" },
    { value: "completed", label: "Đã kết thúc" },
    { value: "cancelled", label: "Đã hủy" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <FormInput
            label="Tiêu đề hội thảo"
            name="title"
            value={formData.title}
            onChange={(value: string) => handleChange("title", value)}
            onBlur={() => validateField("title", formData.title)}
            required
            error={touched.has("title") ? errors.title : undefined}
            success={touched.has("title") && !errors.title}
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
            error={errors.description}
            placeholder="Mô tả chi tiết về hội thảo..."
            rows={4}
          />
        </div>

        <FormInput
          label="Ngày bắt đầu"
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={(value: string) => handleChange("startDate", value)}
          onBlur={() => validateField("startDate", formData.startDate)}
          required
          error={touched.has("startDate") ? errors.startDate : undefined}
          success={touched.has("startDate") && !errors.startDate}
        />

        <FormInput
          label="Ngày kết thúc"
          name="endDate"
          type="date"
          value={formData.endDate}
          onChange={(value: string) => handleChange("endDate", value)}
          onBlur={() => validateField("endDate", formData.endDate)}
          required
          error={touched.has("endDate") ? errors.endDate : undefined}
          success={touched.has("endDate") && !errors.endDate}
        />

        <FormInput
          label="Địa điểm"
          name="location"
          value={formData.location}
          onChange={(value: string) => handleChange("location", value)}
          onBlur={() => validateField("location", formData.location)}
          required
          error={touched.has("location") ? errors.location : undefined}
          success={touched.has("location") && !errors.location}
          placeholder="VD: Hồ Chí Minh"
        />

        <FormInput
          label="Địa chỉ cụ thể"
          name="venue"
          value={formData.venue}
          onChange={(value: string) => handleChange("venue", value)}
          onBlur={() => validateField("venue", formData.venue)}
          required
          error={touched.has("venue") ? errors.venue : undefined}
          success={touched.has("venue") && !errors.venue}
          placeholder="VD: Trung tâm Hội nghị Quốc gia"
        />

        <FormSelect
          label="Danh mục"
          name="category"
          value={formData.category}
          onChange={(value: string) => handleChange("category", value)}
          options={categoryOptions}
          required
          error={errors.category}
        />

        <FormSelect
          label="Trạng thái"
          name="status"
          value={formData.status}
          onChange={(value: string) => handleChange("status", value)}
          options={statusOptions}
          required
          error={errors.status}
        />

        <FormInput
          label="Hạn đăng ký"
          name="registrationDeadline"
          type="date"
          value={formData.registrationDeadline}
          onChange={(value: string) => handleChange("registrationDeadline", value)}
          onBlur={() => validateField("registrationDeadline", formData.registrationDeadline)}
          required
          error={touched.has("registrationDeadline") ? errors.registrationDeadline : undefined}
          success={touched.has("registrationDeadline") && !errors.registrationDeadline}
        />

        <FormInput
          label="Số lượng tối đa"
          name="maxAttendees"
          type="number"
          value={formData.maxAttendees}
          onChange={(value: string) => handleChange("maxAttendees", Number(value))}
          onBlur={() => validateField("maxAttendees", formData.maxAttendees)}
          required
          error={touched.has("maxAttendees") ? errors.maxAttendees : undefined}
          success={touched.has("maxAttendees") && !errors.maxAttendees}
          placeholder="VD: 500"
        />

        <FormInput
          label="Phí đăng ký (VNĐ)"
          name="registrationFee"
          type="number"
          value={formData.registrationFee}
          onChange={(value: string) => handleChange("registrationFee", Number(value))}
          placeholder="VD: 500000"
        />

        <FormInput
          label="Tên người tổ chức"
          name="organizerName"
          value={formData.organizerName}
          onChange={(value: string) => handleChange("organizerName", value)}
          onBlur={() => validateField("organizerName", formData.organizerName)}
          required
          error={touched.has("organizerName") ? errors.organizerName : undefined}
          success={touched.has("organizerName") && !errors.organizerName}
          placeholder="VD: Nguyễn Văn A"
        />

        <FormInput
          label="Email người tổ chức"
          name="organizerEmail"
          type="email"
          value={formData.organizerEmail}
          onChange={(value: string) => handleChange("organizerEmail", value)}
          onBlur={() => validateField("organizerEmail", formData.organizerEmail)}
          required
          error={touched.has("organizerEmail") ? errors.organizerEmail : undefined}
          success={touched.has("organizerEmail") && !errors.organizerEmail}
          placeholder="VD: organizer@example.com"
        />

        <div className="md:col-span-2">
          <FormInput
            label="Website (tùy chọn)"
            name="website"
            type="url"
            value={formData.website || ""}
            onChange={(value: string) => handleChange("website", value)}
            placeholder="https://conference-website.com"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Nhập tag và nhấn Enter"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Thêm
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-blue-900 text-lg leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
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