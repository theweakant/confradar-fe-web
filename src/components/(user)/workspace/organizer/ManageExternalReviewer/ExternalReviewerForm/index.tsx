import React, { useState } from 'react';
import { CreateNewReviewerContractRequest } from '@/types/contract.type';
import { Conference } from '@/types/conference.type';

interface ExternalReviewerFormProps {
  onSave: (data: CreateNewReviewerContractRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  selectedConference: Conference | null;
  onSelectConference: () => void;
  onChangeConference: () => void;
}

export const ExternalReviewerForm: React.FC<ExternalReviewerFormProps> = ({
  onSave,
  onCancel,
  isLoading = false,
  selectedConference,
  onSelectConference,
  onChangeConference
}) => {
  const [formData, setFormData] = useState<Omit<CreateNewReviewerContractRequest, 'contractFile'> & { contractFile: File | null }>({
    email: '',
    fullName: '',
    // password: '',
    // confirmPassword: '',
    wage: 0,
    conferenceId: '',
    signDay: '',
    contractFile: null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cập nhật conferenceId khi selectedConference thay đổi
  React.useEffect(() => {
    if (selectedConference) {
      setFormData(prev => ({ ...prev, conferenceId: selectedConference.conferenceId }));
    }
  }, [selectedConference]);

  const formatVND = (value: number) =>
    value.toLocaleString("vi-VN");

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // if (!formData.password) {
    //   newErrors.password = 'Vui lòng nhập mật khẩu';
    // } else if (formData.password.length < 6) {
    //   newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    // }

    // if (!formData.confirmPassword) {
    //   newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    // } else if (formData.password !== formData.confirmPassword) {
    //   newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    // }

    if (!formData.conferenceId) {
      newErrors.conferenceId = 'Vui lòng chọn hội nghị';
    }

    if (formData.wage <= 0) {
      newErrors.wage = 'Vui lòng nhập lương hợp lệ';
    }

    if (!formData.signDay) {
      newErrors.signDay = 'Vui lòng chọn ngày ký hợp đồng';
    }

    if (!formData.contractFile) {
      newErrors.contractFile = 'Vui lòng tải lên file hợp đồng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && formData.contractFile) {
      const submitData: CreateNewReviewerContractRequest = {
        email: formData.email,
        fullName: formData.fullName,
        // password: formData.password,
        // confirmPassword: formData.confirmPassword,
        wage: formData.wage,
        conferenceId: formData.conferenceId,
        signDay: formData.signDay,
        contractFile: formData.contractFile
      };
      onSave(submitData);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string | number | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Thông tin cá nhân */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin cá nhân</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Nhập họ và tên"
              disabled={isLoading}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="reviewer@example.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Tối thiểu 6 ký tự"
              disabled={isLoading}
              minLength={6}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div> */}

          {/* Confirm Password */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Nhập lại mật khẩu"
              disabled={isLoading}
              minLength={6}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div> */}
        </div>
      </div>

      {/* Thông tin hợp đồng */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin hợp đồng</h3>
        <div className="space-y-6">
          {/* Conference Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hội nghị <span className="text-red-500">*</span>
            </label>
            {selectedConference ? (
              <div className={`border rounded-lg p-3 bg-gray-50 ${errors.conferenceId ? 'border-red-500' : 'border-gray-300'
                }`}>
                <div className="flex items-start gap-3">
                  {selectedConference.bannerImageUrl && (
                    <img
                      src={selectedConference.bannerImageUrl}
                      alt={selectedConference.conferenceName}
                      className="w-16 h-16 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {selectedConference.conferenceName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {selectedConference.conferenceId}
                    </p>
                    {selectedConference.startDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        📅 {formatDate(selectedConference.startDate)}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onChangeConference}
                    className="text-sm text-blue-600 hover:text-blue-700 whitespace-nowrap"
                    disabled={isLoading}
                  >
                    Đổi
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={onSelectConference}
                className={`w-full px-3 py-2 border rounded-lg text-left text-gray-500 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.conferenceId ? 'border-red-500' : 'border-gray-300'
                  }`}
                disabled={isLoading}
              >
                Chọn hội nghị nghiên cứu
              </button>
            )}
            {errors.conferenceId && (
              <p className="mt-1 text-sm text-red-600">{errors.conferenceId}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lương (VND) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.wage ? formatVND(formData.wage) : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, "");
                  const number = parseInt(raw || "0", 10);
                  handleChange("wage", number);
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.wage ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder="5.000.000"
              />
              {/* <input
                type="number"
                value={formData.wage || ''}
                onChange={(e) => handleChange('wage', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.wage ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="5000000"
                disabled={isLoading}
                min="0"
                step="1000"
              /> */}
              {errors.wage && (
                <p className="mt-1 text-sm text-red-600">{errors.wage}</p>
              )}
            </div>

            {/* Sign Day */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày ký hợp đồng <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.signDay}
                onChange={(e) => handleChange('signDay', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.signDay ? 'border-red-500' : 'border-gray-300'
                  }`}
                disabled={isLoading}
              />
              {errors.signDay && (
                <p className="mt-1 text-sm text-red-600">{errors.signDay}</p>
              )}
            </div>
          </div>

          {/* Contract File */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File hợp đồng <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              onChange={(e) => handleChange('contractFile', e.target.files?.[0] || null)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.contractFile ? 'border-red-500' : 'border-gray-300'
                }`}
              disabled={isLoading}
              accept=".pdf,.doc,.docx"
            />
            {formData.contractFile && (
              <p className="mt-1 text-xs text-gray-500">
                Đã chọn: {formData.contractFile.name}
              </p>
            )}
            {errors.contractFile && (
              <p className="mt-1 text-sm text-red-600">{errors.contractFile}</p>
            )}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Đang xử lý...' : 'Tạo người đánh giá và hợp đồng'}
        </button>
      </div>
    </form>
  );
};