// components/pages/ConferenceDetailPage/Tab/RefundRequestTab.tsx
"use client";

import { Info, Clock, FileText, User, Tag, Calendar, DollarSign, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatCurrency } from "@/helper/format";
import { useGetRefundRequestsByConferenceIdQuery } from "@/redux/services/request.service";
import type { RefundRequest } from "@/types/request.type";

interface RefundRequestTabProps {
  conferenceId: string;
  conferenceType: "technical" | "research" | null;
}

export function RefundRequestTab({ conferenceId, conferenceType }: RefundRequestTabProps) {
  const { data, isLoading, error } = useGetRefundRequestsByConferenceIdQuery(conferenceId);

  const refundRequests = data?.data || [];

  const renderStatusBadge = (statusName: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    const normalizedStatus = statusName.toLowerCase();
    
    if (normalizedStatus.includes("pending") || normalizedStatus.includes("đang chờ")) {
      return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Đang chờ</span>;
    }
    if (normalizedStatus.includes("approved") || normalizedStatus.includes("đã duyệt")) {
      return <span className={`${baseClasses} bg-green-100 text-green-800`}>Đã duyệt</span>;
    }
    if (normalizedStatus.includes("rejected") || normalizedStatus.includes("từ chối")) {
      return <span className={`${baseClasses} bg-red-100 text-red-800`}>Từ chối</span>;
    }
    return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{statusName}</span>;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-gray-600">Đang tải yêu cầu hoàn vé...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Info className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Lỗi tải dữ liệu</h3>
        <p className="text-gray-500">Không thể tải danh sách yêu cầu hoàn vé</p>
      </div>
    );
  }

  if (refundRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Info className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có yêu cầu hoàn vé</h3>
        <p className="text-gray-500">
          {conferenceType === "research"
            ? "Chưa có tác giả hoặc người tham dự nào gửi yêu cầu hoàn vé"
            : "Chưa có khách hàng nào gửi yêu cầu hoàn vé"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Yêu cầu hoàn vé
          </CardTitle>
          <span className="text-sm text-gray-500">{refundRequests.length} yêu cầu</span>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {refundRequests.map((req: RefundRequest) => (
              <div
                key={req.refundRequestId}
                className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {/* Header: User Info + Status */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-3">
                    {req.ticket.avatarUrl ? (
                      <img
                        src={req.ticket.avatarUrl}
                        alt={req.ticket.fullName || "User"}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {req.ticket.fullName || "Người dùng"}
                      </p>
                      <p className="text-xs text-gray-500">ID: {req.ticket.userId}</p>
                    </div>
                  </div>
                  {renderStatusBadge(req.globalStatusName)}
                </div>

                {/* Ticket & Transaction Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-gray-500" />
                      <span className="font-semibold text-gray-700">Mã vé:</span>
                      <span className="text-gray-600 font-mono text-xs">{req.ticketId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-gray-500" />
                      <span className="font-semibold text-gray-700">Giao dịch:</span>
                      <span className="text-gray-600 font-mono text-xs">{req.transactionId}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-gray-500" />
                      <span className="font-semibold text-gray-700">Số tiền:</span>
                      <span className="text-blue-600 font-medium">
                        {formatCurrency(req.ticket.actualPrice)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      <span className="font-semibold text-gray-700">Ngày mua:</span>
                      <span className="text-gray-600">{formatDate(req.ticket.registeredDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Price Phase Info */}
                <div className="bg-blue-50 rounded-md p-3 mb-3">
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    {req.ticket.pricePhaseName}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                    <p>
                      <span className="font-semibold">Giảm giá:</span> {req.ticket.pricePhaseApplyPercent}%
                    </p>
                    <p>
                      <span className="font-semibold">Slot:</span> {req.ticket.pricePhaseAvailableSlot}/
                      {req.ticket.pricePhaseTotalSlot}
                    </p>
                    <p className="col-span-2">
                      <span className="font-semibold">Thời hạn:</span>{" "}
                      {formatDate(req.ticket.pricePhaseStartDate)} -{" "}
                      {formatDate(req.ticket.pricePhaseEndDate)}
                    </p>
                  </div>
                </div>

                {/* Reason */}
                <div className="mb-3">
                  <p className="text-sm">
                    <span className="font-semibold text-gray-700">Lý do:</span>{" "}
                    <span className="text-gray-600">{req.reason}</span>
                  </p>
                </div>

                {/* Footer: Created Date */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>
                      Yêu cầu lúc: {req.createdAt ? formatDate(req.createdAt) : "N/A"}
                    </span>
                  </div>
                  {req.ticket.isRefunded && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      Đã hoàn tiền
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}