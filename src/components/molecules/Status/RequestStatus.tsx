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
import { AlertCircle, SendHorizonal, AlertTriangle } from "lucide-react";
import { useRequestConferenceApprovalMutation } from "@/redux/services/status.service";
import { useGetAllConferenceStatusesQuery } from "@/redux/services/status.service";
import { ConferenceMediaResponse, ConferencePolicyResponse, ConferencePrice, ConferencePriceResponse, Media, Policy, RefundPolicy, ResearchConferenceSessionResponse, Session, Sponsor, SponsorResponse, TechnicalConferenceSessionResponse } from "@/types/conference.type";

interface ValidationError {
  field: string;
  message: string;
}

interface Contract {
  isSponsorStep: boolean;
  isMediaStep: boolean;
  isPolicyStep: boolean;
  isSessionStep: boolean;
  isPriceStep: boolean;
}

interface ConferenceData {
  conferenceName: string;
  conferenceStatusId: string;
  sponsors: SponsorResponse[];
  conferenceMedia: ConferenceMediaResponse[];
  policies: ConferencePolicyResponse[];
  sessions: TechnicalConferenceSessionResponse[] | ResearchConferenceSessionResponse[];
  conferencePrices: ConferencePriceResponse[];
}

interface RequestConferenceApprovalProps {
  conferenceId: string;
  contract: Contract;
  conferenceData: ConferenceData;
  onSuccess?: () => void;
  asDropdownItem?: boolean;
}

export const RequestConferenceApproval: React.FC<RequestConferenceApprovalProps> = ({
  conferenceId,
  contract,
  conferenceData,
  onSuccess,
  asDropdownItem = false,
}) => {
  const [open, setOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const { data: statusData } = useGetAllConferenceStatusesQuery();
  const [requestApproval, { isLoading }] = useRequestConferenceApprovalMutation();

  const shouldShowButton = useMemo(() => {
    if (!conferenceData || !conferenceData.conferenceStatusId || !statusData?.data) {
      return false;
    }

    const currentStatus = statusData.data.find(
      (s) => s.conferenceStatusId === conferenceData.conferenceStatusId
    );

    return currentStatus?.conferenceStatusName?.toLowerCase() === "draft";
  }, [conferenceData, conferenceData?.conferenceStatusId, statusData?.data]);

  const currentStatusName = useMemo(() => {
    if (!conferenceData || !conferenceData.conferenceStatusId || !statusData?.data) {
      return "N/A";
    }

    const status = statusData.data.find(
      (s) => s.conferenceStatusId === conferenceData.conferenceStatusId
    );

    return status?.conferenceStatusName || "N/A";
  }, [conferenceData, conferenceData?.conferenceStatusId, statusData?.data]);

  useEffect(() => {
    if (!open) {
      setValidationErrors([]);
      return;
    }

    const errors: ValidationError[] = [];

    if (contract.isSponsorStep && conferenceData.sponsors.length === 0) {
      errors.push({ field: "sponsors", message: "Chưa có nhà tài trợ nào" });
    }

    if (contract.isMediaStep && conferenceData.conferenceMedia.length === 0) {
      errors.push({ field: "conferenceMedia", message: "Chưa có media" });
    }

    if (contract.isPolicyStep && conferenceData.policies.length === 0) {
      errors.push({ field: "policies", message: "Chưa thiết lập chính sách" });
    }

    if (contract.isSessionStep && conferenceData.sessions.length === 0) {
      errors.push({ field: "sessions", message: "Chưa có session" });
    }

    if (contract.isPriceStep && conferenceData.conferencePrices.length === 0) {
      errors.push({ field: "conferencePrices", message: "Chưa thiết lập giá vé" });
    }

    setValidationErrors(errors);
  }, [open, contract, conferenceData]);

  const handleRequest = async () => {
    if (validationErrors.length > 0) {
      toast.error("Phải hoàn thành tất cả các bước bắt buộc mới có thể gửi duyệt", {
        description: validationErrors.map((e) => e.message).join("\n"),
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

  const canSubmit = validationErrors.length === 0;

  if (!shouldShowButton) {
    return null;
  }

  const TriggerButton = asDropdownItem ? (
    <DropdownMenuItem
      onClick={(e) => {
        e.preventDefault();
        setTimeout(() => setOpen(true), 0);
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
              <div>
                <Label className="text-sm font-semibold text-gray-800">Tên hội thảo</Label>
                <p className="mt-1 text-base font-semibold text-indigo-700">
                  {conferenceData.conferenceName}
                </p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-800">Trạng thái hiện tại</Label>
                <p className="mt-1 text-base text-gray-400 font-semibold">{currentStatusName}</p>
              </div>
            </div>

            <div className="text-gray-800 text-sm p-4 rounded-xl bg-blue-50 leading-relaxed">
              <p>
                Hội thảo hiện đang ở trạng thái{" "}
                <span className="font-semibold text-yellow-700">&quot;Draft&quot;</span>. Bạn đang gửi yêu
                cầu để <span className="font-semibold">ConfRadar</span> duyệt hội thảo này. Sau khi
                được duyệt, hội thảo sẽ chuyển sang trạng thái{" "}
                <span className="font-semibold text-blue-900">&quot;Pending&quot;</span>.
              </p>
            </div>

            {/* WARNING SECTION - Hiển thị cả khi đã đủ điều kiện */}
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900 mb-2">
                    Lưu ý quan trọng
                  </p>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Sau khi gửi duyệt, bạn sẽ <span className="font-semibold">không thể cập nhật</span> các thông tin sau:
                  </p>
                  <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
                    <li className="text-sm text-amber-800">Thông tin cơ bản</li>
                    <li className="text-sm text-amber-800">Giá vé</li>
                    <li className="text-sm text-amber-800">Sessions</li>
                  </ul>
                  <p className="text-sm text-amber-900 font-semibold mt-3">
                    Hãy chắc chắn với những thông tin bạn đã cung cấp!
                  </p>
                </div>
              </div>
            </div>

            {/* VALIDATION ERRORS */}
            {validationErrors.length > 0 ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800 mb-2">Cần hoàn thành các bước sau:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.map((error, idx) => (
                        <li key={idx} className="text-sm text-red-700">{error.message}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-green-800">
                    Hội thảo của bạn đã đủ điều kiện để gửi duyệt
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