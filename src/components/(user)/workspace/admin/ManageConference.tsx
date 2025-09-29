"use client";

import { useState } from "react";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Calendar,
  MapPin,
  Users,
  Clock,
  DollarSign,
  FileText,
  Eye,
  Link as LinkIcon,
  Tag
} from "lucide-react";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { formatCurrency, formatDate } from "@/helper/format";

import { SearchBar } from "@/components/molecules/SearchBar";
import { FormInput } from "@/components/molecules/FormInput";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { Modal } from "@/components/molecules/Modal";
import { StatCard } from "@/components/molecules/StatCard";
import {Button} from "@/components/atoms/Button";

type ConferenceFormData = Omit<Conference, "id" | "currentAttendees">;


// ============================================
// 🔄 REUSABLE: FormTextArea Component
// Có thể tái sử dụng cho các form khác
// ============================================
interface FormTextAreaProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  rows?: number;
}

function FormTextArea({ 
  label, 
  name, 
  value, 
  onChange, 
  required = false, 
  error,
  placeholder,
  rows = 4
}: FormTextAreaProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

// ============================================
// 🔄 REUSABLE: FormSelect Component
// Có thể tái sử dụng cho các form khác
// ============================================
interface FormSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  error?: string;
}

function FormSelect({ label, name, value, onChange, options, required = false, error }: FormSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      >
        <option value="">Chọn {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}



// ============================================
// CONFERENCE FORM COMPONENT
// ============================================
type ValidationRule = {
  validate: (value: string | number) => boolean;
  message: string;
};

type FieldValidation = {
  [key: string]: ValidationRule[];
};

interface ConferenceFormProps {
  conference?: Conference | null;
  onSave: (data: ConferenceFormData) => void;
  onCancel: () => void;
}

function ConferenceForm({ conference, onSave, onCancel }: ConferenceFormProps) {
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

  const validationRules: FieldValidation = {
    title: [
      {
        validate: (value) => String(value).trim().length > 0,
        message: "Tiêu đề hội thảo là bắt buộc"
      },
      {
        validate: (value) => String(value).trim().length >= 5,
        message: "Tiêu đề phải có ít nhất 5 ký tự"
      }
    ],
    description: [
      {
        validate: (value) => String(value).trim().length > 0,
        message: "Mô tả là bắt buộc"
      },
      {
        validate: (value) => String(value).trim().length >= 20,
        message: "Mô tả phải có ít nhất 20 ký tự"
      }
    ],
    startDate: [
      {
        validate: (value) => String(value).length > 0,
        message: "Ngày bắt đầu là bắt buộc"
      }
    ],
    endDate: [
      {
        validate: (value) => String(value).length > 0,
        message: "Ngày kết thúc là bắt buộc"
      }
    ],
    location: [
      {
        validate: (value) => String(value).trim().length > 0,
        message: "Địa điểm là bắt buộc"
      }
    ],
    venue: [
      {
        validate: (value) => String(value).trim().length > 0,
        message: "Địa chỉ cụ thể là bắt buộc"
      }
    ],
    registrationDeadline: [
      {
        validate: (value) => String(value).length > 0,
        message: "Hạn đăng ký là bắt buộc"
      }
    ],
    maxAttendees: [
      {
        validate: (value) => Number(value) > 0,
        message: "Số lượng người tham dự phải lớn hơn 0"
      }
    ],
    organizerName: [
      {
        validate: (value) => String(value).trim().length > 0,
        message: "Tên người tổ chức là bắt buộc"
      }
    ],
    organizerEmail: [
      {
        validate: (value) => String(value).trim().length > 0,
        message: "Email người tổ chức là bắt buộc"
      },
      {
        validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)),
        message: "Email không hợp lệ"
      }
    ]
  };

  const handleChange = (field: keyof ConferenceFormData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field !== 'tags') {
      validateField(field, value);
      setTouched(prev => new Set(prev).add(field));
    }
  };

  const validateField = (field: keyof ConferenceFormData, value: string | number | string[]): boolean => {
    // Skip validation for array fields (like tags)
    if (Array.isArray(value)) return true;

    const fieldRules = validationRules[field];
    if (!fieldRules) return true;

    for (const rule of fieldRules) {
      if (!rule.validate(value)) {
        setErrors(prev => ({ ...prev, [field]: rule.message }));
        return false;
      }
    }

    setErrors(prev => ({ ...prev, [field]: "" }));
    return true;
  };

  const validate = (): boolean => {
    let isValid = true;
    const allFields = Object.keys(formData) as Array<keyof ConferenceFormData>;
    
    allFields.forEach(field => {
      if (field === 'tags' || field === 'website') return;
      const fieldValue = formData[field];
      const fieldIsValid = validateField(field, fieldValue);
      if (!fieldIsValid) {
        isValid = false;
        setTouched(prev => new Set(prev).add(field));
      }
    });

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setErrors(prev => ({ ...prev, endDate: "Ngày kết thúc phải sau ngày bắt đầu" }));
      isValid = false;
    }

    if (new Date(formData.registrationDeadline) > new Date(formData.startDate)) {
      setErrors(prev => ({ ...prev, registrationDeadline: "Hạn đăng ký phải trước ngày bắt đầu" }));
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
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleChange("tags", [...formData.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    handleChange("tags", formData.tags.filter(t => t !== tag));
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
            onChange={(value) => handleChange("title", value)}
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
            onChange={(value) => handleChange("description", value)}
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
          onChange={(value) => handleChange("startDate", value)}
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
          onChange={(value) => handleChange("endDate", value)}
          onBlur={() => validateField("endDate", formData.endDate)}
          required
          error={touched.has("endDate") ? errors.endDate : undefined}
          success={touched.has("endDate") && !errors.endDate}
        />

        <FormInput
          label="Địa điểm"
          name="location"
          value={formData.location}
          onChange={(value) => handleChange("location", value)}
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
          onChange={(value) => handleChange("venue", value)}
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
          onChange={(value) => handleChange("category", value as any)}
          options={categoryOptions}
          required
          error={errors.category}
        />

        <FormSelect
          label="Trạng thái"
          name="status"
          value={formData.status}
          onChange={(value) => handleChange("status", value as any)}
          options={statusOptions}
          required
          error={errors.status}
        />

        <FormInput
          label="Hạn đăng ký"
          name="registrationDeadline"
          type="date"
          value={formData.registrationDeadline}
          onChange={(value) => handleChange("registrationDeadline", value)}
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
          onChange={(value) => handleChange("maxAttendees", Number(value))}
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
          onChange={(value) => handleChange("registrationFee", Number(value))}
          placeholder="VD: 500000"
        />

        <FormInput
          label="Tên người tổ chức"
          name="organizerName"
          value={formData.organizerName}
          onChange={(value) => handleChange("organizerName", value)}
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
          onChange={(value) => handleChange("organizerEmail", value)}
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
            onChange={(value) => handleChange("website", value)}
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
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
              placeholder="Nhập tag và nhấn Enter"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Thêm
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {conference ? "Cập nhật" : "Thêm mới"}
        </button>
      </div>
    </div>
  );
}

// ============================================
// CONFERENCE DETAIL VIEW COMPONENT
// ============================================
interface ConferenceDetailProps {
  conference: Conference;
  onClose: () => void;
}

function ConferenceDetail({ conference, onClose }: ConferenceDetailProps) {
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      technology: "Công nghệ",
      research: "Nghiên cứu",
      business: "Kinh doanh",
      education: "Giáo dục"
    };
    return labels[category] || category;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      upcoming: "Sắp diễn ra",
      ongoing: "Đang diễn ra",
      completed: "Đã kết thúc",
      cancelled: "Đã hủy"
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: string): "success" | "danger" | "warning" | "info" => {
    const variants: Record<string, "success" | "danger" | "warning" | "info"> = {
      upcoming: "info",
      ongoing: "success",
      completed: "warning",
      cancelled: "danger"
    };
    return variants[status] || "info";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900
          mb-2">{conference.title}</h3>
          <div className="flex items-center gap-3 mb-4">
            <StatusBadge
              status={getStatusLabel(conference.status)}
              variant={getStatusVariant(conference.status)}
            />
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              {getCategoryLabel(conference.category)}
            </span>
          </div>
        </div>
      </div>

      <div className="prose max-w-none">
        <p className="text-gray-700 leading-relaxed">{conference.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Thời gian</p>
              <p className="text-gray-900">{formatDate(conference.startDate)}</p>
              <p className="text-gray-600 text-sm">đến {formatDate(conference.endDate)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Địa điểm</p>
              <p className="text-gray-900">{conference.location}</p>
              <p className="text-gray-600 text-sm">{conference.venue}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Hạn đăng ký</p>
              <p className="text-gray-900">{formatDate(conference.registrationDeadline)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Số lượng</p>
              <p className="text-gray-900">
                {conference.currentAttendees} / {conference.maxAttendees} người
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(conference.currentAttendees / conference.maxAttendees) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Phí đăng ký</p>
              <p className="text-gray-900 font-semibold">
                {conference.registrationFee === 0 ? "Miễn phí" : formatCurrency(conference.registrationFee)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Người tổ chức</p>
              <p className="text-gray-900">{conference.organizerName}</p>
              <p className="text-gray-600 text-sm">{conference.organizerEmail}</p>
            </div>
          </div>

          {conference.website && (
            <div className="flex items-start gap-3">
              <LinkIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <a> 
                    <p className="text-sm font-medium text-gray-700">Website</p>

                    href={conference.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                    {">"}
                    {conference.website}
                    </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {conference.tags.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-5 h-5 text-gray-600" />
            <p className="text-sm font-medium text-gray-700">Tags</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {conference.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function ManageConference() {
  const [conferences, setConferences] = useState<Conference[]>([
    {
      id: "1",
      title: "Hội thảo Trí tuệ Nhân tạo 2025",
      description: "Hội thảo quốc tế về AI và Machine Learning, tập hợp các chuyên gia hàng đầu trong lĩnh vực công nghệ AI.",
      startDate: "2025-11-15",
      endDate: "2025-11-17",
      location: "Hồ Chí Minh",
      venue: "Trung tâm Hội nghị Quốc gia",
      category: "technology",
      status: "upcoming",
      registrationDeadline: "2025-11-01",
      maxAttendees: 500,
      currentAttendees: 234,
      registrationFee: 2000000,
      organizerName: "Nguyễn Văn An",
      organizerEmail: "an.nguyen@example.com",
      website: "https://ai-conference-2025.com",
      tags: ["AI", "Machine Learning", "Deep Learning", "Technology"]
    },
    {
      id: "2",
      title: "Vietnam Research Conference 2025",
      description: "Hội thảo nghiên cứu khoa học Việt Nam, trình bày các công trình nghiên cứu xuất sắc trong năm.",
      startDate: "2025-10-20",
      endDate: "2025-10-22",
      location: "Hà Nội",
      venue: "Đại học Quốc gia Hà Nội",
      category: "research",
      status: "ongoing",
      registrationDeadline: "2025-10-10",
      maxAttendees: 300,
      currentAttendees: 289,
      registrationFee: 1500000,
      organizerName: "Trần Thị Bình",
      organizerEmail: "binh.tran@example.com",
      website: "https://vrc2025.edu.vn",
      tags: ["Research", "Science", "Innovation"]
    },
    {
      id: "3",
      title: "Digital Marketing Summit 2025",
      description: "Hội nghị thượng đỉnh về Marketing số, chia sẻ xu hướng và chiến lược marketing mới nhất.",
      startDate: "2025-09-10",
      endDate: "2025-09-11",
      location: "Đà Nẵng",
      venue: "Furama Resort Đà Nẵng",
      category: "business",
      status: "completed",
      registrationDeadline: "2025-09-01",
      maxAttendees: 400,
      currentAttendees: 378,
      registrationFee: 3000000,
      organizerName: "Lê Hoàng Cường",
      organizerEmail: "cuong.le@example.com",
      website: "https://dms2025.vn",
      tags: ["Marketing", "Digital", "Business", "Strategy"]
    },
    {
      id: "4",
      title: "Hội thảo Đổi mới Giáo dục",
      description: "Hội thảo về đổi mới phương pháp giảng dạy và học tập trong kỷ nguyên số.",
      startDate: "2025-12-05",
      endDate: "2025-12-06",
      location: "Cần Thơ",
      venue: "Đại học Cần Thơ",
      category: "education",
      status: "upcoming",
      registrationDeadline: "2025-11-25",
      maxAttendees: 200,
      currentAttendees: 87,
      registrationFee: 0,
      organizerName: "Phạm Thị Dung",
      organizerEmail: "dung.pham@example.com",
      tags: ["Education", "Innovation", "E-Learning"]
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingConference, setEditingConference] = useState<Conference | null>(null);
  const [viewingConference, setViewingConference] = useState<Conference | null>(null);
  const [deleteConferenceId, setDeleteConferenceId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const filteredConferences = conferences.filter(conf => {
    const matchesSearch = conf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conf.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conf.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || conf.category === filterCategory;
    const matchesStatus = !filterStatus || conf.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreate = () => {
    setEditingConference(null);
    setIsModalOpen(true);
  };

  const handleEdit = (conference: Conference) => {
    setEditingConference(conference);
    setIsModalOpen(true);
  };

  const handleView = (conference: Conference) => {
    setViewingConference(conference);
    setIsDetailOpen(true);
  };

  const handleSave = (data: ConferenceFormData) => {
    if (editingConference) {
      setConferences(prev => prev.map(c => 
        c.id === editingConference.id 
          ? { ...c, ...data }
          : c
      ));
      showNotification("Cập nhật hội thảo thành công!", "success");
    } else {
      const newConference: Conference = {
        ...data,
        id: Date.now().toString(),
        currentAttendees: 0
      };
      setConferences(prev => [...prev, newConference]);
      showNotification("Thêm hội thảo thành công!", "success");
    }
    setIsModalOpen(false);
    setEditingConference(null);
  };

  const handleDelete = (id: string) => {
    setDeleteConferenceId(id);
  };

  const confirmDelete = () => {
    if (deleteConferenceId) {
      setConferences(prev => prev.filter(c => c.id !== deleteConferenceId));
      showNotification("Xóa hội thảo thành công!", "success");
      setDeleteConferenceId(null);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      technology: "Công nghệ",
      research: "Nghiên cứu",
      business: "Kinh doanh",
      education: "Giáo dục"
    };
    return labels[category] || category;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      upcoming: "Sắp diễn ra",
      ongoing: "Đang diễn ra",
      completed: "Đã kết thúc",
      cancelled: "Đã hủy"
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: string): "success" | "danger" | "warning" | "info" => {
    const variants: Record<string, "success" | "danger" | "warning" | "info"> = {
      upcoming: "info",
      ongoing: "success",
      completed: "warning",
      cancelled: "danger"
    };
    return variants[status] || "info";
  };

  const totalConferences = conferences.length;
  const upcomingConferences = conferences.filter(c => c.status === "upcoming").length;
  const ongoingConferences = conferences.filter(c => c.status === "ongoing").length;
  const completedConferences = conferences.filter(c => c.status === "completed").length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Hội thảo</h1>
          <p className="text-gray-600">Quản lý thông tin các hội thảo trên ConfRadar</p>
        </div>

        {notification && (
          <Alert className={`mb-6 ${notification.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
            <AlertDescription className={notification.type === "success" ? "text-green-800" : "text-red-800"}>
              {notification.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Tìm kiếm theo tên, mô tả, địa điểm..."
            />
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả danh mục</option>
              <option value="technology">Công nghệ</option>
              <option value="research">Nghiên cứu</option>
              <option value="business">Kinh doanh</option>
              <option value="education">Giáo dục</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="upcoming">Sắp diễn ra</option>
              <option value="ongoing">Đang diễn ra</option>
              <option value="completed">Đã kết thúc</option>
              <option value="cancelled">Đã hủy</option>
            </select>

            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Thêm hội thảo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Tổng hội thảo"
            value={totalConferences}
            icon={<Calendar className="w-10 h-10" />}
            color="blue"
          />
          <StatCard
            title="Sắp diễn ra"
            value={upcomingConferences}
            icon={<Clock className="w-10 h-10" />}
            color="purple"
          />
          <StatCard
            title="Đang diễn ra"
            value={ongoingConferences}
            icon={<Users className="w-10 h-10" />}
            color="green"
          />
          <StatCard
            title="Đã kết thúc"
            value={completedConferences}
            icon={<FileText className="w-10 h-10" />}
            color="orange"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Hội thảo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Thời gian</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Địa điểm</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Danh mục</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Số lượng</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phí</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredConferences.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      Không tìm thấy hội thảo nào
                    </td>
                  </tr>
                ) : (
                  filteredConferences.map((conference) => (
                    <tr key={conference.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="font-medium text-gray-900 truncate">{conference.title}</p>
                          <p className="text-sm text-gray-500 truncate">{conference.organizerName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <div>
                            <p className="text-sm whitespace-nowrap">
                              {new Date(conference.startDate).toLocaleDateString("vi-VN")}
                            </p>
                            <p className="text-xs text-gray-500">
                              đến {new Date(conference.endDate).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{conference.location}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          {getCategoryLabel(conference.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          status={getStatusLabel(conference.status)}
                          variant={getStatusVariant(conference.status)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {conference.currentAttendees}/{conference.maxAttendees}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {conference.registrationFee === 0 ? "Miễn phí" : formatCurrency(conference.registrationFee)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handleView(conference)}
                            icon={<Eye className="w-4 h-4" />}
                            variant="success"
                            tooltip="Xem chi tiết"
                          />
                          <Button
                            onClick={() => handleEdit(conference)}
                            icon={<Pencil className="w-4 h-4" />}
                            variant="primary"
                            tooltip="Chỉnh sửa"
                          />
                          <Button
                            onClick={() => handleDelete(conference.id)}
                            icon={<Trash2 className="w-4 h-4" />}
                            variant="danger"
                            tooltip="Xóa"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingConference(null);
        }}
        title={editingConference ? "Chỉnh sửa hội thảo" : "Thêm hội thảo mới"}
        size="lg"
      >
        <ConferenceForm
          conference={editingConference}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingConference(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setViewingConference(null);
        }}
        title="Chi tiết hội thảo"
        size="lg"
      >
        {viewingConference && (
          <ConferenceDetail
            conference={viewingConference}
            onClose={() => {
              setIsDetailOpen(false);
              setViewingConference(null);
            }}
          />
        )}
      </Modal>

      <AlertDialog open={!!deleteConferenceId} onOpenChange={() => setDeleteConferenceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa hội thảo này? Hành động này không thể hoàn tác và sẽ xóa tất cả các đăng ký liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}