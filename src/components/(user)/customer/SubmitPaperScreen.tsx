"use client";

import React, { useState } from "react";

interface Author {
  name: string;
  affiliation: string;
  email: string;
}

interface FormData {
  title: string;
  abstract: string;
  keywords: string;
  authors: Author[];
  category: string;
  paperFile: File | null;
  abstractFile: File | null;
  supplementaryFiles: File[];
  acknowledgments: string;
  conflicts: string;
  ethics: boolean;
  copyright: boolean;
}

const SubmitPaperScreen: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    abstract: "",
    keywords: "",
    authors: [{ name: "", affiliation: "", email: "" }],
    category: "",
    paperFile: null,
    abstractFile: null,
    supplementaryFiles: [],
    acknowledgments: "",
    conflicts: "",
    ethics: false,
    copyright: false,
  });

  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;

  const conferenceInfo = {
    name: "Hội thảo Khoa học Máy tính Việt Nam 2025",
    deadline: "28/02/2025",
    submissionGuidelines: "IEEE Conference Paper Format",
    maxPages: 8,
    topics: [
      "Trí tuệ nhân tạo và Machine Learning",
      "Xử lý ngôn ngữ tự nhiên",
      "Computer Vision",
      "Hệ thống phân tán",
      "Bảo mật thông tin",
      "Khoa học dữ liệu",
    ],
  };

  const addAuthor = () => {
    setFormData((prev) => ({
      ...prev,
      authors: [...prev.authors, { name: "", affiliation: "", email: "" }],
    }));
  };

  const removeAuthor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index),
    }));
  };

  const updateAuthor = (index: number, field: keyof Author, value: string) => {
    setFormData((prev) => ({
      ...prev,
      authors: prev.authors.map((author, i) =>
        i === index ? { ...author, [field]: value } : author,
      ),
    }));
  };

  const handleFileUpload = (
    field: "paperFile" | "abstractFile",
    file: File,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleSupplementaryFiles = (files: FileList) => {
    setFormData((prev) => ({ ...prev, supplementaryFiles: Array.from(files) }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep((prev) => prev + 1);
  };
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Thông tin cơ bản
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề bài báo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Nhập tiêu đề bài báo của bạn..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lĩnh vực nghiên cứu <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Chọn lĩnh vực nghiên cứu</option>
                  {conferenceInfo.topics.map((topic, index) => (
                    <option key={index} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Từ khóa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) =>
                    setFormData({ ...formData, keywords: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Nhập các từ khóa, phân cách bằng dấu phẩy..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Ví dụ: machine learning, deep learning, neural networks
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tóm tắt bài báo <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.abstract}
                  onChange={(e) =>
                    setFormData({ ...formData, abstract: e.target.value })
                  }
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Nhập tóm tắt bài báo của bạn (khoảng 150-300 từ)..."
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>Tối thiểu 150 từ, tối đa 300 từ</span>
                  <span>
                    {
                      formData.abstract
                        .split(" ")
                        .filter((word) => word.length > 0).length
                    }{" "}
                    từ
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Thông tin tác giả
            </h3>
            {formData.authors.map((author, index) => (
              <div
                key={index}
                className="p-4 bg-gray-100 rounded-lg mb-4 border border-gray-300"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-800">
                    Tác giả {index + 1}{" "}
                    {index === 0 && (
                      <span className="text-blue-500">(Tác giả chính)</span>
                    )}
                  </h4>
                  {index > 0 && (
                    <button
                      onClick={() => removeAuthor(index)}
                      className="text-red-500 hover:text-red-400 text-sm"
                    >
                      Xóa
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      value={author.name}
                      onChange={(e) =>
                        updateAuthor(index, "name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="Nhập họ và tên..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={author.email}
                      onChange={(e) =>
                        updateAuthor(index, "email", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="Nhập email..."
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đơn vị công tác *
                  </label>
                  <input
                    type="text"
                    value={author.affiliation}
                    onChange={(e) =>
                      updateAuthor(index, "affiliation", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Nhập tên trường/công ty/tổ chức..."
                  />
                </div>
              </div>
            ))}

            <button
              onClick={addAuthor}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
              + Thêm tác giả
            </button>
          </div>
        );

      default:
        return <div className="text-gray-800">Step content here...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-white border-b border-gray-300">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Nộp bài báo</h1>
            <p className="text-gray-600 text-sm mt-1">{conferenceInfo.name}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Deadline nộp bài</p>
            <p className="font-semibold text-red-500">
              {conferenceInfo.deadline}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Tiến độ hoàn thành
            </span>
            <span className="text-sm font-medium text-gray-600">
              {currentStep}/{totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs">
            <span
              className={`${currentStep >= 1 ? "text-blue-500" : "text-gray-400"}`}
            >
              Thông tin cơ bản
            </span>
            <span
              className={`${currentStep >= 2 ? "text-blue-500" : "text-gray-400"}`}
            >
              Tác giả
            </span>
            <span
              className={`${currentStep >= 3 ? "text-blue-500" : "text-gray-400"}`}
            >
              Tài liệu
            </span>
            <span
              className={`${currentStep >= 4 ? "text-blue-500" : "text-gray-400"}`}
            >
              Xác nhận
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white rounded-xl border border-gray-300 p-6 shadow-sm">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-300">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Quay lại
              </button>

              <div className="flex space-x-3">
                <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  Lưu nháp
                </button>

                {currentStep < totalSteps ? (
                  <button
                    onClick={nextStep}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Tiếp tục
                  </button>
                ) : (
                  <button
                    disabled={!formData.ethics || !formData.copyright}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Nộp bài báo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitPaperScreen;

// 'use client';

// import React, { useState } from 'react';

// const SubmitPaperScreen = () => {
//   const [formData, setFormData] = useState({
//     title: '',
//     abstract: '',
//     keywords: '',
//     authors: [{ name: '', affiliation: '', email: '' }],
//     category: '',
//     paperFile: null,
//     abstractFile: null,
//     supplementaryFiles: [],
//     acknowledgments: '',
//     conflicts: '',
//     ethics: false,
//     copyright: false
//   });

//   const [currentStep, setCurrentStep] = useState(1);
//   const totalSteps = 4;

//   const conferenceInfo = {
//     name: 'Hội thảo Khoa học Máy tính Việt Nam 2025',
//     deadline: '28/02/2025',
//     submissionGuidelines: 'IEEE Conference Paper Format',
//     maxPages: 8,
//     topics: [
//       'Trí tuệ nhân tạo và Machine Learning',
//       'Xử lý ngôn ngữ tự nhiên',
//       'Computer Vision',
//       'Hệ thống phân tán',
//       'Bảo mật thông tin',
//       'Khoa học dữ liệu'
//     ]
//   };

//   const addAuthor = () => {
//     setFormData({
//       ...formData,
//       authors: [...formData.authors, { name: '', affiliation: '', email: '' }]
//     });
//   };

//   const removeAuthor = (index) => {
//     const newAuthors = formData.authors.filter((_, i) => i !== index);
//     setFormData({ ...formData, authors: newAuthors });
//   };

//   const updateAuthor = (index, field, value) => {
//     const newAuthors = formData.authors.map((author, i) =>
//       i === index ? { ...author, [field]: value } : author
//     );
//     setFormData({ ...formData, authors: newAuthors });
//   };

//   const handleFileUpload = (field, file) => {
//     setFormData({ ...formData, [field]: file });
//   };

//   const nextStep = () => {
//     if (currentStep < totalSteps) {
//       setCurrentStep(currentStep + 1);
//     }
//   };

//   const prevStep = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1);
//     }
//   };

//   const renderStepContent = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <div className="space-y-6">
//             <div>
//               <h3 className="text-lg font-semibold text-white mb-4">Thông tin cơ bản</h3>

//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">
//                     Tiêu đề bài báo <span className="text-red-400">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.title}
//                     onChange={(e) => setFormData({...formData, title: e.target.value})}
//                     className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//                     placeholder="Nhập tiêu đề bài báo của bạn..."
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">
//                     Lĩnh vực nghiên cứu <span className="text-red-400">*</span>
//                   </label>
//                   <select
//                     value={formData.category}
//                     onChange={(e) => setFormData({...formData, category: e.target.value})}
//                     className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//                   >
//                     <option value="">Chọn lĩnh vực nghiên cứu</option>
//                     {conferenceInfo.topics.map((topic, index) => (
//                       <option key={index} value={topic}>{topic}</option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">
//                     Từ khóa <span className="text-red-400">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.keywords}
//                     onChange={(e) => setFormData({...formData, keywords: e.target.value})}
//                     className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//                     placeholder="Nhập các từ khóa, phân cách bằng dấu phẩy..."
//                   />
//                   <p className="text-sm text-gray-400 mt-1">Ví dụ: machine learning, deep learning, neural networks</p>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">
//                     Tóm tắt bài báo <span className="text-red-400">*</span>
//                   </label>
//                   <textarea
//                     value={formData.abstract}
//                     onChange={(e) => setFormData({...formData, abstract: e.target.value})}
//                     rows={6}
//                     className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//                     placeholder="Nhập tóm tắt bài báo của bạn (khoảng 150-300 từ)..."
//                   ></textarea>
//                   <div className="flex justify-between text-sm text-gray-400 mt-1">
//                     <span>Tối thiểu 150 từ, tối đa 300 từ</span>
//                     <span>{formData.abstract.split(' ').filter(word => word.length > 0).length} từ</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       case 2:
//         return (
//           <div className="space-y-6">
//             <div>
//               <h3 className="text-lg font-semibold text-white mb-4">Thông tin tác giả</h3>

//               {formData.authors.map((author, index) => (
//                 <div key={index} className="p-4 bg-gray-700 rounded-lg mb-4 border border-gray-600">
//                   <div className="flex justify-between items-center mb-3">
//                     <h4 className="font-medium text-white">
//                       Tác giả {index + 1} {index === 0 && <span className="text-blue-400">(Tác giả chính)</span>}
//                     </h4>
//                     {index > 0 && (
//                       <button
//                         onClick={() => removeAuthor(index)}
//                         className="text-red-400 hover:text-red-300 text-sm"
//                       >
//                         Xóa
//                       </button>
//                     )}
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-300 mb-2">
//                         Họ và tên <span className="text-red-400">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         value={author.name}
//                         onChange={(e) => updateAuthor(index, 'name', e.target.value)}
//                         className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
//                         placeholder="Nhập họ và tên..."
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-300 mb-2">
//                         Email <span className="text-red-400">*</span>
//                       </label>
//                       <input
//                         type="email"
//                         value={author.email}
//                         onChange={(e) => updateAuthor(index, 'email', e.target.value)}
//                         className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
//                         placeholder="Nhập email..."
//                       />
//                     </div>
//                   </div>

//                   <div className="mt-4">
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                       Đơn vị công tác <span className="text-red-400">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       value={author.affiliation}
//                       onChange={(e) => updateAuthor(index, 'affiliation', e.target.value)}
//                       className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
//                       placeholder="Nhập tên trường/công ty/tổ chức..."
//                     />
//                   </div>
//                 </div>
//               ))}

//               <button
//                 onClick={addAuthor}
//                 className="w-full py-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-colors"
//               >
//                 + Thêm tác giả
//               </button>
//             </div>
//           </div>
//         );

//       case 3:
//         return (
//           <div className="space-y-6">
//             <div>
//               <h3 className="text-lg font-semibold text-white mb-4">Tải lên tài liệu</h3>

//               <div className="space-y-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">
//                     File bài báo đầy đủ <span className="text-red-400">*</span>
//                   </label>
//                   <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
//                     <div className="text-4xl text-gray-400 mb-2">📄</div>
//                     <p className="text-gray-300 mb-2">Kéo thả file hoặc click để chọn</p>
//                     <p className="text-sm text-gray-400 mb-4">
//                       Chỉ chấp nhận file PDF, tối đa 10MB, {conferenceInfo.maxPages} trang
//                     </p>
//                     <input
//                       type="file"
//                       accept=".pdf"
//                       onChange={(e) => handleFileUpload('paperFile', e.target.files[0])}
//                       className="hidden"
//                       id="paperFile"
//                     />
//                     <label
//                       htmlFor="paperFile"
//                       className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
//                     >
//                       Chọn file
//                     </label>
//                     {formData.paperFile && (
//                       <p className="text-green-400 text-sm mt-2">
//                         ✓ Đã tải lên: {formData.paperFile.name}
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">
//                     File tóm tắt (Abstract) <span className="text-red-400">*</span>
//                   </label>
//                   <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
//                     <div className="text-4xl text-gray-400 mb-2">📋</div>
//                     <p className="text-gray-300 mb-2">Tải lên file tóm tắt</p>
//                     <p className="text-sm text-gray-400 mb-4">File PDF hoặc DOC, tối đa 2MB</p>
//                     <input
//                       type="file"
//                       accept=".pdf,.doc,.docx"
//                       onChange={(e) => handleFileUpload('abstractFile', e.target.files[0])}
//                       className="hidden"
//                       id="abstractFile"
//                     />
//                     <label
//                       htmlFor="abstractFile"
//                       className="inline-block px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 cursor-pointer"
//                     >
//                       Chọn file
//                     </label>
//                     {formData.abstractFile && (
//                       <p className="text-green-400 text-sm mt-2">
//                         ✓ Đã tải lên: {formData.abstractFile.name}
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">
//                     Tài liệu bổ sung (tùy chọn)
//                   </label>
//                   <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
//                     <div className="text-4xl text-gray-400 mb-2">📎</div>
//                     <p className="text-gray-300 mb-2">Tải lên các file bổ sung</p>
//                     <p className="text-sm text-gray-400 mb-4">
//                       Code, dataset, hình ảnh bổ sung... (ZIP, RAR, PDF)
//                     </p>
//                     <input
//                       type="file"
//                       multiple
//                       accept=".zip,.rar,.pdf,.jpg,.png"
//                       onChange={(e) => setFormData({...formData, supplementaryFiles: Array.from(e.target.files)})}
//                       className="hidden"
//                       id="supplementaryFiles"
//                     />
//                     <label
//                       htmlFor="supplementaryFiles"
//                       className="inline-block px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 cursor-pointer"
//                     >
//                       Chọn files
//                     </label>
//                     {formData.supplementaryFiles.length > 0 && (
//                       <div className="mt-3">
//                         {formData.supplementaryFiles.map((file, index) => (
//                           <p key={index} className="text-green-400 text-sm">
//                             ✓ {file.name}
//                           </p>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
//                   <h4 className="font-medium text-blue-300 mb-2">Yêu cầu định dạng:</h4>
//                   <ul className="text-sm text-blue-200 space-y-1">
//                     <li>• Sử dụng template {conferenceInfo.submissionGuidelines}</li>
//                     <li>• Tối đa {conferenceInfo.maxPages} trang bao gồm tài liệu tham khảo</li>
//                     <li>• Font Times New Roman, size 10pt</li>
//                     <li>• Margin: 0.75 inch cho tất cả các cạnh</li>
//                     <li>• File PDF không có mật khẩu bảo vệ</li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       case 4:
//         return (
//           <div className="space-y-6">
//             <div>
//               <h3 className="text-lg font-semibold text-white mb-4">Xác nhận và cam kết</h3>

//               <div className="space-y-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">
//                     Lời cảm ơn (tùy chọn)
//                   </label>
//                   <textarea
//                     value={formData.acknowledgments}
//                     onChange={(e) => setFormData({...formData, acknowledgments: e.target.value})}
//                     rows={3}
//                     className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
//                     placeholder="Cảm ơn các cá nhân, tổ chức hỗ trợ nghiên cứu..."
//                   ></textarea>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">
//                     Xung đột lợi ích
//                   </label>
//                   <textarea
//                     value={formData.conflicts}
//                     onChange={(e) => setFormData({...formData, conflicts: e.target.value})}
//                     rows={3}
//                     className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
//                     placeholder="Khai báo các xung đột lợi ích (nếu có) hoặc ghi 'Không có'..."
//                   ></textarea>
//                 </div>

//                 <div className="space-y-4">
//                   <div className="flex items-start">
//                     <input
//                       type="checkbox"
//                       id="ethics"
//                       checked={formData.ethics}
//                       onChange={(e) => setFormData({...formData, ethics: e.target.checked})}
//                       className="mr-3 mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
//                     />
//                     <label htmlFor="ethics" className="text-sm text-gray-300">
//                       <span className="text-red-400">*</span> Tôi xác nhận rằng nghiên cứu này tuân thủ các nguyên tắc đạo đức trong nghiên cứu khoa học và không vi phạm bản quyền của bất kỳ tác phẩm nào khác.
//                     </label>
//                   </div>

//                   <div className="flex items-start">
//                     <input
//                       type="checkbox"
//                       id="copyright"
//                       checked={formData.copyright}
//                       onChange={(e) => setFormData({...formData, copyright: e.target.checked})}
//                       className="mr-3 mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
//                     />
//                     <label htmlFor="copyright" className="text-sm text-gray-300">
//                       <span className="text-red-400">*</span> Tôi đồng ý chuyển giao bản quyền bài báo cho ban tổ chức hội thảo nếu bài báo được chấp nhận và hiểu rằng bài báo sẽ được xuất bản trong kỷ yếu hội thảo.
//                     </label>
//                   </div>
//                 </div>

//                 <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
//                   <h4 className="font-medium text-yellow-300 mb-2">Lưu ý quan trọng:</h4>
//                   <ul className="text-sm text-yellow-200 space-y-1">
//                     <li>• Bài báo phải là nghiên cứu gốc, chưa được xuất bản ở nơi khác</li>
//                     <li>• Deadline nộp bài: <strong>{conferenceInfo.deadline}</strong></li>
//                     <li>• Kết quả review sẽ được thông báo trong vòng 4-6 tuần</li>
//                     <li>• Không thể chỉnh sửa bài báo sau khi đã nộp</li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 text-white">
//       {/* Header */}
//       <header className="bg-gray-800 border-b border-gray-700">
//         <div className="max-w-7xl mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-xl font-bold">Nộp bài báo</h1>
//               <p className="text-gray-400 text-sm mt-1">{conferenceInfo.name}</p>
//             </div>
//             <div className="text-right">
//               <p className="text-sm text-gray-400">Deadline nộp bài</p>
//               <p className="font-semibold text-red-400">{conferenceInfo.deadline}</p>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-5xl mx-auto px-6 py-8">
//         {/* Progress Bar */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm font-medium text-gray-300">Tiến độ hoàn thành</span>
//             <span className="text-sm font-medium text-gray-300">{currentStep}/{totalSteps}</span>
//           </div>
//           <div className="w-full bg-gray-700 rounded-full h-2">
//             <div
//               className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//               style={{ width: `${(currentStep / totalSteps) * 100}%` }}
//             ></div>
//           </div>
//           <div className="flex justify-between mt-2">
//             <span className={`text-xs ${currentStep >= 1 ? 'text-blue-400' : 'text-gray-500'}`}>
//               Thông tin cơ bản
//             </span>
//             <span className={`text-xs ${currentStep >= 2 ? 'text-blue-400' : 'text-gray-500'}`}>
//               Tác giả
//             </span>
//             <span className={`text-xs ${currentStep >= 3 ? 'text-blue-400' : 'text-gray-500'}`}>
//               Tài liệu
//             </span>
//             <span className={`text-xs ${currentStep >= 4 ? 'text-blue-400' : 'text-gray-500'}`}>
//               Xác nhận
//             </span>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//           {/* Main Form */}
//           <div className="lg:col-span-3">
//             <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
//               {renderStepContent()}

//               {/* Navigation Buttons */}
//               <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-700">
//                 <button
//                   onClick={prevStep}
//                   disabled={currentStep === 1}
//                   className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                 >
//                   Quay lại
//                 </button>

//                 <div className="flex space-x-3">
//                   <button className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors">
//                     Lưu nháp
//                   </button>

//                   {currentStep < totalSteps ? (
//                     <button
//                       onClick={nextStep}
//                       className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                     >
//                       Tiếp tục
//                     </button>
//                   ) : (
//                     <button
//                       disabled={!formData.ethics || !formData.copyright}
//                       className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                     >
//                       Nộp bài báo
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Sidebar */}
//           <div className="lg:col-span-1">
//             <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 sticky top-8">
//               <h3 className="font-semibold text-white mb-4">Thông tin hội thảo</h3>

//               <div className="space-y-4 text-sm">
//                 <div>
//                   <p className="text-gray-400">Tên hội thảo:</p>
//                   <p className="text-white font-medium">{conferenceInfo.name}</p>
//                 </div>

//                 <div>
//                   <p className="text-gray-400">Deadline:</p>
//                   <p className="text-red-400 font-medium">{conferenceInfo.deadline}</p>
//                 </div>

//                 <div>
//                   <p className="text-gray-400">Định dạng:</p>
//                   <p className="text-white">{conferenceInfo.submissionGuidelines}</p>
//                 </div>

//                 <div>
//                   <p className="text-gray-400">Số trang tối đa:</p>
//                   <p className="text-white">{conferenceInfo.maxPages} trang</p>
//                 </div>
//               </div>

//               <div className="mt-6 pt-4 border-t border-gray-700">
//                 <h4 className="font-medium text-white mb-2">Hỗ trợ</h4>
//                 <div className="space-y-2 text-sm">
//                   <a href="#" className="block text-blue-400 hover:text-blue-300">
//                     📋 Hướng dẫn nộp bài
//                   </a>
//                   <a href="#" className="block text-blue-400 hover:text-blue-300">
//                     📄 Template bài báo
//                   </a>
//                   <a href="#" className="block text-blue-400 hover:text-blue-300">
//                     💬 Liên hệ hỗ trợ
//                   </a>
//                 </div>
//               </div>

//               <div className="mt-6 pt-4 border-t border-gray-700">
//                 <h4 className="font-medium text-white mb-2">Trạng thái</h4>
//                 <div className="text-sm">
//                   <div className="flex justify-between py-1">
//                     <span className="text-gray-400">Thông tin cơ bản:</span>
//                     <span className={currentStep > 1 ? 'text-green-400' : 'text-yellow-400'}>
//                       {currentStep > 1 ? '✓' : '○'}
//                     </span>
//                   </div>
//                   <div className="flex justify-between py-1">
//                     <span className="text-gray-400">Tác giả:</span>
//                     <span className={currentStep > 2 ? 'text-green-400' : 'text-yellow-400'}>
//                       {currentStep > 2 ? '✓' : '○'}
//                     </span>
//                   </div>
//                   <div className="flex justify-between py-1">
//                     <span className="text-gray-400">Tài liệu:</span>
//                     <span className={currentStep > 3 ? 'text-green-400' : 'text-yellow-400'}>
//                       {currentStep > 3 ? '✓' : '○'}
//                     </span>
//                   </div>
//                   <div className="flex justify-between py-1">
//                     <span className="text-gray-400">Xác nhận:</span>
//                     <span className={currentStep === 4 && formData.ethics && formData.copyright ? 'text-green-400' : 'text-yellow-400'}>
//                       {currentStep === 4 && formData.ethics && formData.copyright ? '✓' : '○'}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SubmitPaperScreen;
