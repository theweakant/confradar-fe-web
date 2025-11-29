// TicketSelectionDialog.tsx
import React from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import {
    ConferencePriceResponse,
    ResearchConferenceDetailResponse,
    TechnicalConferenceDetailResponse,
} from "@/types/conference.type";
import { getCurrentPrice } from "@/helper/conference";

import TicketOption from "./TicketOption";
import AuthorFormSection from "./AuthorFormSection";
import PaymentMethodSelector from "./PaymentMethodSelector";
import WaitlistSection from "./WaitlistSection";
import { PaymentMethod } from "@/types/transaction.type";

interface TicketSelectionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    conference: TechnicalConferenceDetailResponse | ResearchConferenceDetailResponse;
    formatDate: (dateString?: string) => string;
    selectedTicket: ConferencePriceResponse | null;
    onSelectTicket: (ticket: ConferencePriceResponse | null) => void;
    authorInfo: { title: string; description: string };
    onAuthorInfoChange: (info: { title: string; description: string }) => void;
    showAuthorForm: boolean;
    onToggleAuthorForm: (show: boolean) => void;
    selectedPaymentMethod: string | null;
    onSelectPaymentMethod: (id: string | null) => void;
    showPaymentMethods: boolean;
    onTogglePaymentMethods: (show: boolean) => void;
    paymentMethods: PaymentMethod[];
    paymentMethodsLoading: boolean;
    paymentLoading: boolean;
    onPurchase: () => void;
    onAddToWaitlist: (conferenceId?: string) => void;
    addingToWaitListLoading: boolean;
    accessToken: string | null;
}

