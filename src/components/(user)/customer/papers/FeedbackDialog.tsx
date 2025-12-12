// import { PhaseValidationResult } from "@/helper/timeValidation";
// import { RevisionSubmission, RevisionSubmissionFeedback } from "@/types/paper.type";
// import { Dialog, Transition } from "@headlessui/react";
// import { X } from "lucide-react";
// import { Fragment, memo, useCallback } from "react";

// interface FeedbackDialogProps {
//     isOpen: boolean;
//     onClose: () => void;
//     submission: RevisionSubmission;
//     feedbackResponses: { [key: string]: string };
//     onResponseChange: (feedbackId: string, response: string) => void;
//     onSubmitResponses: () => void;
//     loading: boolean;
//     canRespondToFeedback: (feedback: RevisionSubmissionFeedback) => boolean;
//     responseValidation: PhaseValidationResult;
// }

// const FeedbackDialog: React.FC<FeedbackDialogProps> = memo(({
//     isOpen,
//     onClose,
//     submission,
//     feedbackResponses,
//     onResponseChange,
//     onSubmitResponses,
//     loading,
//     canRespondToFeedback,
//     responseValidation
// }) => {
//     // Memoize handler để tránh tạo function mới mỗi lần render
//     const handleInputChange = useCallback((feedbackId: string, value: string) => {
//         onResponseChange(feedbackId, value);
//     }, [onResponseChange]);

//     return (
//         <Transition appear show={isOpen} as={Fragment}>
//             <Dialog as="div" className="relative z-50" onClose={onClose}>
//                 <Transition.Child
//                     as={Fragment}
//                     enter="ease-out duration-300"
//                     enterFrom="opacity-0"
//                     enterTo="opacity-100"
//                     leave="ease-in duration-200"
//                     leaveFrom="opacity-100"
//                     leaveTo="opacity-0"
//                 >
//                     <div className="fixed inset-0 bg-black bg-opacity-30" />
//                 </Transition.Child>

//                 <div className="fixed inset-0 overflow-y-auto">
//                     <div className="flex min-h-full items-center justify-center p-4">
//                         <Transition.Child
//                             as={Fragment}
//                             enter="ease-out duration-300"
//                             enterFrom="opacity-0 scale-95"
//                             enterTo="opacity-100 scale-100"
//                             leave="ease-in duration-200"
//                             leaveFrom="opacity-100 scale-100"
//                             leaveTo="opacity-0 scale-95"
//                         >
//                             <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 text-left align-middle shadow-xl transition-all">
//                                 <div className="flex justify-between items-start mb-4">
//                                     <Dialog.Title className="text-xl font-bold text-gray-900">
//                                         Feedbacks - Submission
//                                     </Dialog.Title>
//                                     <button
//                                         onClick={onClose}
//                                         className="text-gray-500 hover:text-gray-900 transition-colors"
//                                     >
//                                         <X className="w-6 h-6" />
//                                     </button>
//                                 </div>

//                                 <div className="mb-4 space-y-2 text-sm text-gray-600">
//                                     {submission.title && (
//                                         <p>
//                                             <span className="font-medium text-gray-900">Tiêu đề:</span> {submission.title}
//                                         </p>
//                                     )}
//                                     {submission.description && (
//                                         <p>
//                                             <span className="font-medium text-gray-900">Mô tả:</span> {submission.description}
//                                         </p>
//                                     )}
//                                 </div>

//                                 <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
//                                     {submission.feedbacks.map((feedback) => (
//                                         <div key={feedback.feedbackId} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
//                                             <div className="mb-3">
//                                                 <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded">
//                                                     Feedback #{feedback.order}
//                                                 </span>
//                                                 <p className="text-sm mt-2 text-gray-800">
//                                                     {feedback.feedBack || 'Chưa có feedback'}
//                                                 </p>
//                                             </div>

