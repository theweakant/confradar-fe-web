// components/pages/ConferenceDetailPage/Tab/CustomerTicketModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { User, Calendar, DollarSign, CreditCard, Ticket, Tag, MapPin, Clock } from "lucide-react";
import { formatDate, formatCurrency, truncateText } from "@/helper/format";
import type { TicketHolder } from "@/types/statistics.type";
import { CancelTechTicket } from "@/components/molecules/Status/CancelTechTicket";
import { CancelResearchTicket } from "@/components/molecules/Status/CancelResearchTicket";
import { Button } from "@/components/ui/button";

interface SessionCheckIn {
  sessionId: string;
  sessionTitle: string;
  roomName: string;
  startTime: string;
  endTime: string;
  checkInStatus: string;
  checkInTime: string | null;
}

interface TicketHolderExtended extends TicketHolder {
  sessionCheckIns?: SessionCheckIn[];
}

interface CustomerTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: TicketHolderExtended;
  conferenceType: "technical" | "research" | null;
}

export function CustomerTicketModal({
  open,
  onOpenChange,
  ticket,
  conferenceType,
}: CustomerTicketModalProps) {
  const formatSessionDateTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const dateStr = start.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    });
    
    const startTimeStr = start.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
    
    const endTimeStr = end.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
    
    return `${dateStr} (${startTimeStr} → ${endTimeStr})`;
  };

  const formatCheckInTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Chi tiết</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info Card */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0">
              <User className="w-7 h-7 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-gray-900 truncate">
                {ticket.customerName}
              </h3>
              <p className="text-sm text-gray-600 font-mono truncate">
                {ticket.ticketId}
              </p>
            </div>
          </div>

          {/* Ticket Details Grid */}
          <div className="space-y-3">
            <InfoRow
              icon={<Ticket className="w-4 h-4" />}
              label="Tên loại chi phí"
              value={ticket.ticketTypeName}
            />
            <InfoRow
              icon={<Tag className="w-4 h-4" />}
              label="Giai đoạn"
              value={ticket.phaseName}
            />
            <InfoRow
              icon={<Calendar className="w-4 h-4" />}
              label="Ngày mua"
              value={formatDate(ticket.purchaseDate)}
            />
            <InfoRow
              icon={<DollarSign className="w-4 h-4" />}
              label="Số tiền"
              value={formatCurrency(ticket.actualPrice)}
              valueClassName="text-blue-600 font-semibold"
            />
            <InfoRow
              icon={<CreditCard className="w-4 h-4" />}
              label="Trạng thái"
              value={
                <span
                  className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                    ticket.overallStatus === "Đã thanh toán"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                  }`}
                >
                  {ticket.overallStatus}
                </span>
              }
            />
          </div>

          {/* Session Check-ins Section */}
          {ticket.sessionCheckIns && ticket.sessionCheckIns.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-base text-gray-900 flex items-center gap-2">
                Session tham dự ({ticket.sessionCheckIns.length})
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ticket.sessionCheckIns.map((session) => (
                  <div
                    key={session.sessionId}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all space-y-3"
                  >
                    {/* Session Title */}
                    <h4 className="font-semibold text-sm text-gray-900 truncate" title={session.sessionTitle}>
                      {truncateText(session.sessionTitle, 25)}
                    </h4>

                    {/* Room */}
                    <div className="flex items-center gap-2 text-xs text-gray-600 truncate">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{session.roomName}</span>
                    </div>

                    {/* Time Range */}
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{formatSessionDateTime(session.startTime, session.endTime)}</span>
                    </div>

                    {/* Check-in Status */}
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${
                            session.checkInStatus === "Checked In" 
                              ? "bg-green-500" 
                              : "bg-yellow-500"
                          }`} />
                          <span className="text-xs font-medium text-gray-700">
                            {session.checkInStatus === "Checked In" ? "Đã check-in" : "Chưa check-in"}
                          </span>
                        </div>
                      </div>
                      
                      {/* Check-in Time */}
                      {session.checkInTime && (
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500 truncate">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          {formatCheckInTime(session.checkInTime)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2 pt-3 mt-4 border-t">
          
          {!ticket.isRefunded && ( 
            <>
              {conferenceType === "technical" ? (
                <CancelTechTicket
                  ticketIds={[ticket.ticketId]}
                  onSuccess={() => onOpenChange(false)}
                />
              ) : conferenceType === "research" ? (
                <CancelResearchTicket
                  ticketIds={[ticket.ticketId]}
                  onSuccess={() => onOpenChange(false)}
                />
              ) : (
                <CancelTechTicket
                  ticketIds={[ticket.ticketId]}
                  onSuccess={() => onOpenChange(false)}
                />
              )}
            </>
          )}
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="px-4"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for consistent info rows
function InfoRow({
  icon,
  label,
  value,
  valueClassName = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="text-gray-500 flex-shrink-0">{icon}</div>
      <span className="text-sm font-medium text-gray-700 min-w-[90px]">
        {label}:
      </span>
      <div className={`text-sm flex-1 text-right ${valueClassName}`}>
        {value}
      </div>
    </div>
  );
}