const TicketSelectionDialog: React.FC<TicketSelectionDialogProps> = ({
    isOpen,
    onClose,
    conference,
    formatDate,
    selectedTicket,
    onSelectTicket,
    authorInfo,
    onAuthorInfoChange,
    showAuthorForm,
    onToggleAuthorForm,
    selectedPaymentMethod,
    onSelectPaymentMethod,
    showPaymentMethods,
    onTogglePaymentMethods,
    paymentMethods,
    paymentMethodsLoading,
    paymentLoading,
    onPurchase,
    onAddToWaitlist,
    addingToWaitListLoading,
    accessToken,
}) => {
    const isResearch = conference.isResearchConference;

    const [activeTab, setActiveTab] = React.useState<'author' | 'listener'>('author');

    const [isAuthorFormDialogOpen, setIsAuthorFormDialogOpen] = React.useState(false);

    const getFilteredTickets = () => {
        if (!isResearch) {
            return conference.conferencePrices || [];
        }

        return (conference.conferencePrices || []).filter(ticket =>
            activeTab === 'author' ? ticket.isAuthor : !ticket.isAuthor
        );
    };


    const checkAllAuthorTicketsSoldOut = () => {
        const authorTickets = (conference.conferencePrices || []).filter((ticket) => ticket.isAuthor);
        return (
            authorTickets.length > 0 &&
            authorTickets.every((ticket) => {
                const now = new Date();
                const currentPhase = ticket.pricePhases?.find((phase) => {
                    const startDate = new Date(phase.startDate || "");
                    const endDate = new Date(phase.endDate || "");
                    return now >= startDate && now <= endDate;
                });

                const futurePhases = ticket.pricePhases?.filter((phase) => {
                    const startDate = new Date(phase.startDate || "");
                    return startDate > now;
                });

                const currentPhaseAvailable = (currentPhase?.availableSlot ?? 0) > 0;
                const futurePhaseAvailable = futurePhases?.some((phase) => (phase.availableSlot ?? 0) > 0);

                return !currentPhaseAvailable && !futurePhaseAvailable;
            })
        );
    };

    const handleTicketSelect = (ticket: ConferencePriceResponse, isDisabled: boolean) => {
        if (!isDisabled) {
            onSelectTicket(ticket);
            if (ticket.isAuthor) {
                onToggleAuthorForm(true);
            } else {
                onToggleAuthorForm(false);
            }
        }
    };

    React.useEffect(() => {
        if (isResearch && selectedTicket) {
            const isCurrentTicketInTab = activeTab === 'author'
                ? selectedTicket.isAuthor
                : !selectedTicket.isAuthor;

            if (!isCurrentTicketInTab) {
                onSelectTicket(null);
                onToggleAuthorForm(false);
            }
        }
    }, [activeTab, isResearch]);

    return (
        <Dialog open={isOpen} as="div" className="relative z-50 focus:outline-none" onClose={onClose}>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel
                    transition
                    className="w-full max-w-xl rounded-2xl bg-white/10 backdrop-blur-2xl p-6 text-white duration-300 ease-out data-[closed]:opacity-0 data-[closed]:scale-95 max-h-[95vh] flex flex-col"
                >
                    <DialogTitle as="h3" className="text-lg font-semibold mb-4">
                        {isResearch ? "Chọn hình thức tham dự" : "Chọn loại vé"}
                    </DialogTitle>

                    <>
                        {/* Tab Headers - chỉ hiển thị khi là Research Conference */}
                        {isResearch && (
                            <div className="flex gap-2 mb-4 p-1 bg-white/5 rounded-lg">
                                <button
                                    onClick={() => setActiveTab('author')}
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'author'
                                        ? 'bg-coral-500 text-white shadow-md'
                                        : 'text-white/70 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    Tác giả
                                </button>
                                <button
                                    onClick={() => setActiveTab('listener')}
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'listener'
                                        ? 'bg-coral-500 text-white shadow-md'
                                        : 'text-white/70 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    Thính giả
                                </button>
                            </div>
                        )}

                        {isResearch && activeTab === 'author' && (
                            <div className="col-span-full my-2 bg-white/10 rounded-lg p-3 border border-white/20">
                                <p className="text-white/80 text-sm italic">
                                    💡 <b>Lưu ý:</b> Khi nộp bài báo (với tư cách tác giả), bạn sẽ thanh toán toàn bộ phí đăng ký ngay tại thời điểm nộp.
                                    Nếu bài báo bị từ chối, hệ thống sẽ hoàn lại <b>số tiền đã thanh toán, nhưng đã trừ đi khoản phí đánh giá bài báo</b> tương ứng với hội nghị này.
                                </p>
                            </div>
                        )}

                        {/* Tickets List */}
                        <div
                            className="space-y-3 max-h-[70vh] overflow-y-auto pr-1"
                            style={{
                                scrollbarWidth: "thin",
                                scrollbarColor: "rgba(255,255,255,0.2) transparent",
                                scrollBehavior: "smooth",
                            }}
                        >
                            {isResearch && activeTab === 'listener' && !(conference as ResearchConferenceDetailResponse).allowListener ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <div className="w-16 h-16 mb-4 rounded-full bg-orange-500/20 flex items-center justify-center">
                                        <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <p className="text-white/90 font-medium text-center mb-1">
                                        Hội nghị này không cho phép người nghe tham dự
                                    </p>
                                    <p className="text-white/60 text-sm text-center">
                                        Vui lòng chọn tab &quot;Tác giả&quot; để xem các gói phí tham dự
                                    </p>
                                </div>
                            ) : getFilteredTickets().length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <div className="w-16 h-16 mb-4 rounded-full bg-gray-500/20 flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                    </div>
                                    <p className="text-white/90 font-medium text-center mb-1">
                                        Chưa có vé nào
                                    </p>
                                    <p className="text-white/60 text-sm text-center">
                                        {isResearch
                                            ? `Chưa có gói phí cho ${activeTab === 'author' ? 'tác giả' : 'thính giả'}`
                                            : 'Chưa có loại vé nào được mở bán'
                                        }
                                    </p>
                                </div>
                            ) : (
                                getFilteredTickets().map((ticket) => (
                                    <TicketOption
                                        key={ticket.conferencePriceId}
                                        ticket={ticket}
                                        conference={conference}
                                        formatDate={formatDate}
                                        isSelected={selectedTicket?.conferencePriceId === ticket.conferencePriceId}
                                        onSelect={handleTicketSelect}
                                        isResearch={isResearch}
                                    />
                                ))
                            )}
                        </div>
                    </>

                    {/* <div
                        className="space-y-3 max-h-[70vh] overflow-y-auto pr-1"
                        style={{
                            scrollbarWidth: "thin",
                            scrollbarColor: "rgba(255,255,255,0.2) transparent",
                            scrollBehavior: "smooth",
                        }}
                    >
                        {(conference.conferencePrices || []).map((ticket) => (
                            <TicketOption
                                key={ticket.conferencePriceId}
                                ticket={ticket}
                                conference={conference}
                                formatDate={formatDate}
                                isSelected={selectedTicket?.conferencePriceId === ticket.conferencePriceId}
                                onSelect={handleTicketSelect}
                                isResearch={isResearch}
                            />
                        ))}
                    </div> */}

                    <WaitlistSection
                        allAuthorTicketsSoldOut={checkAllAuthorTicketsSoldOut()}
                        conferenceId={conference.conferenceId}
                        onAddToWaitlist={onAddToWaitlist}
                        loading={addingToWaitListLoading}
                    />

                    {selectedTicket && (
                        <div className="mt-4 flex-shrink-0 space-y-4">

                            {/* Author form luôn full width */}
                            <div className="w-full">
                                <AuthorFormSection
                                    isAuthorTicket={selectedTicket.isAuthor}
                                    showForm={showAuthorForm}
                                    onToggleForm={() => onToggleAuthorForm(!showAuthorForm)}
                                    authorInfo={authorInfo}
                                    onAuthorInfoChange={onAuthorInfoChange}
                                    isDialogOpen={isAuthorFormDialogOpen}
                                    onOpenDialog={() => setIsAuthorFormDialogOpen(true)}
                                    onCloseDialog={() => setIsAuthorFormDialogOpen(false)}
                                />
                            </div>

                            {/* Payment section để riêng bên dưới hoặc bên phải nếu desktop */}
                            {/* <div className="w-full md:w-auto">
                                <PaymentMethodSelector
                                    selectedPaymentMethod={selectedPaymentMethod}
                                    onSelectPaymentMethod={onSelectPaymentMethod}
                                    showPaymentMethods={showPaymentMethods}
                                    onTogglePaymentMethods={onTogglePaymentMethods}
                                    paymentMethods={paymentMethods}
                                    paymentMethodsLoading={paymentMethodsLoading}
                                    isAuthorTicket={selectedTicket.isAuthor}
                                />
                            </div> */}

                        </div>
                    )}

                    {/* {selectedTicket && (
                        <div className="mt-4 flex-shrink-0">
                            <div className="flex gap-2">
                                <AuthorFormSection
                                    isAuthorTicket={selectedTicket.isAuthor}
                                    showForm={showAuthorForm}
                                    onToggleForm={() => onToggleAuthorForm(!showAuthorForm)}
                                    authorInfo={authorInfo}
                                    onAuthorInfoChange={onAuthorInfoChange}
                                />

                                <PaymentMethodSelector
                                    selectedPaymentMethod={selectedPaymentMethod}
                                    onSelectPaymentMethod={onSelectPaymentMethod}
                                    showPaymentMethods={showPaymentMethods}
                                    onTogglePaymentMethods={onTogglePaymentMethods}
                                    paymentMethods={paymentMethods}
                                    paymentMethodsLoading={paymentMethodsLoading}
                                    isAuthorTicket={selectedTicket.isAuthor}
                                />
                            </div>
                        </div>
                    )} */}

                    <div className="mt-4 flex justify-end gap-3 flex-shrink-0 pt-4 border-t border-white/10">
                        <div className="w-full flex items-center justify-between gap-3">
                            {selectedTicket && (
                                <div className="w-1/2">
                                    <PaymentMethodSelector
                                        selectedPaymentMethod={selectedPaymentMethod}
                                        onSelectPaymentMethod={onSelectPaymentMethod}
                                        showPaymentMethods={showPaymentMethods}
                                        onTogglePaymentMethods={onTogglePaymentMethods}
                                        paymentMethods={paymentMethods}
                                        paymentMethodsLoading={paymentMethodsLoading}
                                        isAuthorTicket={selectedTicket.isAuthor}
                                    />
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition text-sm font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={onPurchase}
                                    disabled={
                                        !selectedTicket ||
                                        paymentLoading ||
                                        !selectedPaymentMethod ||
                                        (selectedTicket?.isAuthor && (!authorInfo.title.trim() || !authorInfo.description.trim()))
                                    }
                                    className="px-5 py-2 rounded-lg bg-coral-500 hover:bg-coral-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
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
                                        isResearch ? "Đăng ký" : "Thanh toán"
                                    ) : (
                                        "Đăng nhập"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default TicketSelectionDialog;