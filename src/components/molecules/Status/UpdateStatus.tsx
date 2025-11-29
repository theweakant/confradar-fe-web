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

interface Conference {
  conferenceId?: string;
  conferenceStatusId?: string;
  conferenceStatusName?: string;
  [key: string]: unknown;
}

interface UpdateConferenceStatusProps {
  open: boolean;
  onClose: () => void;
  conference: Conference;
  onSuccess?: () => void;
}

export const UpdateConferenceStatus: React.FC<UpdateConferenceStatusProps> = ({
  open,
  onClose,
  conference,
  onSuccess
}) => {
  const { user } = useAuth();
  const roles: string[] = Array.isArray(user?.role)
    ? user.role.filter((r): r is string => typeof r === "string")
    : user?.role
      ? [user.role]
      : [];

  const { data: statusData, refetch } = useGetAllConferenceStatusesQuery();
  const [updateStatus, { isLoading }] = useUpdateOwnConferenceStatusMutation();

  const [selectedStatusId, setSelectedStatusId] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  const statusIdToNameMap = useMemo<Record<string, string>>(() => {
    if (!statusData?.data) return {};
    return statusData.data.reduce((acc, s: ConferenceStatus) => {
      acc[s.conferenceStatusId] = s.conferenceStatusName;
      return acc;
    }, {} as Record<string, string>);
  }, [statusData]);

  const currentStatusName = statusIdToNameMap[conference?.conferenceStatusId || ""] || "N/A";

  const getStatusColor = (statusName: string): string => {
    switch (statusName) {
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

  const availableStatusOptions = useMemo<{ id: string; name: string }[]>(() => {
    const hasCollaboratorRole = roles.some(
      (r) => typeof r === "string" && r.toLowerCase().replace(/\s+/g, "").includes("collaborator")
    );
    const hasOrganizerRole = roles.some(
      (r) => typeof r === "string" && r.toLowerCase().replace(/\s+/g, "").includes("conferenceorganizer")
    );

    // if (!hasCollaboratorRole || !statusData?.data) return [];
    if (!hasOrganizerRole && !hasCollaboratorRole) return [];

    const nameToIdMap: Record<string, string> = {};
    statusData?.data.forEach((s: ConferenceStatus) => {
      nameToIdMap[s.conferenceStatusName] = s.conferenceStatusId;
    });

    let allowedNames: string[] = [];

    switch (currentStatusName) {
      case "Preparing":
        allowedNames = ["Ready", "Cancelled"];
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
  }, [roles, currentStatusName, statusData]);

  const handleSubmit = async () => {
    if (!selectedStatusId) {
      return toast.error("Vui lòng chọn trạng thái mới");
    }

    try {
      if (!conference?.conferenceId) {
        toast.error("Không tìm thấy ID!");
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái</DialogTitle>
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

        <div className="">
          <Label className="text-sm font-medium mb-4">Lý do (tùy chọn)</Label>
          <Textarea
            placeholder="Nhập lý do (nếu có)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1"
            rows={3}
          />
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Đang cập nhật..." : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};