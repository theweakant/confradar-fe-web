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
import SubmissionFormDialog from "../../../papers/SubmissionFormDialog";
import { parseApiError } from "@/helper/api";
import { useGlobalTime } from "@/utils/TimeContext";

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
    onSelectPaper?: (paperId: string | null) => void;

    activeTab?: string;
    onTabChange?: (tab: string) => void;

    active: boolean;
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
    onSelectPaper,

    activeTab,
    onTabChange,

    active
}) => {
    const { now, useFakeTime } = useGlobalTime();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [userType, setUserType] = useState<'author' | 'listener'>('listener');
    const [showAuthorForm, setShowAuthorForm] = useState(false);
    const [showPaymentMethods, setShowPaymentMethods] = useState(false);
    const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const {
        lazyFavouriteConferences,
        addFavourite,
        removeFavourite,
        addingToFavourite,
        deletingFromFavourite,
        fetchFavouriteConferences,
    } = useConference();

    const {
        fetchAvailableCustomers,
        handleSubmitAbstract,
        handleUpdateAbstract,
        submitAbstractError,
        updateAbstractError,
        loading: submitLoading
    } = usePaperCustomer();

    const { paymentMethods, loading: paymentMethodsLoading, fetchAllPaymentMethods } = useTransaction();
    const { handleAddToWaitList, addingToWaitListLoading } = usePaperCustomer();

    const [isFavorite, setIsFavorite] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);

    const isResearch = conference.isResearchConference;

    const showSubscribeCard =
        conference.isResearchConference ||
        conference.isInternalHosted ||
        !!conference.contract?.isTicketSelling;

    const isUserDisabled = accessToken && active === false;

    const submittedPaper = isResearch ? (conference as ResearchConferenceDetailResponse).submittedPaper : null;
    const hasSubmittedPaper = submittedPaper?.paperId != null;


    useEffect(() => {
        if (submitAbstractError) toast.error(parseApiError<string>(submitAbstractError)?.data?.message)
        if (updateAbstractError) toast.error(parseApiError<string>(updateAbstractError)?.data?.message)
    }, [submitAbstractError, updateAbstractError]);


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

    console.log("🔥 conference FULL OBJECT:", conference);

    const getNextAvailablePhase = () => {
        if (!conference.isResearchConference) return null;

        const researchConf = conference as ResearchConferenceDetailResponse;
        const researchPhases = researchConf.researchPhase || [];

        // Tìm phase hiện tại
        const currentPhase = researchPhases.find(phase => {
            if (!phase.authorPaymentStart || !phase.authorPaymentEnd) return false;
            const start = new Date(phase.authorPaymentStart);
            const end = new Date(phase.authorPaymentEnd);
            return phase.isActive && now >= start && now <= end;
        });

        if (currentPhase) return null;

        // Tìm phase tiếp theo
        const sortedPhases = [...researchPhases].sort((a, b) => (a.phaseOrder || 0) - (b.phaseOrder || 0));
        const nextPhase = sortedPhases.find(phase => {
            if (!phase.authorPaymentStart) return false;
            const start = new Date(phase.authorPaymentStart);
            return phase.isActive && start > now;
        });

        if (!nextPhase) return null;

        // Check xem có vé available không
        const authorTickets = (conference.conferencePrices || []).filter(ticket => ticket.isAuthor);
        const hasAvailableSlots = authorTickets.some(ticket => {
            return ticket.pricePhases?.some(pricePhase => (pricePhase.availableSlot ?? 0) > 0);
        });

        return {
            phase: nextPhase,
            hasAvailableSlots
        };
    };

    const nextPhaseInfo = getNextAvailablePhase();

    const handleOpenDialog = (type: 'author' | 'listener') => {
        setUserType(type);
        setIsDialogOpen(true);
    };

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

    if (isResearch) {
        return (
            <div className="relative max-w-6xl mx-auto px-4 py-4 md:py-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 my-5 md:mt-5">
                    {/* TitleCard*/}
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
                            activeTab={activeTab}
                            onTabChange={onTabChange}
                        />
                    </div>

                    {/* SubscribeCard */}
                    {showSubscribeCard && (
                        isUserDisabled ? (
                            <div className="rounded-xl border border-red-300 bg-red-50 p-5 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <svg
                                        className="w-6 h-6 text-red-600 flex-shrink-0"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <div>
                                        <p className="font-semibold text-red-700 mb-1">
                                            Tài khoản đã bị vô hiệu hóa
                                        </p>
                                        <p className="text-sm text-red-600">
                                            Bạn không thể đăng ký thêm bất kỳ hội nghị hoặc hội thảo nào.
                                            Vui lòng liên hệ ban quản trị để được hỗ trợ.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <ConferenceSubscribeCard
                                conference={conference}
                                formatDate={formatDate}
                                onOpenDialog={handleOpenDialog}
                                purchasedTicketInfo={getPurchasedTicketInfo()}
                                isResearch={isResearch}
                                onOpenAbstractDialog={() => setIsSubmitDialogOpen(true)}
                                hasSubmittedPaper={hasSubmittedPaper}
                                submittedPaper={submittedPaper}
                                onSelectPaper={onSelectPaper}
                                accessToken={accessToken}
                            />
                        )
                    )}
                </div>

                {/* DescriptionCard full width */}
                <ConferenceDescriptionCard
                    conference={conference}
                    isResearch={isResearch}
                />

                {/* Dialog */}
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
                    userType={userType}
                    nextPhaseInfo={nextPhaseInfo}
                />


                <SubmissionFormDialog
                    isOpen={isSubmitDialogOpen}
                    onClose={() => setIsSubmitDialogOpen(false)}
                    onSubmit={async (data) => {
                        try {
                            const result = await handleSubmitAbstract({
                                abstractFile: data.file!,
                                conferenceId: conference.conferenceId!,
                                title: data.title,
                                description: data.description,
                                // conferenceSessionId: data.conferenceSessionId!,
                            });

                            if (result.success) {
                                toast.success("Nộp abstract thành công!");
                                // onSubmittedAbstract?.();
                                return { success: true };
                            }
                            // }
                            return { success: false };
                        } catch (error) {
                            return { success: false };
                        }
                    }}
                    title={"Nộp Abstract"}
                    loading={submitLoading}
                    includeCoauthors={true}
                    shouldCloseOnSuccess={false}
                    conferenceSessions={(conference as ResearchConferenceDetailResponse).researchSessions}
                    conferenceName={conference.conferenceName}
                />
            </div>
        );
    }

    return (
        <div className="relative max-w-6xl mx-auto px-4 py-4 md:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5 md:mt-10">
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
                    isUserDisabled ? (
                        <div className="rounded-xl border border-red-300 bg-red-50 p-5 shadow-sm">
                            <div className="flex items-start gap-3">
                                <svg
                                    className="w-6 h-6 text-red-600 flex-shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <div>
                                    <p className="font-semibold text-red-700 mb-1">
                                        Tài khoản đã bị vô hiệu hóa
                                    </p>
                                    <p className="text-sm text-red-600">
                                        Bạn không thể đăng ký thêm bất kỳ hội nghị hoặc hội thảo nào.
                                        Vui lòng liên hệ ban quản trị để được hỗ trợ.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <ConferenceSubscribeCard
                            conference={conference}
                            formatDate={formatDate}
                            onOpenDialog={() => setIsDialogOpen(true)}
                            purchasedTicketInfo={getPurchasedTicketInfo()}
                            isResearch={isResearch}

                            accessToken={null}
                        />
                    )
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

export default ConferenceHeader;