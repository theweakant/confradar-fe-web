import React from 'react';
import { Eye, UserMinus, UserCheck, Mail, Calendar } from 'lucide-react';
import { UserDetailForAdminAndOrganizerResponse } from '@/types/user.type';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface CustomerTableProps {
  customers: UserDetailForAdminAndOrganizerResponse[];
  onView: (customer: UserDetailForAdminAndOrganizerResponse) => void;
  onSuspend: (userId: string) => void;
  onActivate: (userId: string) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onView,
  onSuspend,
  onActivate
}) => {
  if (customers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 9a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Không có khách hàng nào</h3>
        <p className="text-gray-500">Danh sách khách hàng sẽ hiển thị tại đây</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left py-4 px-6 font-medium text-gray-700">Thông tin khách hàng</th>
            <th className="text-left py-4 px-6 font-medium text-gray-700">Email</th>
            <th className="text-left py-4 px-6 font-medium text-gray-700">Ngày tham gia</th>
            <th className="text-left py-4 px-6 font-medium text-gray-700">Trạng thái</th>
            <th className="text-center py-4 px-6 font-medium text-gray-700">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.userId} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-4 px-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {customer.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {customer.fullName || 'Chưa có tên'}
                    </h3>
                    <p className="text-sm text-gray-500">ID: {customer.userId}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{customer.email}</span>
                </div>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {customer.createdAt ? format(new Date(customer.createdAt), 'dd/MM/yyyy', { locale: vi }) : 'N/A'}
                  </span>
                </div>
              </td>
              <td className="py-4 px-6">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  customer.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {customer.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                </span>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => onView(customer)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {customer.isActive ? (
                    <button
                      onClick={() => onSuspend(customer.userId)}
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Tạm ngưng tài khoản"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onActivate(customer.userId)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Kích hoạt tài khoản"
                    >
                      <UserCheck className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};