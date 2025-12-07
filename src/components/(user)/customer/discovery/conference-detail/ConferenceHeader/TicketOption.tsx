// TicketOption.tsx
import React from "react";
import {
    ConferencePriceResponse,
    ResearchConferenceDetailResponse,
    TechnicalConferenceDetailResponse,
} from "@/types/conference.type";
import { getCurrentPrice } from "@/helper/conference";
import { useGlobalTime } from "@/utils/TimeContext";

interface TicketOptionProps {
    ticket: ConferencePriceResponse;
    conference: TechnicalConferenceDetailResponse | ResearchConferenceDetailResponse;
    formatDate: (dateString?: string) => string;
    isSelected: boolean;
    onSelect: (ticket: ConferencePriceResponse, isDisabled: boolean) => void;
    isResearch?: boolean;
}

const TicketOption: React.FC<TicketOptionProps> = ({
    ticket,
    conference,
    formatDate,
    isSelected,
    onSelect,
    isResearch,
}) => {
    const { now, useFakeTime } = useGlobalTime();

    const currentPrice = getCurrentPrice(ticket);

    // const now = new Date();
    const currentPhase = ticket.pricePhases?.find((phase) => {
        const startDate = new Date(phase.startDate || "");
        const endDate = new Date(phase.endDate || "");
        return now >= startDate && now <= endDate;
    });

    const futurePhases = ticket.pricePhases
        ?.filter((phase) => {
            const startDate = new Date(phase.startDate || "");
            return startDate > now;
        })
        .sort((a, b) => new Date(a.startDate || "").getTime() - new Date(b.startDate || "").getTime());

    const nextPhase = futurePhases && futurePhases.length > 0 ? futurePhases[0] : null;

    // const isBeforeSale = !currentPhase && nextPhase;
    const isBeforeSale = !currentPhase && nextPhase !== null;
    const currentPhaseSoldOut = currentPhase && currentPhase.availableSlot === 0;
    const isLastPhase = !nextPhase;
    const isTicketSoldOut =
        (!currentPhase || currentPhase.availableSlot === 0) &&
        (!futurePhases || futurePhases.every((phase) => phase.availableSlot === 0));

    const hasDiscount =
        currentPrice < (ticket.ticketPrice ?? 0) && currentPhase?.applyPercent !== undefined;

    const isPurchasedTicket =
        conference.purchasedInfo?.conferencePriceId === ticket.conferencePriceId;

    const isDisabled = currentPhaseSoldOut || isTicketSoldOut || isBeforeSale || isPurchasedTicket;

    return (
        <label
            className={`block rounded-xl p-4 border transition-all ${isDisabled
                ? "bg-gray-500/20 border-gray-400/30 cursor-not-allowed opacity-60"
                : isSelected
                    ? "bg-coral-100 border-yellow-400 border-2 shadow-md cursor-pointer"
                    : "bg-white/10 border-white/20 hover:bg-white/20 cursor-pointer"
                }`}
            onClick={() => onSelect(ticket, isDisabled)}
        >
            <input type="radio" name="ticket" value={ticket.conferencePriceId} className="hidden" />

            <div className="flex justify-between items-start mb-1">
                <div className="flex flex-col">
                    <span className="font-semibold text-lg">{ticket.ticketName}</span>
                    {ticket.isAuthor ? (
                        <span className="text-xs text-yellow-300 font-medium mt-0.5">
                            {isResearch ? "Phí đăng ký với tư cách tác giả" : "Vé dành cho tác giả"}
                        </span>
                    ) : (
                        isResearch && (
                            <span className="text-xs text-blue-300 font-medium mt-0.5">
                                Phí đăng ký với tư cách thính giả
                            </span>
                        )
                    )}
                </div>
                <div className="text-right">
                    {hasDiscount && (
                        <span className="text-sm line-through text-white/60 block">
                            {(ticket.ticketPrice || 0).toLocaleString("vi-VN")}₫
                        </span>
                    )}
                    <span className="text-coral-300 font-bold text-lg">
                        {currentPrice.toLocaleString("vi-VN")}₫
                    </span>
                </div>
            </div>

            {ticket.ticketDescription && (
                <p className="text-sm text-white/70">{ticket.ticketDescription}</p>
            )}

            <div className="mt-2 text-sm space-y-1">
                {currentPhase && (
                    <div>
                        <p>
                            <span className="font-medium text-coral-200">
                                {isResearch ? "Giai đoạn phí tham dự hiện tại" : "Giai đoạn vé hiện tại:"}
                            </span>{" "}
                            {currentPhase.phaseName || "Không xác định"}
                        </p>
                        {currentPhase.applyPercent !== undefined && (
                            <p
                                className={`text-sm font-medium ${currentPhase.applyPercent > 100
                                    ? "text-red-500"
                                    : currentPhase.applyPercent < 100
                                        ? "text-green-500"
                                        : "text-gray-400"
                                    }`}
                            >
                                {currentPhase.applyPercent > 100
                                    ? `+${currentPhase.applyPercent - 100}%`
                                    : currentPhase.applyPercent < 100
                                        ? `-${100 - currentPhase.applyPercent}%`
                                        : "±0%"}
                            </p>
                        )}

                        <p>
                            <span className="font-medium text-coral-200">Số lượng:</span>{" "}
                            {currentPhase?.availableSlot} / {currentPhase?.totalSlot}
                        </p>

                        {currentPhase?.startDate && (
                            <p className="text-white/70">
                                <span className="font-medium">Hiệu lực:</span> {formatDate(currentPhase.startDate)} →{" "}
                                {formatDate(currentPhase.endDate)}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {isBeforeSale && nextPhase && (
                <div className="mt-3 p-2 bg-yellow-500/20 border border-yellow-400/40 rounded-lg">
                    <p className="text-xs text-yellow-200">
                        Vé sẽ mở bán từ {formatDate(nextPhase.startDate)} → {formatDate(nextPhase.endDate)}
                    </p>
                </div>
            )}

            {currentPhaseSoldOut && !isLastPhase && nextPhase && (
                <div className="mt-3 p-2 bg-yellow-500/20 border border-yellow-400/40 rounded-lg">
                    <p className="text-xs text-yellow-200">
                        Giai đoạn hiện tại đã hết vé, vui lòng chờ giai đoạn tiếp theo từ{" "}
                        {formatDate(nextPhase.startDate)} → {formatDate(nextPhase.endDate)}
                    </p>
                </div>
            )}

            {isTicketSoldOut && isLastPhase && (
                <div className="mt-3 p-2 bg-red-500/20 border border-red-400/40 rounded-lg">
                    <p className="text-xs text-red-200">Vé đã bán hết</p>
                </div>
            )}

            {isPurchasedTicket && (
                <div className="mb-2 inline-flex items-center gap-1 px-2 py-1 bg-green-500/30 border border-green-400/40 rounded-full">
                    <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <span className="text-xs text-green-300 font-medium">Đã mua</span>
                </div>
            )}
        </label>
    );
};

export default TicketOption;