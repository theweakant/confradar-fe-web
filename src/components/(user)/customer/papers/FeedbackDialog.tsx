import { PhaseValidationResult } from "@/helper/timeValidation";
import { RevisionSubmission, RevisionSubmissionFeedback } from "@/types/paper.type";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import { Fragment } from "react";

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

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
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
                    <div className="fixed inset-0 bg-black bg-opacity-50" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-gray-800 border border-gray-700 p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <Dialog.Title className="text-xl font-bold text-white">
                                        Feedbacks - Submission
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="mb-4 space-y-2 text-sm text-gray-400">
                                    {submission.title && (
                                        <p>
                                            <span className="font-medium text-white">Tiêu đề:</span> {submission.title}
                                        </p>
                                    )}
                                    {submission.description && (
                                        <p>
                                            <span className="font-medium text-white">Mô tả:</span> {submission.description}
                                        </p>
                                    )}
                                </div>

                                <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
                                    {submission.feedbacks.map((feedback) => (
                                        <div key={feedback.feedbackId} className="bg-gray-700 p-4 rounded-lg">
                                            <div className="mb-3">
                                                <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded">
                                                    Feedback #{feedback.order}
                                                </span>
                                                <p className="text-sm mt-2 text-gray-200">
                                                    {feedback.feedBack || 'Chưa có feedback'}
                                                </p>
                                            </div>

                                            {canRespondToFeedback(feedback) && (
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-300 mb-2">
                                                        Phản hồi của bạn:
                                                    </label>
                                                    <textarea
                                                        value={feedbackResponses[feedback.feedbackId] || feedback.response || ''}
                                                        onChange={(e) => onResponseChange(feedback.feedbackId, e.target.value)}
                                                        placeholder="Nhập phản hồi cho feedback này..."
                                                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        rows={3}
                                                        disabled={!!(feedback.response && !feedbackResponses[feedback.feedbackId]) || !responseValidation.isAvailable}
                                                    />
                                                    {!responseValidation.isAvailable && (
                                                        <p className="text-xs text-yellow-400 mt-1">{responseValidation.message}</p>
                                                    )}

                                                    {feedback.response && !feedbackResponses[feedback.feedbackId] && (
                                                        <p className="text-xs text-green-400 mt-1">✓ Đã phản hồi</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {submission.feedbacks.some(f => canRespondToFeedback(f) && !f.response) && (
                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            onClick={onClose}
                                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                                        >
                                            Đóng
                                        </button>
                                        <button
                                            onClick={onSubmitResponses}
                                            disabled={loading || !responseValidation.isAvailable}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                                        >
                                            {loading ? 'Đang gửi...' : 'Gửi Phản Hồi'}
                                        </button>
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};


export default FeedbackDialog;