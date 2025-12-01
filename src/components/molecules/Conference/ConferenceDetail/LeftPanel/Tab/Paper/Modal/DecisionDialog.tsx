  "use client";

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
  import { DecisionType } from "@/types/paper.type";

  interface DecisionDialogProps {
    open: boolean;
    onClose: () => void;
    onDecisionClick: (decision: DecisionType) => void;
  }

  export function DecisionDialog({
    open,
    onClose,
    onDecisionClick,
  }: DecisionDialogProps) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Step 2: Duyệt Abstract
            </DialogTitle>
            <DialogDescription>
              Vui lòng chọn quyết định cho bài báo này
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <p className="text-sm text-gray-600 mb-4">
              Sau khi đã gán reviewer, bạn có thể quyết định chấp nhận hoặc từ chối abstract này.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800">
                <strong>Lưu ý:</strong> Quyết định này sẽ không thể hoàn tác sau khi xác nhận.
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700 flex-1"
              onClick={() => onDecisionClick("Accepted")}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Chấp nhận
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => onDecisionClick("Rejected")}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }