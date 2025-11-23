// components/pages/ConferenceDetailPage/Tab/CustomerTicketModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { User, Calendar, DollarSign, CreditCard, Ticket, Tag } from "lucide-react";
import { formatDate, formatCurrency } from "@/helper/format";
import type { TicketHolder } from "@/types/statistics.type";
import { CancelTechTicket } from "@/components/molecules/Status/CancelTechTicket";
import { CancelResearchTicket } from "@/components/molecules/Status/CancelResearchTicket";
import { Button } from "@/components/ui/button";

interface CustomerTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: TicketHolder;
  conferenceType: "technical" | "research" | null;
}

export function CustomerTicketModal({
  open,
  onOpenChange,
  ticket,
  conferenceType,
}: CustomerTicketModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Chi tiết vé</DialogTitle>
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
              label="Loại vé"
              value={ticket.ticketTypeName}
            />
            <InfoRow
              icon={<Tag className="w-4 h-4" />}
              label="Đợt giá"
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
                    ticket.status === "Đã thanh toán"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                  }`}
                >
                  {ticket.status}
                </span>
              }
            />
          </div>
        </div>

<DialogFooter className="flex flex-row justify-end gap-2 pt-2 mt-4 border-t">
  <Button 
    variant="outline" 
    onClick={() => onOpenChange(false)}
    className="px-6"
  >
    Đóng
  </Button>

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