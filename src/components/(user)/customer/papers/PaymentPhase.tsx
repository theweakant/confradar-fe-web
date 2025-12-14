import React, { useState, useEffect, useMemo } from "react";
import { useGetConferenceStepPricesQuery } from "@/redux/services/conferenceStep.service";
import { useTransaction } from "@/redux/hooks/useTransaction";
import { ConferencePriceResponse, ConferencePricePhaseResponse, ResearchConferencePhaseResponse } from "@/types/conference.type";
import { ResearchPhaseDtoDetail } from "@/types/paper.type";
import { validatePhaseTime } from "@/helper/timeValidation";
import { useGlobalTime } from "@/utils/TimeContext";
import { toast } from "sonner";
import { useConference } from "@/redux/hooks/useConference";
import { usePaperCustomer } from "@/redux/hooks/usePaper";
import { useRouter } from "next/navigation";
import { RootState } from "@/redux/store";
import { useAppSelector } from "@/redux/hooks/hooks";

interface PaymentPhaseProps {
    paperId?: string;
    conferenceId?: string;
    researchPhase?: ResearchPhaseDtoDetail;
    onPaymentSuccess?: () => void;
}

interface NextPhaseInfo {
    phase: ResearchConferencePhaseResponse;
    isAvailable: boolean;
    hasAvailableSlots: boolean;
}


