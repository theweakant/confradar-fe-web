"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { FormSelect } from "@/components/molecules/FormSelect";
import { Upload, X, FileText } from "lucide-react";
import { validationUserRules } from "@/utils/validationUserRules";
import type { User, UserFormData } from "@/types/user.type";

interface ReviewerFormData extends UserFormData {
  password?: string;
  confirmPassword?: string;
  expertise?: string;
  startDate?: string;
  endDate?: string;
  contractFile?: File | null;
  contractFileName?: string;
  assignedConferences?: string[];
}

interface ReviewerFormProps {
  user?: User | null;
  onSave: (data: ReviewerFormData) => void;
  onCancel: () => void;
}

// Mock data cho conferences
const mockConferences = [
  { value: "conf-001", label: "Hội nghị Khoa học Máy tính 2024" },
  { value: "conf-002", label: "Hội nghị Trí tuệ Nhân tạo 2024" },
  { value: "conf-003", label: "Hội nghị An toàn Thông tin 2024" },
  { value: "conf-004", label: "Hội nghị IoT và Big Data 2024" },
];

export function ReviewerForm({ user, onSave, onCancel }: ReviewerFormProps) {
  const [formData, setFormData] = useState<ReviewerFormData>({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    address: user?.address || "",
    role: user?.role || "localreviewer",
    password: "",
    confirmPassword: "",
    expertise: "",
    startDate: "",
    endDate: "",
    contractFile: null,
    contractFileName: "",
    assignedConferences: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ReviewerFormData, string>>>({});
  const [touched, setTouched] = useState<Set<keyof ReviewerFormData>>(new Set());

  const handleChange = (field: keyof ReviewerFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (typeof value === 'string') {
      validateField(field, value);
    }
    setTouched((prev) => new Set(prev).add(field));
  };

  const validateField = (field: keyof ReviewerFormData, value: string): boolean => {
    if (typeof field !== "string") return true;
    
    // Custom validation for password fields
    if (field === "password" && !user) {
      if (!value || value.length < 6) {
        setErrors((prev) => ({ ...prev, [field]: "Mật khẩu phải có ít nhất 6 ký tự" }));
        return false;
      }
    }
    
    if (field === "confirmPassword") {
      if (value !== formData.password) {
        setErrors((prev) => ({ ...prev, [field]: "Mật khẩu xác nhận không khớp" }));
        return false;
      }
    }

    const fieldRules = validationUserRules[field as string];
    if (!fieldRules) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
      return true;
    }

    for (const rule of fieldRules) {
      if (!rule.validate(value)) {
        setErrors((prev) => ({ ...prev, [field]: rule.message }));
        return false;
      }
    }

    setErrors((prev) => ({ ...prev, [field]: "" }));
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, contractFile: 'Chỉ chấp nhận file PDF hoặc Word' }));
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, contractFile: 'Kích thước file không được vượt quá 5MB' }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        contractFile: file,
        contractFileName: file.name
      }));
      setErrors((prev) => ({ ...prev, contractFile: "" }));
    }
  };

  const removeFile = () => {
    setFormData((prev) => ({
      ...prev,
      contractFile: null,
      contractFileName: ""
    }));
  };

  const toggleConference = (conferenceId: string) => {
    setFormData((prev) => {
      const current = prev.assignedConferences || [];
      const newAssigned = current.includes(conferenceId)
        ? current.filter(id => id !== conferenceId)
        : [...current, conferenceId];
      return { ...prev, assignedConferences: newAssigned };
    });
  };

  const validate = (): boolean => {
    let isValid = true;
    const requiredFields: Array<keyof ReviewerFormData> = ['fullName', 'email', 'expertise'];
    
    // Only require password for new users
    if (!user) {
      requiredFields.push('password', 'confirmPassword');
    }

    requiredFields.forEach((field) => {
      const fieldValue = formData[field] as string;
      const fieldIsValid = validateField(field, fieldValue || '');

      if (!fieldIsValid || !fieldValue) {
        isValid = false;
        setTouched((prev) => new Set(prev).add(field));
      }
    });

    // Validate dates
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        setErrors((prev) => ({ ...prev, endDate: 'Ngày kết thúc phải sau ngày bắt đầu' }));
        isValid = false;
      }
    }

    return isValid;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  const roleOptions = [
    { value: "localreviewer", label: "Phản biện nội bộ" },
    { value: "externalreviewer", label: "Phản biện bên ngoài" },
  ];

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
      {/* Account Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
          Thông tin Tài khoản
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <FormInput
              label="Họ và tên"
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
              placeholder="VD: reviewer@example.com"
            />
          </div>

          {!user && (
            <>
              <FormInput
                label="Mật khẩu"
                name="password"
                type="password"
                value={formData.password || ""}
                onChange={(value: string) => handleChange("password", value)}
                onBlur={() => validateField("password", formData.password || "")}
                required
                error={touched.has("password") ? errors.password : undefined}
                success={touched.has("password") && !errors.password}
                placeholder="Tối thiểu 6 ký tự"
              />

              <FormInput
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword || ""}
                onChange={(value: string) => handleChange("confirmPassword", value)}
                onBlur={() => validateField("confirmPassword", formData.confirmPassword || "")}
                required
                error={touched.has("confirmPassword") ? errors.confirmPassword : undefined}
                success={touched.has("confirmPassword") && !errors.confirmPassword}
                placeholder="Nhập lại mật khẩu"
              />
            </>
          )}
        </div>
      </div>

      {/* Reviewer Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
          Thông tin Reviewer
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <FormInput
              label="Chuyên môn"
              name="expertise"
              value={formData.expertise || ""}
              onChange={(value: string) => handleChange("expertise", value)}
              required
              error={touched.has("expertise") ? errors.expertise : undefined}
              success={touched.has("expertise") && !errors.expertise}
              placeholder="VD: Trí tuệ nhân tạo, Machine Learning, Deep Learning"
            />
          </div>

          <FormInput
            label="Ngày bắt đầu"
            name="startDate"
            type="date"
            value={formData.startDate || ""}
            onChange={(value: string) => handleChange("startDate", value)}
            error={touched.has("startDate") ? errors.startDate : undefined}
            success={touched.has("startDate") && !errors.startDate}
          />

          <FormInput
            label="Ngày kết thúc"
            name="endDate"
            type="date"
            value={formData.endDate || ""}
            onChange={(value: string) => handleChange("endDate", value)}
            error={touched.has("endDate") ? errors.endDate : undefined}
            success={touched.has("endDate") && !errors.endDate}
          />

          <div className="md:col-span-2">
            <FormSelect
              label="Loại Reviewer"
              name="role"
              value={formData.role}
              onChange={(value: string) => handleChange("role", value)}
              options={roleOptions}
              required
              error={errors.role}
            />
          </div>
        </div>

        {/* Conference Assignment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phân công Hội nghị
          </label>
          <div className="space-y-2">
            {mockConferences.map((conference) => (
              <div
                key={conference.value}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  id={conference.value}
                  checked={formData.assignedConferences?.includes(conference.value)}
                  onChange={() => toggleConference(conference.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor={conference.value}
                  className="flex-1 text-sm text-gray-700 cursor-pointer"
                >
                  {conference.label}
                </label>
              </div>
            ))}
          </div>

          {formData.assignedConferences && formData.assignedConferences.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Đã chọn:</span> {formData.assignedConferences.length} hội nghị
              </p>
            </div>
          )}
        </div>

        {/* Contract File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload hợp đồng
          </label>
          
          {!formData.contractFileName ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                id="contract-upload"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              <label
                htmlFor="contract-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Click để upload hoặc kéo thả file vào đây
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PDF, DOC, DOCX (tối đa 5MB)
                </span>
              </label>
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formData.contractFileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formData.contractFile ? `${(formData.contractFile.size / 1024).toFixed(2)} KB` : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          
          {errors.contractFile && (
            <p className="text-sm text-red-500 mt-1">{errors.contractFile}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
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