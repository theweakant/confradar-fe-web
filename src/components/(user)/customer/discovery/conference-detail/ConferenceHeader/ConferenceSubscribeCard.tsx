// ConferenceSubscribeCard.tsx
import React from "react";
import {
    ConferencePricePhaseResponse,
    ConferencePriceResponse,
    ResearchConferenceDetailResponse,
    TechnicalConferenceDetailResponse,
} from "@/types/conference.type";
import { useGlobalTime } from "@/utils/TimeContext";

interface PurchasedTicketInfo {
    ticket: ConferencePriceResponse;
    phase?: ConferencePricePhaseResponse;
}

interface ConferenceSubscribeCardProps {
    conference: TechnicalConferenceDetailResponse | ResearchConferenceDetailResponse;
    formatDate: (dateString?: string) => string;
    onOpenDialog: () => void;
    purchasedTicketInfo: PurchasedTicketInfo | null;
}

const ConferenceSubscribeCard: React.FC<ConferenceSubscribeCardProps> = ({
    conference,
    formatDate,
    onOpenDialog,
    purchasedTicketInfo,
}) => {
    const { now, useFakeTime } = useGlobalTime();
    const isResearch = conference.isResearchConference;

    const renderSubscribeButton = () => {
        if (purchasedTicketInfo) {
            return (
                <div className="space-y-3">
                    <div className="p-4 bg-green-500/20 border border-green-400/40 rounded-lg">
                        <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1">
                                <p className="text-green-300 font-semibold mb-1">Bạn đã mua vé thành công!</p>
                                <div className="text-sm text-green-200/80 space-y-1">
                                    <p><span className="font-medium">Loại vé:</span> {purchasedTicketInfo.ticket.ticketName}</p>
                                    {purchasedTicketInfo.phase && (
                                        <p><span className="font-medium">Giai đoạn:</span> {purchasedTicketInfo.phase.phaseName}</p>
                                    )}
                                    <p><span className="font-medium">Giá:</span> {(purchasedTicketInfo.ticket.ticketPrice || 0).toLocaleString("vi-VN")}₫</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button disabled className="w-full bg-gray-500/50 text-white/70 px-6 py-3 rounded-lg font-semibold cursor-not-allowed opacity-60">
                        Đã sở hữu vé
                    </button>

                    <p className="text-white/60 text-xs text-center">
                        Bạn có thể xem chi tiết vé trong phần &quot;Vé của tôi&quot;
                    </p>
                </div>
            );
        }

        // const now = new Date();
        const allPhases = (conference.conferencePrices || []).flatMap((ticket) => ticket.pricePhases || []);

        const currentPhase = allPhases.find((phase) => {
            const start = new Date(phase.startDate || "");
            const end = new Date(phase.endDate || "");
            return now >= start && now <= end && (phase.availableSlot ?? 0) > 0;
        });

        const futurePhases = allPhases
            .filter((phase) => new Date(phase.startDate || "") > now)
            .sort((a, b) => new Date(a.startDate || "").getTime() - new Date(b.startDate || "").getTime());
        const nextPhaseStart = futurePhases.length > 0 ? new Date(futurePhases[0].startDate || "") : null;

        if (!currentPhase && nextPhaseStart) {
            return (
                <div>
                    <button disabled className="w-full bg-gray-500/50 text-white/70 px-6 py-3 rounded-lg font-semibold cursor-not-allowed opacity-60">
                        Chưa đến lúc mở bán vé
                    </button>
                    <p className="text-white/60 text-xs mt-2 text-center">
                        Ngày bắt đầu bán vé: {formatDate(nextPhaseStart.toISOString())}
                    </p>
                </div>
            );
        }

        if (!currentPhase && !nextPhaseStart) {
            return (
                <button disabled className="w-full bg-red-500/50 text-white/70 px-6 py-3 rounded-lg font-semibold cursor-not-allowed opacity-60">
                    Đã hết thời gian bán vé
                </button>
            );
        }

        return (
            <button
                onClick={onOpenDialog}
                className="w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 hover:from-sky-400 hover:via-indigo-400 hover:to-violet-400 text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02]"
            >
                {isResearch ? "Đăng ký tham dự" : "Mua vé"}
            </button>
        );
    };

    return (
        <div className="bg-gradient-to-br from-slate-800/90 via-gray-900/80 to-slate-900/70 backdrop-blur-md rounded-2xl shadow-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-sky-400 via-indigo-400 to-blue-300 bg-clip-text text-transparent drop-shadow-[0_2px_6px_rgba(56,189,248,0.4)]">
                Đăng ký ngay
            </h3>
            <p className="text-white text-sm mb-4">Nhấn để chọn khung giá vé và thanh toán</p>
            {renderSubscribeButton()}
        </div>
    );
};

export default ConferenceSubscribeCard;