//                                             {canRespondToFeedback(feedback) && (
//                                                 <div>
//                                                     <label className="block text-xs font-medium text-gray-700 mb-2">
//                                                         Phản hồi của bạn:
//                                                     </label>
//                                                     <textarea
//                                                         value={feedbackResponses[feedback.feedbackId] || feedback.response || ''}
//                                                         onChange={(e) => handleInputChange(feedback.feedbackId, e.target.value)}
//                                                         placeholder="Nhập phản hồi cho feedback này..."
//                                                         className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                                         rows={3}
//                                                         disabled={!!(feedback.response && !feedbackResponses[feedback.feedbackId]) || !responseValidation.isAvailable}
//                                                     />
//                                                     {!responseValidation.isAvailable && (
//                                                         <p className="text-xs text-yellow-600 mt-1">{responseValidation.message}</p>
//                                                     )}

//                                                     {feedback.response && !feedbackResponses[feedback.feedbackId] && (
//                                                         <p className="text-xs text-green-600 mt-1">✓ Đã phản hồi</p>
//                                                     )}
//                                                 </div>
//                                             )}
//                                         </div>
//                                     ))}
//                                 </div>

//                                 {submission.feedbacks.some(f => canRespondToFeedback(f) && !f.response) && (
//                                     <div className="mt-6 flex justify-end gap-3">
//                                         <button
//                                             onClick={onClose}
//                                             className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors"
//                                         >
//                                             Đóng
//                                         </button>
//                                         <button
//                                             onClick={onSubmitResponses}
//                                             disabled={loading || !responseValidation.isAvailable}
//                                             className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
//                                         >
//                                             {loading ? 'Đang gửi...' : 'Gửi Phản Hồi'}
//                                         </button>
//                                     </div>
//                                 )}
//                             </Dialog.Panel>
//                         </Transition.Child>
//                     </div>
//                 </div>
//             </Dialog>
//         </Transition>
//     );
// });

// FeedbackDialog.displayName = 'FeedbackDialog';
// export default FeedbackDialog;

import { PhaseValidationResult } from "@/helper/timeValidation";
import { RevisionSubmission, RevisionSubmissionFeedback } from "@/types/paper.type";
import { Dialog, Transition } from "@headlessui/react";
import { CheckCircle, MessageSquare, X } from "lucide-react";
import { Fragment, memo, useCallback, useState } from "react";
import { Editor } from '@tinymce/tinymce-react';

interface FeedbackDialogProps {
    isOpen: boolean;
    onClose: () => void;
    submission: RevisionSubmission;
    feedbackResponses: { [key: string]: string };
    onResponseChange: (feedbackId: string, response: string) => void;
    onSubmitResponses: () => void;
    loading: boolean;
    canRespondToFeedback: (feedback: RevisionSubmissionFeedback) => boolean;
    responseValidation: PhaseValidationResult;
}

