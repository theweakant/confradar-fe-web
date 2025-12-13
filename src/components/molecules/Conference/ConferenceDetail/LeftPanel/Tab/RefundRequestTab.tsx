// components/pages/ConferenceDetailPage/Tab/RefundRequestTab.tsx
"use client";

import {
  Info,
  Clock,
  FileText,
  User,
  Tag,
  Calendar,
  DollarSign,
  Loader2,
  MoreVertical,
  AlertCircle,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/helper/format";
import { useGetRefundRequestsByConferenceIdQuery } from "@/redux/services/request.service";
import type { RefundRequest } from "@/types/request.type";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CancelTechTicket } from "@/components/molecules/Status/CancelTechTicket";
import { CancelResearchTicket } from "@/components/molecules/Status/CancelResearchTicket";
import { Button } from "@/components/ui/button";

interface RefundRequestTabProps {
  conferenceId: string;
  conferenceType: "technical" | "research" | null;
  isCollaborator?: boolean;
  isTicketSelling?: boolean;
  currentUserId?: string;       // 👈 thêm: ID người dùng đang đăng nhập
  conferenceOwnerId?: string;   // 👈 thêm: ID người tạo hội thảo
}

export function RefundRequestTab({
  conferenceId,
  conferenceType,
  isCollaborator = false,
  isTicketSelling = true,
  currentUserId,
  conferenceOwnerId,
}: RefundRequestTabProps) {
  const shouldSkip = isCollaborator && !isTicketSelling;

  const { data, isLoading, error } = useGetRefundRequestsByConferenceIdQuery(conferenceId, {
    skip: shouldSkip,
  });
  
  const refundRequests = data?.data || [];

  if (isCollaborator && !isTicketSelling) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-10 h-10 text-amber-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Doanh thu không được liên kết với ConfRadar
        </h3>
        <p className="text-sm text-gray-500">
          Hội thảo này không sử dụng hệ thống bán vé của ConfRadar
        </p>
      </div>
    );
  }

  const getStatusConfig = (statusName: string) => {
    const normalized = statusName.toLowerCase();
    if (normalized.includes("pending") || normalized.includes("đang chờ")) {
      return { label: "Đang chờ", color: "bg-yellow-100 text-yellow-700 border-yellow-200" };
    }
    if (normalized.includes("approved") || normalized.includes("đã duyệt")) {
      return { label: "Đã duyệt", color: "bg-green-100 text-green-700 border-green-200" };
    }
    if (normalized.includes("rejected") || normalized.includes("từ chối")) {
      return { label: "Từ chối", color: "bg-red-100 text-red-700 border-red-200" };
    }
    return { label: statusName, color: "bg-gray-100 text-gray-700 border-gray-200" };
  };

  const renderTicketActions = (req: RefundRequest) => {
    // ✅ Chỉ chủ sở hữu hội thảo mới được hủy vé
    const isOwner = currentUserId && conferenceOwnerId && currentUserId === conferenceOwnerId;
    const canCancel = isOwner && !req.ticket.isRefunded && conferenceType;

    if (!canCancel) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {conferenceType === "technical" ? (
            <CancelTechTicket ticketIds={[req.ticketId]} asDropdownItem onSuccess={() => {}} />
          ) : conferenceType === "research" ? (
            <CancelResearchTicket ticketIds={[req.ticketId]} asDropdownItem onSuccess={() => {}} />
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-gray-600">Đang tải lịch sử hoàn tiền...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Info className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Lỗi tải dữ liệu</h3>
        <p className="text-sm text-gray-500">Không thể tải danh sách lịch sử hoàn tiền</p>
      </div>
    );
  }

  if (refundRequests.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Chưa có lịch sử hoàn tiền</h3>
        <p className="text-sm text-gray-500">
          {conferenceType === "research"
            ? "Chưa có tác giả hoặc người tham dự nào gửi yêu cầu hoàn tiền"
            : "Chưa có khách hàng nào gửi yêu cầu hoàn tiền"}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Lịch sử hoàn tiền
          </h2>
          <p className="text-sm text-gray-500 mt-1">{refundRequests.length} yêu cầu</p>
        </div>
      </div>

      <div className="space-y-4">
        {refundRequests.map((req: RefundRequest) => {
          const statusConfig = getStatusConfig(req.globalStatusName);

          return (
            <div
              key={req.refundRequestId}
              className="border border-gray-200 rounded-xl bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between p-4 border-b bg-gray-50 rounded-t-xl">
                <div className="flex items-center gap-3">
                  {req.ticket.avatarUrl ? (
                    <img
                      src={req.ticket.avatarUrl}
                      alt={req.ticket.fullName || "User"}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {req.ticket.fullName || "Người dùng"}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">{req.ticket.userId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}
                  >
                    {statusConfig.label}
                  </span>
                  {renderTicketActions(req)}
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <InfoItem
                    icon={<Tag className="w-4 h-4" />}
                    label="Mã ID"
                    value={req.ticketId}
                    mono
                  />
                  <InfoItem
                    icon={<DollarSign className="w-4 h-4" />}
                    label="Số tiền"
                    value={formatCurrency(req.ticket.actualPrice)}
                    valueClass="text-blue-600 font-semibold"
                  />
                  <InfoItem
                    icon={<Calendar className="w-4 h-4" />}
                    label="Ngày mua"
                    value={formatDate(req.ticket.registeredDate)}
                  />
                  <InfoItem
                    icon={<FileText className="w-4 h-4" />}
                    label="Giao dịch"
                    value={req.transactionId}
                    mono
                  />
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">
                    {req.ticket.pricePhaseName}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                    <div>
                      <span className="font-medium">Giảm giá:</span> {req.ticket.pricePhaseApplyPercent}%
                    </div>
                    <div>
                      <span className="font-medium">Slot:</span> {req.ticket.pricePhaseAvailableSlot}/
                      {req.ticket.pricePhaseTotalSlot}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Thời hạn:</span>{" "}
                      {formatDate(req.ticket.pricePhaseStartDate)} -{" "}
                      {formatDate(req.ticket.pricePhaseEndDate)}
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                  <p className="text-sm">
                    <span className="font-semibold text-amber-900">Lý do:</span>{" "}
                    <span className="text-amber-800">{req.reason}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-b-xl border-t text-xs">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Yêu cầu lúc: {req.createdAt ? formatDate(req.createdAt) : "N/A"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
  mono = false,
  valueClass = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="text-gray-500 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-600 font-medium">{label}</p>
        <p
          className={`truncate ${mono ? "font-mono text-xs" : ""} ${
            valueClass || "text-gray-900"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}