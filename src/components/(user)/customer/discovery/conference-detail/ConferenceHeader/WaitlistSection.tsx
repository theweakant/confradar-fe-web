// WaitlistSection.tsx
import React from "react";

interface WaitlistSectionProps {
    allAuthorTicketsSoldOut: boolean;
    conferenceId?: string;
    onAddToWaitlist: (conferenceId?: string) => void;
    loading: boolean;
}

const WaitlistSection: React.FC<WaitlistSectionProps> = ({
    allAuthorTicketsSoldOut,
    conferenceId,
    onAddToWaitlist,
    loading,
}) => {
    if (!allAuthorTicketsSoldOut) return null;

    return (
        <div className="mt-4 p-4 bg-orange-500/20 border border-orange-400/40 rounded-xl">
            <p className="text-sm text-orange-200 mb-3">
                Loại vé cho tác giả hiện đang hết, bạn vui lòng xác nhận thêm vào danh sách chờ để nhận
                được thông báo khi vé mở lại, hoặc đăng ký với tư cách thính giả.
            </p>
            <button
                onClick={() => onAddToWaitlist(conferenceId)}
                disabled={loading}
                className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
                {loading ? (
                    <div className="flex items-center justify-center gap-2">
                        <svg
                            className="animate-spin h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                            ></path>
                        </svg>
                        <span>Đang xử lý...</span>
                    </div>
                ) : (
                    "Thêm vào danh sách chờ"
                )}
            </button>
        </div>
    );
};

export default WaitlistSection;