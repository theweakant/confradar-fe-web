"use client";

import { Ticket, Calendar, ExternalLink, QrCode, Download, Clock, CreditCard, MapPin, CheckCircle2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTicket } from "@/redux/hooks/ticket/useTicket";
import { useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import type { CustomerTransactionDetailResponse, CustomerCheckInDetailResponse, CustomerPaidTicketResponse } from "@/types/ticket.type";

export default function TicketConferences() {
  const { tickets, loading, ticketsError, refetchTickets } = useTicket();
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<CustomerTransactionDetailResponse[]>([]);
  const [selectedCheckIns, setSelectedCheckIns] = useState<CustomerCheckInDetailResponse[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<CustomerTransactionDetailResponse | null>(null);
  const [selectedCheckIn, setSelectedCheckIn] = useState<CustomerCheckInDetailResponse | null>(null);
  const [singleTransactionDialogOpen, setSingleTransactionDialogOpen] = useState(false);
  const [singleCheckInDialogOpen, setSingleCheckInDialogOpen] = useState(false);

  const filterOptions = [
    { id: "upcoming", label: "Sắp diễn ra", active: true },
    { id: "today", label: "Hôm nay", active: false },
    { id: "this-week", label: "Tuần này", active: false },
    { id: "this-month", label: "Tháng này", active: false },
    { id: "all", label: "Tất cả", active: false },
  ];

  useEffect(() => {
    refetchTickets();
  }, []);

  const getStatusBadge = (isRefunded?: boolean) => {
    if (isRefunded) {
      return <Badge className="bg-gray-800 text-gray-200 border-gray-600">Đã hoàn tiền</Badge>;
    }
    return <Badge className="bg-green-800 text-green-200 border-green-600">Đã xác nhận</Badge>;
  };

  const formatPrice = (price?: number) => {
    if (!price) return "Miễn phí";
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa xác định";
    return new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "Chưa xác định";
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const handleShowTransactions = (transactions: CustomerTransactionDetailResponse[]) => {
    setSelectedTransactions(transactions);
    setTransactionDialogOpen(true);
  };

  const handleShowCheckIns = (checkIns: CustomerCheckInDetailResponse[]) => {
    setSelectedCheckIns(checkIns);
    setCheckInDialogOpen(true);
  };

  const handleViewSingleTransaction = (transaction: CustomerTransactionDetailResponse) => {
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
            <div className="text-red-400 mb-4">Có lỗi xảy ra khi tải dữ liệu</div>
            <p className="text-gray-400">{ticketsError.data?.Message}</p>
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
                variant={option.active ? "default" : "outline"}
                className={`whitespace-nowrap ${option.active
                  ? "bg-purple-600 text-white hover:bg-purple-700 border-purple-600"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600"
                  }`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Ticket List */}
        <div className="space-y-6">
          {tickets.map((ticket) => (
            <Card key={ticket.ticketId} className="bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-purple-500/10 transition-shadow">
              <div className="flex flex-col lg:flex-row">
                {/* Content */}
                <CardContent className="flex-1 p-6 overflow-hidden">
                  <div className="flex flex-col gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Date & Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="h-4 w-4" />
                          {formatDate(ticket.registeredDate)}
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(ticket.isRefunded)}
                        </div>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                        Vé hội nghị #{ticket.ticketId.slice(-8)}
                      </h2>

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
                            <Clock className="h-4 w-4" />
                            {formatDate(ticket.registeredDate)}
                          </div>
                        </div>
                        <div className="text-sm text-gray-400">
                          Ngày đăng ký: {formatDate(ticket.registeredDate)}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          Mã vé: {ticket.ticketId}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                        <div className="flex flex-wrap gap-2">
                          {!ticket.isRefunded && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 text-purple-400 border-purple-600 hover:bg-purple-900/50 bg-gray-800"
                              >
                                <QrCode className="h-4 w-4" />
                                QR Code
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 text-gray-300 border-gray-600 hover:bg-gray-700 bg-gray-800"
                              >
                                <Download className="h-4 w-4" />
                                Tải vé
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleExpand(ticket.ticketId)}
                            className="flex items-center gap-2 text-gray-300 border-gray-600 hover:bg-gray-700 bg-gray-800"
                          >
                            {expandedTicketId === ticket.ticketId ? 'Thu gọn' : 'Chi tiết'}
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
                            <div className="w-full overflow-x-auto -mx-4 px-4" style={{
                              scrollbarWidth: 'thin',
                              scrollbarColor: 'rgba(148,163,184,0.4) transparent',
                            }}>
                              <div className="flex gap-3 pb-2">
                                {ticket.transactions.map((transaction) => (
                                  <div
                                    key={transaction.transactionId}
                                    className="bg-gray-800 p-3 rounded border border-gray-600 text-sm cursor-pointer hover:bg-gray-700 transition-colors flex-shrink-0 w-64"
                                    onClick={() => handleViewSingleTransaction(transaction)}
                                  >
                                    <div className="flex justify-between items-start mb-1">
                                      <span className="text-gray-400 truncate">Mã GD: {transaction.transactionCode}</span>
                                      <span className="text-green-400 font-semibold ml-2 whitespace-nowrap">{formatPrice(transaction.amount)}</span>
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
                            <div className="w-full overflow-x-auto -mx-4 px-4" style={{
                              scrollbarWidth: 'thin',
                              scrollbarColor: 'rgba(148,163,184,0.4) transparent',
                            }}>
                              <div className="flex gap-3 pb-2">
                                {ticket.userCheckIns.map((checkIn) => (
                                  <div
                                    key={checkIn.userCheckinId}
                                    className="bg-gray-800 p-3 rounded border border-gray-600 text-sm cursor-pointer hover:bg-gray-700 transition-colors flex-shrink-0 w-72"
                                    onClick={() => handleViewSingleCheckIn(checkIn)}
                                  >
                                    <div className="flex justify-between items-start mb-1">
                                      <span className="text-white font-medium truncate flex-1 max-w-[180px]">{checkIn.conferenceSessionDetail?.title || 'Phiên không xác định'}</span>
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

                {/* Image */}
                {/* <div className="lg:w-80 lg:flex-shrink-0">
                  <div className="h-48 lg:h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <Ticket className="h-16 w-16 text-white/70" />
                  </div>
                </div> */}
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
        <Dialog as="div" className="relative z-50" onClose={() => setSingleTransactionDialogOpen(false)}>
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
                            <div className="text-sm text-gray-400 mb-1">Mã giao dịch</div>
                            <div className="text-white font-mono text-sm">{selectedTransaction.transactionCode}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-400 mb-1">Số tiền</div>
                            <div className="text-green-400 font-bold text-lg">{formatPrice(selectedTransaction.amount)}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-gray-400">Phương thức</div>
                            <div className="text-white">{selectedTransaction.paymentMethodName || 'Chưa xác định'}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Tiền tệ</div>
                            <div className="text-white">{selectedTransaction.currency || 'VND'}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Thời gian</div>
                            <div className="text-white">{formatDateTime(selectedTransaction.createdAt)}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Trạng thái</div>
                            <div>
                              {selectedTransaction.isRefunded ? (
                                <Badge className="bg-gray-800 text-gray-200 border-gray-600">Đã hoàn tiền</Badge>
                              ) : (
                                <Badge className="bg-green-800 text-green-200 border-green-600">Thành công</Badge>
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
        <Dialog as="div" className="relative z-50" onClose={() => setSingleCheckInDialogOpen(false)}>
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
                    <button
                      onClick={() => setSingleCheckInDialogOpen(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="px-6 py-4 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    {selectedCheckIn && (
                      <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2">
                              {selectedCheckIn.conferenceSessionDetail?.title || 'Phiên không xác định'}
                            </h3>
                            {selectedCheckIn.conferenceSessionDetail?.description && (
                              <p className="text-sm text-gray-400 mb-2">
                                {selectedCheckIn.conferenceSessionDetail.description}
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
                            <div className="text-white">{formatDateTime(selectedCheckIn.checkInTime)}</div>
                          </div>
                          <div>
                            <div className="text-gray-400 flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Ngày diễn ra
                            </div>
                            <div className="text-white">{formatDate(selectedCheckIn.conferenceSessionDetail?.sessionDate)}</div>
                          </div>
                        </div>

                        {selectedCheckIn.conferenceSessionDetail && (
                          <div className="bg-gray-800 p-3 rounded border border-gray-600 space-y-2">
                            <div className="text-xs text-gray-400 font-semibold mb-2">THÔNG TIN ĐỊA ĐIỂM</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              {selectedCheckIn.conferenceSessionDetail.conferenceName && (
                                <div>
                                  <div className="text-gray-400">Hội nghị</div>
                                  <div className="text-white">{selectedCheckIn.conferenceSessionDetail.conferenceName}</div>
                                </div>
                              )}
                              {selectedCheckIn.conferenceSessionDetail.roomDisplayName && (
                                <div>
                                  <div className="text-gray-400">Phòng</div>
                                  <div className="text-white">{selectedCheckIn.conferenceSessionDetail.roomDisplayName}</div>
                                </div>
                              )}
                              {selectedCheckIn.conferenceSessionDetail.destinationName && (
                                <div className="col-span-2">
                                  <div className="text-gray-400 flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    Địa điểm
                                  </div>
                                  <div className="text-white">
                                    {selectedCheckIn.conferenceSessionDetail.destinationName}
                                    {selectedCheckIn.conferenceSessionDetail.cityName && `, ${selectedCheckIn.conferenceSessionDetail.cityName}`}
                                  </div>
                                  {(selectedCheckIn.conferenceSessionDetail.street || selectedCheckIn.conferenceSessionDetail.district) && (
                                    <div className="text-gray-400 text-xs mt-1">
                                      {[selectedCheckIn.conferenceSessionDetail.street, selectedCheckIn.conferenceSessionDetail.district].filter(Boolean).join(', ')}
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

      {/* <Transition appear show={transactionDialogOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setTransactionDialogOpen(false)}>
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
                      <CreditCard className="h-6 w-6 text-purple-400" />
                      Chi tiết giao dịch
                    </Dialog.Title>
                    <button
                      onClick={() => setTransactionDialogOpen(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="px-6 py-4 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    <div className="space-y-4">
                      {selectedTransactions.map((transaction) => (
                        <div key={transaction.transactionId} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="text-sm text-gray-400 mb-1">Mã giao dịch</div>
                              <div className="text-white font-mono text-sm">{transaction.transactionCode}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-400 mb-1">Số tiền</div>
                              <div className="text-green-400 font-bold text-lg">{formatPrice(transaction.amount)}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <div className="text-gray-400">Phương thức</div>
                              <div className="text-white">{transaction.paymentMethodName || 'Chưa xác định'}</div>
                            </div>
                            <div>
                              <div className="text-gray-400">Tiền tệ</div>
                              <div className="text-white">{transaction.currency || 'VND'}</div>
                            </div>
                            <div>
                              <div className="text-gray-400">Thời gian</div>
                              <div className="text-white">{formatDateTime(transaction.createdAt)}</div>
                            </div>
                            <div>
                              <div className="text-gray-400">Trạng thái</div>
                              <div>
                                {transaction.isRefunded ? (
                                  <Badge className="bg-gray-800 text-gray-200 border-gray-600">Đã hoàn tiền</Badge>
                                ) : (
                                  <Badge className="bg-green-800 text-green-200 border-green-600">Thành công</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={checkInDialogOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setCheckInDialogOpen(false)}>
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
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-gray-800 border border-gray-700 shadow-xl transition-all">
                  <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
                    <Dialog.Title className="text-xl font-semibold text-white flex items-center gap-2">
                      <CheckCircle2 className="h-6 w-6 text-green-400" />
                      Chi tiết điểm danh
                    </Dialog.Title>
                    <button
                      onClick={() => setCheckInDialogOpen(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="px-6 py-4 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    <div className="space-y-4">
                      {selectedCheckIns.map((checkIn) => (
                        <div key={checkIn.userCheckinId} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white mb-2">
                                {checkIn.conferenceSessionDetail?.title || 'Phiên không xác định'}
                              </h3>
                              {checkIn.conferenceSessionDetail?.description && (
                                <p className="text-sm text-gray-400 mb-2">
                                  {checkIn.conferenceSessionDetail.description}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                              <Badge className="bg-green-800 text-green-200 border-green-600">
                                {checkIn.checkinStatusName}
                              </Badge>
                              {checkIn.isPresenter && (
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
                              <div className="text-white">{formatDateTime(checkIn.checkInTime)}</div>
                            </div>
                            <div>
                              <div className="text-gray-400 flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Ngày diễn ra
                              </div>
                              <div className="text-white">{formatDate(checkIn.conferenceSessionDetail?.sessionDate)}</div>
                            </div>
                          </div>

                          {checkIn.conferenceSessionDetail && (
                            <div className="bg-gray-800 p-3 rounded border border-gray-600 space-y-2">
                              <div className="text-xs text-gray-400 font-semibold mb-2">THÔNG TIN ĐỊA ĐIỂM</div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                {checkIn.conferenceSessionDetail.conferenceName && (
                                  <div>
                                    <div className="text-gray-400">Hội nghị</div>
                                    <div className="text-white">{checkIn.conferenceSessionDetail.conferenceName}</div>
                                  </div>
                                )}
                                {checkIn.conferenceSessionDetail.roomDisplayName && (
                                  <div>
                                    <div className="text-gray-400">Phòng</div>
                                    <div className="text-white">{checkIn.conferenceSessionDetail.roomDisplayName}</div>
                                  </div>
                                )}
                                {checkIn.conferenceSessionDetail.destinationName && (
                                  <div className="col-span-2">
                                    <div className="text-gray-400 flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      Địa điểm
                                    </div>
                                    <div className="text-white">
                                      {checkIn.conferenceSessionDetail.destinationName}
                                      {checkIn.conferenceSessionDetail.cityName && `, ${checkIn.conferenceSessionDetail.cityName}`}
                                    </div>
                                    {(checkIn.conferenceSessionDetail.street || checkIn.conferenceSessionDetail.district) && (
                                      <div className="text-gray-400 text-xs mt-1">
                                        {[checkIn.conferenceSessionDetail.street, checkIn.conferenceSessionDetail.district].filter(Boolean).join(', ')}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition> */}

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
    </div>
  );
}

// "use client";

// import { Ticket, Calendar, ExternalLink, QrCode, Download, Clock } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { useTicket } from "@/redux/hooks/ticket/useTicket";
// import { useEffect } from "react";

// export default function TicketConferences() {
//   const { tickets, loading, ticketsError, refetchTickets } = useTicket();

//   const filterOptions = [
//     { id: "upcoming", label: "Sắp diễn ra", active: true },
//     { id: "today", label: "Hôm nay", active: false },
//     { id: "this-week", label: "Tuần này", active: false },
//     { id: "this-month", label: "Tháng này", active: false },
//     { id: "all", label: "Tất cả", active: false },
//   ];

//   useEffect(() => {
//     refetchTickets();
//   }, []);

//   const getStatusBadge = (isRefunded?: boolean) => {
//     if (isRefunded) {
//       return <Badge className="bg-gray-800 text-gray-200 border-gray-600">Đã hoàn tiền</Badge>;
//     }
//     return <Badge className="bg-green-800 text-green-200 border-green-600">Đã xác nhận</Badge>;
//   };

//   const formatPrice = (price?: number) => {
//     if (!price) return "Miễn phí";
//     return new Intl.NumberFormat('vi-VN', {
//       style: 'currency',
//       currency: 'VND'
//     }).format(price);
//   };

//   const formatDate = (dateString?: string) => {
//     if (!dateString) return "Chưa xác định";
//     return new Intl.DateTimeFormat('vi-VN', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     }).format(new Date(dateString));
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center py-16">
//             <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
//             <p className="text-gray-400">Đang tải vé của bạn...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (ticketsError) {
//     return (
//       <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center py-16">
//             <div className="text-red-400 mb-4">Có lỗi xảy ra khi tải dữ liệu</div>
//             <p className="text-gray-400">{ticketsError.data?.Message}</p>
//             <Button
//               onClick={() => refetchTickets()}
//               className="mt-4 bg-purple-600 hover:bg-purple-700"
//             >
//               Thử lại
//             </Button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Page Title */}
//         <div className="mb-8">
//           <div className="flex items-center gap-3 mb-2">
//             <Ticket className="h-8 w-8 text-purple-400" />
//             <h1 className="text-3xl sm:text-4xl font-bold text-white">
//               Vé sự kiện của tôi
//             </h1>
//           </div>
//           <p className="text-gray-400 text-sm sm:text-base">
//             Quản lý và theo dõi các vé hội nghị bạn đã mua
//           </p>
//         </div>

//         {/* Filter/Sort Options */}
//         <div className="mb-8 overflow-x-auto">
//           <div className="flex gap-3 min-w-max pb-2">
//             {filterOptions.map((option) => (
//               <Button
//                 key={option.id}
//                 variant={option.active ? "default" : "outline"}
//                 className={`whitespace-nowrap ${option.active
//                     ? "bg-purple-600 text-white hover:bg-purple-700 border-purple-600"
//                     : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600"
//                   }`}
//               >
//                 {option.label}
//               </Button>
//             ))}
//           </div>
//         </div>

//         {/* Ticket List */}
//         <div className="space-y-6">
//           {tickets.map((ticket) => (
//             <Card key={ticket.ticketId} className="bg-gray-800 border-gray-700 overflow-hidden hover:shadow-lg hover:shadow-purple-500/10 transition-shadow">
//               <div className="flex flex-col lg:flex-row">
//                 {/* Content */}
//                 <CardContent className="flex-1 p-6">
//                   <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
//                     <div className="flex-1 space-y-3">
//                       {/* Date & Status */}
//                       <div className="flex flex-col sm:flex-row sm:items-center gap-2">
//                         <div className="flex items-center gap-2 text-sm text-gray-400">
//                           <Calendar className="h-4 w-4" />
//                           {formatDate(ticket.registeredDate)}
//                         </div>
//                         <div className="flex items-center gap-2">
//                           {getStatusBadge(ticket.isRefunded)}
//                         </div>
//                       </div>

//                       {/* Title */}
//                       <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
//                         Vé hội nghị #{ticket.ticketId.slice(-8)}
//                       </h2>

//                       {/* Ticket Info */}
//                       <div className="bg-gray-700 border border-gray-600 p-4 rounded-lg space-y-2">
//                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//                           <div className="flex items-center gap-2">
//                             <Badge className="bg-purple-800 text-purple-200 border-purple-600">
//                               Vé tham dự
//                             </Badge>
//                             <span className="text-lg font-bold text-purple-400">
//                               {formatPrice(ticket.actualPrice)}
//                             </span>
//                           </div>
//                           <div className="flex items-center gap-2 text-sm text-gray-400">
//                             <Clock className="h-4 w-4" />
//                             {formatDate(ticket.registeredDate)}
//                           </div>
//                         </div>
//                         <div className="text-sm text-gray-400">
//                           Ngày đăng ký: {formatDate(ticket.registeredDate)}
//                         </div>
//                         <div className="text-xs text-gray-500 font-mono">
//                           Mã vé: {ticket.ticketId}
//                         </div>
//                         {ticket.transactionId && (
//                           <div className="text-xs text-gray-500 font-mono">
//                             Mã giao dịch: {ticket.transactionId}
//                           </div>
//                         )}
//                       </div>

//                       {/* Actions */}
//                       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
//                         <div className="flex gap-2">
//                           {!ticket.isRefunded && (
//                             <>
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 className="flex items-center gap-2 text-purple-400 border-purple-600 hover:bg-purple-900/50 bg-gray-800"
//                               >
//                                 <QrCode className="h-4 w-4" />
//                                 QR Code
//                               </Button>
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 className="flex items-center gap-2 text-gray-300 border-gray-600 hover:bg-gray-700 bg-gray-800"
//                               >
//                                 <Download className="h-4 w-4" />
//                                 Tải vé
//                               </Button>
//                             </>
//                           )}
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             className="flex items-center gap-2 text-gray-300 border-gray-600 hover:bg-gray-700 bg-gray-800"
//                           >
//                             Chi tiết
//                             <ExternalLink className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>

//                 {/* Image */}
//                 <div className="lg:w-80 lg:flex-shrink-0">
//                   <div className="h-48 lg:h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
//                     <Ticket className="h-16 w-16 text-white/70" />
//                   </div>
//                 </div>
//               </div>
//             </Card>
//           ))}
//         </div>

//         {/* Empty State */}
//         {tickets.length === 0 && (
//           <div className="text-center py-16">
//             <Ticket className="h-16 w-16 text-gray-600 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-gray-400 mb-2">
//               Chưa có vé nào
//             </h3>
//             <p className="text-gray-500">
//               Mua vé cho hội nghị đầu tiên của bạn
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }