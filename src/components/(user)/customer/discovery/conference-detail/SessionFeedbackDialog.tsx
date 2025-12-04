import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, User } from "lucide-react";
import { SessionFeedback } from "@/types/conference.type";
import Image from "next/image";

interface SessionFeedbackDialogProps {
    isOpen: boolean;
    onClose: () => void;
    sessionTitle: string;
    sessionId: string;
    feedbacks: SessionFeedback[];
    canSubmitFeedback: boolean;
    onSubmitFeedback: (rating: number, message: string) => Promise<void>;
    isSubmitting: boolean;
}

const SessionFeedbackDialog: React.FC<SessionFeedbackDialogProps> = ({
    isOpen,
    onClose,
    sessionTitle,
    sessionId,
    feedbacks,
    canSubmitFeedback,
    onSubmitFeedback,
    isSubmitting,
}) => {
    const [rating, setRating] = useState(5);
    const [message, setMessage] = useState("");
    const [hoveredStar, setHoveredStar] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            return;
        }
        await onSubmitFeedback(rating, message);
        setRating(5);
        setMessage("");
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-gray-900 text-white border-gray-700">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white">
                        Đánh giá - {sessionTitle}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Submit Feedback Form - Only show if can submit */}
                    {canSubmitFeedback && (
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                            <h3 className="text-lg font-semibold mb-4">Thêm đánh giá của bạn</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Đánh giá</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoveredStar(star)}
                                                onMouseLeave={() => setHoveredStar(0)}
                                                className="focus:outline-none transition-transform hover:scale-110"
                                            >
                                                <Star
                                                    className={`w-8 h-8 ${star <= (hoveredStar || rating)
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-white/40"
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Nhận xét</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black/50 text-white"
                                        rows={4}
                                        placeholder="Chia sẻ trải nghiệm của bạn về session này..."
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                >
                                    {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Existing Feedbacks */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">
                            Đánh giá từ người tham dự ({feedbacks.length})
                        </h3>
                        <div className="space-y-4">
                            {feedbacks.length > 0 ? (
                                feedbacks.map((feedback) => (
                                    <div
                                        key={feedback.feedbackId}
                                        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-700">
                                                {feedback.userAvatar ? (
                                                    <Image
                                                        src={feedback.userAvatar}
                                                        alt={feedback.userName || "User"}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <User className="w-6 h-6 text-white/60" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-semibold text-white">
                                                        {feedback.userName || "Người dùng"}
                                                    </h4>
                                                    <span className="text-sm text-white/70">
                                                        {formatDate(feedback.createdAt)}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1 mb-2">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${i < feedback.rating
                                                                ? "fill-yellow-400 text-yellow-400"
                                                                : "text-white/40"
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-white/90">{feedback.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-white/70 text-center py-8">
                                    Chưa có đánh giá nào cho session này
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SessionFeedbackDialog;