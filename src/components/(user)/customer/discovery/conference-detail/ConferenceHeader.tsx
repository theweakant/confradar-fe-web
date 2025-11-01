import { MapPin, Calendar, Star } from 'lucide-react';
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ConferencePriceResponse, ResearchConferenceDetailResponse, TechnicalConferenceDetailResponse } from "@/types/conference.type";
import { getCurrentPrice } from "@/utils/conferenceUtils";
import React from 'react';

interface ConferenceHeaderProps {
    conference: TechnicalConferenceDetailResponse | ResearchConferenceDetailResponse;
    isFavorite: boolean;
    setIsFavorite: (favorite: boolean) => void;
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
    selectedTicket: ConferencePriceResponse | null;
    setSelectedTicket: (ticket: ConferencePriceResponse | null) => void;
    paymentLoading: boolean;
    handlePurchaseTicket: () => void;
    accessToken: string | null;
    formatDate: (dateString?: string) => string;
    authorInfo: { title: string; description: string };
    setAuthorInfo: (info: { title: string; description: string }) => void;
    showAuthorForm: boolean;
    setShowAuthorForm: (show: boolean) => void;
}

const ConferenceHeader: React.FC<ConferenceHeaderProps> = ({
    conference,
    isFavorite,
    setIsFavorite,
    isDialogOpen,
    setIsDialogOpen,
    selectedTicket,
    setSelectedTicket,
    paymentLoading,
    handlePurchaseTicket,
    accessToken,
    formatDate,
    authorInfo,
    setAuthorInfo,
    showAuthorForm,
    setShowAuthorForm,
}) => {
    const titleRef = React.useRef<HTMLInputElement>(null);
    const descriptionRef = React.useRef<HTMLTextAreaElement>(null);

    return (
        <>
            <div className="relative max-w-6xl mx-auto px-4 py-8 md:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-32 md:mt-48">
                    {/* Title Card */}
                    <div className="lg:col-span-2 bg-white/30 backdrop-blur-md rounded-2xl shadow-lg p-6 md:p-8 text-white">
                        <div className="flex items-start gap-3 mb-4">
                            <h1 className="text-2xl md:text-3xl font-bold flex-1
               bg-gradient-to-r from-black to-blue-950
               bg-clip-text text-transparent drop-shadow-lg">
                                {conference.conferenceName}
                            </h1>
                            <button
                                onClick={() => setIsFavorite(!isFavorite)}
                                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
                                title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                            >
                                <Star
                                    className={`w-6 h-6 transition-colors ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-white"}`}
                                />
                            </button>
                            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                                {conference.isResearchConference ? 'Nghiên cứu' : 'Công nghệ'}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-white" />
                                <span>{formatDate(conference.startDate)}</span>
                            </div>
                            <div className="flex items-start gap-2 md:col-span-2">
                                <MapPin className="w-5 h-5 text-white" />
                                <span>{conference.address}</span>
                            </div>
                            {conference.totalSlot && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">Sức chứa: {conference.totalSlot} người</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Subscribe Card */}
                    <div className="bg-white/30 backdrop-blur-md rounded-2xl shadow-lg p-6 text-white">
                        <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-black to-blue-950
    bg-clip-text text-transparent drop-shadow-lg">Đăng ký ngay</h3>
                        <p className="text-white text-sm mb-4">
                            Nhấn để chọn khung giá vé và thanh toán
                        </p>
                        <button
                            onClick={() => setIsDialogOpen(true)}
                            className="w-full bg-black hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            Mở chọn vé
                        </button>
                    </div>

                    {/* Ticket Selection Dialog */}
                    <Dialog
                        open={isDialogOpen}
                        as="div"
                        className="relative z-50 focus:outline-none"
                        onClose={setIsDialogOpen}
                    >
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
                        <div className="fixed inset-0 flex items-center justify-center p-4">
                            <DialogPanel
                                transition
                                className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-2xl p-6
            text-white duration-300 ease-out data-[closed]:opacity-0 data-[closed]:scale-95
             max-h-[85vh] flex flex-col"
                            >
                                <DialogTitle as="h3" className="text-lg font-semibold mb-4">
                                    Chọn loại vé
                                </DialogTitle>

                                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1"
                                    style={{
                                        scrollbarWidth: "thin",
                                        scrollbarColor: "rgba(255,255,255,0.2) transparent",
                                        scrollBehavior: "smooth",
                                    }}>
                                    {(conference.conferencePrices || []).map((ticket) => {
                                        const currentPrice = getCurrentPrice(ticket);

                                        const now = new Date();
                                        const currentPhase = ticket.pricePhases?.find((phase) => {
                                            const startDate = new Date(phase.startDate || "");
                                            const endDate = new Date(phase.endDate || "");
                                            return now >= startDate && now <= endDate;
                                        });

                                        const hasDiscount =
                                            currentPrice < (ticket.ticketPrice ?? 0) &&
                                            currentPhase?.applyPercent !== undefined;

                                        return (
                                            <label
                                                key={ticket.conferencePriceId}
                                                className={`block rounded-xl p-4 border cursor-pointer transition-all ${selectedTicket?.conferencePriceId === ticket.conferencePriceId
                                                    ? "bg-coral-500/30 border-coral-400"
                                                    : "bg-white/10 border-white/20 hover:bg-white/20"
                                                    }`}
                                                onClick={() => {
                                                    setSelectedTicket(ticket);
                                                    if (ticket.isAuthor) {
                                                        setShowAuthorForm(true);
                                                    } else {
                                                        setShowAuthorForm(false);
                                                    }
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name="ticket"
                                                    value={ticket.conferencePriceId}
                                                    className="hidden"
                                                // onChange={() => setSelectedTicket(ticket)}
                                                />

                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-lg">{ticket.ticketName}</span>
                                                        {ticket.isAuthor && (
                                                            <span className="text-xs text-yellow-300 font-medium mt-0.5">
                                                                Vé dành cho tác giả
                                                            </span>
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
                                                        <p>
                                                            <span className="font-medium text-coral-200">Giai đoạn vé hiện tại:</span>{" "}
                                                            {currentPhase.phaseName || "Không xác định"}{" "}
                                                            {currentPhase.applyPercent !== undefined && (
                                                                <p
                                                                    className={`text-sm font-medium ${currentPhase.applyPercent > 100 ? "text-red-500" : currentPhase.applyPercent < 100 ? "text-green-500" : "text-gray-400"
                                                                        }`}
                                                                >
                                                                    {currentPhase.applyPercent > 100
                                                                        ? `+${currentPhase.applyPercent - 100}%`
                                                                        : currentPhase.applyPercent < 100
                                                                            ? `-${100 - currentPhase.applyPercent}%`
                                                                            : "±0%"}
                                                                </p>
                                                            )}
                                                            {/* {currentPhase.applyPercent && (
                                                                <span className="text-white/70">
                                                                    ({currentPhase.applyPercent}%)
                                                                </span>
                                                            )} */}
                                                        </p>
                                                    )}

                                                    <p>
                                                        <span className="font-medium text-coral-200">Số lượng:</span>{" "}
                                                        {ticket.availableSlot} / {ticket.totalSlot}
                                                    </p>

                                                    {currentPhase?.startDate && (
                                                        <p className="text-white/70">
                                                            <span className="font-medium">Hiệu lực:</span>{" "}
                                                            {formatDate(currentPhase.startDate)} →{" "}
                                                            {formatDate(currentPhase.endDate)}
                                                        </p>
                                                    )}
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>

                                {selectedTicket?.isAuthor && (
                                    <div className="mt-4 flex-shrink-0">
                                        <button
                                            onClick={() => setShowAuthorForm(!showAuthorForm)}
                                            className="w-full flex items-center justify-between p-3 rounded-lg 
                           bg-gradient-to-r from-yellow-500/20 to-orange-500/20 
                           border border-yellow-400/40 hover:border-yellow-400/60 transition-all"
                                        >
                                            <div className="flex items-center gap-2">
                                                <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-sm font-medium text-yellow-300">
                                                    Thông tin bài báo {authorInfo.title && authorInfo.description && '✓'}
                                                </span>
                                            </div>
                                            <svg
                                                className={`w-5 h-5 text-yellow-300 transition-transform ${showAuthorForm ? 'rotate-180' : ''}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {/* Form content với animation */}
                                        <div
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${showAuthorForm ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
                                                }`}
                                        >
                                            <div className="space-y-3 p-3 bg-black/20 rounded-lg border border-yellow-400/20">
                                                <p className="text-xs text-yellow-200/80 leading-relaxed">
                                                    💡 Viết tiêu đề và mô tả bài báo. Có thể chỉnh sửa sau tại <strong>"Bài báo của tôi"</strong>
                                                </p>

                                                <div>
                                                    <label className="block text-xs font-medium mb-1.5 text-white/90">
                                                        Tiêu đề <span className="text-red-400">*</span>
                                                    </label>
                                                    <input
                                                        ref={titleRef}
                                                        type="text"
                                                        value={authorInfo.title}
                                                        onChange={(e) => setAuthorInfo({ ...authorInfo, title: e.target.value })}
                                                        placeholder="Nhập tiêu đề bài báo..."
                                                        className="w-full px-3 py-2 text-sm rounded-lg bg-white/10 border border-white/30 
                                     text-white placeholder-white/40 focus:outline-none focus:border-yellow-400
                                     focus:ring-1 focus:ring-yellow-400/30"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium mb-1.5 text-white/90">
                                                        Mô tả <span className="text-red-400">*</span>
                                                    </label>
                                                    <textarea
                                                        ref={descriptionRef}
                                                        value={authorInfo.description}
                                                        onChange={(e) => setAuthorInfo({ ...authorInfo, description: e.target.value })}
                                                        placeholder="Nhập mô tả ngắn gọn..."
                                                        rows={3}
                                                        className="w-full px-3 py-2 text-sm rounded-lg bg-white/10 border border-white/30 
                                     text-white placeholder-white/40 focus:outline-none focus:border-yellow-400
                                     focus:ring-1 focus:ring-yellow-400/30 resize-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 flex justify-end gap-3 flex-shrink-0 pt-4 border-t border-white/10">
                                    <button
                                        onClick={() => setIsDialogOpen(false)}
                                        className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition text-sm font-medium"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handlePurchaseTicket}
                                        disabled={!selectedTicket || paymentLoading ||
                                            (selectedTicket?.isAuthor && (!authorInfo.title.trim() || !authorInfo.description.trim()))}
                                        className="px-5 py-2 rounded-lg bg-coral-500 hover:bg-coral-600 
                     disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                                    >
                                        {paymentLoading ? (
                                            <div className="flex items-center gap-2">
                                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"></path>
                                                </svg>
                                                <span>Đang xử lý...</span>
                                            </div>
                                        ) : accessToken ? (
                                            "Thanh toán"
                                        ) : (
                                            "Đăng nhập"
                                        )}
                                    </button>
                                </div>

                                {/* <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={() => setIsDialogOpen(false)}
                                        className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handlePurchaseTicket}
                                        disabled={!selectedTicket || paymentLoading}
                                        className="px-5 py-2 rounded-lg bg-coral-500 hover:bg-coral-600 disabled:opacity-50 transition"
                                    >
                                        {paymentLoading ? (
                                            <div className="flex items-center gap-2">
                                                <svg
                                                    className="animate-spin h-5 w-5 text-white"
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
                                        ) : accessToken ? (
                                            "Thanh toán"
                                        ) : (
                                            "Đăng nhập để thanh toán"
                                        )}
                                    </button>
                                </div> */}
                            </DialogPanel>
                        </div>
                    </Dialog>
                    {/* <Dialog
                        open={isDialogOpen}
                        as="div"
                        className="relative z-50 focus:outline-none"
                        onClose={setIsDialogOpen}
                    >
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
                        <div className="fixed inset-0 flex items-center justify-center p-4">
                            <DialogPanel
                                transition
                                className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-2xl p-6
        text-white duration-300 ease-out data-[closed]:opacity-0 data-[closed]:scale-95"
                            >
                                <DialogTitle as="h3" className="text-lg font-semibold mb-4">
                                    Chọn loại vé
                                </DialogTitle>
                                <div className="space-y-3">
                                    {(conference.conferencePrices || []).map((ticket) => (
                                        <label
                                            key={ticket.conferencePriceId}
                                            className={`block rounded-xl p-4 border cursor-pointer transition-all ${selectedTicket?.conferencePriceId === ticket.conferencePriceId
                                                ? "bg-coral-500/30 border-coral-400"
                                                : "bg-white/10 border-white/20 hover:bg-white/20"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="ticket"
                                                value={ticket.conferencePriceId}
                                                className="hidden"
                                                onChange={() => setSelectedTicket(ticket)}
                                            />
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold">{ticket.ticketName}</span>
                                                <span className="text-coral-300 font-medium">
                                                    {(ticket.ticketPrice || 0).toLocaleString("vi-VN")}₫
                                                </span>
                                            </div>
                                            <p className="text-sm text-white/70 mt-1">{ticket.ticketDescription}</p>
                                        </label>
                                    ))}
                                </div>
                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={() => setIsDialogOpen(false)}
                                        className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handlePurchaseTickt}
                                        disabled={!selectedTicket || paymentLoading}
                                        className="px-5 py-2 rounded-lg bg-coral-500 hover:bg-coral-600 disabled:opacity-50 transition"
                                    >
                                        {paymentLoading ? (
                                            <div className="flex items-center gap-2">
                                                <svg
                                                    className="animate-spin h-5 w-5 text-white"
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
                                        ) : accessToken ? (
                                            "Thanh toán"
                                        ) : (
                                            "Đăng nhập để thanh toán"
                                        )
                                        }
                                    </button>
                                </div>
                            </DialogPanel>
                        </div>
                    </Dialog> */}
                </div>

                {/* Description Card */}
                <div className="mt-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg p-6 md:p-8 text-white">
                    <p className="text-white leading-relaxed mb-3">{conference.description}</p>
                    {conference.policies && conference.policies.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-semibold mb-2">Chính sách:</h4>
                            <div className="space-y-2">
                                {conference.policies.map((policy) => (
                                    <div key={policy.policyId} className="text-sm">
                                        <span className="font-medium">{policy.policyName}:</span> {policy.description}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ConferenceHeader;