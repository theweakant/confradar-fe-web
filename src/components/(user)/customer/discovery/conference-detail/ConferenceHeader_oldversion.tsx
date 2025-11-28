import { MapPin, Calendar, Star } from "lucide-react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import {
  ConferencePriceResponse,
  ResearchConferenceDetailResponse,
  TechnicalConferenceDetailResponse,
} from "@/types/conference.type";
import { getCurrentPrice } from "@/helper/conference";
import React, { useEffect, useState } from "react";
import { useTransaction } from "@/redux/hooks/useTransaction";
import { useConference } from "@/redux/hooks/useConference";
import { usePaperCustomer } from "@/redux/hooks/usePaper";
import { toast } from "sonner";

interface ConferenceHeaderProps {
  conference:
  | TechnicalConferenceDetailResponse
  | ResearchConferenceDetailResponse;
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
  selectedPaymentMethod: string | null;
  setSelectedPaymentMethod: (id: string | null) => void;
  showPaymentMethods: boolean;
  setShowPaymentMethods: (show: boolean) => void;
}

const ConferenceHeader: React.FC<ConferenceHeaderProps> = ({
  conference,
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
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  showPaymentMethods,
  setShowPaymentMethods,
}) => {
  const {
    lazyFavouriteConferences,
    addFavourite,
    removeFavourite,
    addingToFavourite,
    deletingFromFavourite,
    fetchFavouriteConferences,
  } = useConference();

  const [isFavorite, setIsFavorite] = useState(false);

  const isResearch = conference.isResearchConference;

  useEffect(() => {
    if (accessToken) {
      fetchFavouriteConferences();
    }
  }, [accessToken, fetchFavouriteConferences]);

  useEffect(() => {
    if (accessToken && lazyFavouriteConferences && conference.conferenceId) {
      const isInFavorites = lazyFavouriteConferences.some(
        (fav) => fav.conferenceId === conference.conferenceId,
      );
      setIsFavorite(isInFavorites);
    } else {
      setIsFavorite(false);
    }
  }, [accessToken, lazyFavouriteConferences, conference.conferenceId]);

  const getPurchasedTicketInfo = () => {
    if (!conference.purchasedInfo?.conferencePriceId) return null;

    const purchasedTicket = conference.conferencePrices?.find(
      price => price.conferencePriceId === conference.purchasedInfo?.conferencePriceId
    );

    if (!purchasedTicket) return null;

    const purchasedPhase = purchasedTicket.pricePhases?.find(
      phase => phase.pricePhaseId === conference.purchasedInfo?.pricePhaseId
    );

    return {
      ticket: purchasedTicket,
      phase: purchasedPhase
    };
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
      // Refetch favorites to update the list
      fetchFavouriteConferences();
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
      console.error("Favorite toggle error:", error);
    }
  };

  const {
    paymentMethods,
    loading: paymentMethodsLoading,
    fetchAllPaymentMethods,
  } = useTransaction();

  const { handleAddToWaitList, addingToWaitListLoading } = usePaperCustomer();

  useEffect(() => {
    if (isDialogOpen) {
      fetchAllPaymentMethods();
    }
  }, [isDialogOpen]);

  // Handle add to waitlist
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

  return (
    <div className="relative max-w-6xl mx-auto px-4 py-8 md:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-32 md:mt-48">
        {/* Title Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/90 via-gray-900/80 to-slate-900/70 backdrop-blur-md rounded-2xl shadow-lg p-6 md:p-8 text-white">
          <div className="flex items-start gap-3 mb-4">
            <h1
              className="text-2xl md:text-3xl font-bold flex-1
             bg-gradient-to-r from-sky-400 via-indigo-400 to-blue-300
             bg-clip-text text-transparent drop-shadow-[0_2px_6px_rgba(56,189,248,0.4)]"
            //                 className="text-2xl md:text-3xl font-bold flex-1
            //    bg-gradient-to-r from-black to-blue-950
            //    bg-clip-text text-transparent drop-shadow-lg"
            >
              {conference.conferenceName}
            </h1>
            {accessToken && (
              <button
                onClick={handleFavoriteToggle}
                disabled={addingToFavourite || deletingFromFavourite}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
              >
                <Star
                  className={`w-6 h-6 transition-colors ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-white"} ${addingToFavourite || deletingFromFavourite ? "animate-pulse" : ""}`}
                />
              </button>
            )}

            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
              {conference.isResearchConference ? "Nghiên cứu" : "Công nghệ"}
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
                <span className="text-sm">
                  Số người tham dự tối đa: {conference.totalSlot} người
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Subscribe Card */}
        <div className="bg-gradient-to-br from-slate-800/90 via-gray-900/80 to-slate-900/70 backdrop-blur-md rounded-2xl shadow-lg p-6 text-white">
          <h3
            className="text-xl font-bold mb-3 bg-gradient-to-r from-sky-400 via-indigo-400 to-blue-300
             bg-clip-text text-transparent drop-shadow-[0_2px_6px_rgba(56,189,248,0.4)]"
          >Đăng ký ngay</h3>
          <p className="text-white text-sm mb-4">
            Nhấn để chọn khung giá vé và thanh toán
          </p>
          {(() => {
            const purchasedInfo = getPurchasedTicketInfo();

            if (purchasedInfo) {
              return (
                <div className="space-y-3">
                  <div className="p-4 bg-green-500/20 border border-green-400/40 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="text-green-300 font-semibold mb-1">
                          Bạn đã mua vé thành công!
                        </p>
                        <div className="text-sm text-green-200/80 space-y-1">
                          <p>
                            <span className="font-medium">Loại vé:</span> {purchasedInfo.ticket.ticketName}
                          </p>
                          {purchasedInfo.phase && (
                            <p>
                              <span className="font-medium">Giai đoạn:</span> {purchasedInfo.phase.phaseName}
                            </p>
                          )}
                          <p>
                            <span className="font-medium">Giá:</span>{" "}
                            {(purchasedInfo.ticket.ticketPrice || 0).toLocaleString("vi-VN")}₫
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled
                    className="w-full bg-gray-500/50 text-white/70 px-6 py-3 rounded-lg font-semibold
                 cursor-not-allowed opacity-60"
                  >
                    Đã sở hữu vé
                  </button>

                  <p className="text-white/60 text-xs text-center">
                    Bạn có thể xem chi tiết vé trong phần &quot;Vé của tôi&quot;
                  </p>
                </div>
              );
            }

            const now = new Date();

            const allPhases = (conference.conferencePrices || []).flatMap(ticket => ticket.pricePhases || []);

            // Phase hiện tại (đang mở bán)
            const currentPhase = allPhases.find(phase => {
              const start = new Date(phase.startDate || "");
              const end = new Date(phase.endDate || "");
              return now >= start && now <= end && (phase.availableSlot ?? 0) > 0;
            });

            // Phase bắt đầu bán vé gần nhất trong tương lai
            const futurePhases = allPhases
              .filter(phase => new Date(phase.startDate || "") > now)
              .sort((a, b) => new Date(a.startDate || "").getTime() - new Date(b.startDate || "").getTime());
            const nextPhaseStart = futurePhases.length > 0 ? new Date(futurePhases[0].startDate || "") : null;

            if (!currentPhase && nextPhaseStart) {
              return (
                <div>
                  <button
                    disabled
                    className="w-full bg-gray-500/50 text-white/70 px-6 py-3 rounded-lg font-semibold
                         cursor-not-allowed opacity-60"
                  >
                    Chưa đến lúc mở bán vé
                  </button>
                  <p className="text-white/60 text-xs mt-2 text-center">
                    Ngày bắt đầu bán vé: {formatDate(nextPhaseStart.toISOString())}
                  </p>
                </div>
              );
            }

            if (!currentPhase && !nextPhaseStart) {
              return (
                <button
                  disabled
                  className="w-full bg-red-500/50 text-white/70 px-6 py-3 rounded-lg font-semibold
                     cursor-not-allowed opacity-60"
                >
                  Đã hết thời gian bán vé
                </button>
              );
            }

            return (
              <button
                onClick={() => setIsDialogOpen(true)}
                className="w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 
                     hover:from-sky-400 hover:via-indigo-400 hover:to-violet-400
                     text-white px-6 py-3 rounded-lg font-semibold
                     shadow-lg shadow-indigo-500/30 transition-all duration-300
                     hover:scale-[1.02]"
              >
                {isResearch ? "Đăng ký tham dự" : "Mua vé"}
              </button>
            );
          })()}
        </div>

        {/* Ticket Selection Dialog */}
        <Dialog
          open={isDialogOpen}
          as="div"
          className="relative z-50 focus:outline-none"
          onClose={setIsDialogOpen}
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-xl rounded-2xl bg-white/10 backdrop-blur-2xl p-6
            text-white duration-300 ease-out data-[closed]:opacity-0 data-[closed]:scale-95
             max-h-[95vh] flex flex-col"
            >
              <DialogTitle as="h3" className="text-lg font-semibold mb-4">
                {isResearch ? "Chọn hình thức tham dự" : "Chọn loại vé"}
              </DialogTitle>

              <div
                className="space-y-3 max-h-[70vh] overflow-y-auto pr-1"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(255,255,255,0.2) transparent",
                  scrollBehavior: "smooth",
                }}
              >
                {(conference.conferencePrices || []).map((ticket) => {
                  const currentPrice = getCurrentPrice(ticket);

                  const now = new Date();
                  const currentPhase = ticket.pricePhases?.find((phase) => {
                    const startDate = new Date(phase.startDate || "");
                    const endDate = new Date(phase.endDate || "");
                    return now >= startDate && now <= endDate;
                  });

                  // Check for future phases
                  const futurePhases = ticket.pricePhases
                    ?.filter((phase) => {
                      const startDate = new Date(phase.startDate || "");
                      return startDate > now;
                    })
                    .sort(
                      (a, b) =>
                        new Date(a.startDate || "").getTime() -
                        new Date(b.startDate || "").getTime(),
                    );

                  const nextPhase =
                    futurePhases && futurePhases.length > 0
                      ? futurePhases[0]
                      : null;

                  const isBeforeSale = !currentPhase && nextPhase;
                  const currentPhaseSoldOut = currentPhase && currentPhase.availableSlot === 0;
                  const isLastPhase = !nextPhase;
                  const isTicketSoldOut = (!currentPhase || currentPhase.availableSlot === 0) &&
                    (!futurePhases || futurePhases.every(phase => phase.availableSlot === 0));

                  const hasDiscount =
                    currentPrice < (ticket.ticketPrice ?? 0) &&
                    currentPhase?.applyPercent !== undefined;

                  const isPurchasedTicket = conference.purchasedInfo?.conferencePriceId === ticket.conferencePriceId;

                  const isDisabled = currentPhaseSoldOut || isTicketSoldOut || isBeforeSale || isPurchasedTicket;

                  return (
                    <label
                      key={ticket.conferencePriceId}
                      className={`block rounded-xl p-4 border transition-all ${isDisabled
                        ? "bg-gray-500/20 border-gray-400/30 cursor-not-allowed opacity-60"
                        : selectedTicket?.conferencePriceId === ticket.conferencePriceId
                          // ? "bg-coral-500/30 border-coral-400 cursor-pointer"
                          ? "bg-coral-100 border-yellow-400 border-2 shadow-md cursor-pointer"
                          : "bg-white/10 border-white/20 hover:bg-white/20 cursor-pointer"
                        }`}
                      onClick={() => {
                        if (!isDisabled) {
                          setSelectedTicket(ticket);
                          if (ticket.isAuthor) {
                            setShowAuthorForm(true);
                          } else {
                            setShowAuthorForm(false);
                          }
                        }
                        //   if (!isDisabled) {
                        //     setSelectedTicket(ticket);
                        //     setShowAuthorForm(ticket.isAuthor);
                        //   }
                      }}
                    >
                      {/* Hidden radio input */}
                      <input
                        type="radio"
                        name="ticket"
                        value={ticket.conferencePriceId}
                        className="hidden"
                      />

                      {/* Header: Ticket name + author label + price */}
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex flex-col">
                          <span className="font-semibold text-lg">{ticket.ticketName}</span>
                          {/* {ticket.isAuthor && (
                            <span className="text-xs text-yellow-300 font-medium mt-0.5">
                              {isResearch ? "Phí đăng ký với tư cách tác giả" : "Vé dành cho tác giả"}
                            </span>
                          )} */}
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

                      {/* Ticket description */}
                      {ticket.ticketDescription && (
                        <p className="text-sm text-white/70">{ticket.ticketDescription}</p>
                      )}

                      {/* Phase info */}
                      <div className="mt-2 text-sm space-y-1">
                        {currentPhase && (
                          <div>
                            <p>
                              <span className="font-medium text-coral-200">{isResearch ? "Giai đoạn phí tham dự hiện tại" : "Giai đoạn vé hiện tại:"}</span>{" "}
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
                                <span className="font-medium">Hiệu lực:</span>{" "}
                                {formatDate(currentPhase.startDate)} → {formatDate(currentPhase.endDate)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Status messages */}

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
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-green-300 font-medium">Đã mua</span>
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>

              {/* Author ticket waitlist logic */}
              {(() => {
                const authorTickets = (
                  conference.conferencePrices || []
                ).filter((ticket) => ticket.isAuthor);
                const allAuthorTicketsSoldOut =
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

                    const currentPhaseAvailable =
                      (currentPhase?.availableSlot ?? 0) > 0;
                    const futurePhaseAvailable = futurePhases?.some(
                      (phase) => (phase.availableSlot ?? 0) > 0,
                    );

                    return !currentPhaseAvailable && !futurePhaseAvailable;
                  });

                return (
                  allAuthorTicketsSoldOut && (
                    <div className="mt-4 p-4 bg-orange-500/20 border border-orange-400/40 rounded-xl">
                      <p className="text-sm text-orange-200 mb-3">
                        Loại vé cho tác giả hiện đang hết, bạn vui lòng xác nhận
                        thêm vào danh sách chờ để nhận được thông báo khi vé mở
                        lại, hoặc đăng ký với tư cách thính giả.
                      </p>
                      <button
                        onClick={() =>
                          handleAddToWaitlist(conference.conferenceId)
                        }
                        disabled={addingToWaitListLoading}
                        className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                      >
                        {addingToWaitListLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <svg
                              className="animate-spin h-4 w-4 text-white"
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
                        ) : (
                          "Thêm vào danh sách chờ"
                        )}
                      </button>
                    </div>
                  )
                );
              })()}

              {selectedTicket && (
                <div className="mt-4 flex-shrink-0">
                  {/* Container cho cả 2 controls cùng hàng */}
                  <div className="flex gap-2">
                    {/* Author Form Button */}
                    {selectedTicket.isAuthor && (
                      <button
                        onClick={() => setShowAuthorForm(!showAuthorForm)}
                        className="flex-1 flex items-center justify-between p-3 rounded-lg 
                               bg-gradient-to-r from-yellow-500/20 to-orange-500/20 
                               border border-yellow-400/40 hover:border-yellow-400/60 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-yellow-300"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path
                              fillRule="evenodd"
                              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm font-medium text-yellow-300">
                            Bài báo{" "}
                            {authorInfo.title && authorInfo.description && "✓"}
                          </span>
                        </div>
                        <svg
                          className={`w-5 h-5 text-yellow-300 transition-transform ${showAuthorForm ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    )}

                    {/* Payment Method Dropdown */}
                    <div
                      className={`${selectedTicket.isAuthor ? "flex-1" : "w-full"} relative`}
                    >
                      <button
                        onClick={() =>
                          setShowPaymentMethods(!showPaymentMethods)
                        }
                        className="w-full flex items-center justify-between p-3 rounded-lg 
                               bg-gradient-to-r from-indigo-500/20 to-purple-500/20 
                               border border-indigo-400/40 hover:border-indigo-400/60 
                               transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <svg
                            className="w-5 h-5 text-indigo-300 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                          <span className="text-sm font-medium text-indigo-200 truncate">
                            {selectedPaymentMethod ? (
                              paymentMethods.find(
                                (pm) =>
                                  pm.paymentMethodId === selectedPaymentMethod,
                              )?.methodName
                            ) : (
                              <>
                                Phương Thức Thanh toán{" "}
                                <span className="text-red-400">*</span>
                              </>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {selectedPaymentMethod && (
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          )}
                          <svg
                            className={`w-4 h-4 text-indigo-300 transition-transform duration-200 
                                       ${showPaymentMethods ? "rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </button>

                      {/* Dropdown Menu */}
                      {showPaymentMethods && (
                        <>
                          {/* Overlay để đóng dropdown khi click outside */}
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowPaymentMethods(false)}
                          />

                          {/* Dropdown Content */}
                          <div
                            className="absolute bottom-full left-0 right-0 mt-2 z-20 
                                      bg-gray-900/95 backdrop-blur-xl rounded-xl 
                                      border border-indigo-400/30 shadow-2xl shadow-indigo-500/20
                                      overflow-hidden animate-slideDown"
                          >
                            {paymentMethodsLoading ? (
                              <div className="flex items-center justify-center p-6">
                                <svg
                                  className="animate-spin h-5 w-5 text-indigo-400"
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
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                                <span className="ml-2 text-sm text-white/60">
                                  Đang tải...
                                </span>
                              </div>
                            ) : (
                              <div
                                className="max-h-64 overflow-y-auto"
                                style={{
                                  scrollbarWidth: "thin",
                                  scrollbarColor:
                                    "rgba(139, 92, 246, 0.4) transparent",
                                }}
                              >
                                {paymentMethods.map((method, index) => (
                                  <button
                                    key={method.paymentMethodId}
                                    onClick={() => {
                                      setSelectedPaymentMethod(
                                        method.paymentMethodId,
                                      );
                                      setShowPaymentMethods(false);
                                    }}
                                    className={`w-full p-3 flex items-center gap-3 transition-all duration-150
                                                       hover:bg-indigo-500/20 border-b border-white/5 last:border-0
                                                       ${selectedPaymentMethod ===
                                        method.paymentMethodId
                                        ? "bg-indigo-500/20"
                                        : "bg-transparent"
                                      }`}
                                    style={{
                                      animationDelay: `${index * 30}ms`,
                                    }}
                                  >
                                    {/* Icon */}
                                    <div
                                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                                                           transition-colors ${selectedPaymentMethod ===
                                          method.paymentMethodId
                                          ? "bg-indigo-500/40"
                                          : "bg-white/5"
                                        }`}
                                    >
                                      {selectedPaymentMethod ===
                                        method.paymentMethodId ? (
                                        <svg
                                          className="w-4 h-4 text-green-400"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      ) : (
                                        <svg
                                          className="w-4 h-4 text-white/40"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                          />
                                        </svg>
                                      )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 text-left min-w-0">
                                      <div
                                        className={`font-medium text-sm truncate ${selectedPaymentMethod ===
                                          method.paymentMethodId
                                          ? "text-indigo-200"
                                          : "text-white/90"
                                          }`}
                                      >
                                        {method.methodName}
                                      </div>
                                      {method.methodDescription && (
                                        <div className="text-xs text-white/50 truncate mt-0.5">
                                          {method.methodDescription}
                                        </div>
                                      )}
                                    </div>

                                    {/* Selected indicator */}
                                    {selectedPaymentMethod ===
                                      method.paymentMethodId && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0 animate-pulse" />
                                      )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Author Form Content - Vẫn expand/collapse như cũ */}
                  {selectedTicket.isAuthor && (
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${showAuthorForm
                        ? "max-h-96 opacity-100 mt-3"
                        : "max-h-0 opacity-0"
                        }`}
                    >
                      <div className="space-y-3 p-3 bg-black/20 rounded-lg border border-yellow-400/20">
                        <p className="text-xs text-yellow-200/80 leading-relaxed">
                          💡 Viết tiêu đề và mô tả bài báo. Có thể chỉnh sửa sau
                          tại <strong>&quot;Bài báo của tôi&quot;</strong>
                        </p>
                        <div>
                          <label className="block text-xs font-medium mb-1.5 text-white/90">
                            Tiêu đề <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={authorInfo.title}
                            onChange={(e) =>
                              setAuthorInfo({
                                ...authorInfo,
                                title: e.target.value,
                              })
                            }
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
                            value={authorInfo.description}
                            onChange={(e) =>
                              setAuthorInfo({
                                ...authorInfo,
                                description: e.target.value,
                              })
                            }
                            placeholder="Nhập mô tả ngắn gọn..."
                            rows={3}
                            className="w-full px-3 py-2 text-sm rounded-lg bg-white/10 border border-white/30 
                                     text-white placeholder-white/40 focus:outline-none focus:border-yellow-400
                                     focus:ring-1 focus:ring-yellow-400/30 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
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
                  disabled={
                    !selectedTicket ||
                    paymentLoading ||
                    !selectedPaymentMethod ||
                    (selectedTicket?.isAuthor &&
                      (!authorInfo.title.trim() ||
                        !authorInfo.description.trim()))
                  }
                  className="px-5 py-2 rounded-lg bg-coral-500 hover:bg-coral-600 
                     disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                >
                  {paymentLoading ? (
                    <div className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-white"
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
                    isResearch ? "Đăng ký" : "Thanh toán"
                  ) : (
                    "Đăng nhập"
                  )}
                </button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      </div>

      {/* Description Card */}
      <div className="mt-4 bg-gradient-to-br from-slate-800/90 via-gray-900/80 to-slate-900/70 backdrop-blur-md rounded-2xl shadow-lg p-6 md:p-8 text-white">
        <p className="text-white leading-relaxed mb-3">
          {conference.description}
        </p>
        {conference.policies && conference.policies.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Chính sách:</h4>
            <div className="space-y-2">
              {conference.policies.map((policy) => (
                <div key={policy.policyId} className="text-sm">
                  <span className="font-medium">{policy.policyName}:</span>{" "}
                  {policy.description}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConferenceHeader;
