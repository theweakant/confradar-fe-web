import React, { useState, useEffect, useMemo } from "react";
import { useGetConferenceStepPricesQuery } from "@/redux/services/conferenceStep.service";
import { useTransaction } from "@/redux/hooks/useTransaction";
import { ConferencePriceResponse, ConferencePricePhaseResponse } from "@/types/conference.type";
import { ResearchPhaseDtoDetail } from "@/types/paper.type";
import { validatePhaseTime } from "@/helper/timeValidation";
import { useGlobalTime } from "@/utils/TimeContext";
import { toast } from "sonner";
import { useConference } from "@/redux/hooks/useConference";

interface PaymentPhaseProps {
    paperId?: string;
    conferenceId?: string;
    researchPhase?: ResearchPhaseDtoDetail;
    onPaymentSuccess?: () => void;
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

    const [validationMessage, setValidationMessage] = useState("");

    // Fetch prices
    // const {
    //     data: pricesResponse,
    //     isLoading: pricesLoading,
    //     error: pricesError,
    // } = useGetConferenceStepPricesQuery(conferenceId || "", {
    //     skip: !conferenceId,
    // });

    const {
        researchConference,
        researchConferenceLoading,
        researchConferenceError,
        refetchResearchConference,
    } = useConference({ id: conferenceId });

    const { paymentMethods, loading: paymentMethodsLoading, fetchAllPaymentMethods } = useTransaction();

    const pricesResponse = researchConference?.conferencePrices;

    const priceNotSelected = !selectedPrice || !selectedPhase;
    const paymentNotSelected = !selectedPaymentMethod;

    const originalPrice = selectedPrice?.ticketPrice ?? 0;
    const applyPercent = selectedPhase?.applyPercent ?? 100;

    const finalPrice = Math.round(originalPrice * (applyPercent / 100));

    useEffect(() => {
        fetchAllPaymentMethods();
    }, [fetchAllPaymentMethods]);

    // Validate phase timing
    const phaseValidation = validatePhaseTime(
        researchPhase?.registrationStartDate,
        researchPhase?.registrationEndDate
    );

    // Filter author prices only
    const authorPrices = useMemo(() => {
        if (!pricesResponse) return [];
        return Array.isArray(pricesResponse)
            ? pricesResponse.filter((price) => price.isAuthor === true)
            : [];
    }, [pricesResponse]);

    // Get current and available phases for a price
    const getPricePhaseInfo = (price: ConferencePriceResponse) => {
        if (!price.pricePhases || price.pricePhases.length === 0) {
            return { currentPhase: null, futurePhases: [], hasAvailableSlots: false };
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
        if (!selectedPrice || !selectedPhase || !selectedPaymentMethod || !paperId) {
            toast.error("Vui lòng chọn đầy đủ thông tin thanh toán");
            return;
        }

        setIsProcessing(true);
        try {
            // TODO: Call payment API here
            // const result = await processPayment({
            //   paperId,
            //   priceId: selectedPrice.conferencePriceId,
            //   phaseId: selectedPhase.pricePhaseId,
            //   paymentMethodId: selectedPaymentMethod,
            // });

            toast.success("Thanh toán thành công!");
            onPaymentSuccess?.();
        } catch (error) {
            toast.error("Có lỗi xảy ra khi thanh toán");
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

    // if (!phaseValidation.isAvailable) {
    //     return (
    //         <div className="space-y-6">
    //             <h3 className="text-lg font-semibold text-gray-900">Giai đoạn Thanh toán</h3>
    //             <div className={`border rounded-xl p-6 ${phaseValidation.isExpired
    //                 ? "bg-red-50 border-red-300"
    //                 : "bg-yellow-50 border-yellow-300"
    //                 }`}>
    //                 <p className={`text-sm ${phaseValidation.isExpired ? "text-red-700" : "text-yellow-700"
    //                     }`}>
    //                     {phaseValidation.message}
    //                 </p>
    //                 {phaseValidation.formattedPeriod && (
    //                     <p className="text-sm text-gray-600 mt-2">
    //                         <strong>Thời gian:</strong> {phaseValidation.formattedPeriod}
    //                     </p>
    //                 )}
    //             </div>
    //         </div>
    //     );
    // }

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

    return (
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Payment Method */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Phương thức thanh toán</h2>

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
                                                    <div className="mt-1 ml-8 text-xs text-gray-500">
                                                        {formatDateRange(
                                                            phaseInfo.currentPhase.startDate,
                                                            phaseInfo.currentPhase.endDate
                                                        )}
                                                    </div>
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
                                    <p className="text-sm font-semibold text-gray-900 mt-2">
                                        {formatCurrency(selectedPrice.ticketPrice ?? 0)}
                                    </p>
                                </div>

                                {(() => {
                                    const apply = selectedPhase.applyPercent ?? 100;
                                    const original = selectedPrice.ticketPrice ?? 0;

                                    // Không tăng không giảm → không hiển thị gì
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

                                {/* {selectedPhase.applyPercent && selectedPhase.applyPercent > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Discount</span>
                                        <span className="text-sm font-semibold text-red-600">
                                            -Rp {((selectedPrice.ticketPrice ?? 0) * (selectedPhase.applyPercent / 100)).toLocaleString("vi-VN")}
                                        </span>
                                    </div>
                                )} */}

                                {/* <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                                    <span className="text-base font-semibold text-gray-900">Total</span>
                                    <span className="text-xl font-bold text-gray-900">
                                        {formatCurrency(
                                            calculateFinalPrice(selectedPrice.ticketPrice ?? 0, selectedPhase.applyPercent)
                                        )}
                                    </span>
                                </div> */}
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

                            {/* <button
                                onClick={handlePayment}
                                disabled={!selectedPaymentMethod || isProcessing}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"></path>
                                        </svg>
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    "Pay"
                                )}
                            </button> */}

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
        </div>
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