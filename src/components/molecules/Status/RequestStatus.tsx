"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AlertCircle, SendHorizonal } from "lucide-react";
import {
  useRequestConferenceApprovalMutation,
  useGetAllConferenceStatusesQuery,
} from "@/redux/services/status.service";
import { useGetTechnicalConferenceDetailInternalQuery } from "@/redux/services/conference.service";

interface RequestConferenceApprovalProps {
  conferenceId: string;
  onSuccess?: () => void;
  asDropdownItem?: boolean;
}

interface ValidationError {
  field: string;
  message: string;
}

export const RequestConferenceApproval: React.FC<RequestConferenceApprovalProps> = ({
  conferenceId,
  onSuccess,
  asDropdownItem = false,
}) => {
  const [open, setOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const { data: statusData } = useGetAllConferenceStatusesQuery();
  const [requestApproval, { isLoading }] = useRequestConferenceApprovalMutation();

  const { data: conferenceDetail, isLoading: isLoadingDetail } =
    useGetTechnicalConferenceDetailInternalQuery(conferenceId, {
      skip: !conferenceId,
    });

  const shouldShowButton = useMemo(() => {
    if (!conferenceDetail?.data?.conferenceStatusId || !statusData?.data) {
      return false;
    }

    const currentStatus = statusData.data.find(
      (s) => s.conferenceStatusId === conferenceDetail.data.conferenceStatusId
    );

    return currentStatus?.conferenceStatusName?.toLowerCase() === "draft";
  }, [conferenceDetail?.data?.conferenceStatusId, statusData?.data]);

  const currentStatusName = useMemo(() => {
    if (!conferenceDetail?.data?.conferenceStatusId || !statusData?.data) return "N/A";
    const status = statusData.data.find(
      (s) => s.conferenceStatusId === conferenceDetail.data.conferenceStatusId
    );
    return status?.conferenceStatusName || "N/A";
  }, [conferenceDetail?.data?.conferenceStatusId, statusData?.data]);

  // VALIDATION LOGIC
  useEffect(() => {
    if (!conferenceDetail?.data || !open) {
      setValidationErrors([]);
      return;
    }

    const errors: ValidationError[] = [];
    const data = conferenceDetail.data;

    if (!data.conferencePrices || data.conferencePrices.length === 0) {
      errors.push({
        field: "conferencePrices",
        message: "Chưa thiết lập giá vé cho hội thảo",
      });
    }

    if (!data.sessions || data.sessions.length === 0) {
      errors.push({
        field: "sessions",
        message: "Chưa có session nào cho hội thảo",
      });
    }

    if (!data.policies || data.policies.length === 0) {
      errors.push({
        field: "policies",
        message: "Chưa thiết lập chính sách cho hội thảo",
      });
    }

    if (!data.conferenceMedia || data.conferenceMedia.length === 0) {
      errors.push({
        field: "conferenceMedia",
        message: "Chưa có media nào cho hội thảo",
      });
    }

    if (!data.sponsors || data.sponsors.length === 0) {
      errors.push({
        field: "sponsors",
        message: "Chưa có nhà tài trợ nào",
      });
    }

    setValidationErrors(errors);
  }, [conferenceDetail, open]);

  // SUBMIT HANDLER
  const handleRequest = async () => {
    if (!conferenceId) {
      toast.error("Không tìm thấy ID hội thảo.");
      return;
    }

    if (validationErrors.length > 0) {
      toast.error("Phải hoàn thành tất cả các bước mới có thể duyệt", {
        description: validationErrors.map((e) => e.message).join(", "),
      });
      return;
    }

    try {
      await requestApproval({ confId: conferenceId }).unwrap();
      toast.success("Gửi yêu cầu duyệt thành công!");
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      console.error("Lỗi khi gửi yêu cầu duyệt:", err);
      toast.error("Gửi yêu cầu thất bại. Vui lòng thử lại.");
    }
  };

  const canSubmit = validationErrors.length === 0 && !isLoadingDetail;

  if (!shouldShowButton) {
    return null;
  }

  // Render trigger button
  const TriggerButton = asDropdownItem ? (
    <DropdownMenuItem
      onClick={(e) => {
        e.preventDefault();
        // Delay để dropdown đóng trước khi mở dialog
        setTimeout(() => {
          setOpen(true);
        }, 0);
      }}
      className="cursor-pointer flex items-center gap-2 text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
    >
      <SendHorizonal className="w-4 h-4" />
      Gửi yêu cầu duyệt
    </DropdownMenuItem>
  ) : (
    <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700">
      Gửi yêu cầu duyệt
    </Button>
  );

  return (
    <>
      {TriggerButton}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Gửi yêu cầu duyệt</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {conferenceDetail?.data?.conferenceName && (
                <div>
                  <Label className="text-sm font-semibold text-gray-800">
                    Tên hội thảo
                  </Label>
                  <p className="mt-1 text-base font-semibold text-indigo-700">
                    {conferenceDetail.data.conferenceName}
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

            <div className="text-black-800 text-sm p-4 rounded-xl leading-relaxed">
            <p>
              Hội thảo hiện đang ở trạng thái{" "}
              <span className="font-semibold text-yellow-700">&quot;Draft&quot;</span>. Bạn đang gửi yêu
              cầu để <span className="font-semibold">ConfRadar</span> duyệt hội thảo này. Sau khi
              được duyệt, hội thảo sẽ chuyển sang trạng thái{" "}
              <span className="font-semibold text-blue-900">&quot;Pending&quot;</span>.
            </p>
            </div>

            {isLoadingDetail && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full" />
                <span>Đang kiểm tra dữ liệu...</span>
              </div>
            )}

            {!isLoadingDetail && validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800 mb-2">
                      Cần hoàn thành các bước sau:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.map((error, idx) => (
                        <li key={idx} className="text-sm text-red-700">
                          {error.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {!isLoadingDetail && validationErrors.length === 0 && conferenceDetail && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-green-800">
                    Hội thảo đã đủ điều kiện để gửi duyệt
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button
              onClick={handleRequest}
              disabled={isLoading || !canSubmit}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? "Đang gửi..." : "Gửi yêu cầu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};