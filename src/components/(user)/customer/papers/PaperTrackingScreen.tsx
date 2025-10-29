'use client';

import React from 'react';

const PaperTrackingScreen = () => {
  const paperStatus = [
    { id: 1, step: 'Nộp bài báo', completed: true, date: '15/01/2025' },
    { id: 2, step: 'Xác nhận tiếp nhận', completed: true, date: '17/01/2025' },
    { id: 3, step: 'Phân công reviewer', completed: true, date: '20/01/2025' },
    { id: 4, step: 'Đánh giá bài báo', completed: false, date: 'Đang tiến hành' },
    { id: 5, step: 'Kết quả review', completed: false, date: 'Chờ xử lý' },
    { id: 6, step: 'Camera-ready', completed: false, date: 'Chờ xử lý' },
  ];

  const paperDetails = {
    title: 'Nghiên cứu về Machine Learning trong xử lý ngôn ngữ tự nhiên',
    conference: 'Hội thảo Khoa học Máy tính Việt Nam 2025',
    submittedDate: '15/01/2025',
    reviewDeadline: '28/02/2025',
    status: 'Đang được đánh giá'
  };

  const actions = [
    { name: 'Xem chi tiết bài báo', progress: '100%', status: 'completed' },
    { name: 'Theo dõi phản hồi reviewer', progress: '60%', status: 'in-progress' },
    { name: 'Cập nhật thông tin tác giả', progress: '100%', status: 'completed' },
    { name: 'Chuẩn bị bản camera-ready', progress: '0%', status: 'pending' },
    { name: 'Đăng ký trình bày', progress: '0%', status: 'pending' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Theo dõi bài báo</h1>
            <p className="text-gray-400 text-sm mt-1">Quản lý tiến độ và trạng thái bài báo của bạn</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Tiếp tục theo dõi →
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
          <nav className="p-4">
            <div className="space-y-2">
              <a href="#" className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg">
                <span className="mr-3">📊</span>
                Dashboard
              </a>
              <a href="#" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
                <span className="mr-3">📝</span>
                Bài báo của tôi
              </a>
              <a href="#" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
                <span className="mr-3">👥</span>
                Reviewers
              </a>
              <a href="#" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
                <span className="mr-3">📅</span>
                Lịch trình
              </a>
              <a href="#" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
                <span className="mr-3">💬</span>
                Phản hồi
              </a>
            </div>

            <div className="mt-8">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Báo cáo</h3>
              <div className="space-y-2">
                <a href="#" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
                  <span className="mr-3">📈</span>
                  Tiến độ submission
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg">
                  <span className="mr-3">📋</span>
                  Kế hoạch hành động
                </a>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Message */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Chào buổi sáng, Nguyễn Văn A!</h2>
              <p className="text-gray-400">
                Theo dõi tiến độ bài báo của bạn. Nhấn nút Tiếp tục theo dõi để xem chi tiết hoặc sử dụng thanh tiến độ bên dưới.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Progress Section */}
              <div className="lg:col-span-2">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                      3/6
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Tiến độ bài báo</h3>
                      <p className="text-gray-400">Giai đoạn trước và sau chuyển đổi</p>
                    </div>
                  </div>

                  {/* Paper Details Card */}
                  <div className="bg-gray-700 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold mb-2">{paperDetails.title}</h4>
                    <p className="text-sm text-gray-400 mb-1">Hội thảo: {paperDetails.conference}</p>
                    <p className="text-sm text-gray-400">Deadline review: {paperDetails.reviewDeadline}</p>
                    <div className="mt-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300">
                        {paperDetails.status}
                      </span>
                    </div>
                  </div>

                  {/* Progress Steps */}
                  <div className="space-y-4">
                    {paperStatus.map((step, index) => (
                      <div key={step.id} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${step.completed
                            ? 'bg-blue-600 text-white'
                            : index === 3
                              ? 'bg-yellow-600 text-white'
                              : 'bg-gray-600 text-gray-400'
                          }`}>
                          {step.completed ? '✓' : index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className={`font-medium ${step.completed ? 'text-white' : 'text-gray-400'}`}>
                              {step.step}
                            </span>
                            <span className="text-sm text-gray-400">{step.date}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Recommended Support */}
                <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-bold mb-4">Hỗ trợ được đề xuất</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium">Hướng dẫn định dạng bài báo</h4>
                        <p className="text-sm text-gray-400">Tài liệu</p>
                      </div>
                      <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                        Xem
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium">Template bài báo khoa học</h4>
                        <p className="text-sm text-gray-400">Mẫu</p>
                      </div>
                      <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                        Tải về
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium">Hỗ trợ kỹ thuật</h4>
                        <p className="text-sm text-gray-400">Liên hệ</p>
                      </div>
                      <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                        Chat
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Panel */}
              <div className="lg:col-span-1">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-bold mb-4">Hành động</h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Danh sách các hành động cần thực hiện
                  </p>

                  <div className="space-y-4">
                    {actions.map((action, index) => (
                      <div key={index} className="border-b border-gray-700 pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-3 h-3 rounded-full mr-3 ${action.status === 'completed'
                              ? 'bg-green-500'
                              : action.status === 'in-progress'
                                ? 'bg-yellow-500'
                                : 'bg-gray-500'
                            }`}></div>
                          <span className="text-sm flex-1">{action.name}</span>
                        </div>
                        <div className="ml-6">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>{action.status === 'completed' ? 'Hoàn thành' : action.status === 'in-progress' ? 'Đang thực hiện' : 'Chờ thực hiện'}</span>
                            <span>{action.progress}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1">
                            <div
                              className={`h-1 rounded-full ${action.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                                }`}
                              style={{ width: action.progress }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full mt-6 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                    Bỏ qua
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PaperTrackingScreen;

//version chụp cho report 3
// 'use client';

// import React from 'react';

// interface PaperStep {
//   id: number;
//   step: string;
//   completed: boolean;
//   date: string;
// }

// interface PaperDetails {
//   title: string;
//   conference: string;
//   submittedDate: string;
//   reviewDeadline: string;
//   status: string;
// }

// interface ActionItem {
//   name: string;
//   progress: string;
//   status: 'completed' | 'in-progress' | 'pending';
// }

// const PaperTrackingScreen: React.FC = () => {
//   const paperStatus: PaperStep[] = [
//     { id: 1, step: 'Nộp bài báo', completed: true, date: '15/01/2025' },
//     { id: 2, step: 'Xác nhận tiếp nhận', completed: true, date: '17/01/2025' },
//     { id: 3, step: 'Phân công reviewer', completed: true, date: '20/01/2025' },
//     { id: 4, step: 'Đánh giá bài báo', completed: false, date: 'Đang tiến hành' },
//     { id: 5, step: 'Kết quả review', completed: false, date: 'Chờ xử lý' },
//     { id: 6, step: 'Camera-ready', completed: false, date: 'Chờ xử lý' },
//   ];

//   const paperDetails: PaperDetails = {
//     title: 'Nghiên cứu về Machine Learning trong xử lý ngôn ngữ tự nhiên',
//     conference: 'Hội thảo Khoa học Máy tính Việt Nam 2025',
//     submittedDate: '15/01/2025',
//     reviewDeadline: '28/02/2025',
//     status: 'Đang được đánh giá'
//   };

//   const actions: ActionItem[] = [
//     { name: 'Xem chi tiết bài báo', progress: '100%', status: 'completed' },
//     { name: 'Theo dõi phản hồi reviewer', progress: '60%', status: 'in-progress' },
//     { name: 'Cập nhật thông tin tác giả', progress: '100%', status: 'completed' },
//     { name: 'Chuẩn bị bản camera-ready', progress: '0%', status: 'pending' },
//     { name: 'Đăng ký trình bày', progress: '0%', status: 'pending' },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 text-gray-900">
//       {/* Header */}
//       <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-xl font-bold">Theo dõi bài báo</h1>
//             <p className="text-gray-600 text-sm mt-1">Quản lý tiến độ và trạng thái bài báo của bạn</p>
//           </div>
//           <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors">
//             Tiếp tục theo dõi →
//           </button>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-6 py-8">
//         <div className="mb-8">
//           <h2 className="text-2xl font-bold mb-2">Chào buổi sáng, Nguyễn Văn A!</h2>
//           <p className="text-gray-600">
//             Theo dõi tiến độ bài báo của bạn. Sử dụng thanh tiến độ bên dưới để nắm rõ các đợt review.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Progress Section */}
//           <div className="lg:col-span-2 space-y-6">
//             <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
//               <div className="flex items-center mb-6">
//                 <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
//                   3/6
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-bold">Tiến độ bài báo</h3>
//                   <p className="text-gray-500">Giai đoạn trước và sau chuyển đổi</p>
//                 </div>
//               </div>

//               {/* Paper Details */}
//               <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
//                 <h4 className="font-semibold mb-2">{paperDetails.title}</h4>
//                 <p className="text-sm text-gray-500 mb-1">Hội thảo: {paperDetails.conference}</p>
//                 <p className="text-sm text-gray-500">Deadline review: {paperDetails.reviewDeadline}</p>
//                 <div className="mt-3">
//                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
//                     {paperDetails.status}
//                   </span>
//                 </div>
//               </div>

//               {/* Progress Steps */}
//               <div className="space-y-4">
//                 {paperStatus.map((step, index) => (
//                   <div key={step.id} className="flex items-center">
//                     <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${step.completed
//                         ? 'bg-blue-600 text-white'
//                         : index === 3
//                           ? 'bg-yellow-500 text-white'
//                           : 'bg-gray-300 text-gray-600'
//                       }`}>
//                       {step.completed ? '✓' : index + 1}
//                     </div>
//                     <div className="flex-1">
//                       <div className="flex justify-between items-center">
//                         <span className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
//                           {step.step}
//                         </span>
//                         <span className="text-sm text-gray-500">{step.date}</span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Progress Bar */}
//               <div className="mt-6">
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50%' }}></div>
//                 </div>
//               </div>
//             </div>

//             {/* Recommended Support */}
//             <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
//               <h3 className="text-lg font-bold mb-4">Hỗ trợ được đề xuất</h3>
//               <div className="space-y-4">
//                 {[
//                   { title: 'Hướng dẫn định dạng bài báo', type: 'Tài liệu' },
//                   { title: 'Template bài báo khoa học', type: 'Mẫu' },
//                   { title: 'Hỗ trợ kỹ thuật', type: 'Liên hệ' },
//                 ].map((item, idx) => (
//                   <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
//                     <div>
//                       <h4 className="font-medium">{item.title}</h4>
//                       <p className="text-sm text-gray-500">{item.type}</p>
//                     </div>
//                     <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">Xem</button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Actions Panel */}
//           <div className="lg:col-span-1 space-y-6">
//             <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
//               <h3 className="text-lg font-bold mb-4">Hành động</h3>
//               <p className="text-sm text-gray-500 mb-6">Danh sách các hành động cần thực hiện</p>

//               <div className="space-y-4">
//                 {actions.map((action, index) => (
//                   <div key={index} className="space-y-1">
//                     <div className="flex items-center justify-between">
//                       <div className={`w-3 h-3 rounded-full mr-3 ${action.status === 'completed'
//                           ? 'bg-green-500'
//                           : action.status === 'in-progress'
//                             ? 'bg-yellow-500'
//                             : 'bg-gray-300'
//                         }`}></div>
//                       <span className="text-sm flex-1">{action.name}</span>
//                     </div>
//                     <div className="ml-6">
//                       <div className="flex justify-between text-xs text-gray-500 mb-1">
//                         <span>{action.status === 'completed' ? 'Hoàn thành' : action.status === 'in-progress' ? 'Đang thực hiện' : 'Chờ thực hiện'}</span>
//                         <span>{action.progress}</span>
//                       </div>
//                       <div className="w-full bg-gray-200 rounded-full h-1">
//                         <div
//                           className={`h-1 rounded-full ${action.status === 'completed' ? 'bg-green-500' : action.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-300'
//                             }`}
//                           style={{ width: action.progress }}
//                         ></div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <button className="w-full mt-6 bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-4 rounded-lg text-sm font-medium transition-colors">
//                 Bỏ qua
//               </button>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default PaperTrackingScreen;