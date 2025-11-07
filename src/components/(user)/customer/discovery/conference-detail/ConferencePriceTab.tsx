import React from 'react';
import { Clock, Calendar, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { TechnicalConferenceDetailResponse, ResearchConferenceDetailResponse, ConferencePriceResponse, ConferencePricePhaseResponse } from "@/types/conference.type";

interface ConferencePriceTabProps {
    conference: TechnicalConferenceDetailResponse | ResearchConferenceDetailResponse;
    formatDate: (dateString?: string) => string;
    formatTime: (timeString?: string) => string;
}

const ConferencePriceTab: React.FC<ConferencePriceTabProps> = ({
    conference,
    formatDate,
    formatTime
}) => {
    const pricesList = conference.conferencePrices || [];

    const getPhaseStatus = (phase: ConferencePricePhaseResponse) => {
        if (!phase.startDate || !phase.endDate) return 'unknown';

        const now = new Date();
        const startDate = new Date(phase.startDate);
        const endDate = new Date(phase.endDate);

        if (now < startDate) return 'upcoming';
        if (now > endDate) return 'ended';
        return 'current';
    };

    const getStatusDisplay = (status: string) => {
        switch (status) {
            case 'current':
                return {
                    icon: <CheckCircle className="w-5 h-5 text-green-400" />,
                    text: 'Đang diễn ra',
                    bgClass: 'bg-green-500/20 border-green-400 ring-2 ring-green-400/50',
                    textClass: 'text-green-400'
                };
            case 'upcoming':
                return {
                    icon: <AlertCircle className="w-5 h-5 text-yellow-400" />,
                    text: 'Chưa diễn ra',
                    bgClass: 'bg-yellow-500/20 border-yellow-400',
                    textClass: 'text-yellow-400'
                };
            case 'ended':
                return {
                    icon: <XCircle className="w-5 h-5 text-gray-400" />,
                    text: 'Đã kết thúc',
                    bgClass: 'bg-gray-500/20 border-gray-400',
                    textClass: 'text-gray-400'
                };
            default:
                return {
                    icon: <AlertCircle className="w-5 h-5 text-gray-400" />,
                    text: 'Chưa xác định',
                    bgClass: 'bg-gray-500/20 border-gray-400',
                    textClass: 'text-gray-400'
                };
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Các loại vé</h2>

            {pricesList.length > 0 ? (
                <div className="space-y-6">
                    {pricesList.map((ticket) => (
                        <div key={ticket.conferencePriceId} className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/20">
                            {/* Ticket Header */}
                            <div className="mb-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">
                                            {ticket.ticketName || 'Vé chưa đặt tên'}
                                        </h3>
                                        <p className="text-white/70 text-sm">
                                            {ticket.ticketDescription || 'Chưa có mô tả cho loại vé này'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-coral-400 mb-1">
                                            {ticket.ticketPrice ? `${ticket.ticketPrice.toLocaleString('vi-VN')}₫` : 'Giá chưa xác định'}
                                        </div>
                                        {ticket.isAuthor && (
                                            <span className="inline-block bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                                                Dành cho tác giả
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Ticket Availability */}
                                <div className="flex items-center gap-4 mt-4 text-sm">
                                    <div className="text-white/70">
                                        <span className="font-medium">Tổng số vé:</span> {ticket.totalSlot || 'Chưa xác định'}
                                    </div>
                                    <div className="text-white/70">
                                        <span className="font-medium">Còn lại:</span> {ticket.availableSlot !== undefined ? ticket.availableSlot : 'Chưa xác định'}
                                    </div>
                                </div>
                            </div>

                            {/* Price Phases */}
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-4">Các giai đoạn giá vé</h4>
                                {ticket.pricePhases && ticket.pricePhases.length > 0 ? (
                                    <div className="space-y-3">
                                        {ticket.pricePhases
                                            .sort((a, b) => {
                                                const startA = new Date(a.startDate || '').getTime();
                                                const startB = new Date(b.startDate || '').getTime();
                                                return startA - startB;
                                            })
                                            .map((phase, index) => {
                                            const status = getPhaseStatus(phase);
                                            const statusDisplay = getStatusDisplay(status);
                                            const actualPrice = ticket.ticketPrice && phase.applyPercent
                                                ? Math.round(ticket.ticketPrice * (phase.applyPercent / 100))
                                                : ticket.ticketPrice;

                                            return (
                                                <div
                                                    key={phase.pricePhaseId}
                                                    className={`p-4 rounded-lg border transition-all ${statusDisplay.bgClass} ${status === 'current' ? 'transform scale-[1.02] shadow-lg' : ''
                                                        }`}
                                                >
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h5 className="font-semibold text-white">
                                                                    {phase.phaseName || `Giai đoạn ${index + 1}`}
                                                                </h5>
                                                                <div className={`flex items-center gap-2 ${statusDisplay.textClass}`}>
                                                                    {statusDisplay.icon}
                                                                    <span className="text-sm font-medium">
                                                                        {statusDisplay.text}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                                {phase.startDate && (
                                                                    <div className="flex items-center gap-2 text-white/70">
                                                                        <Calendar className="w-4 h-4" />
                                                                        <span>Bắt đầu: {formatDate(phase.startDate)}</span>
                                                                    </div>
                                                                )}
                                                                {phase.endDate && (
                                                                    <div className="flex items-center gap-2 text-white/70">
                                                                        <Calendar className="w-4 h-4" />
                                                                        <span>Kết thúc: {formatDate(phase.endDate)}</span>
                                                                    </div>
                                                                )}
                                                                {phase.startDate && phase.endDate && (
                                                                    <div className="flex items-center gap-2 text-white/70">
                                                                        <Clock className="w-4 h-4" />
                                                                        <span>
                                                                            {formatTime(phase.startDate)} - {formatTime(phase.endDate)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <div className="text-white/70">
                                                                    <span className="font-medium">Vé còn lại:</span> {phase.availableSlot !== undefined ? phase.availableSlot : 'Chưa xác định'}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="text-right">
                                                            <div className="text-xl font-bold text-coral-400 mb-1">
                                                                {actualPrice ? `${actualPrice.toLocaleString('vi-VN')}₫` : 'Giá chưa xác định'}
                                                            </div>
                                                            {phase.applyPercent && (
                                                                <div className="text-sm text-white/70">
                                                                    Giảm {100 - phase.applyPercent}% ({phase.applyPercent}% giá gốc)
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center text-white/70 py-6 bg-white/10 rounded-lg">
                                        <p>Chưa có thông tin về các giai đoạn giá vé</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-white/70 py-12 bg-white/10 rounded-xl">
                    <AlertCircle className="w-12 h-12 text-white/50 mx-auto mb-4" />
                    <p className="text-lg">Chưa có thông tin về giá vé</p>
                    <p className="text-sm mt-2">Vui lòng quay lại sau hoặc liên hệ ban tổ chức để biết thêm chi tiết</p>
                </div>
            )}
        </div>
    );
};

export default ConferencePriceTab;