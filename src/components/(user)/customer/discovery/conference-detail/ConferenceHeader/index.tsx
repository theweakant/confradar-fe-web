// ConferenceHeader.tsx
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
}

const ConferenceHeader: React.FC<ConferenceHeaderProps> = ({
    conference,
    accessToken,
    formatDate,
    handlePurchaseTicket
}) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<ConferencePriceResponse | null>(null);
    const [authorInfo, setAuthorInfo] = useState({ title: "", description: "" });
    const [showAuthorForm, setShowAuthorForm] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
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

    // const handlePurchaseTicket = () => {
    //     // Implement your purchase logic here
    //     setPaymentLoading(true);
    //     // Your API call...
    //     setTimeout(() => setPaymentLoading(false), 2000);
    // };

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

    return (
        <div className="relative max-w-6xl mx-auto px-4 py-8 md:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-32 md:mt-48">
                <ConferenceTitleCard
                    conference={conference}
                    formatDate={formatDate}
                    isFavorite={isFavorite}
                    onFavoriteToggle={handleFavoriteToggle}
                    isTogglingFavorite={addingToFavourite || deletingFromFavourite}
                    accessToken={accessToken}
                />

                <ConferenceSubscribeCard
                    conference={conference}
                    formatDate={formatDate}
                    onOpenDialog={() => setIsDialogOpen(true)}
                    purchasedTicketInfo={getPurchasedTicketInfo()}
                />
            </div>

            <ConferenceDescriptionCard conference={conference} />

            <TicketSelectionDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                conference={conference}
                formatDate={formatDate}
                selectedTicket={selectedTicket}
                onSelectTicket={setSelectedTicket}
                authorInfo={authorInfo}
                onAuthorInfoChange={setAuthorInfo}
                showAuthorForm={showAuthorForm}
                onToggleAuthorForm={setShowAuthorForm}
                selectedPaymentMethod={selectedPaymentMethod}
                onSelectPaymentMethod={setSelectedPaymentMethod}
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