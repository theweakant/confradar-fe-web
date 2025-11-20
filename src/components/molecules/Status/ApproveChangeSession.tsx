// components/ApproveChangeSession.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/redux/hooks/useAuth";
import { useApproveChangeSessionMutation } from "@/redux/services/assigningpresentersession.service"; 
import { ApiResponse } from "@/types/api.type";

interface ApproveChangeSessionProps {
  open: boolean;
  onClose: () => void;
  sessionChangeRequestId: string;
  paperTitle?: string; 
  onSuccess?: () => void;
}

export const ApproveChangeSession: React.FC<ApproveChangeSessionProps> = ({
  open,
  onClose,
  sessionChangeRequestId,
  paperTitle,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [approveChangeSession, { isLoading }] = useApproveChangeSessionMutation();

  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [reviewerComment, setReviewerComment] = useState<string>("");

  const handleApprove = async () => {
    if (isApproved === null) {
      return toast.error("Vui lòng chọn phê duyệt hoặc từ chối");
    }

    try {
      const res: ApiResponse<string> = await approveChangeSession({
        sessionChangeRequestId,
        isApproved,
        reviewerComment,
      }).unwrap();

      if (res.success) {
        toast.success(
          isApproved
            ? "Phê duyệt thay đổi phiên thành công!"
            : "Từ chối yêu cầu thay đổi phiên thành công!"
        );
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.message || "Thao tác thất bại");
      }
    } catch (err) {
      console.error("Lỗi khi xử lý yêu cầu:", err);
      toast.error("Có lỗi xảy ra khi xử lý yêu cầu");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isApproved === true ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : isApproved === false ? (
              <AlertCircle className="w-5 h-5 text-red-600" />
            ) : null}
            Xử lý yêu cầu thay đổi phiên
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {paperTitle && (
            <div className="bg-gray-50 p-3 rounded-md">
              <Label className="text-sm text-gray-600">Bài báo</Label>
              <p className="mt-1 font-medium text-gray-900">{paperTitle}</p>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium">Phê duyệt hoặc từ chối</Label>
            <div className="mt-2 flex gap-2">
              <Button
                variant={isApproved === true ? "default" : "outline"}
                size="sm"
                onClick={() => setIsApproved(true)}
                className="flex-1"
              >
                Phê duyệt
              </Button>
              <Button
                variant={isApproved === false ? "destructive" : "outline"}
                size="sm"
                onClick={() => setIsApproved(false)}
                className="flex-1"
              >
                Từ chối
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Ghi chú (tùy chọn)</Label>
            <Textarea
              placeholder="Nhập ghi chú cho người gửi..."
              value={reviewerComment}
              onChange={(e) => setReviewerComment(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isLoading || isApproved === null}
            className={
              isApproved === true
                ? "bg-green-600 hover:bg-green-700"
                : isApproved === false
                ? "bg-red-600 hover:bg-red-700"
                : ""
            }
          >
            {isLoading
              ? "Đang xử lý..."
              : isApproved === true
              ? "Phê duyệt"
              : isApproved === false
              ? "Từ chối"
              : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};