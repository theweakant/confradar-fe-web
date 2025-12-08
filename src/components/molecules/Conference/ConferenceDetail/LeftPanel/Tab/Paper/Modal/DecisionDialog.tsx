"use client";

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DecisionType } from "@/types/paper.type";

interface DecisionDialogProps {
  open: boolean;
  onClose: () => void;
  onDecisionClick: (decision: DecisionType, reason: string) => void;
}

export function DecisionDialog({
  open,
  onClose,
  onDecisionClick,
}: DecisionDialogProps) {
  const [reason, setReason] = useState<string>("");

  const isReasonEmpty = !reason.trim();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Step 2: Duyệt Abstract
          </DialogTitle>
          <DialogDescription>
            Vui lòng chọn quyết định và nhập lý do cho bài báo này.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <p className="text-sm text-gray-600">
            Sau khi đã gán reviewer, bạn có thể quyết định chấp nhận hoặc từ chối abstract này.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              <strong>Lưu ý:</strong> Quyết định này sẽ không thể hoàn tác sau khi xác nhận.
            </p>
          </div>

          <div>
            <label htmlFor="decisionReason" className="block text-sm font-medium text-gray-700 mb-1">
              Lý do (bắt buộc)
            </label>
            <Textarea
              id="decisionReason"
              placeholder="Đóng góp rõ ràng và có giá trị"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Vui lòng cung cấp lý do chi tiết để giúp tác giả hiểu rõ phản hồi của bạn.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => onDecisionClick("Rejected", reason.trim())}
            disabled={isReasonEmpty}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Từ chối
          </Button>
          <Button
            variant="default"
            className="bg-green-600 hover:bg-green-700 flex-1"
            onClick={() => onDecisionClick("Accepted", reason.trim())}
            disabled={isReasonEmpty}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Chấp nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}