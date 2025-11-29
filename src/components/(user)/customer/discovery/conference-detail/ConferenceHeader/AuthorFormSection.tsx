import React from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

interface AuthorFormSectionProps {
    isAuthorTicket?: boolean;
    showForm: boolean;
    onToggleForm: () => void;
    authorInfo: { title: string; description: string };
    onAuthorInfoChange: (info: { title: string; description: string }) => void;
    isDialogOpen: boolean;
    onOpenDialog: () => void;
    onCloseDialog: () => void;
}

const AuthorFormSection: React.FC<AuthorFormSectionProps> = ({
    isAuthorTicket,
    showForm,
    onToggleForm,
    authorInfo,
    onAuthorInfoChange,
    isDialogOpen,
    onOpenDialog,
    onCloseDialog,
}) => {
    if (!isAuthorTicket) return null;

    const isFormValid = authorInfo.title.trim() && authorInfo.description.trim();

    return (
        <>
            <button
                onClick={onOpenDialog}
                className="w-full flex items-center justify-between p-3 rounded-lg 
                   bg-gradient-to-r from-yellow-500/20 to-orange-500/20 
                   border border-yellow-400/40 hover:border-yellow-400/60 transition-all"
            >
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path
                            fillRule="evenodd"
                            d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <span className="text-sm font-medium text-yellow-300">
                        Thông tin bài báo {isFormValid && "✓"}
                    </span>
                </div>
                <svg
                    className="w-5 h-5 text-yellow-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            <Dialog open={isDialogOpen} as="div" className="relative z-[60]" onClose={onCloseDialog}>
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-lg rounded-2xl bg-white/10 backdrop-blur-2xl p-6 text-white">
                        <DialogTitle as="h3" className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <svg className="w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path
                                    fillRule="evenodd"
                                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Thông tin bài báo
                        </DialogTitle>

                        <div className="space-y-4">
                            <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-400/30">
                                <p className="text-xs text-yellow-200/90 leading-relaxed">
                                    💡 Viết tiêu đề và mô tả bài báo. Có thể chỉnh sửa sau tại{" "}
                                    <strong>&quot;Bài báo của tôi&quot;</strong>
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-white/90">
                                    Tiêu đề <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={authorInfo.title}
                                    onChange={(e) =>
                                        onAuthorInfoChange({
                                            ...authorInfo,
                                            title: e.target.value,
                                        })
                                    }
                                    placeholder="Nhập tiêu đề bài báo..."
                                    className="w-full px-4 py-2.5 text-sm rounded-lg bg-white/10 border border-white/30 
                                        text-white placeholder-white/40 focus:outline-none focus:border-yellow-400
                                        focus:ring-2 focus:ring-yellow-400/30 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-white/90">
                                    Mô tả <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={authorInfo.description}
                                    onChange={(e) =>
                                        onAuthorInfoChange({
                                            ...authorInfo,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Nhập mô tả ngắn gọn về nội dung bài báo..."
                                    rows={5}
                                    className="w-full px-4 py-2.5 text-sm rounded-lg bg-white/10 border border-white/30 
                                        text-white placeholder-white/40 focus:outline-none focus:border-yellow-400
                                        focus:ring-2 focus:ring-yellow-400/30 resize-none transition"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={onCloseDialog}
                                className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 
                                    transition text-sm font-medium border border-white/20"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={onCloseDialog}
                                disabled={!isFormValid}
                                className="px-5 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 
                                    disabled:opacity-50 disabled:cursor-not-allowed transition 
                                    text-sm font-medium text-black"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </>
        // <div className="flex-1">
        //     <button
        //         onClick={onToggleForm}
        //         className="w-full flex items-center justify-between p-3 rounded-lg 
        //        bg-gradient-to-r from-yellow-500/20 to-orange-500/20 
        //        border border-yellow-400/40 hover:border-yellow-400/60 transition-all"
        //     >
        //         <div className="flex items-center gap-2">
        //             <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
        //                 <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        //                 <path
        //                     fillRule="evenodd"
        //                     d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
        //                     clipRule="evenodd"
        //                 />
        //             </svg>
        //             <span className="text-sm font-medium text-yellow-300">
        //                 Bài báo {authorInfo.title && authorInfo.description && "✓"}
        //             </span>
        //         </div>
        //         <svg
        //             className={`w-5 h-5 text-yellow-300 transition-transform ${showForm ? "rotate-180" : ""}`}
        //             fill="none"
        //             viewBox="0 0 24 24"
        //             stroke="currentColor"
        //         >
        //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        //         </svg>
        //     </button>

        //     <div
        //         className={`overflow-hidden transition-all duration-300 ease-in-out ${showForm ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
        //             }`}
        //     >
        //         <div className="space-y-3 p-3 bg-black/20 rounded-lg border border-yellow-400/20">
        //             <p className="text-xs text-yellow-200/80 leading-relaxed">
        //                 💡 Viết tiêu đề và mô tả bài báo. Có thể chỉnh sửa sau tại{" "}
        //                 <strong>&quot;Bài báo của tôi&quot;</strong>
        //             </p>
        //             <div>
        //                 <label className="block text-xs font-medium mb-1.5 text-white/90">
        //                     Tiêu đề <span className="text-red-400">*</span>
        //                 </label>
        //                 <input
        //                     type="text"
        //                     value={authorInfo.title}
        //                     onChange={(e) =>
        //                         onAuthorInfoChange({
        //                             ...authorInfo,
        //                             title: e.target.value,
        //                         })
        //                     }
        //                     placeholder="Nhập tiêu đề bài báo..."
        //                     className="w-full px-3 py-2 text-sm rounded-lg bg-white/10 border border-white/30 
        //              text-white placeholder-white/40 focus:outline-none focus:border-yellow-400
        //              focus:ring-1 focus:ring-yellow-400/30"
        //                 />
        //             </div>
        //             <div>
        //                 <label className="block text-xs font-medium mb-1.5 text-white/90">
        //                     Mô tả <span className="text-red-400">*</span>
        //                 </label>
        //                 <textarea
        //                     value={authorInfo.description}
        //                     onChange={(e) =>
        //                         onAuthorInfoChange({
        //                             ...authorInfo,
        //                             description: e.target.value,
        //                         })
        //                     }
        //                     placeholder="Nhập mô tả ngắn gọn..."
        //                     rows={3}
        //                     className="w-full px-3 py-2 text-sm rounded-lg bg-white/10 border border-white/30 
        //              text-white placeholder-white/40 focus:outline-none focus:border-yellow-400
        //              focus:ring-1 focus:ring-yellow-400/30 resize-none"
        //                 />
        //             </div>
        //         </div>
        //     </div>
        // </div>
    );
};

export default AuthorFormSection;