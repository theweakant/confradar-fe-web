// src/components/conference/RequestConferenceApproval.tsx
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
import { toast } from "sonner";
import {
  useRequestConferenceApprovalMutation,
  useGetAllConferenceStatusesQuery,
} from "@/redux/services/status.service";
import { Conference } from "@/types/conference.type";

interface RequestConferenceApprovalProps {
  open: boolean;
  onClose: () => void;
  conference: {
    conferenceId?: string;
    conferenceName?: string;
    conferenceStatusId?: string;
    [key: string]: unknown;
  };
}

export const RequestConferenceApproval: React.FC<RequestConferenceApprovalProps> = ({
  open,
  onClose,
  conference,
}) => {
  const { data: statusData } = useGetAllConferenceStatusesQuery();
  const [requestApproval, { isLoading }] = useRequestConferenceApprovalMutation();

  const currentStatusName = (() => {
    if (!conference.conferenceStatusId || !statusData?.data) return "N/A";
    const status = statusData.data.find(
    (s) => s.conferenceStatusId === conference.conferenceStatusId
    );
    return status?.conferenceStatusName || "N/A";
  })();

  const handleRequest = async () => {
    if (!conference.conferenceId) {
      toast.error("Không tìm thấy ID hội thảo.");
      return;
    }

    try {
      await requestApproval({ confId: conference.conferenceId }).unwrap();
      toast.success("Gửi yêu cầu duyệt thành công!");
      onClose();
    } catch (err) {
      console.error("Lỗi khi gửi yêu cầu duyệt:", err);
      toast.error("Gửi yêu cầu thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle>Gửi yêu cầu duyệt</DialogTitle>
        </DialogHeader>

<div className="space-y-6">
  {/* Grid 2 cột */}
  <div className="grid grid-cols-2 gap-6">
    {conference.conferenceName && (
      <div>
        <Label className="text-sm font-semibold text-gray-800">
          Tên hội thảo
        </Label>
        <p className="mt-1 text-base font-semibold text-indigo-700">
          {conference.conferenceName}
        </p>
      </div>
    )}

    <div>
      <Label className="text-sm font-semibold text-gray-800">
        Trạng thái hiện tại
      </Label>
      <p className="mt-1 text-base text-gray-400 font-semibold">
        {currentStatusName}
      </p>
    </div>
  </div>

    {/* Thông tin thêm */}
    <div className=" text-black-800 text-sm p-4 rounded-xl leading-relaxed">
      <p>
        Hội thảo hiện đang ở trạng thái{" "}
        <span className="font-semibold text-yellow-700">"Draft"</span>. Bạn đang gửi yêu
        cầu để <span className="font-semibold">ConfRadar</span> duyệt hội thảo này. Sau khi
        được duyệt, hội thảo sẽ chuyển sang trạng thái{" "}
        <span className="font-semibold text-blue-900">"Pending"</span>.
      </p>
    </div>
  </div>



        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleRequest}
            disabled={isLoading || !conference.conferenceId}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Đang gửi..." : "Gửi yêu cầu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};