const FeedbackDialog: React.FC<FeedbackDialogProps> = memo(({
    isOpen,
    onClose,
    submission,
    feedbackResponses,
    onResponseChange,
    onSubmitResponses,
    loading,
    canRespondToFeedback,
    responseValidation
}) => {
    const [selectedFeedback, setSelectedFeedback] = useState<RevisionSubmissionFeedback | null>(null);

    const handleInputChange = useCallback((feedbackId: string, value: string) => {
        onResponseChange(feedbackId, value);
    }, [onResponseChange]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isDetailView = selectedFeedback !== null;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-6xl h-[95vh] flex flex-col transform rounded-xl bg-white shadow-2xl transition-all">
                                {/* Header */}
                                <div className="flex-shrink-0 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200 px-4 sm:px-6 py-3 rounded-t-xl">
                                    <div className="flex items-center justify-between">
                                        <Dialog.Title className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                                            {isDetailView && (
                                                <button
                                                    onClick={() => setSelectedFeedback(null)}
                                                    className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                </button>
                                            )}
                                            <div className="p-1.5 bg-green-100 rounded-lg">
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <span>
                                                    {isDetailView ? 'Chi tiết Feedback' : 'Danh sách Feedbacks'}
                                                </span>
                                                {submission.title && (
                                                    <span className="ml-3 text-sm font-normal text-gray-600">
                                                        {submission.title}
                                                    </span>
                                                )}
                                            </div>
                                        </Dialog.Title>
                                        <button
                                            onClick={() => {
                                                onClose();
                                                setSelectedFeedback(null);
                                            }}
                                            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-white/50 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-y-auto">
                                    {isDetailView ? (
                                        /* Detail View */
                                        <div className="h-full">
                                            <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
                                                {/* Feedback Info */}
                                                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                                                    <span className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 text-white text-lg font-bold flex items-center justify-center shadow-sm">
                                                        {selectedFeedback.order}
                                                    </span>
                                                    <div>
                                                        <div className="font-semibold text-gray-900">
                                                            Feedback #{submission.feedbacks.findIndex(
                                                                f => f.feedbackId === selectedFeedback.feedbackId
                                                            ) + 1}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Feedback Section */}
                                                <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                                                    <div className="bg-gradient-to-r from-green-500 to-green-600 px-5 py-3">
                                                        <h3 className="text-white font-semibold flex items-center gap-2">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            {"Reviewer's Feedback"}
                                                        </h3>
                                                    </div>
                                                    <div className="p-6 bg-gray-50">
                                                        <div
                                                            className="prose prose-sm sm:prose-base max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-strong:text-gray-900 prose-a:text-blue-600 hover:prose-a:text-blue-700"
                                                            dangerouslySetInnerHTML={{ __html: selectedFeedback.feedBack || 'Chưa có feedback' }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Response Section */}
                                                {canRespondToFeedback(selectedFeedback) && (
                                                    <div className="bg-white rounded-xl border-2 border-blue-200 overflow-hidden">
                                                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-3">
                                                            <h3 className="text-white font-semibold flex items-center gap-2">
                                                                <MessageSquare className="w-5 h-5" />
                                                                {selectedFeedback.response ? "Your Response" : "Write Your Response"}
                                                            </h3>
                                                        </div>
                                                        <div className="p-6 bg-blue-50">
                                                            {selectedFeedback.response && !feedbackResponses[selectedFeedback.feedbackId] ? (
                                                                <div
                                                                    className="prose prose-sm sm:prose-base max-w-none prose-headings:text-blue-900 prose-p:text-gray-800 prose-p:leading-relaxed prose-li:text-gray-800 prose-strong:text-blue-900 prose-a:text-blue-600 hover:prose-a:text-blue-700"
                                                                    dangerouslySetInnerHTML={{ __html: selectedFeedback.response }}
                                                                />
                                                            ) : (
                                                                <div>
                                                                    <Editor
                                                                        apiKey="3y5fjdjkfiq85zyoqsx6xzhjkh2xteadh3g6lcrm1k56vgn1"
                                                                        value={feedbackResponses[selectedFeedback.feedbackId] || selectedFeedback.response || ''}
                                                                        onEditorChange={(content) => handleInputChange(selectedFeedback.feedbackId, content)}
                                                                        disabled={!responseValidation.isAvailable}
                                                                        init={{
                                                                            height: 400,
                                                                            menubar: true,
                                                                            plugins: [
                                                                                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                                                                                'preview', 'anchor', 'searchreplace', 'visualblocks', 'code',
                                                                                'fullscreen', 'insertdatetime', 'media', 'table', 'help', 'wordcount'
                                                                            ],
                                                                            toolbar:
                                                                                'undo redo | blocks | ' +
                                                                                'bold italic underline forecolor | alignleft aligncenter ' +
                                                                                'alignright alignjustify | bullist numlist outdent indent | ' +
                                                                                'image table | removeformat | help',
                                                                            content_style:
                                                                                'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                                                                        }}
                                                                    />
                                                                    {!responseValidation.isAvailable && (
                                                                        <p className="text-xs text-yellow-600 mt-2">{responseValidation.message}</p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        /* List View */
                                        <div className="p-4 sm:p-6">
                                            {submission.feedbacks.length === 0 ? (
                                                <div className="h-full flex items-center justify-center py-16">
                                                    <div className="text-center">
                                                        <div className="inline-flex p-4 bg-gray-100 rounded-full mb-3">
                                                            <MessageSquare className="w-10 h-10 text-gray-400" />
                                                        </div>
                                                        <p className="text-gray-500">Chưa có feedback nào</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid gap-4 max-w-5xl mx-auto">
                                                    {submission.feedbacks.map((feedback, index) => (
                                                        <div
                                                            key={feedback.feedbackId}
                                                            className="bg-white rounded-lg border-2 border-gray-200 hover:border-green-300 hover:shadow-md transition-all overflow-hidden"
                                                        >
                                                            <div className="p-4 sm:p-5">
                                                                <div className="flex items-start justify-between gap-4">
                                                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                                                        <span className="flex-shrink-0 w-9 h-9 rounded-full bg-green-500 text-white text-sm font-bold flex items-center justify-center shadow-sm">
                                                                            {feedback.order}
                                                                        </span>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="font-semibold text-gray-900 mb-1">
                                                                                Feedback #{index + 1}
                                                                            </div>
                                                                            <div
                                                                                className="prose prose-sm max-w-none line-clamp-3 text-gray-600"
                                                                                dangerouslySetInnerHTML={{
                                                                                    __html: (feedback.feedBack || 'Chưa có feedback').substring(0, 200) +
                                                                                        ((feedback.feedBack || '').length > 200 ? "..." : "")
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                                                        {feedback.response && (
                                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                                                                <MessageSquare className="w-3.5 h-3.5" />
                                                                                Có phản hồi
                                                                            </span>
                                                                        )}
                                                                        <button
                                                                            onClick={() => setSelectedFeedback(feedback)}
                                                                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                                                                        >
                                                                            Xem chi tiết
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-3 rounded-b-xl">
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-600">
                                            {!isDetailView && (
                                                <span>
                                                    Tổng số: <span className="font-semibold text-gray-900">{submission.feedbacks.length}</span> feedback{submission.feedbacks.length !== 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    onClose();
                                                    setSelectedFeedback(null);
                                                }}
                                                className="px-5 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-medium transition-colors"
                                            >
                                                Đóng
                                            </button>
                                            {submission.feedbacks.some(f => canRespondToFeedback(f) && !f.response) && (
                                                <button
                                                    onClick={onSubmitResponses}
                                                    disabled={loading || !responseValidation.isAvailable}
                                                    className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
                                                >
                                                    {loading ? 'Đang gửi...' : 'Gửi Phản Hồi'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
});

FeedbackDialog.displayName = 'FeedbackDialog';
export default FeedbackDialog;

// import { PhaseValidationResult } from "@/helper/timeValidation";
// import { RevisionSubmission, RevisionSubmissionFeedback } from "@/types/paper.type";
// import { Dialog, Transition } from "@headlessui/react";
// import { X } from "lucide-react";
// import { Fragment, memo, useCallback } from "react";

// interface FeedbackDialogProps {
//     isOpen: boolean;
//     onClose: () => void;
//     submission: RevisionSubmission;
//     feedbackResponses: { [key: string]: string };
//     onResponseChange: (feedbackId: string, response: string) => void;
//     onSubmitResponses: () => void;
//     loading: boolean;
//     canRespondToFeedback: (feedback: RevisionSubmissionFeedback) => boolean;
//     responseValidation: PhaseValidationResult;
// }

// // const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
// //     isOpen,
// //     onClose,
// //     submission,
// //     feedbackResponses,
// //     onResponseChange,
// //     onSubmitResponses,
// //     loading,
// //     canRespondToFeedback,
// //     responseValidation
// // }) => {
// const FeedbackDialog: React.FC<FeedbackDialogProps> = memo(({
//     isOpen,
//     onClose,
//     submission,
//     feedbackResponses,
//     onResponseChange,
//     onSubmitResponses,
//     loading,
//     canRespondToFeedback,
//     responseValidation
// }) => {
//     // Memoize handler để tránh tạo function mới mỗi lần render
//     const handleInputChange = useCallback((feedbackId: string, value: string) => {
//         onResponseChange(feedbackId, value);
//     }, [onResponseChange]);

//     return (
//         <Transition appear show={isOpen} as={Fragment}>
//             <Dialog as="div" className="relative z-50" onClose={onClose}>
//                 <Transition.Child
//                     as={Fragment}
//                     enter="ease-out duration-300"
//                     enterFrom="opacity-0"
//                     enterTo="opacity-100"
//                     leave="ease-in duration-200"
//                     leaveFrom="opacity-100"
//                     leaveTo="opacity-0"
//                 >
//                     <div className="fixed inset-0 bg-black bg-opacity-50" />
//                 </Transition.Child>

//                 <div className="fixed inset-0 overflow-y-auto">
//                     <div className="flex min-h-full items-center justify-center p-4">
//                         <Transition.Child
//                             as={Fragment}
//                             enter="ease-out duration-300"
//                             enterFrom="opacity-0 scale-95"
//                             enterTo="opacity-100 scale-100"
//                             leave="ease-in duration-200"
//                             leaveFrom="opacity-100 scale-100"
//                             leaveTo="opacity-0 scale-95"
//                         >
//                             <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-gray-800 border border-gray-700 p-6 text-left align-middle shadow-xl transition-all">
//                                 <div className="flex justify-between items-start mb-4">
//                                     <Dialog.Title className="text-xl font-bold text-white">
//                                         Feedbacks - Submission
//                                     </Dialog.Title>
//                                     <button
//                                         onClick={onClose}
//                                         className="text-gray-400 hover:text-white transition-colors"
//                                     >
//                                         <X className="w-6 h-6" />
//                                     </button>
//                                 </div>

//                                 <div className="mb-4 space-y-2 text-sm text-gray-400">
//                                     {submission.title && (
//                                         <p>
//                                             <span className="font-medium text-white">Tiêu đề:</span> {submission.title}
//                                         </p>
//                                     )}
//                                     {submission.description && (
//                                         <p>
//                                             <span className="font-medium text-white">Mô tả:</span> {submission.description}
//                                         </p>
//                                     )}
//                                 </div>

//                                 <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
//                                     {submission.feedbacks.map((feedback) => (
//                                         <div key={feedback.feedbackId} className="bg-gray-700 p-4 rounded-lg">
//                                             <div className="mb-3">
//                                                 <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded">
//                                                     Feedback #{feedback.order}
//                                                 </span>
//                                                 <p className="text-sm mt-2 text-gray-200">
//                                                     {feedback.feedBack || 'Chưa có feedback'}
//                                                 </p>
//                                             </div>

//                                             {canRespondToFeedback(feedback) && (
//                                                 <div>
//                                                     <label className="block text-xs font-medium text-gray-300 mb-2">
//                                                         Phản hồi của bạn:
//                                                     </label>
//                                                     <textarea
//                                                         value={feedbackResponses[feedback.feedbackId] || feedback.response || ''}
//                                                         // onChange={(e) => onResponseChange(feedback.feedbackId, e.target.value)}
//                                                         onChange={(e) => handleInputChange(feedback.feedbackId, e.target.value)}
//                                                         placeholder="Nhập phản hồi cho feedback này..."
//                                                         className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                                         rows={3}
//                                                         disabled={!!(feedback.response && !feedbackResponses[feedback.feedbackId]) || !responseValidation.isAvailable}
//                                                     />
//                                                     {!responseValidation.isAvailable && (
//                                                         <p className="text-xs text-yellow-400 mt-1">{responseValidation.message}</p>
//                                                     )}

//                                                     {feedback.response && !feedbackResponses[feedback.feedbackId] && (
//                                                         <p className="text-xs text-green-400 mt-1">✓ Đã phản hồi</p>
//                                                     )}
//                                                 </div>
//                                             )}
//                                         </div>
//                                     ))}
//                                 </div>

//                                 {submission.feedbacks.some(f => canRespondToFeedback(f) && !f.response) && (
//                                     <div className="mt-6 flex justify-end gap-3">
//                                         <button
//                                             onClick={onClose}
//                                             className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
//                                         >
//                                             Đóng
//                                         </button>
//                                         <button
//                                             onClick={onSubmitResponses}
//                                             disabled={loading || !responseValidation.isAvailable}
//                                             className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
//                                         >
//                                             {loading ? 'Đang gửi...' : 'Gửi Phản Hồi'}
//                                         </button>
//                                     </div>
//                                 )}
//                             </Dialog.Panel>
//                         </Transition.Child>
//                     </div>
//                 </div>
//             </Dialog>
//         </Transition>
//     );
// });

// FeedbackDialog.displayName = 'FeedbackDialog';
// export default FeedbackDialog;