// components/ticket/CancelResearchTicket.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { AlertCircle, Ban } from "lucide-react";
import { useCancelResearchTicketMutation } from "@/redux/services/ticket.service";

interface CancelResearchTicketProps {
  ticketIds: string[];
  onSuccess?: () => void;
  asDropdownItem?: boolean;
}

export const CancelResearchTicket: React.FC<CancelResearchTicketProps> = ({
  ticketIds,
  onSuccess,
  asDropdownItem = false,
}) => {
  const [open, setOpen] = useState(false);
  const [cancelTicket, { isLoading }] = useCancelResearchTicketMutation();

  const handleCancel = async () => {
    if (ticketIds.length === 0) return;

    try {
      await cancelTicket({ ticketIds }).unwrap();
      toast.success("Đã hủy chi phí nghiên cứu thành công!");
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      console.error("Lỗi khi hủy chi phí nghiên cứu:", err);
      toast.error("Không thể hủy chi phí. Vui lòng thử lại.");
    }
  };

  const TriggerButton = asDropdownItem ? (
    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault();
        setOpen(true);
      }}
      className="cursor-pointer flex items-center gap-2 text-red-600 focus:text-red-700 focus:bg-red-50"
    >
      <Ban className="w-4 h-4" />
      Hủy chi phí nghiên cứu
    </DropdownMenuItem>
  ) : (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => setOpen(true)}
      disabled={ticketIds.length === 0}
    >
      Hủy chi phí nghiên cứu
    </Button>
  );

  return (
    <>
      {TriggerButton}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-red-600">Xác nhận hủy chi phí nghiên cứu</DialogTitle>
            <DialogDescription>
              Hành động này sẽ hủy {ticketIds.length} chi phí nghiên cứu đã chọn. Bạn có chắc chắn không?
            </DialogDescription>
          </DialogHeader>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">
                Chi phí tham dự đã hủy <strong>không thể khôi phục</strong>. Vui lòng xác nhận kỹ trước khi tiếp tục.
              </p>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Đang xử lý..." : "Xác nhận hủy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};