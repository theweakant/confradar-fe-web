import React, { useEffect, useState } from "react";
import { useTransaction } from "@/redux/hooks/useTransaction";
import { useConference } from "@/redux/hooks/useConference";
import { usePaperCustomer } from "@/redux/hooks/usePaper";
import { toast } from "sonner";
import {
    ConferencePriceResponse,
    ResearchConferenceDetailResponse,
    TechnicalConferenceDetailResponse,
} from "@/types/conference.type";
import ConferenceTitleCard from "./ConferenceTitleCard";
import ConferenceSubscribeCard from "./ConferenceSubscribeCard";
import ConferenceDescriptionCard from "./ConferenceDescriptionCard";
import TicketSelectionDialog from "./TicketSelectionDialog";

interface ConferenceHeaderProps {
    conference: TechnicalConferenceDetailResponse | ResearchConferenceDetailResponse;
    accessToken: string | null;
    formatDate: (dateString?: string) => string;
    handlePurchaseTicket: () => void;
    selectedTicket: ConferencePriceResponse | null;
    onSelectTicket: (ticket: ConferencePriceResponse | null) => void;
    authorInfo: { title: string; description: string };
    onAuthorInfoChange: (info: { title: string; description: string }) => void;
    selectedPaymentMethod: string | null;
    onSelectPaymentMethod: (id: string | null) => void;
}

