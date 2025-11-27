import React, { useState } from 'react';
import { CreateLocalReviewerRequest } from '@/types/user.type';

interface LocalReviewerFormProps {
  onSave: (data: CreateLocalReviewerRequest) => void;
  onCancel: () => void;
}


export const LocalReviewerForm: React.FC<LocalReviewerFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<CreateLocalReviewerRequest>({
    fullName: '',
    email: '',
    // password: '',
    // confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ và tên';
    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';

    // if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
    // if (!formData.confirmPassword) newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    // if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword)
    //   newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) onSave(formData);
  };

  const handleChange = (field: keyof CreateLocalReviewerRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên *</label>
        <input
          type="text"
          value={formData.fullName}
          onChange={e => handleChange('fullName', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Nhập họ và tên"
        />
        {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
        <input
          type="email"
          value={formData.email}
          onChange={e => handleChange('email', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Nhập email"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      {/* <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu *</label>
        <input
          type="password"
          value={formData.password}
          onChange={e => handleChange('password', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Nhập mật khẩu"
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu *</label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={e => handleChange('confirmPassword', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Xác nhận mật khẩu"
        />
        {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
      </div> */}

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Hủy</button>
        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Thêm người đánh giá nội bộ</button>
      </div>
    </form>
  );
};