const PaymentPhase: React.FC<PaymentPhaseProps> = ({
    paperId,
    conferenceId,
    researchPhase,
    onPaymentSuccess,
}) => {
    const { now } = useGlobalTime();
    const [selectedPrice, setSelectedPrice] = useState<ConferencePriceResponse | null>(null);
    const [selectedPhase, setSelectedPhase] = useState<ConferencePricePhaseResponse | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Fetch prices
    // const {
    //     data: pricesResponse,
    //     isLoading: pricesLoading,
    //     error: pricesError,
    // } = useGetConferenceStepPricesQuery(conferenceId || "", {
    //     skip: !conferenceId,
    // });

    const router = useRouter();
    const { accessToken } = useAppSelector((state: RootState) => state.auth);

    const {
        researchConference,
        researchConferenceLoading,
        researchConferenceError,
        refetchResearchConference,
    } = useConference({ id: conferenceId });

    const { paymentMethods, loading: paymentMethodsLoading, fetchAllPaymentMethods } = useTransaction();
    const {
        purchaseResearchPaper,
        loading: purchaseLoading,
        researchPaymentError,
    } = useTransaction();
    const { handleAddToWaitList, addingToWaitListLoading } = usePaperCustomer();

    const pricesResponse = researchConference?.conferencePrices;

    const priceNotSelected = !selectedPrice || !selectedPhase;
    const paymentNotSelected = !selectedPaymentMethod;

    const originalPrice = selectedPrice?.ticketPrice ?? 0;
    const applyPercent = selectedPhase?.applyPercent ?? 100;

    const finalPrice = Math.round(originalPrice * (applyPercent / 100));

    useEffect(() => {
        if (researchPaymentError) {
            toast.error(researchPaymentError.data?.message);
        }
    }, [researchPaymentError]);

    useEffect(() => {
        fetchAllPaymentMethods();
    }, [fetchAllPaymentMethods]);

    // Validate phase timing
    const phaseValidation = validatePhaseTime(
        researchPhase?.authorPaymentStart,
        researchPhase?.authorPaymentEnd,
        now
    );

    // Filter author prices only
    const authorPrices = useMemo(() => {
        if (!pricesResponse) return [];
        return Array.isArray(pricesResponse)
            ? pricesResponse.filter((price) => price.isAuthor === true)
            : [];
    }, [pricesResponse]);

    const getNextAvailablePhase = (): NextPhaseInfo | null => {
        if (!researchConference?.researchPhase || !researchPhase?.researchConferencePhaseId) {
            return null;
        }

        const allPhases = researchConference.researchPhase;

        // Tìm phase hiện tại trong list
        const currentPhaseIndex = allPhases.findIndex(
            (p) => p.researchConferencePhaseId === researchPhase.researchConferencePhaseId
        );

        if (currentPhaseIndex === -1) return null;

        // Lấy các phase sau phase hiện tại, đã sort theo phaseOrder
        const nextPhases = allPhases
            .slice(currentPhaseIndex + 1)
            .sort((a, b) => (a.phaseOrder || 0) - (b.phaseOrder || 0));

        // Tìm phase đầu tiên đang active
        const nextActivePhase = nextPhases.find((phase) => phase.isActive);

        if (!nextActivePhase) return null;

        // Check xem phase đó có vé available không
        const hasAvailableSlots = authorPrices.some((price) => {
            return price.pricePhases?.some((pricePhase) => {
                return (pricePhase.availableSlot ?? 0) > 0;
            });
        });

        return {
            phase: nextActivePhase,
            isAvailable: true,
            hasAvailableSlots,
        };
    };

    const nextPhaseInfo = getNextAvailablePhase();

    const getPurchasedTicketInfo = () => {
        if (!researchConference?.purchasedInfo?.conferencePriceId) return null;

        const purchasedTicket = researchConference.conferencePrices?.find(
            (price) => price.conferencePriceId === researchConference.purchasedInfo?.conferencePriceId
        );

        if (!purchasedTicket) return null;

        const purchasedPhase = purchasedTicket.pricePhases?.find(
            (phase) => phase.pricePhaseId === researchConference.purchasedInfo?.pricePhaseId
        );

        return { ticket: purchasedTicket, phase: purchasedPhase };
    };

    const purchasedTicketInfo = getPurchasedTicketInfo();

    const checkAllAuthorTicketsSoldOut = () => {
        const authorTickets = authorPrices;
        if (nextPhaseInfo?.isAvailable && nextPhaseInfo?.hasAvailableSlots) {
            return (
                authorTickets.length > 0 &&
                authorTickets.every((ticket) => {
                    // Chỉ check xem có phase nào còn slot không
                    const hasAnyAvailableSlot = ticket.pricePhases?.some((phase) => {
                        return (phase.availableSlot ?? 0) > 0;
                    });

                    return !hasAnyAvailableSlot;
                })
            );
        }
        return (
            authorTickets.length > 0 &&
            authorTickets.every((ticket) => {
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

    const handleAddToWaitlist = async () => {
        if (!conferenceId) {
            toast.error("Vui lòng đăng nhập để sử dụng tính năng này");
            return;
        }

        try {
            await handleAddToWaitList(conferenceId);
            toast.success("Đã thêm vào danh sách chờ thành công!");
        } catch (error) {
            toast.error("Có lỗi xảy ra, vui lòng thử lại");
            console.error("Add to waitlist error:", error);
        }
    };

    // Get current and available phases for a price
    const getPricePhaseInfo = (price: ConferencePriceResponse) => {
        if (!price.pricePhases || price.pricePhases.length === 0) {
            return { currentPhase: null, futurePhases: [], hasAvailableSlots: false };
        }

        if (nextPhaseInfo?.isAvailable && nextPhaseInfo?.hasAvailableSlots) {
            const currentPhase = price.pricePhases.find((phase) => {
                return (phase.availableSlot ?? 0) > 0;
            });

            const futurePhases = price.pricePhases
                .filter((phase) => (phase.availableSlot ?? 0) > 0)
                .sort((a, b) => new Date(a.startDate || "").getTime() - new Date(b.startDate || "").getTime());

            const hasAvailableSlots = (currentPhase?.availableSlot ?? 0) > 0 ||
                futurePhases.some((phase) => (phase.availableSlot ?? 0) > 0);

            return { currentPhase, futurePhases, hasAvailableSlots };
        }

        const currentPhase = price.pricePhases.find((phase) => {
            const start = new Date(phase.startDate || "");
            const end = new Date(phase.endDate || "");
            return now >= start && now <= end && (phase.availableSlot ?? 0) > 0;
        });

        const futurePhases = price.pricePhases
            .filter((phase) => new Date(phase.startDate || "") > now)
            .sort((a, b) => new Date(a.startDate || "").getTime() - new Date(b.startDate || "").getTime());

        const hasAvailableSlots = (currentPhase?.availableSlot ?? 0) > 0 ||
            futurePhases.some((phase) => (phase.availableSlot ?? 0) > 0);

        return { currentPhase, futurePhases, hasAvailableSlots };
    };

    // Calculate final price
    const calculateFinalPrice = (basePrice: number, applyPercent?: number) => {
        if (!applyPercent) return basePrice;
        return basePrice * (1 - applyPercent / 100);
    };

    const handlePriceSelect = (price: ConferencePriceResponse) => {
        const phaseInfo = getPricePhaseInfo(price);
        if (phaseInfo.currentPhase) {
            setSelectedPrice(price);
            setSelectedPhase(phaseInfo.currentPhase);
        }
    };

    const handlePayment = async () => {
        if (!accessToken) {
            toast.error("Vui lòng đăng nhập để thanh toán");
            router.push("/auth/login");
            return;
        }

        if (!selectedPrice || !selectedPhase || !selectedPaymentMethod || !paperId) {
            toast.error("Vui lòng chọn đầy đủ thông tin thanh toán");
            return;
        }

        setIsProcessing(true);
        try {
            const response = await purchaseResearchPaper({
                conferencePriceId: selectedPrice.conferencePriceId,
                paperId: paperId,
                paymentMethodId: selectedPaymentMethod,
            });

            if (response?.data.checkOutUrl) {
                window.location.href = response.data.checkOutUrl;
            } else {
                toast.error("Không nhận được đường dẫn thanh toán");
            }
        } catch (error) {
            // toast.error("Có lỗi xảy ra khi thanh toán");
            console.error("Payment error:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString("vi-VN") + "₫";
    };

    if (researchConferenceLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const formatDateRange = (start?: string, end?: string) => {
        if (!start || !end) return "";
        const s = new Date(start).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
        const e = new Date(end).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
        return `${s} → ${e}`;
    };


    if (researchConferenceError) {
        return (
            <div className="bg-red-50 border border-red-300 rounded-xl p-6">
                <h3 className="text-red-700 font-semibold mb-2">Lỗi tải dữ liệu</h3>
                <p className="text-red-600 text-sm">Không thể tải danh sách gói thanh toán</p>
            </div>
        );
    }


    // Sau phần check error và trước phần check authorPrices.length === 0
    if (purchasedTicketInfo) {
        return (
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Giai đoạn Thanh toán</h2>

                    <div className="space-y-4">
                        {/* Success Card */}
                        <div className="p-6 rounded-xl bg-green-50 border border-green-200">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                                        Bạn đã thanh toán thành công!
                                    </h3>
                                    <div className="space-y-2 text-sm text-green-700">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Gói đăng ký:</span>
                                            <span>{purchasedTicketInfo.ticket.ticketName}</span>
                                        </div>
                                        {purchasedTicketInfo.phase && (
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Giai đoạn:</span>
                                                <span>{purchasedTicketInfo.phase.phaseName}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Số tiền đã thanh toán:</span>
                                            <span className="text-lg font-bold">
                                                {(purchasedTicketInfo.ticket.ticketPrice || 0).toLocaleString("vi-VN")}₫
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Disabled Button */}
                        <button
                            disabled
                            className="w-full py-3 px-4 bg-gray-300 text-gray-500 rounded-xl font-semibold cursor-not-allowed opacity-60"
                        >
                            Đã hoàn tất thanh toán
                        </button>

                        {/* Info Text */}
                        <p className="text-sm text-gray-500 text-center">
                            Bạn có thể xem chi tiết giao dịch trong phần &quot;Lịch sử giao dịch&quot;
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!phaseValidation.isAvailable) {
        // Nếu đã quá hạn thanh toán của phase hiện tại
        if (phaseValidation.isExpired) {
            // Kiểm tra xem có phase tiếp theo available không
            if (nextPhaseInfo && nextPhaseInfo.isAvailable && nextPhaseInfo.hasAvailableSlots) {
                // KHÔNG return ở đây, mà để code tiếp tục chạy xuống dưới
                // Chỉ cần set một flag để hiển thị warning message
            } else if (nextPhaseInfo && nextPhaseInfo.isAvailable && !nextPhaseInfo.hasAvailableSlots) {
                // Hết slot - return message
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Giai đoạn Thanh toán</h3>

                        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6">
                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <p className="text-sm text-yellow-700 font-medium mb-1">
                                        Đã hết thời hạn thanh toán cho giai đoạn hiện tại
                                    </p>
                                    <p className="text-sm text-yellow-600">
                                        {phaseValidation.message}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-red-50 border border-red-300 rounded-xl p-6">
                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <p className="text-sm text-red-700 font-medium mb-1">
                                        Đã hết chỗ cho giai đoạn tiếp theo
                                    </p>
                                    <p className="text-sm text-red-600">
                                        Tất cả các chỗ cho giai đoạn tiếp theo đã hết
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            } else {
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Giai đoạn Thanh toán</h3>
                        <div className="bg-red-50 border border-red-300 rounded-xl p-6">
                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <p className="text-sm text-red-700 font-medium mb-1">
                                        Đã hết thời hạn thanh toán
                                    </p>
                                    <p className="text-sm text-red-600">
                                        {phaseValidation.message}
                                    </p>
                                    {phaseValidation.formattedPeriod && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            <strong>Thời gian:</strong> {phaseValidation.formattedPeriod}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
        } else {
            // Chưa tới thời gian thanh toán
            return (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Giai đoạn Thanh toán</h3>
                    <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6">
                        <p className="text-sm text-yellow-700">
                            {phaseValidation.message}
                        </p>
                        {phaseValidation.formattedPeriod && (
                            <p className="text-sm text-gray-600 mt-2">
                                <strong>Thời gian:</strong> {phaseValidation.formattedPeriod}
                            </p>
                        )}
                    </div>
                </div>
            );
        }
    }

    if (authorPrices.length === 0) {
        return (
            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Giai đoạn Thanh toán</h3>
                <div className="bg-gray-50 border border-gray-300 rounded-xl p-6 text-center">
                    <p className="text-gray-600">Chưa có gói thanh toán nào được mở bán</p>
                </div>
            </div>
        );
    }

    const showExpiredWarning = !phaseValidation.isAvailable &&
        phaseValidation.isExpired &&
        nextPhaseInfo?.isAvailable &&
        nextPhaseInfo?.hasAvailableSlots;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Payment Method */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Phương thức thanh toán</h2>

                        {showExpiredWarning && (
                            <>
                                <div className="mb-6 bg-yellow-50 border border-yellow-300 rounded-xl p-6">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="text-sm text-yellow-700 font-medium mb-1">
                                                Đã hết thời hạn thanh toán cho giai đoạn hiện tại
                                            </p>
                                            <p className="text-sm text-yellow-600">
                                                {phaseValidation.message}
                                            </p>
                                            {phaseValidation.formattedPeriod && (
                                                <p className="text-sm text-gray-600 mt-2">
                                                    <strong>Thời gian đã kết thúc:</strong> {phaseValidation.formattedPeriod}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6 bg-blue-50 border border-blue-300 rounded-xl p-6">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="text-sm text-blue-700 font-medium mb-1">
                                                Có giai đoạn tiếp theo đang mở đăng ký
                                            </p>
                                            <p className="text-sm text-blue-600">
                                                Bạn có thể tiếp tục thanh toán cho giai đoạn tiếp theo bên dưới
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Phase timing information - chỉ hiển thị khi trong thời hạn bình thường */}
                        {!showExpiredWarning && phaseValidation.formattedPeriod && (
                            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-blue-700 text-sm mb-1">
                                    <strong>Thời gian thanh toán:</strong> {phaseValidation.formattedPeriod}
                                </p>
                                {phaseValidation.daysRemaining && (
                                    <p className="text-blue-600 text-sm">
                                        {phaseValidation.message}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Phase timing information */}
                        {phaseValidation.formattedPeriod && (
                            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-blue-700 text-sm mb-1">
                                    <strong>Thời gian thanh toán:</strong> {phaseValidation.formattedPeriod}
                                </p>
                                {phaseValidation.daysRemaining && (
                                    <p className="text-blue-600 text-sm">
                                        {phaseValidation.message}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Select Package */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn mức phí thanh toán</h3>
                            <div className="space-y-3">
                                {authorPrices.map((price) => {
                                    const phaseInfo = getPricePhaseInfo(price);
                                    const isSelected = selectedPrice?.conferencePriceId === price.conferencePriceId;
                                    const isAvailable = phaseInfo.currentPhase && (phaseInfo.currentPhase.availableSlot ?? 0) > 0;

                                    return (
                                        <div
                                            key={price.conferencePriceId}
                                            className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${isSelected
                                                ? "border-blue-500 bg-blue-50"
                                                : isAvailable
                                                    ? "border-gray-200 hover:border-gray-300"
                                                    : "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                                                }`}
                                            onClick={() => isAvailable && handlePriceSelect(price)}
                                        >
                                            {isSelected && (
                                                <div className="absolute top-3 right-3">
                                                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-blue-500" : "border-gray-300"
                                                    }`}>
                                                    {isSelected && <div className="w-3 h-3 rounded-full bg-blue-500" />}
                                                </div>
                                                <h4 className="font-semibold text-gray-900">
                                                    {price.ticketName || "Package"}
                                                </h4>
                                            </div>
                                            {price.ticketDescription && (
                                                <p className="text-sm text-gray-600 ml-8 mb-2">
                                                    {price.ticketDescription}
                                                </p>
                                            )}
                                            <div className="ml-8 mb-2">
                                                {price.isPublish ? (
                                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                                                        Bao gồm phí xuất bản bài báo
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                                        Không bao gồm phí xuất bản bài báo
                                                    </span>
                                                )}
                                            </div>
                                            {phaseInfo.currentPhase && (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        {/* GIÁ ĐÃ TÍNH */}
                                                        <span className="text-lg font-bold text-purple-700">
                                                            {formatCurrency(
                                                                Math.round(
                                                                    (price.ticketPrice ?? 0) *
                                                                    ((phaseInfo.currentPhase?.applyPercent ?? 100) / 100)
                                                                )
                                                            )}
                                                        </span>

                                                        {/* LOGIC INLINE TĂNG/GIẢM */}
                                                        {(() => {
                                                            const apply = phaseInfo.currentPhase?.applyPercent ?? 100;
                                                            const original = price.ticketPrice ?? 0;

                                                            if (apply === 100) return null;

                                                            // Tính phần trăm chênh lệch
                                                            const diff = apply < 100 ? 100 - apply : apply - 100;

                                                            return (
                                                                <>
                                                                    {/* Giá gốc gạch ngang */}
                                                                    <span className="text-sm text-gray-500 line-through">
                                                                        {formatCurrency(original)}
                                                                    </span>

                                                                    {/* Badge giảm */}
                                                                    {apply < 100 && (
                                                                        <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                                                                            -{diff}%
                                                                        </span>
                                                                    )}

                                                                    {/* Badge tăng */}
                                                                    {apply > 100 && (
                                                                        <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
                                                                            +{diff}%
                                                                        </span>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>

                                                    {/* Phase time range */}
                                                    {!(nextPhaseInfo?.isAvailable && nextPhaseInfo?.hasAvailableSlots) && (
                                                        <div className="mt-1 ml-8 text-xs text-gray-500">
                                                            {formatDateRange(
                                                                phaseInfo.currentPhase.startDate,
                                                                phaseInfo.currentPhase.endDate
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            {!isAvailable && (
                                                <span className="ml-8 text-sm font-medium text-red-600">Đã bán hết</span>
                                            )}

                                            {priceNotSelected && (
                                                <p className="text-sm text-red-600 mt-1">Vui lòng chọn loại phí thanh toán</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Thêm sau div chứa danh sách prices, trước phần Select Payment Method */}
                        {checkAllAuthorTicketsSoldOut() && (
                            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-yellow-800 mb-1">
                                            Tất cả các gói đã hết chỗ
                                        </h4>
                                        <p className="text-sm text-yellow-700 mb-3">
                                            Đăng ký vào danh sách chờ để được thông báo khi có chỗ trống hoặc mở thêm gói mới
                                        </p>
                                        <button
                                            onClick={handleAddToWaitlist}
                                            disabled={addingToWaitListLoading}
                                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {addingToWaitListLoading ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"></path>
                                                    </svg>
                                                    <span>Đang xử lý...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    <span>Thêm vào danh sách chờ</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Select Payment Method */}
                        {selectedPrice && selectedPhase && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn phương thức thanh toán</h3>

                                {paymentMethodsLoading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : paymentMethods.length === 0 ? (
                                    <p className="text-gray-600 text-sm">Không có phương thức thanh toán</p>
                                ) : (
                                    <div className="space-y-4">
                                        {/* E-Wallet Section */}
                                        <div className="border border-gray-200 rounded-xl p-4">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center">
                                                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                                                </div>
                                                <span className="font-medium text-gray-900">Cổng thanh toán</span>
                                            </div>
                                            <div className="grid grid-cols-5 gap-3">
                                                {paymentMethods.slice(0, 5).map((method) => (
                                                    <button
                                                        key={method.paymentMethodId}
                                                        onClick={() => setSelectedPaymentMethod(method.paymentMethodId)}
                                                        className={`relative border-2 rounded-xl p-4 transition-all hover:border-blue-300 ${selectedPaymentMethod === method.paymentMethodId
                                                            ? "border-blue-500 bg-blue-50"
                                                            : "border-gray-200"
                                                            }`}
                                                    >
                                                        {selectedPaymentMethod === method.paymentMethodId && (
                                                            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                        <div className="text-xs font-medium text-gray-700 text-center break-words">
                                                            {method.methodName}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Bank Transfer Section */}
                                        {paymentMethods.length > 5 && (
                                            <div className="border border-gray-200 rounded-xl p-4">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                                                    <span className="font-medium text-gray-900">Bank Transfer</span>
                                                </div>
                                                <div className="grid grid-cols-5 gap-3">
                                                    {paymentMethods.slice(5).map((method) => (
                                                        <button
                                                            key={method.paymentMethodId}
                                                            onClick={() => setSelectedPaymentMethod(method.paymentMethodId)}
                                                            className={`relative border-2 rounded-xl p-4 transition-all hover:border-blue-300 ${selectedPaymentMethod === method.paymentMethodId
                                                                ? "border-blue-500 bg-blue-50"
                                                                : "border-gray-200"
                                                                }`}
                                                        >
                                                            {selectedPaymentMethod === method.paymentMethodId && (
                                                                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                            <div className="text-xs font-medium text-gray-700 text-center break-words">
                                                                {method.methodName}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {paymentNotSelected && (
                                    <p className="text-sm text-red-600 mt-1">Vui lòng chọn phương thức thanh toán</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Payment Summary */}
                {selectedPrice && selectedPhase && (
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tổng tiền thanh toán</h3>

                            <div className="space-y-3 mb-6">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                        {selectedPrice.ticketName}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {selectedPrice.ticketDescription}
                                    </p>
                                    <div className="ml-8 mb-2">
                                        {selectedPrice.isPublish ? (
                                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                                                Bao gồm xuất bản bài báo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                                Không bao gồm phí xuất bản bài báo
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 mt-2">
                                        {formatCurrency(selectedPrice.ticketPrice ?? 0)}
                                    </p>
                                </div>

                                {(() => {
                                    const apply = selectedPhase.applyPercent ?? 100;
                                    const original = selectedPrice.ticketPrice ?? 0;

                                    if (apply === 100) return null;

                                    const finalPrice = Math.round(original * (apply / 100));
                                    const diff = apply < 100 ? 100 - apply : apply - 100;

                                    return (
                                        <>
                                            {/* Nếu giảm giá */}
                                            {apply < 100 && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Discount</span>
                                                    <span className="text-sm font-semibold text-green-600">
                                                        -{diff}% ({(original - finalPrice).toLocaleString("vi-VN")}₫)
                                                    </span>
                                                </div>
                                            )}

                                            {/* Nếu tăng giá */}
                                            {apply > 100 && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Price Increase</span>
                                                    <span className="text-sm font-semibold text-orange-600">
                                                        +{diff}% ({(finalPrice - original).toLocaleString("vi-VN")}₫)
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>

                            <div className="mt-6">
                                <button
                                    onClick={handlePayment}
                                    disabled={!selectedPrice || !selectedPhase || !selectedPaymentMethod || isProcessing}
                                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-between items-center"
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center justify-center gap-2 w-full">
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"></path>
                                            </svg>
                                            <span>Đang xử lý...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span>Thanh toán</span>
                                            <span className="font-semibold">{finalPrice.toLocaleString("vi-VN")}₫</span>
                                        </>
                                    )}
                                </button>

                                {/* Validation message */}
                                {(!selectedPrice || !selectedPhase || !selectedPaymentMethod) && (
                                    <p className="text-sm text-red-600 mt-2 text-center">
                                        {!selectedPrice || !selectedPhase ? "Vui lòng chọn loại phí." : ""}
                                        {!selectedPaymentMethod ? " Vui lòng chọn phương thức thanh toán." : ""}
                                    </p>
                                )}
                            </div>

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                <span>Payments are secured</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );


    // return (
    //     <div className="space-y-6">
    //         <h3 className="text-lg font-semibold text-gray-900">Giai đoạn Thanh toán</h3>
    //         <p className="text-gray-600">Chọn gói thanh toán phù hợp để hoàn tất đăng ký</p>

    //         {/* Phase timing information */}
    //         {phaseValidation.formattedPeriod && (
    //             <div className="bg-blue-50 border border-blue-300 rounded-xl p-4">
    //                 <p className="text-blue-700 text-sm mb-2">
    //                     <strong>Thời gian thanh toán:</strong> {phaseValidation.formattedPeriod}
    //                 </p>
    //                 {phaseValidation.daysRemaining && (
    //                     <p className="text-blue-600 text-sm">
    //                         {phaseValidation.message}
    //                     </p>
    //                 )}
    //             </div>
    //         )}

    //         {/* Price Cards */}
    //         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //             {authorPrices.map((price) => {
    //                 const phaseInfo = getPricePhaseInfo(price);
    //                 const isSelected = selectedPrice?.conferencePriceId === price.conferencePriceId;
    //                 const isAvailable = phaseInfo.currentPhase && (phaseInfo.currentPhase.availableSlot ?? 0) > 0;
    //                 const finalPrice = phaseInfo.currentPhase
    //                     ? calculateFinalPrice(price.ticketPrice ?? 0, phaseInfo.currentPhase.applyPercent)
    //                     : price.ticketPrice ?? 0;

    //                 return (
    //                     <div
    //                         key={price.conferencePriceId}
    //                         className={`border rounded-xl p-5 transition-all cursor-pointer ${isSelected
    //                             ? "border-blue-500 bg-blue-50 shadow-md"
    //                             : isAvailable
    //                                 ? "border-gray-300 bg-white hover:border-blue-400 hover:shadow-sm"
    //                                 : "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
    //                             }`}
    //                         onClick={() => isAvailable && handlePriceSelect(price)}
    //                     >
    //                         <div className="flex items-start justify-between mb-3">
    //                             <div className="flex-1">
    //                                 <h4 className="text-lg font-semibold text-gray-900 mb-1">
    //                                     {price.ticketName || "Gói thanh toán"}
    //                                 </h4>
    //                                 {price.ticketDescription && (
    //                                     <p className="text-sm text-gray-600 line-clamp-2">
    //                                         {price.ticketDescription}
    //                                     </p>
    //                                 )}
    //                             </div>
    //                             {isSelected && (
    //                                 <div className="ml-3">
    //                                     <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
    //                                         <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
    //                                             <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    //                                         </svg>
    //                                     </div>
    //                                 </div>
    //                             )}
    //                         </div>

    //                         {phaseInfo.currentPhase && (
    //                             <div className="space-y-2">
    //                                 <div className="flex items-baseline gap-2">
    //                                     <span className="text-2xl font-bold text-gray-900">
    //                                         {formatCurrency(finalPrice)}
    //                                     </span>
    //                                     {phaseInfo.currentPhase.applyPercent && phaseInfo.currentPhase.applyPercent > 0 && (
    //                                         <span className="text-sm text-gray-500 line-through">
    //                                             {formatCurrency(price.ticketPrice ?? 0)}
    //                                         </span>
    //                                     )}
    //                                 </div>

    //                                 {phaseInfo.currentPhase.applyPercent && phaseInfo.currentPhase.applyPercent > 0 && (
    //                                     <div className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
    //                                         Giảm {phaseInfo.currentPhase.applyPercent}%
    //                                     </div>
    //                                 )}

    //                                 <div className="pt-2 space-y-1 text-sm text-gray-600">
    //                                     <p>
    //                                         <strong>Giai đoạn:</strong> {phaseInfo.currentPhase.phaseName || "Hiện tại"}
    //                                     </p>
    //                                     <p>
    //                                         <strong>Hạn chót:</strong> {formatDate(phaseInfo.currentPhase.endDate)}
    //                                     </p>
    //                                     <p>
    //                                         <strong>Còn lại:</strong>{" "}
    //                                         <span className={`font-semibold ${(phaseInfo.currentPhase.availableSlot ?? 0) < 10
    //                                             ? "text-red-600"
    //                                             : "text-green-600"
    //                                             }`}>
    //                                             {phaseInfo.currentPhase.availableSlot || 0}
    //                                         </span>
    //                                         /{phaseInfo.currentPhase.totalSlot || 0} slot
    //                                     </p>
    //                                 </div>
    //                             </div>
    //                         )}

    //                         {!phaseInfo.currentPhase && phaseInfo.futurePhases.length > 0 && (
    //                             <div className="text-sm text-gray-600">
    //                                 <p className="font-medium mb-1">Sắp mở bán:</p>
    //                                 <p>{formatDate(phaseInfo.futurePhases[0].startDate)}</p>
    //                             </div>
    //                         )}

    //                         {!phaseInfo.hasAvailableSlots && (
    //                             <div className="mt-2 text-sm font-medium text-red-600">
    //                                 Đã hết slot
    //                             </div>
    //                         )}
    //                     </div>
    //                 );
    //             })}
    //         </div>

    //         {/* Payment Method Selection */}
    //         {selectedPrice && selectedPhase && (
    //             <div className="bg-white border border-gray-300 rounded-xl p-5 space-y-4">
    //                 <h4 className="text-md font-semibold text-gray-900">Chọn phương thức thanh toán</h4>

    //                 {paymentMethodsLoading ? (
    //                     <div className="flex justify-center py-4">
    //                         <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
    //                     </div>
    //                 ) : paymentMethods.length === 0 ? (
    //                     <p className="text-gray-600 text-sm">Không có phương thức thanh toán</p>
    //                 ) : (
    //                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    //                         {paymentMethods.map((method) => (
    //                             <div
    //                                 key={method.paymentMethodId}
    //                                 className={`border rounded-lg p-3 cursor-pointer transition-all ${selectedPaymentMethod === method.paymentMethodId
    //                                     ? "border-blue-500 bg-blue-50"
    //                                     : "border-gray-300 hover:border-blue-400"
    //                                     }`}
    //                                 onClick={() => setSelectedPaymentMethod(method.paymentMethodId)}
    //                             >
    //                                 <div className="flex items-center gap-3">
    //                                     <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPaymentMethod === method.paymentMethodId
    //                                         ? "border-blue-600"
    //                                         : "border-gray-300"
    //                                         }`}>
    //                                         {selectedPaymentMethod === method.paymentMethodId && (
    //                                             <div className="w-3 h-3 rounded-full bg-blue-600" />
    //                                         )}
    //                                     </div>
    //                                     <div className="flex-1">
    //                                         <p className="font-medium text-gray-900 text-sm">
    //                                             {method.methodName}
    //                                         </p>
    //                                     </div>
    //                                 </div>
    //                             </div>
    //                         ))}
    //                     </div>
    //                 )}
    //             </div>
    //         )}

    //         {/* Payment Summary & Action */}
    //         {selectedPrice && selectedPhase && (
    //             <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
    //                 <h4 className="text-md font-semibold text-gray-900 mb-3">Tóm tắt thanh toán</h4>
    //                 <div className="space-y-2 text-sm">
    //                     <div className="flex justify-between">
    //                         <span className="text-gray-600">Gói đăng ký:</span>
    //                         <span className="font-medium text-gray-900">{selectedPrice.ticketName}</span>
    //                     </div>
    //                     <div className="flex justify-between">
    //                         <span className="text-gray-600">Giai đoạn:</span>
    //                         <span className="font-medium text-gray-900">{selectedPhase.phaseName}</span>
    //                     </div>
    //                     {selectedPhase.applyPercent && selectedPhase.applyPercent > 0 && (
    //                         <>
    //                             <div className="flex justify-between">
    //                                 <span className="text-gray-600">Giá gốc:</span>
    //                                 <span className="text-gray-500 line-through">
    //                                     {formatCurrency(selectedPrice.ticketPrice ?? 0)}
    //                                 </span>
    //                             </div>
    //                             <div className="flex justify-between text-green-600">
    //                                 <span>Giảm giá ({selectedPhase.applyPercent}%):</span>
    //                                 <span>-{formatCurrency(
    //                                     (selectedPrice.ticketPrice ?? 0) * (selectedPhase.applyPercent / 100)
    //                                 )}</span>
    //                             </div>
    //                         </>
    //                     )}
    //                     <div className="pt-2 border-t border-blue-200 flex justify-between items-baseline">
    //                         <span className="font-semibold text-gray-900">Tổng cộng:</span>
    //                         <span className="text-2xl font-bold text-blue-600">
    //                             {formatCurrency(
    //                                 calculateFinalPrice(selectedPrice.ticketPrice ?? 0, selectedPhase.applyPercent)
    //                             )}
    //                         </span>
    //                     </div>
    //                 </div>

    //                 <button
    //                     onClick={handlePayment}
    //                     disabled={!selectedPaymentMethod || isProcessing}
    //                     className="w-full mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
    //                 >
    //                     {isProcessing ? (
    //                         <div className="flex items-center justify-center gap-2">
    //                             <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    //                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    //                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"></path>
    //                             </svg>
    //                             <span>Đang xử lý...</span>
    //                         </div>
    //                     ) : (
    //                         "Xác nhận thanh toán"
    //                     )}
    //                 </button>
    //             </div>
    //         )}
    //     </div>
    // );
};

export default PaymentPhase;