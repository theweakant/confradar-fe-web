import React from 'react';
import { X, User, Mail, Calendar, Shield, Activity } from 'lucide-react';
import { UserDetailForAdminAndOrganizerResponse } from '@/types/user.type';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface CustomerDetailProps {
  customer: UserDetailForAdminAndOrganizerResponse;
  onClose: () => void;
}

export const CustomerDetail: React.FC<CustomerDetailProps> = ({
  customer,
  onClose
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="text-xl font-semibold text-gray-900">
          Chi tiết khách hàng
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Section */}
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-semibold text-xl">
            {customer.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">
            {customer.fullName || 'Chưa có tên'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">ID: {customer.userId}</p>
          <div className="mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
              }`}>
              {customer.isActive ? 'Hoạt động' : 'Tạm ngưng'}
            </span>
          </div>
        </div>
      </div>

      {/* Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <User className="w-4 h-4 mr-2" />
            Thông tin cơ bản
          </h4>
          <div className="space-y-3 pl-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Họ và tên</label>
              <p className="text-gray-900">{customer.fullName || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900">{customer.email}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
              <p className="text-gray-900">{customer.phoneNumber || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Giới tính</label>
              <p className="text-gray-900">
                {customer.gender === 'Male' ? 'Nam' :
                  customer.gender === 'Female' ? 'Nữ' :
                    customer.gender === 'Other' ? 'Khác' : 'Chưa cập nhật'}
              </p>
            </div>
            {/* <div>
              <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
              <p className="text-gray-900">{customer.address || 'Chưa cập nhật'}</p>
            </div> */}
          </div>
        </div>

        {/* Account Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Thông tin tài khoản
          </h4>
          <div className="space-y-3 pl-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Ngày tham gia</label>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900">
                  {customer.createdAt
                    ? format(new Date(customer.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
            {/* <div>
              <label className="text-sm font-medium text-gray-500">Cập nhật lần cuối</label>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900">
                  {customer.updatedAt
                    ? format(new Date(customer.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })
                    : 'N/A'
                  }
                </p>
              </div>
            </div> */}
            <div>
              <label className="text-sm font-medium text-gray-500">Trạng thái tài khoản</label>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${customer.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <p className={`font-medium ${customer.isActive ? 'text-green-700' : 'text-red-700'}`}>
                  {customer.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                </p>
              </div>
            </div>
            {customer.isEmailConfirmed !== undefined && (
              <div>
                <label className="text-sm font-medium text-gray-500">Xác thực email</label>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${customer.isEmailConfirmed ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <p className={`font-medium ${customer.isEmailConfirmed ? 'text-green-700' : 'text-yellow-700'}`}>
                    {customer.isEmailConfirmed ? 'Đã xác thực' : 'Chưa xác thực'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Organization Information if available */}
      {/* {customer.organizationName && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Thông tin tổ chức</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Tên tổ chức</label>
                <p className="text-gray-900">{customer.organizationName}</p>
              </div>
              {customer.organizationAddress && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Địa chỉ tổ chức</label>
                  <p className="text-gray-900">{customer.organizationAddress}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )} */}

      {/* Footer */}
      <div className="border-t pt-4">
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};