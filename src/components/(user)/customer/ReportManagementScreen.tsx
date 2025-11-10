"use client";

import React, { useState } from "react";

interface Report {
  id: number;
  name: string;
  type: string;
  status: "pending" | "resolved";
  responses: number;
  lastModified: string;
  created: string;
  description: string;
}

interface ReportTemplate {
  name: string;
  description: string;
  icon: string;
}

const ReportManagementScreen: React.FC = () => {
  const [isNewReportDialogOpen, setIsNewReportDialogOpen] = useState(false);
  const [isReportDetailDialogOpen, setIsReportDetailDialogOpen] =
    useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [sortBy, setSortBy] = useState("name");

  const reportTemplates: ReportTemplate[] = [
    {
      name: "Báo cáo lỗi hệ thống",
      description: "Dành cho báo cáo các vấn đề kỹ thuật trong hệ thống",
      icon: "🐛",
    },
    {
      name: "Phản hồi về hội thảo",
      description: "Thu thập ý kiến phản hồi từ người tham gia",
      icon: "💬",
    },
    {
      name: "Báo cáo vi phạm",
      description: "Báo cáo hành vi vi phạm quy định",
      icon: "⚠️",
    },
  ];

  const reports: Report[] = [
    {
      id: 1,
      name: "Lỗi đăng nhập hệ thống",
      type: "Báo cáo lỗi",
      status: "pending",
      responses: 0,
      lastModified: "27 Thg 12, 2024",
      created: "1 tháng trước",
      description: "Không thể đăng nhập vào hệ thống với tài khoản thường",
    },
    {
      id: 2,
      name: "Phản hồi hội thảo AI 2024",
      type: "Phản hồi",
      status: "resolved",
      responses: 45,
      lastModified: "27 Thg 12, 2024",
      created: "1 tháng trước",
      description: "Hội thảo rất bổ ích, tuy nhiên âm thanh có vấn đề",
    },
    {
      id: 3,
      name: "Báo cáo spam trong bình luận",
      type: "Vi phạm",
      status: "pending",
      responses: 12,
      lastModified: "27 Thg 12, 2024",
      created: "1 tháng trước",
      description: "Phát hiện nhiều bình luận spam trong phần thảo luận",
    },
  ];

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setIsReportDetailDialogOpen(true);
  };

  /** ---------------- Dialog tạo báo cáo mới ---------------- */
  const NewReportDialog = () => {
    const [formData, setFormData] = useState({
      title: "",
      type: "",
      description: "",
      priority: "medium",
    });

    if (!isNewReportDialogOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full shadow-xl overflow-y-auto max-h-[90vh]">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">
              Tạo báo cáo mới
            </h3>
            <button
              onClick={() => setIsNewReportDialogOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reportTemplates.map((template, i) => (
                <div
                  key={i}
                  className={`p-4 border rounded-lg cursor-pointer hover:border-blue-500 transition ${
                    formData.type === template.name
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
                  }`}
                  onClick={() =>
                    setFormData({ ...formData, type: template.name })
                  }
                >
                  <div className="text-2xl mb-1">{template.icon}</div>
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-gray-500">
                    {template.description}
                  </p>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Nhập tiêu đề báo cáo..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mức độ ưu tiên
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
                <option value="urgent">Khẩn cấp</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả chi tiết
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Mô tả chi tiết vấn đề hoặc phản hồi..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setIsNewReportDialogOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Gửi báo cáo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /** ---------------- Dialog chi tiết báo cáo ---------------- */
  const ReportDetailDialog = () => {
    if (!isReportDetailDialogOpen || !selectedReport) return null;

    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full shadow-xl overflow-y-auto max-h-[90vh]">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">
              Chi tiết báo cáo
            </h3>
            <button
              onClick={() => setIsReportDetailDialogOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-4 text-gray-800">
            <div>
              <h4 className="font-medium mb-1">Tiêu đề</h4>
              <p>{selectedReport.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Loại báo cáo</h4>
                <p>{selectedReport.type}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Trạng thái</h4>
                <span
                  className={`px-3 py-1 text-xs rounded-full ${
                    selectedReport.status === "resolved"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {selectedReport.status === "resolved"
                    ? "Đã giải quyết"
                    : "Đang xử lý"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Ngày tạo</h4>
                <p>{selectedReport.created}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Cập nhật lần cuối</h4>
                <p>{selectedReport.lastModified}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-1">Mô tả</h4>
              <p className="bg-gray-50 border rounded-lg p-3">
                {selectedReport.description}
              </p>
            </div>

            {selectedReport.status === "resolved" && (
              <div>
                <h4 className="font-medium mb-1">Phản hồi từ admin</h4>
                <p className="bg-gray-50 border rounded-lg p-3 text-green-700">
                  Vấn đề đã được xử lý thành công. Cảm ơn bạn đã báo cáo.
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
              <button
                onClick={() => setIsReportDetailDialogOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Đóng
              </button>
              {selectedReport.status === "pending" && (
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Hủy báo cáo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /** ---------------- Giao diện chính ---------------- */
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b p-6 shadow-sm">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold">Quản lý báo cáo</h1>
            <p className="text-gray-500 text-sm">
              Theo dõi và quản lý các báo cáo bạn đã gửi
            </p>
          </div>
          <button
            onClick={() => setIsNewReportDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Tạo báo cáo mới
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Danh sách template */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Tạo báo cáo mới từ template
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reportTemplates.map((t, i) => (
              <div
                key={i}
                onClick={() => setIsNewReportDialogOpen(true)}
                className="p-4 border rounded-lg bg-white hover:shadow-md cursor-pointer transition"
              >
                <div className="text-2xl mb-2">{t.icon}</div>
                <h3 className="font-medium">{t.name}</h3>
                <p className="text-sm text-gray-500">{t.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Danh sách báo cáo */}
        <div className="bg-white border rounded-xl shadow-sm">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Danh sách báo cáo</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="name">Sắp xếp theo tên</option>
                <option value="date">Sắp xếp theo ngày</option>
                <option value="status">Sắp xếp theo trạng thái</option>
              </select>
            </div>
          </div>

          <div className="p-6 divide-y">
            {reports.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-6 gap-4 py-3 items-center"
              >
                <div className="col-span-2 flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      r.status === "resolved" ? "bg-green-500" : "bg-yellow-400"
                    }`}
                  />
                  <div>
                    <p className="font-medium">{r.name}</p>
                    <p className="text-sm text-gray-500">{r.type}</p>
                  </div>
                </div>
                <div>{r.responses}</div>
                <div>{r.lastModified}</div>
                <div>{r.created}</div>
                <div>
                  <button
                    onClick={() => handleViewReport(r)}
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <NewReportDialog />
      <ReportDetailDialog />
    </div>
  );
};

export default ReportManagementScreen;

// 'use client';

// import React, { useState } from 'react';

// const ReportManagementScreen = () => {
//   const [isNewReportDialogOpen, setIsNewReportDialogOpen] = useState(false);
//   const [isReportDetailDialogOpen, setIsReportDetailDialogOpen] = useState(false);
//   const [selectedReport, setSelectedReport] = useState(null);
//   const [sortBy, setSortBy] = useState('name');

//   const reportTemplates = [
//     {
//       name: 'Báo cáo lỗi hệ thống',
//       description: 'Dành cho báo cáo các vấn đề kỹ thuật trong hệ thống',
//       icon: '🐛'
//     },
//     {
//       name: 'Phản hồi về hội thảo',
//       description: 'Thu thập ý kiến phản hồi từ người tham gia',
//       icon: '💬'
//     },
//     {
//       name: 'Báo cáo vi phạm',
//       description: 'Báo cáo hành vi vi phạm quy định',
//       icon: '⚠️'
//     }
//   ];

//   const reports = [
//     {
//       id: 1,
//       name: 'Lỗi đăng nhập hệ thống',
//       type: 'Báo cáo lỗi',
//       status: 'pending',
//       responses: 0,
//       lastModified: '27 Thg 12, 2024',
//       created: '1 tháng trước',
//       description: 'Không thể đăng nhập vào hệ thống với tài khoản thường'
//     },
//     {
//       id: 2,
//       name: 'Phản hồi hội thảo AI 2024',
//       type: 'Phản hồi',
//       status: 'resolved',
//       responses: 45,
//       lastModified: '27 Thg 12, 2024',
//       created: '1 tháng trước',
//       description: 'Hội thảo rất bổ ích, tuy nhiên âm thanh có vấn đề'
//     },
//     {
//       id: 3,
//       name: 'Báo cáo spam trong bình luận',
//       type: 'Vi phạm',
//       status: 'pending',
//       responses: 12,
//       lastModified: '27 Thg 12, 2024',
//       created: '1 tháng trước',
//       description: 'Phát hiện nhiều bình luận spam trong phần thảo luận'
//     },
//     {
//       id: 4,
//       name: 'Đề xuất cải thiện UI',
//       type: 'Đề xuất',
//       status: 'resolved',
//       responses: 23,
//       lastModified: '27 Thg 12, 2024',
//       created: '1 tháng trước',
//       description: 'Đề xuất cải thiện giao diện người dùng để dễ sử dụng hơn'
//     }
//   ];

//   const handleViewReport = (report) => {
//     setSelectedReport(report);
//     setIsReportDetailDialogOpen(true);
//   };

//   const NewReportDialog = () => {
//     const [formData, setFormData] = useState({
//       title: '',
//       type: '',
//       description: '',
//       priority: 'medium'
//     });

//     if (!isNewReportDialogOpen) return null;

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//         <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
//           <div className="p-6 border-b border-gray-700">
//             <div className="flex justify-between items-center">
//               <h3 className="text-xl font-bold text-white">Tạo báo cáo mới</h3>
//               <button
//                 onClick={() => setIsNewReportDialogOpen(false)}
//                 className="text-gray-400 hover:text-white"
//               >
//                 ✕
//               </button>
//             </div>
//           </div>

//           <div className="p-6">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//               {reportTemplates.map((template, index) => (
//                 <div
//                   key={index}
//                   className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-blue-500 cursor-pointer transition-colors"
//                   onClick={() => setFormData({...formData, type: template.name})}
//                 >
//                   <div className="text-2xl mb-2">{template.icon}</div>
//                   <h4 className="font-medium text-white mb-1">{template.name}</h4>
//                   <p className="text-sm text-gray-400">{template.description}</p>
//                 </div>
//               ))}
//             </div>

//             <form className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-300 mb-2">Tiêu đề báo cáo</label>
//                 <input
//                   type="text"
//                   value={formData.title}
//                   onChange={(e) => setFormData({...formData, title: e.target.value})}
//                   className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
//                   placeholder="Nhập tiêu đề báo cáo..."
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-300 mb-2">Loại báo cáo</label>
//                 <select
//                   value={formData.type}
//                   onChange={(e) => setFormData({...formData, type: e.target.value})}
//                   className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
//                 >
//                   <option value="">Chọn loại báo cáo</option>
//                   <option value="Báo cáo lỗi">Báo cáo lỗi hệ thống</option>
//                   <option value="Phản hồi">Phản hồi về hội thảo</option>
//                   <option value="Vi phạm">Báo cáo vi phạm</option>
//                   <option value="Đề xuất">Đề xuất cải thiện</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-300 mb-2">Mức độ ưu tiên</label>
//                 <select
//                   value={formData.priority}
//                   onChange={(e) => setFormData({...formData, priority: e.target.value})}
//                   className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
//                 >
//                   <option value="low">Thấp</option>
//                   <option value="medium">Trung bình</option>
//                   <option value="high">Cao</option>
//                   <option value="urgent">Khẩn cấp</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-300 mb-2">Mô tả chi tiết</label>
//                 <textarea
//                   value={formData.description}
//                   onChange={(e) => setFormData({...formData, description: e.target.value})}
//                   rows={4}
//                   className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
//                   placeholder="Mô tả chi tiết về vấn đề hoặc phản hồi..."
//                 ></textarea>
//               </div>

//               <div className="flex justify-end space-x-3 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => setIsNewReportDialogOpen(false)}
//                   className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
//                 >
//                   Hủy
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   Gửi báo cáo
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const ReportDetailDialog = () => {
//     if (!isReportDetailDialogOpen || !selectedReport) return null;

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//         <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
//           <div className="p-6 border-b border-gray-700">
//             <div className="flex justify-between items-center">
//               <h3 className="text-xl font-bold text-white">Chi tiết báo cáo</h3>
//               <button
//                 onClick={() => setIsReportDetailDialogOpen(false)}
//                 className="text-gray-400 hover:text-white"
//               >
//                 ✕
//               </button>
//             </div>
//           </div>

//           <div className="p-6">
//             <div className="space-y-4">
//               <div>
//                 <h4 className="font-medium text-white mb-2">Tiêu đề</h4>
//                 <p className="text-gray-300">{selectedReport.name}</p>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <h4 className="font-medium text-white mb-2">Loại báo cáo</h4>
//                   <p className="text-gray-300">{selectedReport.type}</p>
//                 </div>
//                 <div>
//                   <h4 className="font-medium text-white mb-2">Trạng thái</h4>
//                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                     selectedReport.status === 'resolved'
//                       ? 'bg-green-900 text-green-300'
//                       : 'bg-yellow-900 text-yellow-300'
//                   }`}>
//                     {selectedReport.status === 'resolved' ? 'Đã giải quyết' : 'Đang xử lý'}
//                   </span>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <h4 className="font-medium text-white mb-2">Ngày tạo</h4>
//                   <p className="text-gray-300">{selectedReport.created}</p>
//                 </div>
//                 <div>
//                   <h4 className="font-medium text-white mb-2">Cập nhật lần cuối</h4>
//                   <p className="text-gray-300">{selectedReport.lastModified}</p>
//                 </div>
//               </div>

//               <div>
//                 <h4 className="font-medium text-white mb-2">Mô tả</h4>
//                 <p className="text-gray-300 bg-gray-700 p-3 rounded-lg">{selectedReport.description}</p>
//               </div>

//               {selectedReport.status === 'resolved' && (
//                 <div>
//                   <h4 className="font-medium text-white mb-2">Phản hồi từ admin</h4>
//                   <p className="text-gray-300 bg-gray-700 p-3 rounded-lg">
//                     Vấn đề đã được xử lý thành công. Cảm ơn bạn đã báo cáo.
//                   </p>
//                 </div>
//               )}
//             </div>

//             <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700 mt-6">
//               <button
//                 onClick={() => setIsReportDetailDialogOpen(false)}
//                 className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
//               >
//                 Đóng
//               </button>
//               {selectedReport.status === 'pending' && (
//                 <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
//                   Hủy báo cáo
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 text-white">
//       {/* Header */}
//       <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-xl font-bold">Quản lý báo cáo</h1>
//             <p className="text-gray-400 text-sm mt-1">Theo dõi và quản lý các báo cáo bạn đã gửi</p>
//           </div>
//           <button
//             onClick={() => setIsNewReportDialogOpen(true)}
//             className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
//           >
//             + Tạo báo cáo mới
//           </button>
//         </div>
//       </header>

//       <div className="flex">
//         {/* Sidebar */}
//         <aside className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
//           <nav className="p-4">
//             <div className="space-y-2">
//               <a href="#" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
//                 <span className="mr-3">🔍</span>
//                 Tìm kiếm
//               </a>
//               <a href="#" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
//                 <span className="mr-3">🔔</span>
//                 Thông báo
//                 <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">3</span>
//               </a>
//               <a href="#" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
//                 <span className="mr-3">🏠</span>
//                 Trang chủ
//               </a>
//               <a href="#" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
//                 <span className="mr-3">💼</span>
//                 Workspace
//               </a>
//               <a href="#" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
//                 <span className="mr-3">📺</span>
//                 Broadcast
//               </a>
//               <a href="#" className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg">
//                 <span className="mr-3">📊</span>
//                 Quản lý báo cáo
//               </a>
//               <a href="#" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
//                 <span className="mr-3">💬</span>
//                 Chats
//               </a>
//               <a href="#" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
//                 <span className="mr-3">🌟</span>
//                 Channel
//               </a>
//               <a href="#" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
//                 <span className="mr-3">🔗</span>
//                 Integration
//               </a>
//             </div>
//           </nav>

//           <div className="absolute bottom-4 left-4 right-4">
//             <div className="space-y-2">
//               <a href="#" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
//                 <span className="mr-3">⚙️</span>
//                 Cài đặt
//               </a>
//               <a href="#" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
//                 <span className="mr-3">❓</span>
//                 Hỗ trợ
//               </a>
//             </div>

//             <div className="mt-4 flex items-center px-3 py-2">
//               <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
//                 ND
//               </div>
//               <div className="flex-1">
//                 <p className="text-white text-sm font-medium">Nguyễn Đức</p>
//                 <p className="text-gray-400 text-xs">nguyenduc@email.com</p>
//               </div>
//             </div>
//           </div>
//         </aside>

//         {/* Main Content */}
//         <main className="flex-1 p-6">
//           <div className="max-w-7xl mx-auto">
//             {/* Templates Section */}
//             <div className="mb-8">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-semibold">Tạo báo cáo mới từ template</h2>
//                 <button className="text-blue-400 hover:text-blue-300 text-sm">
//                   Thư viện Template
//                 </button>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 {reportTemplates.map((template, index) => (
//                   <div
//                     key={index}
//                     className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 cursor-pointer transition-colors"
//                     onClick={() => setIsNewReportDialogOpen(true)}
//                   >
//                     <div className="text-2xl mb-2">{template.icon}</div>
//                     <h3 className="font-medium mb-1">{template.name}</h3>
//                     <p className="text-sm text-gray-400">{template.description}</p>
//                   </div>
//                 ))}
//               </div>

//               <div className="mt-4 text-center">
//                 <button
//                   onClick={() => setIsNewReportDialogOpen(true)}
//                   className="inline-flex items-center justify-center w-12 h-12 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//                 >
//                   <span className="text-2xl">+</span>
//                 </button>
//                 <p className="text-sm text-gray-400 mt-2">Tạo báo cáo từ đầu</p>
//               </div>
//             </div>

//             {/* Reports List */}
//             <div className="bg-gray-800 rounded-xl border border-gray-700">
//               <div className="p-6 border-b border-gray-700">
//                 <div className="flex items-center justify-between mb-4">
//                   <h2 className="text-lg font-semibold">Hôm nay</h2>
//                   <div className="flex items-center space-x-4">
//                     <input
//                       type="text"
//                       placeholder="Tìm kiếm..."
//                       className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
//                     />
//                     <select
//                       value={sortBy}
//                       onChange={(e) => setSortBy(e.target.value)}
//                       className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
//                     >
//                       <option value="name">Sắp xếp theo tên</option>
//                       <option value="date">Sắp xếp theo ngày</option>
//                       <option value="status">Sắp xếp theo trạng thái</option>
//                     </select>
//                     <button className="p-2 bg-gray-700 border border-gray-600 rounded-lg text-white hover:bg-gray-600">
//                       <span>⚏</span>
//                     </button>
//                   </div>
//                 </div>

//                 {/* Table Header */}
//                 <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-400 pb-3 border-b border-gray-700">
//                   <div className="col-span-2">Tên báo cáo</div>
//                   <div>Phản hồi</div>
//                   <div>Cập nhật lần cuối</div>
//                   <div>Tạo lúc</div>
//                   <div>Hành động</div>
//                 </div>
//               </div>

//               {/* Table Body */}
//               <div className="p-6">
//                 <div className="space-y-4">
//                   {reports.map((report) => (
//                     <div key={report.id} className="grid grid-cols-6 gap-4 items-center py-3 border-b border-gray-700 last:border-b-0">
//                       <div className="col-span-2 flex items-center">
//                         <div className={`w-3 h-3 rounded-full mr-3 ${
//                           report.status === 'resolved' ? 'bg-green-500' : 'bg-yellow-500'
//                         }`}></div>
//                         <div>
//                           <p className="font-medium text-white">{report.name}</p>
//                           <p className="text-sm text-gray-400">{report.type}</p>
//                         </div>
//                       </div>
//                       <div className="text-gray-300">{report.responses}</div>
//                       <div className="text-gray-300">{report.lastModified}</div>
//                       <div className="text-gray-300">{report.created}</div>
//                       <div>
//                         <button
//                           onClick={() => handleViewReport(report)}
//                           className="text-blue-400 hover:text-blue-300 text-sm font-medium"
//                         >
//                           Xem chi tiết
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Pagination */}
//                 <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700">
//                   <div className="text-sm text-gray-400">
//                     Trang 1 của 5
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <button className="px-3 py-1 bg-gray-700 text-gray-400 rounded border border-gray-600">
//                       ←
//                     </button>
//                     <button className="px-3 py-1 bg-blue-600 text-white rounded">
//                       1
//                     </button>
//                     <button className="px-3 py-1 bg-gray-700 text-gray-400 rounded border border-gray-600">
//                       →
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>

//       {/* Dialogs */}
//       <NewReportDialog />
//       <ReportDetailDialog />
//     </div>
//   );
// };

// export default ReportManagementScreen;
