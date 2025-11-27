"use client";

import {
  Ticket,
  Calendar,
  ExternalLink,
  QrCode,
  Download,
  Clock,
  CreditCard,
  MapPin,
  CheckCircle2,
  X,
  Building2,
  Users,
  Tag,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTicket } from "@/redux/hooks/useTicket";
import { useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import type {
  CustomerTransactionDetailResponse,
  CustomerCheckInDetailResponse,
  CustomerPaidTicketResponse,
  RefundPolicyForCustomerTicketResponse,
} from "@/types/ticket.type";
import { isSameDay, isThisWeek, isThisMonth, isAfter, startOfToday } from "date-fns";
import { toast } from "sonner";

export default function TicketConferences() {
  const { tickets, loading, ticketsError, refetchTickets, handleRefundTicket, refunding, refundError } = useTicket();

  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<
    CustomerTransactionDetailResponse[]
  >([]);
  const [selectedCheckIns, setSelectedCheckIns] = useState<
    CustomerCheckInDetailResponse[]
  >([]);
  const [selectedTransaction, setSelectedTransaction] =
    useState<CustomerTransactionDetailResponse | null>(null);
  const [selectedCheckIn, setSelectedCheckIn] =
    useState<CustomerCheckInDetailResponse | null>(null);
  const [singleTransactionDialogOpen, setSingleTransactionDialogOpen] =
    useState(false);
  const [singleCheckInDialogOpen, setSingleCheckInDialogOpen] = useState(false);

  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedRefundTicket, setSelectedRefundTicket] = useState<{
    ticketId: string;
    transactionId: string;
  } | null>(null);

  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  const filterOptions = [
    { id: "all", label: "Tất cả", active: false },
    { id: "upcoming", label: "Sắp diễn ra", active: true },
    { id: "today", label: "Hôm nay", active: false },
    { id: "this-week", label: "Tuần này", active: false },
    { id: "this-month", label: "Tháng này", active: false },
  ];

  useEffect(() => {
    refetchTickets();
  }, []);

  useEffect(() => {
    if (refundError) toast.error(refundError.data?.message);
  }, [refundError]);

  const canRefundTicket = (ticket: CustomerPaidTicketResponse): {
    canRefund: boolean;
    refundAmount?: number;
    refundPercent?: number;
    applicableDeadline?: string;
  } => {
    const now = new Date();

    // CHECK CHUNG CHO TẤT CẢ VÉ (bao gồm cả Author)
    // Bước 1: Check hasRefundPolicy
    if (!ticket.hasRefundPolicy) {
      return { canRefund: false };
    }

    // Bước 2: Check refund policies
    const refundPolicies = ticket.ticketPricePhase?.refundPolicies;

    if (!refundPolicies || refundPolicies.length === 0) {
      return { canRefund: false };
    }

    // Bước 3: Sort policies theo refundDeadline tăng dần
    const sortedPolicies = [...refundPolicies].sort((a, b) => {
      const dateA = a.refundDeadline ? new Date(a.refundDeadline).getTime() : 0;
      const dateB = b.refundDeadline ? new Date(b.refundDeadline).getTime() : 0;
      return dateA - dateB;
    });

    // Bước 4: Tìm policy áp dụng (ngày hiện tại < deadline)
    const applicablePolicy = sortedPolicies.find(policy => {
      if (!policy.refundDeadline) return false;
      return now < new Date(policy.refundDeadline);
    });

    // Bước 5: Check registeredDate
    const registeredDate = ticket.registeredDate ? new Date(ticket.registeredDate) : null;
    if (!applicablePolicy || !registeredDate || now < registeredDate) {
      return { canRefund: false };
    }

    // Bước 6: Tính toán refund amount
    if (applicablePolicy && applicablePolicy.percentRefund) {
      const refundAmount = (ticket.actualPrice || 0) * (applicablePolicy.percentRefund / 100);
      return {
        canRefund: true,
        refundAmount,
        refundPercent: applicablePolicy.percentRefund,
        applicableDeadline: applicablePolicy.refundDeadline
      };
    }

    return { canRefund: false };
  };

  // const canRefundTicket = (ticket: CustomerPaidTicketResponse): {
  //   canRefund: boolean;
  //   refundAmount?: number;
  //   refundPercent?: number;
  //   applicableDeadline?: string;
  // } => {
  //   const now = new Date();
  //   const isAuthor = ticket.ticketPricePhase?.conferencePrice?.isAuthor;

  //   // Trường hợp 1: Vé không phải Author - check refund policy
  //   if (!isAuthor) {
  //     const refundPolicies = ticket.ticketPricePhase?.refundPolicies;

  //     if (!refundPolicies || refundPolicies.length === 0) {
  //       return { canRefund: false };
  //     }

  //     // Sort policies theo refundDeadline tăng dần
  //     const sortedPolicies = [...refundPolicies].sort((a, b) => {
  //       const dateA = a.refundDeadline ? new Date(a.refundDeadline).getTime() : 0;
  //       const dateB = b.refundDeadline ? new Date(b.refundDeadline).getTime() : 0;
  //       return dateA - dateB;
  //     });

  //     // Tìm policy áp dụng (ngày hiện tại < deadline)
  //     const applicablePolicy = sortedPolicies.find(policy => {
  //       if (!policy.refundDeadline) return false;
  //       return now < new Date(policy.refundDeadline);
  //     });

  //     const registeredDate = ticket.registeredDate ? new Date(ticket.registeredDate) : null;
  //     if (!applicablePolicy || !registeredDate || now < registeredDate) {
  //       return { canRefund: false };
  //     }

  //     if (applicablePolicy && applicablePolicy.percentRefund) {
  //       const refundAmount = (ticket.actualPrice || 0) * (applicablePolicy.percentRefund / 100);
  //       return {
  //         canRefund: true,
  //         refundAmount,
  //         refundPercent: applicablePolicy.percentRefund,
  //         applicableDeadline: applicablePolicy.refundDeadline
  //       };
  //     }

  //     return { canRefund: false };
  //   }

  //   // Trường hợp 2: Vé Author - check registration dates
  //   const registrationStartDate = ticket.ticketPricePhase?.conferencePrice?.registrationStartDate;
  //   const registrationEndDate = ticket.ticketPricePhase?.conferencePrice?.registrationEndDate;

  //   if (!registrationStartDate || !registrationEndDate) {
  //     return { canRefund: false };
  //   }

  //   const startDate = new Date(registrationStartDate);
  //   const endDate = new Date(registrationEndDate);

  //   // Trong khoảng registration dates thì được refund
  //   if (now >= startDate && now <= endDate) {
  //     return { canRefund: true };
  //   }

  //   return { canRefund: false };
  // };

  const getAllRefundDeadlines = (ticket: CustomerPaidTicketResponse): RefundPolicyForCustomerTicketResponse[] => {
    const refundPolicies = ticket.ticketPricePhase?.refundPolicies;
    if (!refundPolicies || refundPolicies.length === 0) return [];

    // Sort theo refundDeadline tăng dần
    return [...refundPolicies].sort((a, b) => {
      const dateA = a.refundDeadline ? new Date(a.refundDeadline).getTime() : 0;
      const dateB = b.refundDeadline ? new Date(b.refundDeadline).getTime() : 0;
      return dateA - dateB;
    });
  };

  const handleOpenRefundDialog = (ticketId: string, transactionId: string) => {
    setSelectedRefundTicket({ ticketId, transactionId });
    setRefundDialogOpen(true);
  };

  const handleConfirmRefund = async () => {
    if (!selectedRefundTicket) return;

    try {
      await handleRefundTicket(selectedRefundTicket);
      setRefundDialogOpen(false);
      setSelectedRefundTicket(null);
      toast.success("Hoàn vé thành công!");
      refetchTickets();
    } catch (error) {
      // alert(refundError?.data?.message || "Có lỗi xảy ra khi hoàn vé");
    }
  };

  const handleFilterChange = (id: string) => {
    setSelectedFilter(id);
  };

  const filterTicketsByDate = (ticketList: typeof tickets) => {
    const now = new Date();
    return ticketList.filter((ticket) => {
      const date = ticket.registeredDate ? new Date(ticket.registeredDate) : null;
      if (!date) return false;
      switch (selectedFilter) {
        case "today":
          return isSameDay(date, now);
        case "this-week":
          return isThisWeek(date, { weekStartsOn: 1 });
        case "this-month":
          return isThisMonth(date);
        case "upcoming":
          return isAfter(date, startOfToday());
        default:
          return true;
      }
    });
  };

  const filteredTickets = filterTicketsByDate(tickets);

  const getStatusBadge = (isRefunded?: boolean) => {
    if (isRefunded) {
      return (
        <Badge className="bg-gray-800 text-gray-200 border-gray-600">
          Đã hoàn tiền
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-800 text-green-200 border-green-600">
        Vé khả dụng
      </Badge>
    );
  };

  const formatPrice = (price?: number) => {
    if (!price) return "Miễn phí";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa xác định";
    return new Intl.DateTimeFormat("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "Chưa xác định";
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const handleShowTransactions = (
    transactions: CustomerTransactionDetailResponse[],
  ) => {
    setSelectedTransactions(transactions);
    setTransactionDialogOpen(true);
  };

  const handleShowCheckIns = (checkIns: CustomerCheckInDetailResponse[]) => {
    setSelectedCheckIns(checkIns);
    setCheckInDialogOpen(true);
  };

  const handleViewSingleTransaction = (
    transaction: CustomerTransactionDetailResponse,
  ) => {
    setSelectedTransaction(transaction);
    setSingleTransactionDialogOpen(true);
  };

  const handleViewSingleCheckIn = (checkIn: CustomerCheckInDetailResponse) => {
    setSelectedCheckIn(checkIn);
    setSingleCheckInDialogOpen(true);
  };

  const toggleExpand = (ticketId: string) => {
    setExpandedTicketId(expandedTicketId === ticketId ? null : ticketId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Đang tải vé của bạn...</p>
          </div>
        </div>
      </div>
    );
  }

  if (ticketsError) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <div className="text-red-400 mb-4">
              Có lỗi xảy ra khi tải dữ liệu
            </div>
            <p className="text-gray-400">{ticketsError.data?.message}</p>
            <Button
              onClick={() => refetchTickets()}
              className="mt-4 bg-purple-600 hover:bg-purple-700"
            >
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Ticket className="h-8 w-8 text-purple-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Vé sự kiện của tôi
            </h1>
          </div>
          <p className="text-gray-400 text-sm sm:text-base">
            Quản lý và theo dõi các vé hội nghị bạn đã mua
          </p>
        </div>

        {/* Filter/Sort Options */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-3 min-w-max pb-2">
            {filterOptions.map((option) => (
              <Button
                key={option.id}
                onClick={() => handleFilterChange(option.id)}
                variant={selectedFilter === option.id ? "default" : "outline"}
                className={`whitespace-nowrap ${selectedFilter === option.id
                  ? "bg-purple-600 text-white hover:bg-purple-700 border-purple-600"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600"
                  }`}
              // variant={option.active ? "default" : "outline"}
              // className={`whitespace-nowrap ${option.active
              //   ? "bg-purple-600 text-white hover:bg-purple-700 border-purple-600"
              //   : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600"
              //   }`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Ticket List */}
        {/* Ticket List */}
        <div className="space-y-6">
          {filteredTickets.map((ticket) => (
            <Card
              key={ticket.ticketId}
              className="bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-purple-500/10 transition-shadow overflow-hidden"
            >
              {/* Banner Image */}
              {/* {ticket.bannerImageUrl && (
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={ticket.bannerImageUrl}
                    alt={ticket.conferenceName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-800 via-gray-800/50 to-transparent" />

                  
                  <div className="absolute top-4 right-4">
                    {getStatusBadge(ticket.isRefunded)}
                  </div>
                </div>
              )} */}

              <div className="flex justify-between items-start gap-4 ml-5">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <p>Ngày đăng ký:</p>
                      {formatDate(ticket.registeredDate)}
                    </div>
                    <div>{getStatusBadge(ticket.isRefunded)}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row">
                {/* Content */}
                <CardContent className="flex-1 p-6 overflow-hidden">
                  <div className="flex flex-col gap-4">
                    <div className="flex-1 space-y-4">
                      {/* Conference Title & Info */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h2 className="text-2xl font-bold text-white leading-tight mb-2">
                              {ticket.conferenceName || 'Tên hội nghị'}
                            </h2>
                            {ticket.conferenceDescription && (
                              <p className="text-sm text-gray-400 line-clamp-2">
                                {ticket.conferenceDescription}
                              </p>
                            )}
                          </div>

                          {/* Refund Button */}
                          {!ticket.isRefunded && ticket.transactions && ticket.transactions.length > 0 && (() => {
                            const refundInfo = canRefundTicket(ticket);
                            const isAuthor = ticket.ticketPricePhase?.conferencePrice?.isAuthor;

                            return (
                              <Button
                                variant="outline"
                                size="lg"
                                onClick={() =>
                                  handleOpenRefundDialog(
                                    ticket.ticketId,
                                    ticket.transactions[0].transactionId
                                  )
                                }
                                disabled={!refundInfo.canRefund}
                                className={`
                          flex items-center gap-2 text-white font-semibold transition-all
                          ${refundInfo.canRefund
                                    ? 'bg-red-600 border-red-700 hover:bg-red-700 hover:shadow-lg shadow-red-500/50'
                                    : 'bg-gray-600 border-gray-500 cursor-not-allowed opacity-50'
                                  }
                        `}
                                title={!refundInfo.canRefund
                                  ? (isAuthor ? 'Ngoài thời gian đăng ký' : 'Đã hết hạn hoàn vé')
                                  : undefined
                                }
                              >
                                <X className="h-4 w-4" />
                                Hoàn vé
                                {refundInfo.canRefund && !isAuthor && refundInfo.refundPercent && (
                                  <span className="text-xs">({refundInfo.refundPercent}%)</span>
                                )}
                              </Button>
                            );
                          })()}
                        </div>

                        {/* Conference Meta Info */}
                        <div className="flex flex-col lg:flex-row gap-4">
                          {ticket.bannerImageUrl && (
                            <div className="flex-shrink-0 w-full lg:w-48 h-48 overflow-hidden relative">
                              <img
                                src={ticket.bannerImageUrl}
                                alt={ticket.conferenceName || "Banner"}
                                className="w-full h-full object-cover"
                              />
                              {/* <div className="absolute inset-0 bg-gradient-to-t from-gray-800 via-gray-800/50 to-transparent" />
                              <div className="absolute top-2 right-2">
                                {getStatusBadge(ticket.isRefunded)}
                              </div> */}
                            </div>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">

                            {/* Date Range */}
                            {ticket.conferenceStartDate && ticket.conferenceEndDate && (
                              <div className="flex items-center gap-2 text-gray-300">
                                <Calendar className="h-4 w-4 text-purple-400" />
                                <span>
                                  {formatDate(ticket.conferenceStartDate)} - {formatDate(ticket.conferenceEndDate)}
                                </span>
                              </div>
                            )}

                            {/* Location */}
                            {ticket.conferenceAddress && (
                              <div className="flex items-center gap-2 text-gray-300">
                                <MapPin className="h-4 w-4 text-purple-400" />
                                <span className="truncate">{ticket.conferenceAddress}</span>
                              </div>
                            )}

                            {/* City */}
                            {ticket.cityName && (
                              <div className="flex items-center gap-2 text-gray-300">
                                <Building2 className="h-4 w-4 text-purple-400" />
                                <span>{ticket.cityName}</span>
                              </div>
                            )}

                            {/* Slots */}
                            {ticket.conferenceTotalSlot && (
                              <div className="flex items-center gap-2 text-gray-300">
                                <Users className="h-4 w-4 text-purple-400" />
                                <span>
                                  {ticket.conferenceAvailableSlot || 0}/{ticket.conferenceTotalSlot} chỗ còn trống
                                </span>
                              </div>
                            )}

                            {/* Category */}
                            {ticket.conferenceCategoryName && (
                              <div className="flex items-center gap-2 text-gray-300">
                                <Tag className="h-4 w-4 text-purple-400" />
                                <span>{ticket.conferenceCategoryName}</span>
                              </div>
                            )}

                            {/* Status */}
                            {ticket.conferenceStatusName && (
                              <div className="flex items-center gap-2">
                                <Badge className="bg-green-800 text-green-200 border-green-600">
                                  {ticket.conferenceStatusName}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Conference Type Badges */}
                        <div className="flex flex-wrap gap-2">
                          {ticket.isInternalHosted && (
                            <Badge className="bg-blue-800 text-blue-200 border-blue-600">
                              Tổ chức nội bộ
                            </Badge>
                          )}
                          {ticket.isResearchConference && (
                            <Badge className="bg-purple-800 text-purple-200 border-purple-600">
                              Hội nghị nghiên cứu
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Ticket Sale Period */}
                      {ticket.conferenceTicketSaleStart && ticket.conferenceTicketSaleEnd && (
                        <div className="bg-gray-700/50 border border-gray-600 p-3 rounded-lg">
                          <div className="text-xs text-gray-400 mb-1">Thời gian bán vé</div>
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Clock className="h-4 w-4" />
                            {formatDate(ticket.conferenceTicketSaleStart)} - {formatDate(ticket.conferenceTicketSaleEnd)}
                          </div>
                        </div>
                      )}

                      {/* Ticket Info */}
                      <div className="bg-gray-700 border border-gray-600 p-4 rounded-lg space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-purple-800 text-purple-200 border-purple-600">
                              Vé tham dự
                            </Badge>
                            <span className="text-lg font-bold text-purple-400">
                              {formatPrice(ticket.actualPrice)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <User className="h-4 w-4" />
                            Đăng ký: {formatDate(ticket.registeredDate)}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          Mã vé: {ticket.ticketId}
                        </div>
                      </div>

                      {/* Refund Information Section */}
                      {(() => {
                        const refundInfo = canRefundTicket(ticket);
                        const isAuthor = ticket.ticketPricePhase?.conferencePrice?.isAuthor;
                        const allDeadlines = getAllRefundDeadlines(ticket);

                        if (ticket.isRefunded) {
                          return null;
                        }

                        if (!ticket.hasRefundPolicy) {
                          return (
                            <div className="bg-gray-700/20 border border-gray-600/50 p-4 rounded-lg">
                              <p className="text-gray-400 text-sm flex items-center gap-2">
                                <X className="h-4 w-4" />
                                Vé này không áp dụng chính sách hoàn tiền
                              </p>
                            </div>
                          );
                        }

                        if (allDeadlines.length === 0) {
                          return (
                            <div className="bg-gray-700/20 border border-gray-600/50 p-4 rounded-lg">
                              <p className="text-gray-400 text-sm flex items-center gap-2">
                                <X className="h-4 w-4" />
                                Chưa có chính sách hoàn vé cụ thể
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div className="bg-blue-900/20 border border-blue-600/50 p-4 rounded-lg space-y-2">
                            <h4 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              Thông tin hoàn vé
                              {isAuthor && (
                                <Badge className="bg-purple-800 text-purple-200 border-purple-600 ml-2">
                                  Vé tác giả
                                </Badge>
                              )}
                            </h4>

                            <div className="space-y-2">
                              {refundInfo.canRefund && refundInfo.refundAmount !== undefined && (
                                <div className="bg-green-900/30 border border-green-600/50 p-3 rounded">
                                  <div className="text-green-400 font-semibold mb-1">
                                    Bạn sẽ được hoàn lại: {formatPrice(refundInfo.refundAmount)}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    ({refundInfo.refundPercent}% giá vé gốc)
                                  </div>
                                </div>
                              )}

                              <div className="text-sm text-gray-300">
                                <div className="font-medium mb-2">Các mốc thời gian hoàn vé:</div>
                                <div className="space-y-1">
                                  {allDeadlines.map((policy) => (
                                    <div
                                      key={policy.refundPolicyId}
                                      className={`flex justify-between items-center text-xs p-2 rounded ${refundInfo.applicableDeadline === policy.refundDeadline
                                        ? 'bg-green-900/30 border border-green-600/50'
                                        : 'bg-gray-800/50'
                                        }`}
                                    >
                                      <span>
                                        {refundInfo.applicableDeadline === policy.refundDeadline && (
                                          <span className="text-green-400 mr-1">→</span>
                                        )}
                                        Trước {formatDateTime(policy.refundDeadline)}
                                      </span>
                                      <span className="font-medium text-white">
                                        {policy.percentRefund}%
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {!refundInfo.canRefund && (
                                <div className="text-red-400 text-xs">
                                  ✗ Đã hết hạn hoàn vé
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                        <div className="flex flex-wrap gap-2">
                          {!ticket.isRefunded && ticket.transactions && ticket.transactions.length > 0 && (() => {
                            const refundInfo = canRefundTicket(ticket);
                            const isAuthor = ticket.ticketPricePhase?.conferencePrice?.isAuthor;

                            return (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenRefundDialog(
                                  ticket.ticketId,
                                  ticket.transactions[0].transactionId
                                )}
                                disabled={!refundInfo.canRefund}
                                className={`
                          flex items-center gap-2
                          ${refundInfo.canRefund
                                    ? 'text-red-400 border-red-600 hover:bg-red-900/50 bg-gray-800'
                                    : 'text-gray-500 border-gray-600 bg-gray-800 cursor-not-allowed opacity-50'
                                  }
                        `}
                                title={!refundInfo.canRefund
                                  ? (!ticket.hasRefundPolicy
                                    ? 'Vé không áp dụng chính sách hoàn tiền'
                                    : 'Đã hết hạn hoàn vé')
                                  : undefined
                                }
                              >
                                <X className="h-4 w-4" />
                                Hoàn vé
                                {refundInfo.canRefund && !isAuthor && refundInfo.refundPercent && (
                                  <span className="text-xs ml-1">
                                    ({refundInfo.refundPercent}%)
                                  </span>
                                )}
                              </Button>
                            );
                          })()}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleExpand(ticket.ticketId)}
                            className="flex items-center gap-2 text-gray-300 border-gray-600 hover:bg-gray-700 bg-gray-800"
                          >
                            {expandedTicketId === ticket.ticketId ? "Thu gọn" : "Chi tiết"}
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedTicketId === ticket.ticketId && (
                      <div className="border-t border-gray-600 pt-4 space-y-4 w-full">
                        {/* Transactions Section */}
                        {ticket.transactions && ticket.transactions.length > 0 && (
                          <div className="bg-gray-700/50 rounded-lg p-4 w-full">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
                              <CreditCard className="h-5 w-5 text-purple-400" />
                              Giao dịch ({ticket.transactions.length})
                            </h3>
                            <div
                              className="w-full overflow-x-auto -mx-4 px-4"
                              style={{
                                scrollbarWidth: "thin",
                                scrollbarColor: "rgba(148,163,184,0.4) transparent",
                              }}
                            >
                              <div className="flex gap-3 pb-2">
                                {ticket.transactions.map((transaction) => (
                                  <div
                                    key={transaction.transactionId}
                                    className="bg-gray-800 p-3 rounded border border-gray-600 text-sm cursor-pointer hover:bg-gray-700 transition-colors flex-shrink-0 w-64"
                                    onClick={() => handleViewSingleTransaction(transaction)}
                                  >
                                    <div className="flex justify-between items-start mb-1">
                                      <span className="text-gray-400 truncate">
                                        Mã GD: {transaction.transactionCode}
                                      </span>
                                      <span className="text-green-400 font-semibold ml-2 whitespace-nowrap">
                                        {formatPrice(transaction.amount)}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {formatDateTime(transaction.createdAt)}
                                    </div>
                                    <div className="text-xs text-purple-400 mt-1">
                                      Click để xem chi tiết
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Check-ins Section */}
                        {ticket.userCheckIns && ticket.userCheckIns.length > 0 && (
                          <div className="bg-gray-700/50 rounded-lg p-4 w-full">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
                              <CheckCircle2 className="h-5 w-5 text-green-400" />
                              Điểm danh ({ticket.userCheckIns.length})
                            </h3>
                            <div
                              className="w-full overflow-x-auto -mx-4 px-4"
                              style={{
                                scrollbarWidth: "thin",
                                scrollbarColor: "rgba(148,163,184,0.4) transparent",
                              }}
                            >
                              <div className="flex gap-3 pb-2">
                                {ticket.userCheckIns.map((checkIn) => (
                                  <div
                                    key={checkIn.userCheckinId}
                                    className="bg-gray-800 p-3 rounded border border-gray-600 text-sm cursor-pointer hover:bg-gray-700 transition-colors flex-shrink-0 w-72"
                                    onClick={() => handleViewSingleCheckIn(checkIn)}
                                  >
                                    <div className="flex justify-between items-start mb-1">
                                      <span className="text-white font-medium truncate flex-1 max-w-[180px]">
                                        {checkIn.conferenceSessionDetail?.title || "Phiên không xác định"}
                                      </span>
                                      <Badge className="bg-green-800 text-green-200 border-green-600 text-xs ml-2 flex-shrink-0 whitespace-nowrap">
                                        {checkIn.checkinStatusName}
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      Ngày check-in: {formatDateTime(checkIn.checkInTime)}
                                    </div>
                                    <div className="text-xs text-green-400 mt-1">
                                      Click để xem chi tiết
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>


        {/* Empty State */}
        {tickets.length === 0 && (
          <div className="text-center py-16">
            <Ticket className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Chưa có vé nào
            </h3>
            <p className="text-gray-500">
              Mua vé cho hội nghị đầu tiên của bạn
            </p>
          </div>
        )}
      </div>

      {/* Single Transaction Dialog */}
      <Transition appear show={singleTransactionDialogOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setSingleTransactionDialogOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-lg bg-gray-800 border border-gray-700 shadow-xl transition-all">
                  <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
                    <Dialog.Title className="text-xl font-semibold text-white flex items-center gap-2">
                      <CreditCard className="h-6 w-6 text-purple-400" />
                      Chi tiết giao dịch
                    </Dialog.Title>
                    <button
                      onClick={() => setSingleTransactionDialogOpen(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="px-6 py-4">
                    {selectedTransaction && (
                      <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="text-sm text-gray-400 mb-1">
                              Mã giao dịch
                            </div>
                            <div className="text-white font-mono text-sm">
                              {selectedTransaction.transactionCode}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-400 mb-1">
                              Số tiền
                            </div>
                            <div className="text-green-400 font-bold text-lg">
                              {formatPrice(selectedTransaction.amount)}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-gray-400">Phương thức</div>
                            <div className="text-white">
                              {selectedTransaction.paymentMethodName ||
                                "Chưa xác định"}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-400">Tiền tệ</div>
                            <div className="text-white">
                              {selectedTransaction.currency || "VND"}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-400">Thời gian</div>
                            <div className="text-white">
                              {formatDateTime(selectedTransaction.createdAt)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-400">Trạng thái</div>
                            <div>
                              {selectedTransaction.isRefunded ? (
                                <Badge className="bg-gray-800 text-gray-200 border-gray-600">
                                  Đã hoàn tiền
                                </Badge>
                              ) : (
                                <Badge className="bg-green-800 text-green-200 border-green-600">
                                  Thành công
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Single Check-in Dialog */}
      <Transition appear show={singleCheckInDialogOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setSingleCheckInDialogOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-gray-800 border border-gray-700 shadow-xl transition-all">
                  <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
                    <Dialog.Title className="text-xl font-semibold text-white flex items-center gap-2">
                      <CheckCircle2 className="h-6 w-6 text-green-400" />
                      Chi tiết điểm danh
                    </Dialog.Title>
                    <div className="flex items-center gap-2">
                      {/* Nút xem QR */}
                      {selectedCheckIn?.qrUrl && (
                        <button
                          onClick={() => setQrDialogOpen(true)}
                          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
                        >
                          Xem QR
                        </button>
                      )}
                      <button
                        onClick={() => setSingleCheckInDialogOpen(false)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                  <div className="px-6 py-4 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    {selectedCheckIn && (
                      <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2">
                              {selectedCheckIn.conferenceSessionDetail?.title ||
                                "Phiên không xác định"}
                            </h3>
                            {selectedCheckIn.conferenceSessionDetail
                              ?.description && (
                                <p className="text-sm text-gray-400 mb-2">
                                  {
                                    selectedCheckIn.conferenceSessionDetail
                                      .description
                                  }
                                </p>
                              )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge className="bg-green-800 text-green-200 border-green-600">
                              {selectedCheckIn.checkinStatusName}
                            </Badge>
                            {selectedCheckIn.isPresenter && (
                              <Badge className="bg-purple-800 text-purple-200 border-purple-600">
                                Diễn giả
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <div className="text-gray-400 flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Thời gian điểm danh
                            </div>
                            <div className="text-white">
                              {selectedCheckIn.checkInTime ? formatDateTime(selectedCheckIn.checkInTime) : 'Chưa điểm danh'}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-400 flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Ngày diễn ra
                            </div>
                            <div className="text-white">
                              {formatDate(
                                selectedCheckIn.conferenceSessionDetail
                                  ?.sessionDate,
                              )}
                            </div>
                          </div>
                        </div>

                        {selectedCheckIn.conferenceSessionDetail && (
                          <div className="bg-gray-800 p-3 rounded border border-gray-600 space-y-2">
                            <div className="text-xs text-gray-400 font-semibold mb-2">
                              THÔNG TIN ĐỊA ĐIỂM
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              {selectedCheckIn.conferenceSessionDetail
                                .conferenceName && (
                                  <div>
                                    <div className="text-gray-400">Hội nghị</div>
                                    <div className="text-white">
                                      {
                                        selectedCheckIn.conferenceSessionDetail
                                          .conferenceName
                                      }
                                    </div>
                                  </div>
                                )}
                              {selectedCheckIn.conferenceSessionDetail
                                .roomDisplayName && (
                                  <div>
                                    <div className="text-gray-400">Phòng</div>
                                    <div className="text-white">
                                      {
                                        selectedCheckIn.conferenceSessionDetail
                                          .roomDisplayName
                                      }
                                    </div>
                                  </div>
                                )}
                              {selectedCheckIn.conferenceSessionDetail
                                .destinationName && (
                                  <div className="col-span-2">
                                    <div className="text-gray-400 flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      Địa điểm
                                    </div>
                                    <div className="text-white">
                                      {
                                        selectedCheckIn.conferenceSessionDetail
                                          .destinationName
                                      }
                                      {selectedCheckIn.conferenceSessionDetail
                                        .cityName &&
                                        `, ${selectedCheckIn.conferenceSessionDetail.cityName}`}
                                    </div>
                                    {(selectedCheckIn.conferenceSessionDetail
                                      .street ||
                                      selectedCheckIn.conferenceSessionDetail
                                        .district) && (
                                        <div className="text-gray-400 text-xs mt-1">
                                          {[
                                            selectedCheckIn.conferenceSessionDetail
                                              .street,
                                            selectedCheckIn.conferenceSessionDetail
                                              .district,
                                          ]
                                            .filter(Boolean)
                                            .join(", ")}
                                        </div>
                                      )}
                                  </div>
                                )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* QR Code Dialog */}
      <Transition appear show={qrDialogOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setQrDialogOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-gray-800 border border-gray-700 shadow-xl transition-all">
                  <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
                    <Dialog.Title className="text-xl font-semibold text-white flex items-center gap-2">
                      <QrCode className="h-6 w-6 text-purple-400" />
                      QR Code vé
                    </Dialog.Title>
                    <button
                      onClick={() => setQrDialogOpen(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="px-6 py-6 flex justify-center">
                    {selectedCheckIn?.qrUrl ? (
                      <img
                        src={selectedCheckIn.qrUrl}
                        alt="QR Code"
                        className="w-64 h-64 object-contain"
                      />
                    ) : (
                      <p className="text-gray-400">Chưa có QR Code</p>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>


      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>

      {/* Refund Confirmation Dialog */}
      <div className="px-6 py-4">
        {selectedRefundTicket && (() => {
          const ticket = tickets.find(t => t.ticketId === selectedRefundTicket.ticketId);
          const refundInfo = ticket ? canRefundTicket(ticket) : null;
          const isAuthor = ticket?.ticketPricePhase?.conferencePrice?.isAuthor;

          return (
            <>
              <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4 mb-4">
                <p className="text-red-400 text-sm font-medium mb-2">
                  ⚠️ Cảnh báo
                </p>
                <p className="text-gray-300 text-sm">
                  Bạn có chắc chắn muốn hoàn vé này không?
                </p>
                {refundInfo?.canRefund && !isAuthor && refundInfo.refundAmount !== undefined && (
                  <div className="mt-3 p-3 bg-blue-900/30 border border-blue-600/50 rounded">
                    <div className="text-blue-400 font-semibold">
                      Số tiền hoàn lại: {formatPrice(refundInfo.refundAmount)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      ({refundInfo.refundPercent}% giá vé gốc)
                    </div>
                  </div>
                )}
                <p className="text-gray-400 text-xs mt-2">
                  Hành động này không thể hoàn tác.
                </p>
              </div>

              {refundError && (
                <div className="bg-red-900/30 border border-red-600 rounded-lg p-3 mb-4">
                  <p className="text-red-400 text-sm">
                    {refundError.data?.message || "Có lỗi xảy ra"}
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setRefundDialogOpen(false)}
                  disabled={refunding}
                  className="bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleConfirmRefund}
                  disabled={refunding}
                  className="bg-red-600 text-white hover:bg-red-700 border-red-600"
                >
                  {refunding ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    "Xác nhận hoàn vé"
                  )}
                </Button>
              </div>
            </>
          );
        })()}
      </div>
      {/* <Transition appear show={refundDialogOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => !refunding && setRefundDialogOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-gray-800 border border-gray-700 shadow-xl transition-all">
                  <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                    <Dialog.Title className="text-xl font-semibold text-white flex items-center gap-2">
                      <X className="h-6 w-6 text-red-400" />
                      Xác nhận hoàn vé
                    </Dialog.Title>
                  </div>

                  <div className="px-6 py-4">
                    <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4 mb-4">
                      <p className="text-red-400 text-sm font-medium mb-2">
                        ⚠️ Cảnh báo
                      </p>
                      <p className="text-gray-300 text-sm">
                        Bạn có chắc chắn muốn hoàn vé này không?
                      </p>
                      <p className="text-gray-400 text-xs mt-2">
                        Hành động này không thể hoàn tác.
                      </p>
                    </div>

                    {refundError && (
                      <div className="bg-red-900/30 border border-red-600 rounded-lg p-3 mb-4">
                        <p className="text-red-400 text-sm">
                          {refundError.data?.message || "Có lỗi xảy ra"}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setRefundDialogOpen(false)}
                        disabled={refunding}
                        className="bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                      >
                        Hủy
                      </Button>
                      <Button
                        onClick={handleConfirmRefund}
                        disabled={refunding}
                        className="bg-red-600 text-white hover:bg-red-700 border-red-600"
                      >
                        {refunding ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Đang xử lý...
                          </>
                        ) : (
                          "Xác nhận hoàn vé"
                        )}
                      </Button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition> */}
    </div>
  );
}