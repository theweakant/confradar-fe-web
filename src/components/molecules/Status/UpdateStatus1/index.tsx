// components/molecules/Status/UpdateConferenceStatus.tsx

"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/redux/hooks/useAuth";
import {
  useGetAllConferenceStatusesQuery,
  useUpdateOwnConferenceStatusMutation,
} from "@/redux/services/status.service";
import { ApiResponse } from "@/types/api.type";
import { ConferenceStatus } from "@/types/conference.type";

import {
  Conference,
  ConferenceType,
  validateConferenceForStatusChange,
  validateTimelineForOnHoldToReady,
} from "./validateConferenceStatus";
import { ConferenceValidationAlerts, TimeValidationAlerts } from "./ValidationAlerts";

interface UpdateConferenceStatusProps {
  open: boolean;
  onClose: () => void;
  conference: Conference;
  conferenceType: ConferenceType;
  onSuccess?: () => void;
}

export const UpdateConferenceStatus: React.FC<UpdateConferenceStatusProps> = ({
  open,
  onClose,
  conference,
  conferenceType,
  onSuccess,
}) => {
  const { user } = useAuth();
  const roles: string[] = Array.isArray(user?.role)
    ? user.role.filter((r): r is string => typeof r === "string")
    : user?.role
      ? [user.role]
      : [];

  const { data: statusData } = useGetAllConferenceStatusesQuery();
  const [updateStatus, { isLoading }] = useUpdateOwnConferenceStatusMutation();

  const [selectedStatusId, setSelectedStatusId] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  // === Map status ID → Name ===
  const statusIdToNameMap = useMemo<Record<string, string>>(() => {
    if (!statusData?.data) return {};
    return statusData.data.reduce((acc, s: ConferenceStatus) => {
      acc[s.conferenceStatusId] = s.conferenceStatusName;
      return acc;
    }, {} as Record<string, string>);
  }, [statusData]);

  const currentStatusName = statusIdToNameMap[conference?.conferenceStatusId || ""] || "N/A";
  const targetStatusName = selectedStatusId ? statusIdToNameMap[selectedStatusId] : "";

  // === Validate dữ liệu hội thảo (Draft→Pending, Preparing→Ready) ===
  const { missingRequired, missingRecommended } = useMemo(() => {
    const needsValidation =
      (currentStatusName === "Draft" && targetStatusName === "Pending") ||
      (currentStatusName === "Preparing" && targetStatusName === "Ready");

    if (!needsValidation) {
      return { missingRequired: [], missingRecommended: [] };
    }
    return validateConferenceForStatusChange(conference, conferenceType);
  }, [conference, conferenceType, currentStatusName, targetStatusName]);

  // === Validate thời gian (OnHold→Ready) ===
  const timeValidation = useMemo(() => {
    if (currentStatusName === "OnHold" && targetStatusName === "Ready") {
      return validateTimelineForOnHoldToReady(conference, conferenceType);
    }
    return { valid: true, expiredDates: [], message: undefined };
  }, [conference, conferenceType, currentStatusName, targetStatusName]);

  // === Logic quyền & trạng thái hợp lệ ===
  const hasCollaboratorRole = roles.some(
    (r) => typeof r === "string" && r.toLowerCase().replace(/\s+/g, "").includes("collaborator")
  );
  const hasOrganizerRole = roles.some(
    (r) => typeof r === "string" && r.toLowerCase().replace(/\s+/g, "").includes("conferenceorganizer")
  );

  const availableStatusOptions = useMemo<{ id: string; name: string }[]>(() => {
    if (!hasOrganizerRole && !hasCollaboratorRole) return [];

    const nameToIdMap: Record<string, string> = {};
    statusData?.data.forEach((s: ConferenceStatus) => {
      nameToIdMap[s.conferenceStatusName] = s.conferenceStatusId;
    });

    let allowedNames: string[] = [];
    switch (currentStatusName) {
      case "Draft":
        allowedNames = hasCollaboratorRole ? ["Pending"] : [];
        break;
      case "Preparing":
        allowedNames = ["Ready"];
        break;
      case "Ready":
        allowedNames = ["Completed", "OnHold"];
        break;
      case "OnHold":
        allowedNames = ["Ready", "Cancelled"];
        break;
      default:
        return [];
    }

    return allowedNames
      .map((name) => ({
        id: nameToIdMap[name],
        name,
      }))
      .filter((opt) => opt.id);
  }, [roles, currentStatusName, statusData, hasCollaboratorRole, hasOrganizerRole]);

  // === Trạng thái nút submit ===
  const needsDataValidation =
    (currentStatusName === "Draft" && targetStatusName === "Pending") ||
    (currentStatusName === "Preparing" && targetStatusName === "Ready");

  const needsTimeValidation = currentStatusName === "OnHold" && targetStatusName === "Ready";

  const canSubmit =
    !isLoading &&
    selectedStatusId &&
    (!needsDataValidation || missingRequired.length === 0) &&
    (!needsTimeValidation || timeValidation.valid);

  // === Gửi yêu cầu cập nhật ===
  const handleSubmit = async () => {
    if (!selectedStatusId) {
      return toast.error("Vui lòng chọn trạng thái mới");
    }

    // Validate transition thời gian Ready → Completed
    const now = new Date();
    if (currentStatusName === "Ready" && targetStatusName === "Completed") {
      const endDate = conference.endDate ? new Date(conference.endDate) : null;
      if (!endDate || now <= endDate) {
        return toast.error("Không thể chuyển trạng thái", {
          description: "Chỉ có thể đánh dấu hoàn thành sau ngày kết thúc hội thảo.",
        });
      }
    }

    try {
      if (!conference?.conferenceId) {
        toast.error("Không tìm thấy mã hội thảo.");
        return;
      }

      const res: ApiResponse = await updateStatus({
        confid: conference.conferenceId,
        newStatus: selectedStatusId,
        reason,
      }).unwrap();

      if (res.success) {
        toast.success("Cập nhật trạng thái thành công!");
        onSuccess?.();
        setSelectedStatusId("");
        setReason("");
        onClose();
      } else {
        toast.error(res.message || "Cập nhật thất bại");
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      toast.error("Có lỗi xảy ra khi cập nhật");
    }
  };

  // === Màu sắc trạng thái ===
  const getStatusColor = (statusName: string): string => {
    switch (statusName) {
      case "Draft":
        return "text-gray-600 bg-gray-100 border border-gray-300";
      case "Pending":
        return "text-purple-600 bg-purple-100 border border-purple-300";
      case "Preparing":
        return "text-yellow-600 bg-yellow-100 border border-yellow-300";
      case "Ready":
        return "text-blue-600 bg-blue-100 border border-blue-300";
      case "Completed":
        return "text-green-600 bg-green-100 border border-green-300";
      case "OnHold":
        return "text-orange-600 bg-orange-100 border border-orange-300";
      case "Cancelled":
        return "text-red-600 bg-red-100 border border-red-300";
      default:
        return "text-gray-600 bg-gray-100 border border-gray-300";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái hội thảo</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          <div>
            <Label className="text-sm font-medium">Trạng thái hiện tại</Label>
            <p
              className={`text-sm font-semibold mt-3 px-2 py-1 rounded-md inline-block ${getStatusColor(
                currentStatusName
              )}`}
            >
              {currentStatusName}
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium">Trạng thái mới</Label>
            <Select
              onValueChange={setSelectedStatusId}
              value={selectedStatusId}
              disabled={availableStatusOptions.length === 0}
            >
              <SelectTrigger className="mt-3">
                <SelectValue placeholder="Chọn trạng thái mới" />
              </SelectTrigger>
              <SelectContent>
                {availableStatusOptions.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableStatusOptions.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Không có trạng thái chuyển tiếp hợp lệ.
              </p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <Label className="text-sm font-medium">Lý do (tùy chọn)</Label>
          <Textarea
            placeholder="Nhập lý do (nếu có)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1"
            rows={3}
          />
        </div>

        {/* Hiển thị cảnh báo validate dữ liệu (Draft→Pending, Preparing→Ready) */}
        {needsDataValidation && (
          <div className="mb-4">
            <ConferenceValidationAlerts
              missingRequired={missingRequired}
              missingRecommended={missingRecommended}
            />
          </div>
        )}

        {/* Hiển thị cảnh báo validate thời gian (OnHold→Ready) */}
        {needsTimeValidation && (
          <div className="mb-4">
            <TimeValidationAlerts
              expiredDates={timeValidation.expiredDates}
              message={timeValidation.message}
            />
          </div>
        )}

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isLoading ? "Đang cập nhật..." : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};