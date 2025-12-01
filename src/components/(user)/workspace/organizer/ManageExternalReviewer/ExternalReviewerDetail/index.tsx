import React, { useState } from 'react';
import { X, User, Mail, Calendar, Shield, FileText } from 'lucide-react';
import { UserDetailForAdminAndOrganizerResponse } from '@/types/user.type';
import { useGetContractsByReviewerQuery } from '@/redux/services/contract.service';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import ReusableDocViewer from '@/components/molecules/ReusableDocViewer ';

interface ExternalReviewerDetailProps {
  reviewer: UserDetailForAdminAndOrganizerResponse;
  onClose: () => void;
}

export const ExternalReviewerDetail: React.FC<ExternalReviewerDetailProps> = ({
  reviewer,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'contracts'>('info');

  // Gọi API lấy danh sách hợp đồng
  const {
    data: contractsData,
    isLoading: isLoadingContracts
  } = useGetContractsByReviewerQuery(
    { reviewerId: reviewer.userId },
    { skip: !reviewer.userId }
  );

  const contracts = contractsData?.data || [];

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="text-xl font-semibold text-gray-900">
          Chi tiết người đánh giá theo hợp đồng
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div> */}

      {/* Profile Section */}
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
          <span className="text-purple-600 font-semibold text-xl">
            {reviewer.fullName?.charAt(0)?.toUpperCase() || 'R'}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">
            {reviewer.fullName || 'Chưa có tên'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">ID: {reviewer.userId}</p>
          <div className="mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${reviewer.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
              }`}>
              {reviewer.isActive ? 'Hoạt động' : 'Tạm ngưng'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 border-b-2 transition-colors ${activeTab === 'info'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="font-medium">Thông tin</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`pb-3 border-b-2 transition-colors ${activeTab === 'contracts'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span className="font-medium">
                Hợp đồng {isLoadingContracts ? '(...)' : `(${contracts.length})`}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' ? (
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
                <p className="text-gray-900">{reviewer.fullName || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{reviewer.email}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                <p className="text-gray-900">{reviewer.phoneNumber || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Giới tính</label>
                <p className="text-gray-900">
                  {reviewer.gender === 'Male' ? 'Nam' :
                    reviewer.gender === 'Female' ? 'Nữ' :
                      reviewer.gender === 'Other' ? 'Khác' : 'Chưa cập nhật'}
                </p>
              </div>
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
                    {reviewer.createdAt
                      ? format(new Date(reviewer.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Trạng thái tài khoản</label>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${reviewer.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <p className={`font-medium ${reviewer.isActive ? 'text-green-700' : 'text-red-700'}`}>
                    {reviewer.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                  </p>
                </div>
              </div>
              {reviewer.isEmailConfirmed !== undefined && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Xác thực email</label>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${reviewer.isEmailConfirmed ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <p className={`font-medium ${reviewer.isEmailConfirmed ? 'text-green-700' : 'text-yellow-700'}`}>
                      {reviewer.isEmailConfirmed ? 'Đã xác thực' : 'Chưa xác thực'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {isLoadingContracts ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 ml-3">Đang tải danh sách hợp đồng...</p>
            </div>
          ) : contracts.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {contracts.map((contract, index) => (
                <div key={contract.reviewerContractId || index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start gap-3">
                    {contract.conferenceBannerImageUrl && (
                      <img
                        src={contract.conferenceBannerImageUrl}
                        alt={contract.conferenceName}
                        className="w-16 h-16 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {contract.conferenceName || 'N/A'}
                      </h4>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                        {contract.conferenceDescription || 'Không có mô tả'}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Lương:</span>
                          <span className="ml-1 font-medium text-green-600">
                            {formatCurrency(contract.wage)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Ngày ký:</span>
                          <span className="ml-1 font-medium">
                            {contract.signDay ? format(new Date(contract.signDay), 'dd/MM/yyyy', { locale: vi }) : 'N/A'}
                          </span>
                        </div>
                        {contract.expireDay && (
                          <div>
                            <span className="text-gray-500">Ngày hết hạn:</span>
                            <span className="ml-1 font-medium">
                              {format(new Date(contract.expireDay), 'dd/MM/yyyy', { locale: vi })}
                            </span>
                          </div>
                        )}
                      </div>
                      {contract.contractUrl && (<div className="pt-4 border-t border-green-700/30">
                        <a
                          href={contract.contractUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center mt-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Xem hợp đồng
                        </a>

                        <div className="max-h-[70vh] overflow-auto rounded-lg border border-green-700/50 bg-gray-900/50">
                          <ReusableDocViewer
                            fileUrl={contract.contractUrl}
                            minHeight={400}
                            checkUrlBeforeRender={true}
                          />
                          {/* <DocViewer
                                documents={[{ uri: paperInfo.fileUrl }]}
                                pluginRenderers={DocViewerRenderers}
                                config={{
                                    header: { disableHeader: true },
                                    pdfVerticalScrollByDefault: true,
                                }}
                                style={{ minHeight: "500px", borderRadius: 8 }}
                            /> */}
                        </div>
                      </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Chưa có hợp đồng nào
            </div>
          )}
        </div>
      )
      }

      {/* Footer */}
      <div className="border-t pt-4">
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Đóng
        </button>
      </div>
    </div >
  );
};

// import React from 'react';
// import { X, User, Mail, Calendar, Shield, Activity } from 'lucide-react';
// import { UserDetailForAdminAndOrganizerResponse } from '@/types/user.type';
// import { format } from 'date-fns';
// import { vi } from 'date-fns/locale';

// interface ExternalReviewerDetailProps {
//   reviewer: UserDetailForAdminAndOrganizerResponse;
//   onClose: () => void;
// }

// export const ExternalReviewerDetail: React.FC<ExternalReviewerDetailProps> = ({
//   reviewer,
//   onClose
// }) => {
//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between pb-4 border-b">
//         <h2 className="text-xl font-semibold text-gray-900">
//           Chi tiết người đánh giá theo hợp đồng
//         </h2>
//         <button
//           onClick={onClose}
//           className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//         >
//           <X className="w-5 h-5" />
//         </button>
//       </div>

//       {/* Profile Section */}
//       <div className="flex items-start space-x-4">
//         <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
//           <span className="text-purple-600 font-semibold text-xl">
//             {reviewer.fullName?.charAt(0)?.toUpperCase() || 'R'}
//           </span>
//         </div>
//         <div className="flex-1">
//           <h3 className="text-lg font-medium text-gray-900">
//             {reviewer.fullName || 'Chưa có tên'}
//           </h3>
//           <p className="text-sm text-gray-500 mt-1">ID: {reviewer.userId}</p>
//           <div className="mt-2">
//             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${reviewer.isActive
//               ? 'bg-green-100 text-green-800'
//               : 'bg-red-100 text-red-800'
//               }`}>
//               {reviewer.isActive ? 'Hoạt động' : 'Tạm ngưng'}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Information Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Basic Information */}
//         <div className="space-y-4">
//           <h4 className="font-medium text-gray-900 flex items-center">
//             <User className="w-4 h-4 mr-2" />
//             Thông tin cơ bản
//           </h4>
//           <div className="space-y-3 pl-6">
//             <div>
//               <label className="text-sm font-medium text-gray-500">Họ và tên</label>
//               <p className="text-gray-900">{reviewer.fullName || 'Chưa cập nhật'}</p>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-500">Email</label>
//               <div className="flex items-center space-x-2">
//                 <Mail className="w-4 h-4 text-gray-400" />
//                 <p className="text-gray-900">{reviewer.email}</p>
//               </div>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
//               <p className="text-gray-900">{reviewer.phoneNumber || 'Chưa cập nhật'}</p>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-500">Giới tính</label>
//               <p className="text-gray-900">
//                 {reviewer.gender === 'Male' ? 'Nam' :
//                   reviewer.gender === 'Female' ? 'Nữ' :
//                     reviewer.gender === 'Other' ? 'Khác' : 'Chưa cập nhật'}
//               </p>
//             </div>
//             {/* <div>
//               <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
//               <p className="text-gray-900">{reviewer.address || 'Chưa cập nhật'}</p>
//             </div> */}
//           </div>
//         </div>

//         {/* Account Information */}
//         <div className="space-y-4">
//           <h4 className="font-medium text-gray-900 flex items-center">
//             <Shield className="w-4 h-4 mr-2" />
//             Thông tin tài khoản
//           </h4>
//           <div className="space-y-3 pl-6">
//             <div>
//               <label className="text-sm font-medium text-gray-500">Ngày tham gia</label>
//               <div className="flex items-center space-x-2">
//                 <Calendar className="w-4 h-4 text-gray-400" />
//                 <p className="text-gray-900">
//                   {reviewer.createdAt
//                     ? format(new Date(reviewer.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })
//                     : 'N/A'
//                   }
//                 </p>
//               </div>
//             </div>
//             {/* <div>
//               <label className="text-sm font-medium text-gray-500">Cập nhật lần cuối</label>
//               <div className="flex items-center space-x-2">
//                 <Activity className="w-4 h-4 text-gray-400" />
//                 <p className="text-gray-900">
//                   {reviewer.updatedAt
//                     ? format(new Date(reviewer.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })
//                     : 'N/A'
//                   }
//                 </p>
//               </div>
//             </div> */}
//             <div>
//               <label className="text-sm font-medium text-gray-500">Trạng thái tài khoản</label>
//               <div className="flex items-center space-x-2">
//                 <div className={`w-2 h-2 rounded-full ${reviewer.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
//                 <p className={`font-medium ${reviewer.isActive ? 'text-green-700' : 'text-red-700'}`}>
//                   {reviewer.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
//                 </p>
//               </div>
//             </div>
//             {reviewer.isEmailConfirmed !== undefined && (
//               <div>
//                 <label className="text-sm font-medium text-gray-500">Xác thực email</label>
//                 <div className="flex items-center space-x-2">
//                   <div className={`w-2 h-2 rounded-full ${reviewer.isEmailConfirmed ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
//                   <p className={`font-medium ${reviewer.isEmailConfirmed ? 'text-green-700' : 'text-yellow-700'}`}>
//                     {reviewer.isEmailConfirmed ? 'Đã xác thực' : 'Chưa xác thực'}
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Organization Information if available */}
//       {/* {reviewer.organizationName && (
//         <div className="border-t pt-4">
//           <h4 className="font-medium text-gray-900 mb-3">Thông tin tổ chức</h4>
//           <div className="bg-gray-50 rounded-lg p-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="text-sm font-medium text-gray-500">Tên tổ chức</label>
//                 <p className="text-gray-900">{reviewer.organizationName}</p>
//               </div>
//               {reviewer.organizationAddress && (
//                 <div>
//                   <label className="text-sm font-medium text-gray-500">Địa chỉ tổ chức</label>
//                   <p className="text-gray-900">{reviewer.organizationAddress}</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )} */}

//       {/* Footer */}
//       <div className="border-t pt-4">
//         <button
//           onClick={onClose}
//           className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
//         >
//           Đóng
//         </button>
//       </div>
//     </div>
//   );
// };