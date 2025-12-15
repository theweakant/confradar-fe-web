
import React from "react";
import {
    ConferencePricePhaseResponse,
    ConferencePriceResponse,
    ResearchConferenceDetailResponse,
    SubmittedPaper,
    TechnicalConferenceDetailResponse,
} from "@/types/conference.type";
import { useGlobalTime } from "@/utils/TimeContext";
import Link from "next/link";

interface PurchasedTicketInfo {
    ticket: ConferencePriceResponse;
    phase?: ConferencePricePhaseResponse;
}

interface ConferenceSubscribeCardProps {
    conference: TechnicalConferenceDetailResponse | ResearchConferenceDetailResponse;
    formatDate: (dateString?: string) => string;
    onOpenDialog: (type: 'author' | 'listener') => void;
    onSubmitPaper?: () => void;
    purchasedTicketInfo: PurchasedTicketInfo | null;
    isResearch?: boolean;
    hasSubmittedPaper?: boolean;
    submittedPaper?: SubmittedPaper | null;
    onOpenAbstractDialog?: () => void;
    onSelectPaper?: (paperId: string | null) => void;
}

const ConferenceSubscribeCard: React.FC<ConferenceSubscribeCardProps> = ({
    conference,
    formatDate,
    onOpenDialog,
    onSubmitPaper,
    purchasedTicketInfo,
    isResearch = false,
    hasSubmittedPaper,
    submittedPaper,
    onOpenAbstractDialog,
    onSelectPaper
}) => {
    const { now } = useGlobalTime();

    const baseClasses = isResearch
        ? "bg-white rounded-xl shadow-md p-6"
        : "bg-white rounded-xl shadow-md p-6";

    const titleClasses = isResearch
        ? "text-xl font-bold mb-3 text-blue-600"
        : "text-xl font-bold mb-3 text-blue-600";

    const textColor = isResearch ? "text-gray-700" : "text-gray-700";

    const phaseStatusVN: Record<string, string> = {
        Pending: "Đang xử lý",
        Accepted: "Chấp nhận",
        Rejected: "Bị từ chối",
        Revise: "Cần chỉnh sửa",
    };

    const getAvailableCurrentResearchPhase = () => {
        if (!conference.isResearchConference) return null;

        const researchConf = conference as ResearchConferenceDetailResponse;
        const researchPhases = researchConf.researchPhase || [];

        const currentPhase = submittedPaper?.researchPhaseId
            ? researchPhases.find(phase => {
                if (phase.researchConferencePhaseId !== submittedPaper.researchPhaseId) return false;
                if (!phase.authorPaymentEnd) return false;
                // const start = new Date(phase.authorPaymentStart);
                const end = new Date(phase.authorPaymentEnd);
                return now <= end && phase.isActive;
                // now >= start && 
            }) || null
            : null;

        return currentPhase;
    }

    const getNextAvailablePhase = () => {
        if (!conference.isResearchConference) return null;

        const researchConf = conference as ResearchConferenceDetailResponse;
        const researchPhases = researchConf.researchPhase || [];

        const currentPhase = submittedPaper?.researchPhaseId
            ? researchPhases.find(phase => {
                if (phase.researchConferencePhaseId !== submittedPaper.researchPhaseId) return false;
                if (!phase.authorPaymentEnd) return false;
                // const start = new Date(phase.authorPaymentStart);
                const end = new Date(phase.authorPaymentEnd);
                return now <= end && phase.isActive;
                // now >= start && 
            }) || null
            : null;

        // Nếu đang trong phase hợp lệ, không có next phase cần tính
        if (currentPhase) return {
            phase: currentPhase,
            hasAvailableSlots: (conference.conferencePrices || [])
                .filter(ticket => ticket.isAuthor)
                .some(ticket => (ticket.availableSlot ?? 0) > 0)
            // .some(ticket => ticket.pricePhases?.some(pricePhase => (pricePhase.availableSlot ?? 0) > 0))
        };

        // Tìm phase tiếp theo
        // const sortedPhases = [...researchPhases].sort(
        //     (a, b) => (a.phaseOrder ?? 0) - (b.phaseOrder ?? 0)
        // );

        // Lấy phaseOrder hiện tại (dù đã hết hạn)
        // const currentPhaseOrder = submittedPaper?.researchPhaseId
        //     ? sortedPhases.find(p => p.researchConferencePhaseId === submittedPaper.researchPhaseId)
        //         ?.phaseOrder ?? -1
        //     : -1;

        // const nextPhase = sortedPhases.find(phase => {
        //     if (!phase.isActive) return false;
        //     if (phase.phaseOrder == null) return false;
        //     return phase.phaseOrder > currentPhaseOrder;
        // });

        // if (!nextPhase) return null;
        const sortedPhases = [...researchPhases].sort((a, b) => (a.phaseOrder || 0) - (b.phaseOrder || 0));
        const nextPhase = sortedPhases.find(phase => {
            if (!phase.authorPaymentStart) return false;
            const start = new Date(phase.authorPaymentStart);
            return phase.isActive;
            // && start > now;
        });

        if (!nextPhase) return null;

        // Check xem có vé available không
        const authorTickets = (conference.conferencePrices || []).filter(ticket => ticket.isAuthor);
        const hasAvailableSlots = authorTickets.some(ticket => {
            return (ticket.availableSlot ?? 0) > 0;
            // return ticket.pricePhases?.some(pricePhase => (pricePhase.availableSlot ?? 0) > 0);
        });

        return {
            phase: nextPhase,
            hasAvailableSlots
        };
    };

    const nextPhaseInfo = getNextAvailablePhase();
    const availableResearchPhase = getAvailableCurrentResearchPhase();

    const getPaperPhaseStatus = (paper: SubmittedPaper | null) => {
        if (!paper) return null;

        // Kiểm tra giai đoạn bị reject
        let rejectedPhase: string | null = null;
        let currentPhase: string = "Abstract";
        let canRegisterAsAuthor = false;

        if (paper.abstractStatus === "Rejected") {
            rejectedPhase = "Abstract";
        } else if (paper.fullpaperStatus === "Rejected") {
            rejectedPhase = "Full Paper";
        } else if (paper.revisionStatus === "Rejected") {
            rejectedPhase = "Revision";
        }

        // Check xem có skip Revision không
        const isRevisionSkipped = paper.fullpaperStatus === "Accepted";

        // Xác định current phase và cho phép đăng ký
        // if (paper.cameraReadyStatus === "Accepted") {
        //     currentPhase = "Camera Ready";
        //     canRegisterAsAuthor = true;
        // } else 
        if (paper.revisionStatus === "Accepted") {
            currentPhase = "Revision";
            canRegisterAsAuthor = true;
        } else if (paper.fullpaperStatus === "Accepted" && isRevisionSkipped) {
            currentPhase = "Full Paper";
            canRegisterAsAuthor = true;
        } else if (paper.fullpaperStatus) {
            currentPhase = "Full Paper";
        } else if (paper.abstractStatus) {
            currentPhase = "Abstract";
        }

        const phases = [
            {
                name: "Abstract",
                status: paper.abstractStatus,
                icon: paper.abstractStatus === "Accepted" ? "✓" :
                    paper.abstractStatus === "Rejected" ? "✗" :
                        paper.abstractStatus === "Pending" ? "⏳" : "○"
            },
            {
                name: "Full Paper",
                status: paper.fullpaperStatus,
                icon: paper.fullpaperStatus === "Accepted" ? "✓" :
                    paper.fullpaperStatus === "Rejected" ? "✗" :
                        paper.fullpaperStatus === "Pending" ? "⏳" : "○"
            },
            {
                name: "Revision",
                status: paper.revisionStatus,
                isSkipped: isRevisionSkipped,
                icon: isRevisionSkipped ? "⊘" :
                    paper.revisionStatus === "Accepted" ? "✓" :
                        paper.revisionStatus === "Rejected" ? "✗" :
                            paper.revisionStatus === "Pending" ? "⏳" : "○"
            },
            {
                name: "Camera Ready",
                status: paper.cameraReadyStatus,
                icon: paper.cameraReadyStatus === "Accepted" ? "✓" :
                    paper.cameraReadyStatus === "Pending" ? "⏳" : "○"
            }
        ];

        return {
            phases,
            rejectedPhase,
            currentPhase,
            canRegisterAsAuthor,
            isRevisionSkipped
        };
    };

    const renderSubscribeButton = () => {
        if (purchasedTicketInfo) {
            return (
                <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 flex-shrink-0 mt-0.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1">
                                <p className="font-semibold mb-1 text-green-800">Bạn đã mua vé thành công!</p>
                                <div className="text-sm space-y-1 text-green-700">
                                    <p><span className="font-medium">Loại vé:</span> {purchasedTicketInfo.ticket.ticketName}</p>
                                    {purchasedTicketInfo.phase && (
                                        <p><span className="font-medium">Giai đoạn:</span> {purchasedTicketInfo.phase.phaseName}</p>
                                    )}
                                    <p><span className="font-medium">Giá:</span> {(purchasedTicketInfo.ticket.ticketPrice || 0).toLocaleString("vi-VN")}₫</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button disabled className="w-full px-6 py-3 rounded-lg font-semibold cursor-not-allowed opacity-60 bg-gray-300 text-gray-500">
                        Đã sở hữu vé
                    </button>

                    <p className="text-xs text-center text-gray-500">
                        Bạn có thể xem chi tiết vé trong phần &quot;Vé của tôi&quot;
                    </p>
                </div>
            );
        }

        // Logic riêng cho Research Conference
        if (conference.isResearchConference) {
            const researchConf = conference as ResearchConferenceDetailResponse;

            // Kiểm tra registration period từ researchPhase - CHỈ ẢNH HƯỞNG ĐẾN AUTHOR
            const researchPhases = researchConf.researchPhase || [];

            const currentRegistrationPhase = [...researchPhases]
                .sort((a, b) => (a.phaseOrder || 0) - (b.phaseOrder || 0))
                .find(phase => {
                    if (!phase.registrationStartDate || !phase.registrationEndDate) return false;
                    const start = new Date(phase.registrationStartDate);
                    const end = new Date(phase.registrationEndDate);
                    return phase.isActive && now >= start && now <= end;
                });

            const nextRegistrationPhase = [...researchPhases]
                .sort((a, b) => (a.phaseOrder || 0) - (b.phaseOrder || 0))
                .find(phase => {
                    if (!phase.registrationStartDate) return false;
                    const start = new Date(phase.registrationStartDate);
                    return now < start;
                });

            // Lấy tickets và check phases
            const authorTickets = (conference.conferencePrices || []).filter(ticket => ticket.isAuthor);
            const listenerTickets = (conference.conferencePrices || []).filter(ticket => !ticket.isAuthor);

            const hasAuthorTickets = authorTickets.length > 0;
            const hasListenerTickets = listenerTickets.length > 0;

            const isAuthorHasSlot = authorTickets.some(ticket => (ticket.availableSlot ?? 0) > 0)
            const authorPaymentEnd = availableResearchPhase?.authorPaymentEnd
                ? new Date(availableResearchPhase.authorPaymentEnd)
                : null;

            const isAuthorHasPassPaymentDeadline = !availableResearchPhase;

            // Check giai đoạn cho Author tickets
            const authorPhases = authorTickets.flatMap(ticket => [...(ticket.pricePhases || [])]);

            let currentAuthorPhase;
            let futureAuthorPhases;
            let nextAuthorPhaseStart;

            // Nếu có next phase available, chỉ check slot
            if (nextPhaseInfo?.hasAvailableSlots) {
                currentAuthorPhase = authorPhases.find(phase => (phase.availableSlot ?? 0) > 0);
                futureAuthorPhases = authorPhases.filter(phase => (phase.availableSlot ?? 0) > 0);
                nextAuthorPhaseStart = futureAuthorPhases.length > 0 ? new Date(futureAuthorPhases[0].startDate || "") : null;
            } else {
                // Logic cũ: check cả thời gian
                currentAuthorPhase = authorPhases.find(phase => {
                    const start = new Date(phase.startDate || "");
                    const end = new Date(phase.endDate || "");
                    return now >= start && now <= end && (phase.availableSlot ?? 0) > 0;
                });
                futureAuthorPhases = authorPhases
                    .filter(phase => new Date(phase.startDate || "") > now)
                    .sort((a, b) => new Date(a.startDate || "").getTime() - new Date(b.startDate || "").getTime());
                nextAuthorPhaseStart = futureAuthorPhases.length > 0 ? new Date(futureAuthorPhases[0].startDate || "") : null;
            }
            // const authorPhases = authorTickets.flatMap(ticket => [...(ticket.pricePhases || [])]);
            // const currentAuthorPhase = authorPhases.find(phase => {
            //     const start = new Date(phase.startDate || "");
            //     const end = new Date(phase.endDate || "");
            //     return now >= start && now <= end && (phase.availableSlot ?? 0) > 0;
            // });
            // const futureAuthorPhases = authorPhases
            //     .filter(phase => new Date(phase.startDate || "") > now)
            //     .sort((a, b) => new Date(a.startDate || "").getTime() - new Date(b.startDate || "").getTime());
            // const nextAuthorPhaseStart = futureAuthorPhases.length > 0 ? new Date(futureAuthorPhases[0].startDate || "") : null;

            // Check giai đoạn cho Listener tickets
            const listenerPhases = listenerTickets.flatMap(ticket => ticket.pricePhases || []);
            const currentListenerPhase = listenerPhases.find(phase => {
                const start = new Date(phase.startDate || "");
                const end = new Date(phase.endDate || "");
                return now >= start && now <= end && (phase.availableSlot ?? 0) > 0;
            });
            const futureListenerPhases = listenerPhases
                .filter(phase => new Date(phase.startDate || "") > now)
                .sort((a, b) => new Date(a.startDate || "").getTime() - new Date(b.startDate || "").getTime());
            const nextListenerPhaseStart = futureListenerPhases.length > 0 ? new Date(futureListenerPhases[0].startDate || "") : null;

            // Xác định trạng thái
            const authorStatus = isAuthorHasPassPaymentDeadline
                ? 'closed'
                : isAuthorHasSlot
                    ? 'available'
                    : 'closed';

            // const authorStatus = currentAuthorPhase
            //     ? 'available'
            //     : nextAuthorPhaseStart
            //         ? 'upcoming'
            //         : 'closed';

            const listenerStatus = currentListenerPhase
                ? 'available'
                : nextListenerPhaseStart
                    ? 'upcoming'
                    : 'closed';

            const allowListener = researchConf.allowListener;

            return (
                <div className="space-y-2">
                    {/* SECTION AUTHOR - Phụ thuộc registration phase */}
                    {hasAuthorTickets && (
                        <>
                            {!hasSubmittedPaper ? (
                                // TRƯỜNG HỢP 1: Chưa nộp bài - Check registration phase
                                <>
                                    {!currentRegistrationPhase && !nextRegistrationPhase ? (
                                        <div className="text-center">
                                            <button disabled className="w-full px-6 py-3 rounded-lg font-semibold cursor-not-allowed opacity-60 bg-red-300 text-red-700">
                                                Đã hết thời gian đăng ký cho tác giả
                                            </button>
                                            <p className="text-xs mt-2 text-gray-500">
                                                Hội nghị đã kết thúc giai đoạn đăng ký
                                            </p>
                                        </div>
                                    ) : !currentRegistrationPhase && nextRegistrationPhase ? (
                                        <div className="text-center">
                                            <button disabled className="w-full px-6 py-3 rounded-lg font-semibold cursor-not-allowed opacity-60 bg-gray-300 text-gray-500">
                                                Chưa đến thời gian đăng ký cho tác giả
                                            </button>
                                            <p className="text-xs mt-2 text-gray-500">
                                                Bắt đầu: {formatDate(nextRegistrationPhase.registrationStartDate!)}
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                                                <p className="text-sm text-amber-800">
                                                    💡 Vui lòng nộp bài báo (Abstract) trước khi đăng ký với tư cách tác giả
                                                </p>
                                            </div>
                                            <button
                                                onClick={onOpenAbstractDialog}
                                                className="w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg"
                                            >
                                                Nộp bản giới thiệu của bài báo (Abstract)
                                            </button>
                                        </>
                                    )}
                                </>
                            ) : (() => {
                                // TRƯỜNG HỢP 2: Đã nộp bài - Check paper phase status
                                const paperStatus = getPaperPhaseStatus(submittedPaper ?? null);
                                return (
                                    <>
                                        {/* Hiển thị trạng thái bài báo */}
                                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 space-y-3">
                                            <div>
                                                <p className="font-semibold text-blue-900 mb-1">{submittedPaper?.title}</p>
                                                <p className="text-sm text-blue-700">{submittedPaper?.description}</p>
                                            </div>
                                            {paperStatus && (
                                                <div className="space-y-2">
                                                    <p className="text-xs font-semibold text-blue-800">Tiến trình xét duyệt bài báo:</p>
                                                    {paperStatus.phases.map((phase, idx) => {
                                                        const isBlocked = paperStatus.rejectedPhase &&
                                                            idx > paperStatus.phases.findIndex(p => p.name === paperStatus.rejectedPhase);
                                                        return (
                                                            <div key={idx} className={`flex items-center gap-2 text-xs ${isBlocked ? 'opacity-40' : ''}`}>
                                                                <span className="text-base">{phase.icon}</span>
                                                                <span className={`font-medium ${phase.status === "Accepted" ? "text-green-700" :
                                                                    phase.status === "Rejected" ? "text-red-700" :
                                                                        phase.status === "Pending" ? "text-yellow-700" :
                                                                            "text-gray-600"
                                                                    }`}>
                                                                    {phase.name}
                                                                    {phase.isSkipped && " (Được bỏ qua)"}
                                                                    {isBlocked && " (Đã bị từ chối)"}
                                                                </span>
                                                                {phase.status && (
                                                                    <span className={`text-xs px-2 py-0.5 rounded ${phase.status === "Accepted" ? "bg-green-100 text-green-800" :
                                                                        phase.status === "Rejected" ? "bg-red-100 text-red-800" :
                                                                            phase.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                                                                                "bg-gray-100 text-gray-800"
                                                                        }`}>
                                                                        {phaseStatusVN[phase.status] || phase.status}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                    <div className="pt-2">
                                                        <Link
                                                            href={`/customer/papers/${submittedPaper?.paperId}`}
                                                            className="text-indigo-600 hover:underline text-sm font-medium"
                                                        >
                                                            Xem chi tiết bài báo
                                                        </Link>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Nút đăng ký tác giả - check paper phase trước, sau đó mới check isAuthor phase */}
                                        {paperStatus?.canRegisterAsAuthor ? (
                                            // Bài báo đã pass, check isAuthor phase
                                            <>
                                                {/* Hiển thị warning nếu hết phase nhưng có next phase */}
                                                {authorStatus === 'closed' && nextPhaseInfo?.hasAvailableSlots && (
                                                    <div className="mb-3 bg-blue-50 border border-blue-300 rounded-xl p-4">
                                                        <div className="flex items-start gap-3">
                                                            <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                            </svg>
                                                            <div>
                                                                <p className="text-sm text-blue-700 font-medium mb-1">
                                                                    Đã hết thời hạn thanh toán cho giai đoạn hiện tại
                                                                </p>
                                                                <p className="text-sm text-blue-600">
                                                                    Có giai đoạn tiếp theo đang mở đăng ký. Bạn có thể tiếp tục thanh toán.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {authorStatus === 'closed' && nextPhaseInfo && !nextPhaseInfo.hasAvailableSlots && (
                                                    <div className="mb-3 bg-red-50 border border-red-300 rounded-xl p-4">
                                                        <div className="flex items-start gap-3">
                                                            <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                            </svg>
                                                            <div>
                                                                <p className="text-sm text-red-700 font-medium mb-1">
                                                                    Đã hết thời hạn thanh toán và giai đoạn tiếp theo không còn chỗ trống
                                                                </p>
                                                                <p className="text-sm text-red-600">
                                                                    Vui lòng liên hệ ban tổ chức nếu bạn cần hỗ trợ thêm.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {authorStatus === 'available' || (authorStatus === 'closed' && nextPhaseInfo?.hasAvailableSlots) ? (
                                                    <button
                                                        onClick={() => {
                                                            onSelectPaper?.(submittedPaper?.paperId || null);
                                                            onOpenDialog('author');
                                                        }}
                                                        className="w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300 bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
                                                    >
                                                        ✓ Đăng ký cho Tác giả
                                                    </button>
                                                )
                                                    // : authorStatus === 'upcoming' ? (
                                                    //     <div className="text-center">
                                                    //         <button disabled className="w-full px-6 py-3 rounded-lg font-semibold cursor-not-allowed opacity-60 bg-gray-300 text-gray-500">
                                                    //             Chưa đến lúc thanh toán phí cho Tác giả
                                                    //         </button>
                                                    //         <p className="text-xs mt-2 text-gray-500">
                                                    //             Ngày bắt đầu: {formatDate(nextAuthorPhaseStart!.toISOString())}
                                                    //         </p>
                                                    //     </div>
                                                    // )
                                                    : (
                                                        <button disabled className="w-full px-6 py-3 rounded-lg font-semibold cursor-not-allowed opacity-60 bg-red-300 text-red-700">
                                                            Đã hết thời gian thanh toán phí cho Tác giả
                                                        </button>
                                                    )}
                                            </>
                                        ) : (
                                            // Bài báo chưa pass các phase
                                            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                                                <p className="text-sm text-amber-800">
                                                    {paperStatus?.rejectedPhase
                                                        ? `⚠️ Bài báo bị từ chối ở giai đoạn ${paperStatus.rejectedPhase}`
                                                        : "⏳ Vui lòng hoàn thành các giai đoạn xét duyệt để có thể đăng ký với tư cách tác giả"}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </>
                    )}

                    {/* SECTION LISTENER - Độc lập hoàn toàn, không phụ thuộc registration phase */}
                    {allowListener && hasListenerTickets && (
                        <>
                            {listenerStatus === 'available' ? (
                                <button
                                    onClick={() => onOpenDialog('listener')}
                                    className="w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg"
                                >
                                    Đăng ký cho Thính giả
                                </button>
                            ) : listenerStatus === 'upcoming' ? (
                                <div className="text-center">
                                    <button disabled className="w-full px-6 py-3 rounded-lg font-semibold cursor-not-allowed opacity-60 bg-gray-300 text-gray-500">
                                        Chưa đến lúc đăng ký với tư cách Thính giả
                                    </button>
                                    <p className="text-xs mt-2 text-gray-500">
                                        Ngày bắt đầu: {formatDate(nextListenerPhaseStart!.toISOString())}
                                    </p>
                                </div>
                            ) : (
                                <button disabled className="w-full px-6 py-3 rounded-lg font-semibold cursor-not-allowed opacity-60 bg-red-300 text-red-700">
                                    Đã hết thời gian  đăng ký với tư cách Thính giả
                                </button>
                            )}
                        </>
                    )}

                    {/* Hiển thị thông báo nếu không có tickets nào */}
                    {!hasAuthorTickets && !hasListenerTickets && (
                        <div className="text-center py-4">
                            <p className="text-gray-500 text-sm">Chưa có gói chi phí nào được mở bán</p>
                        </div>
                    )}
                </div>
            );
        }

        // Logic cho Technical Conference (giữ nguyên như cũ)
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
                    <button disabled className="w-full px-6 py-3 rounded-lg font-semibold cursor-not-allowed opacity-60 bg-gray-300 text-gray-500">
                        Chưa đến lúc mở bán vé
                    </button>
                    <p className="text-xs mt-2 text-center text-gray-500">
                        Ngày bắt đầu bán vé: {formatDate(nextPhaseStart.toISOString())}
                    </p>
                </div>
            );
        }

        if (!currentPhase && !nextPhaseStart) {
            return (
                <button disabled className="w-full px-6 py-3 rounded-lg font-semibold cursor-not-allowed opacity-60 bg-red-300 text-red-700">
                    Đã hết thời gian bán vé
                </button>
            );
        }

        return (
            <button
                onClick={() => onOpenDialog('listener')}
                className="w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
            >
                Mua vé
            </button>
        );
    };


    return (
        <div className={baseClasses}>
            <h3 className={titleClasses}>
                {conference.isResearchConference ? "Đăng ký tham dự tại đây" : "Mua vé ngay"}
            </h3>
            <p className={`text-sm mb-4 ${textColor}`}>
                {conference.isResearchConference ? "Đăng ký tham dự cho tác giả/thính giả" : "Nhấn để chọn khung giá vé và thanh toán"}
            </p>
            {renderSubscribeButton()}
        </div>
    );
};

export default ConferenceSubscribeCard;