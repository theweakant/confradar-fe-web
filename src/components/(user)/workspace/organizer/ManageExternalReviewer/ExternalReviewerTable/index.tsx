import React from 'react';
import { Eye, UserMinus, UserCheck, Mail, Calendar } from 'lucide-react';
import { UserDetailForAdminAndOrganizerResponse } from '@/types/user.type';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ExternalReviewerTableProps {
  reviewers: UserDetailForAdminAndOrganizerResponse[];
  onView: (reviewer: UserDetailForAdminAndOrganizerResponse) => void;
  onSuspend: (userId: string) => void;
  onActivate: (userId: string) => void;
}

export const ExternalReviewerTable: React.FC<ExternalReviewerTableProps> = ({
  reviewers,
  onView,
  onSuspend,
  onActivate
}) => {
  if (reviewers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Không có người đánh giá theo hợp đồng nào</h3>
        <p className="text-gray-500">Danh sách người đánh giá theo hợp đồng sẽ hiển thị tại đây</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left py-4 px-6 font-medium text-gray-700">Thông tin người đánh giá theo hợp đồng</th>
            <th className="text-left py-4 px-6 font-medium text-gray-700">Email</th>
            <th className="text-left py-4 px-6 font-medium text-gray-700">Ngày tham gia</th>
            <th className="text-left py-4 px-6 font-medium text-gray-700">Trạng thái</th>
            <th className="text-center py-4 px-6 font-medium text-gray-700">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {reviewers.map((reviewer) => (
            <tr key={reviewer.userId} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-4 px-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-medium text-sm">
                      {reviewer.fullName?.charAt(0)?.toUpperCase() || 'R'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {reviewer.fullName || 'Chưa có tên'}
                    </h3>
                    <p className="text-sm text-gray-500">ID: {reviewer.userId}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{reviewer.email}</span>
                </div>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {reviewer.createdAt ? format(new Date(reviewer.createdAt), 'dd/MM/yyyy', { locale: vi }) : 'N/A'}
                  </span>
                </div>
              </td>
              <td className="py-4 px-6">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${reviewer.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                  }`}>
                  {reviewer.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                </span>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => onView(reviewer)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {reviewer.isActive ? (
                    <button
                      onClick={() => onSuspend(reviewer.userId)}
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Tạm ngưng tài khoản"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onActivate(reviewer.userId)}
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