const ConferenceHeader: React.FC<ConferenceHeaderProps> = ({
    conference,
    accessToken,
    formatDate,
    handlePurchaseTicket,
    selectedTicket,
    onSelectTicket,
    authorInfo,
    onAuthorInfoChange,
    selectedPaymentMethod,
    onSelectPaymentMethod,
}) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [showAuthorForm, setShowAuthorForm] = useState(false);
    const [showPaymentMethods, setShowPaymentMethods] = useState(false);

    const {
        lazyFavouriteConferences,
        addFavourite,
        removeFavourite,
        addingToFavourite,
        deletingFromFavourite,
        fetchFavouriteConferences,
    } = useConference();

    const { paymentMethods, loading: paymentMethodsLoading, fetchAllPaymentMethods } = useTransaction();
    const { handleAddToWaitList, addingToWaitListLoading } = usePaperCustomer();

    const [isFavorite, setIsFavorite] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);

    const isResearch = conference.isResearchConference;

    const showSubscribeCard =
        conference.isResearchConference ||
        conference.isInternalHosted ||
        !!conference.contract?.isTicketSelling;

    useEffect(() => {
        if (accessToken) {
            fetchFavouriteConferences();
        }
    }, [accessToken, fetchFavouriteConferences]);

    useEffect(() => {
        if (accessToken && lazyFavouriteConferences && conference.conferenceId) {
            const isInFavorites = lazyFavouriteConferences.some(
                (fav) => fav.conferenceId === conference.conferenceId
            );
            setIsFavorite(isInFavorites);
        } else {
            setIsFavorite(false);
        }
    }, [accessToken, lazyFavouriteConferences, conference.conferenceId]);

    useEffect(() => {
        if (isDialogOpen) {
            fetchAllPaymentMethods();
        }
    }, [isDialogOpen]);

    const handleFavoriteToggle = async () => {
        if (!conference.conferenceId || !accessToken) {
            toast.error("Vui lòng đăng nhập để sử dụng tính năng này");
            return;
        }

        try {
            if (isFavorite) {
                await removeFavourite(conference.conferenceId);
                toast.success("Đã bỏ khỏi danh sách yêu thích");
            } else {
                await addFavourite(conference.conferenceId);
                toast.success("Đã thêm vào danh sách yêu thích");
            }
            fetchFavouriteConferences();
        } catch (error) {
            toast.error("Có lỗi xảy ra, vui lòng thử lại");
            console.error("Favorite toggle error:", error);
        }
    };

    const handleAddToWaitlist = async (conferenceId?: string) => {
        if (!conferenceId || !accessToken) {
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

    const getPurchasedTicketInfo = () => {
        if (!conference.purchasedInfo?.conferencePriceId) return null;

        const purchasedTicket = conference.conferencePrices?.find(
            (price) => price.conferencePriceId === conference.purchasedInfo?.conferencePriceId
        );

        if (!purchasedTicket) return null;

        const purchasedPhase = purchasedTicket.pricePhases?.find(
            (phase) => phase.pricePhaseId === conference.purchasedInfo?.pricePhaseId
        );

        return { ticket: purchasedTicket, phase: purchasedPhase };
    };

    // Layout cho Research Conference
    if (isResearch) {
        return (
            <div className="space-y-4">
                {/* Title Card - Full width */}
                <ConferenceTitleCard
                    conference={conference}
                    formatDate={formatDate}
                    isFavorite={isFavorite}
                    onFavoriteToggle={handleFavoriteToggle}
                    isTogglingFavorite={addingToFavourite || deletingFromFavourite}
                    accessToken={accessToken}
                    showSubscribeCard={showSubscribeCard}
                    isResearch={isResearch}
                />

                {/* Subscribe Card - Full width */}
                {showSubscribeCard && (
                    <ConferenceSubscribeCard
                        conference={conference}
                        formatDate={formatDate}
                        onOpenDialog={() => setIsDialogOpen(true)}
                        purchasedTicketInfo={getPurchasedTicketInfo()}
                        isResearch={isResearch}
                    />
                )}

                {/* Description Card - Full width */}
                <ConferenceDescriptionCard
                    conference={conference}
                    isResearch={isResearch}
                />

                <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Thông tin chi tiết về hội nghị nghiên cứu
                    </h3>
                    <div className="col-span-full my-2 bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <p className="text-gray-700 text-sm italic">
                            💡 <b>Lưu ý:</b> Khi nộp bài báo (với tư cách tác giả), bạn sẽ thanh toán toàn bộ phí đăng ký ngay tại thời điểm nộp.
                            Nếu bài báo bị từ chối, hệ thống sẽ hoàn lại <b>số tiền đã thanh toán, nhưng đã trừ đi khoản phí đánh giá bài báo</b> tương ứng với hội nghị này.
                        </p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <span className="text-gray-600 text-sm">Định dạng bài báo chấp nhận:</span>
                            <p className="text-gray-900 font-medium">
                                {(conference as ResearchConferenceDetailResponse).paperFormat ||
                                    "Chưa có thông tin về định dạng bài báo"}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-600 text-sm">Số lượng bài báo tối đa chấp nhận:</span>
                            <p className="text-gray-900 font-medium">
                                {(conference as ResearchConferenceDetailResponse).numberPaperAccept !== undefined
                                    ? (conference as ResearchConferenceDetailResponse).numberPaperAccept
                                    : "Chưa xác định số lượng bài báo được chấp nhận"}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-600 text-sm">Số vòng chỉnh sửa tối đa:</span>
                            <p className="text-gray-900 font-medium">
                                {(conference as ResearchConferenceDetailResponse).revisionAttemptAllowed !== undefined
                                    ? (conference as ResearchConferenceDetailResponse).revisionAttemptAllowed
                                    : "Chưa xác định số lần sửa đổi tối đa"}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-600 text-sm">Cho phép thính giả tham dự?</span>
                            <p className="text-gray-900 font-medium">
                                {(conference as ResearchConferenceDetailResponse).allowListener !== undefined
                                    ? (conference as ResearchConferenceDetailResponse).allowListener
                                        ? "Có"
                                        : "Không"
                                    : "Chưa xác định chính sách người nghe"}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-600 text-sm">Giá trị xếp hạng:</span>
                            <p className="text-gray-900 font-medium">
                                {(conference as ResearchConferenceDetailResponse).rankValue ||
                                    "Chưa có thông tin về giá trị xếp hạng"}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-600 text-sm">Năm xếp hạng:</span>
                            <p className="text-gray-900 font-medium">
                                {(conference as ResearchConferenceDetailResponse).rankYear ||
                                    "Chưa có thông tin về năm xếp hạng"}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-600 text-sm">
                                Phí review bài báo <br />
                                <span className="text-gray-500 text-xs italic">
                                    (Khoản phí này đã được tính gộp vào phí đăng ký tham dự nếu bạn đăng ký với tư cách <b>tác giả</b>)
                                </span>
                            </span>
                            <p className="text-gray-900 font-medium">
                                {(conference as ResearchConferenceDetailResponse).reviewFee !== undefined
                                    ? `${(conference as ResearchConferenceDetailResponse).reviewFee?.toLocaleString("vi-VN")}₫`
                                    : "Phí đánh giá bài báo chưa xác định"}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-600 text-sm">Ranking Category Name:</span>
                            <p className="text-gray-900 font-medium">
                                {(conference as ResearchConferenceDetailResponse).rankingCategoryName ||
                                    "Chưa có thông tin về danh mục xếp hạng"}
                            </p>
                        </div>
                        <div className="col-span-full">
                            <span className="text-gray-600 text-sm">Ranking Description:</span>
                            <p className="text-gray-900 mt-1">
                                {(conference as ResearchConferenceDetailResponse).rankingDescription ||
                                    "Chưa có mô tả về xếp hạng"}
                            </p>
                        </div>
                    </div>
                </div>

                <TicketSelectionDialog
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    conference={conference}
                    formatDate={formatDate}
                    selectedTicket={selectedTicket}
                    onSelectTicket={onSelectTicket}
                    authorInfo={authorInfo}
                    onAuthorInfoChange={onAuthorInfoChange}
                    showAuthorForm={showAuthorForm}
                    onToggleAuthorForm={setShowAuthorForm}
                    selectedPaymentMethod={selectedPaymentMethod}
                    onSelectPaymentMethod={onSelectPaymentMethod}
                    showPaymentMethods={showPaymentMethods}
                    onTogglePaymentMethods={setShowPaymentMethods}
                    paymentMethods={paymentMethods}
                    paymentMethodsLoading={paymentMethodsLoading}
                    paymentLoading={paymentLoading}
                    onPurchase={handlePurchaseTicket}
                    onAddToWaitlist={handleAddToWaitlist}
                    addingToWaitListLoading={addingToWaitListLoading}
                    accessToken={accessToken}
                />
            </div>
        );
    }

    // Layout cũ cho Technical Conference
    return (
        <div className="relative max-w-6xl mx-auto px-4 py-8 md:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-32 md:mt-48">
                <div className={showSubscribeCard ? "lg:col-span-2 h-full" : "lg:col-span-3 h-full"}>
                    <ConferenceTitleCard
                        conference={conference}
                        formatDate={formatDate}
                        isFavorite={isFavorite}
                        onFavoriteToggle={handleFavoriteToggle}
                        isTogglingFavorite={addingToFavourite || deletingFromFavourite}
                        accessToken={accessToken}
                        showSubscribeCard={showSubscribeCard}
                        isResearch={isResearch}
                    />
                </div>

                {showSubscribeCard && (
                    <ConferenceSubscribeCard
                        conference={conference}
                        formatDate={formatDate}
                        onOpenDialog={() => setIsDialogOpen(true)}
                        purchasedTicketInfo={getPurchasedTicketInfo()}
                        isResearch={isResearch}
                    />
                )}
            </div>

            <ConferenceDescriptionCard
                conference={conference}
                isResearch={isResearch}
            />

            <TicketSelectionDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                conference={conference}
                formatDate={formatDate}
                selectedTicket={selectedTicket}
                onSelectTicket={onSelectTicket}
                authorInfo={authorInfo}
                onAuthorInfoChange={onAuthorInfoChange}
                showAuthorForm={showAuthorForm}
                onToggleAuthorForm={setShowAuthorForm}
                selectedPaymentMethod={selectedPaymentMethod}
                onSelectPaymentMethod={onSelectPaymentMethod}
                showPaymentMethods={showPaymentMethods}
                onTogglePaymentMethods={setShowPaymentMethods}
                paymentMethods={paymentMethods}
                paymentMethodsLoading={paymentMethodsLoading}
                paymentLoading={paymentLoading}
                onPurchase={handlePurchaseTicket}
                onAddToWaitlist={handleAddToWaitlist}
                addingToWaitListLoading={addingToWaitListLoading}
                accessToken={accessToken}
            />
        </div>
    );
};

// import React, { useEffect, useState } from "react";
// import { useTransaction } from "@/redux/hooks/useTransaction";
// import { useConference } from "@/redux/hooks/useConference";
// import { usePaperCustomer } from "@/redux/hooks/usePaper";
// import { toast } from "sonner";
// import {
//     ConferencePriceResponse,
//     ResearchConferenceDetailResponse,
//     TechnicalConferenceDetailResponse,
// } from "@/types/conference.type";

// import ConferenceTitleCard from "./ConferenceTitleCard";
// import ConferenceSubscribeCard from "./ConferenceSubscribeCard";
// import ConferenceDescriptionCard from "./ConferenceDescriptionCard";
// import TicketSelectionDialog from "./TicketSelectionDialog";

// interface ConferenceHeaderProps {
//     conference: TechnicalConferenceDetailResponse | ResearchConferenceDetailResponse;
//     accessToken: string | null;
//     formatDate: (dateString?: string) => string;
//     handlePurchaseTicket: () => void;
//     selectedTicket: ConferencePriceResponse | null;
//     onSelectTicket: (ticket: ConferencePriceResponse | null) => void;
//     authorInfo: { title: string; description: string };
//     onAuthorInfoChange: (info: { title: string; description: string }) => void;
//     selectedPaymentMethod: string | null;
//     onSelectPaymentMethod: (id: string | null) => void;
// }

// const ConferenceHeader: React.FC<ConferenceHeaderProps> = ({
//     conference,
//     accessToken,
//     formatDate,
//     handlePurchaseTicket,
//     selectedTicket,
//     onSelectTicket,
//     authorInfo,
//     onAuthorInfoChange,
//     selectedPaymentMethod,
//     onSelectPaymentMethod,
// }) => {
//     const [isDialogOpen, setIsDialogOpen] = useState(false);
//     // const [selectedTicket, setSelectedTicket] = useState<ConferencePriceResponse | null>(null);
//     // const [authorInfo, setAuthorInfo] = useState({ title: "", description: "" });
//     const [showAuthorForm, setShowAuthorForm] = useState(false);
//     // const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
//     const [showPaymentMethods, setShowPaymentMethods] = useState(false);

//     const {
//         lazyFavouriteConferences,
//         addFavourite,
//         removeFavourite,
//         addingToFavourite,
//         deletingFromFavourite,
//         fetchFavouriteConferences,
//     } = useConference();

//     const { paymentMethods, loading: paymentMethodsLoading, fetchAllPaymentMethods } = useTransaction();
//     const { handleAddToWaitList, addingToWaitListLoading } = usePaperCustomer();

//     const [isFavorite, setIsFavorite] = useState(false);
//     const [paymentLoading, setPaymentLoading] = useState(false);

//     const showSubscribeCard =
//         conference.isResearchConference ||
//         conference.isInternalHosted ||
//         !!conference.contract?.isTicketSelling;

//     // const showSubscribeCard =
//     //     conference.isResearchConference ||
//     //     (!conference.isResearchConference &&
//     //         !conference.isInternalHosted &&
//     //         conference.contract?.isTicketSelling);

//     useEffect(() => {
//         if (accessToken) {
//             fetchFavouriteConferences();
//         }
//     }, [accessToken, fetchFavouriteConferences]);

//     useEffect(() => {
//         if (accessToken && lazyFavouriteConferences && conference.conferenceId) {
//             const isInFavorites = lazyFavouriteConferences.some(
//                 (fav) => fav.conferenceId === conference.conferenceId
//             );
//             setIsFavorite(isInFavorites);
//         } else {
//             setIsFavorite(false);
//         }
//     }, [accessToken, lazyFavouriteConferences, conference.conferenceId]);

//     useEffect(() => {
//         if (isDialogOpen) {
//             fetchAllPaymentMethods();
//         }
//     }, [isDialogOpen]);

//     const handleFavoriteToggle = async () => {
//         if (!conference.conferenceId || !accessToken) {
//             toast.error("Vui lòng đăng nhập để sử dụng tính năng này");
//             return;
//         }

//         try {
//             if (isFavorite) {
//                 await removeFavourite(conference.conferenceId);
//                 toast.success("Đã bỏ khỏi danh sách yêu thích");
//             } else {
//                 await addFavourite(conference.conferenceId);
//                 toast.success("Đã thêm vào danh sách yêu thích");
//             }
//             fetchFavouriteConferences();
//         } catch (error) {
//             toast.error("Có lỗi xảy ra, vui lòng thử lại");
//             console.error("Favorite toggle error:", error);
//         }
//     };

//     const handleAddToWaitlist = async (conferenceId?: string) => {
//         if (!conferenceId || !accessToken) {
//             toast.error("Vui lòng đăng nhập để sử dụng tính năng này");
//             return;
//         }

//         try {
//             await handleAddToWaitList(conferenceId);
//             toast.success("Đã thêm vào danh sách chờ thành công!");
//         } catch (error) {
//             toast.error("Có lỗi xảy ra, vui lòng thử lại");
//             console.error("Add to waitlist error:", error);
//         }
//     };

//     // const handlePurchaseTicket = () => {
//     //     // Implement your purchase logic here
//     //     setPaymentLoading(true);
//     //     // Your API call...
//     //     setTimeout(() => setPaymentLoading(false), 2000);
//     // };

//     const getPurchasedTicketInfo = () => {
//         if (!conference.purchasedInfo?.conferencePriceId) return null;

//         const purchasedTicket = conference.conferencePrices?.find(
//             (price) => price.conferencePriceId === conference.purchasedInfo?.conferencePriceId
//         );

//         if (!purchasedTicket) return null;

//         const purchasedPhase = purchasedTicket.pricePhases?.find(
//             (phase) => phase.pricePhaseId === conference.purchasedInfo?.pricePhaseId
//         );

//         return { ticket: purchasedTicket, phase: purchasedPhase };
//     };

//     return (
//         <div className="relative max-w-6xl mx-auto px-4 py-8 md:py-16">
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-32 md:mt-48">
//                 {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-32 md:mt-48 items-stretch"> */}
//                 <div className={showSubscribeCard ? "lg:col-span-2 h-full" : "lg:col-span-3 h-full"}>
//                     <ConferenceTitleCard
//                         conference={conference}
//                         formatDate={formatDate}
//                         isFavorite={isFavorite}
//                         onFavoriteToggle={handleFavoriteToggle}
//                         isTogglingFavorite={addingToFavourite || deletingFromFavourite}
//                         accessToken={accessToken}
//                         showSubscribeCard={showSubscribeCard}
//                     />
//                 </div>

//                 {showSubscribeCard && (
//                     <ConferenceSubscribeCard
//                         conference={conference}
//                         formatDate={formatDate}
//                         onOpenDialog={() => setIsDialogOpen(true)}
//                         purchasedTicketInfo={getPurchasedTicketInfo()}
//                     />
//                 )}
//             </div>

//             <ConferenceDescriptionCard conference={conference} />

//             <TicketSelectionDialog
//                 isOpen={isDialogOpen}
//                 onClose={() => setIsDialogOpen(false)}
//                 conference={conference}
//                 formatDate={formatDate}
//                 selectedTicket={selectedTicket}
//                 onSelectTicket={onSelectTicket}
//                 authorInfo={authorInfo}
//                 onAuthorInfoChange={onAuthorInfoChange}
//                 showAuthorForm={showAuthorForm}
//                 onToggleAuthorForm={setShowAuthorForm}
//                 selectedPaymentMethod={selectedPaymentMethod}
//                 onSelectPaymentMethod={onSelectPaymentMethod}
//                 showPaymentMethods={showPaymentMethods}
//                 onTogglePaymentMethods={setShowPaymentMethods}
//                 paymentMethods={paymentMethods}
//                 paymentMethodsLoading={paymentMethodsLoading}
//                 paymentLoading={paymentLoading}
//                 onPurchase={handlePurchaseTicket}
//                 onAddToWaitlist={handleAddToWaitlist}
//                 addingToWaitListLoading={addingToWaitListLoading}
//                 accessToken={accessToken}
//             />
//         </div>
//     );
// };

export default ConferenceHeader;