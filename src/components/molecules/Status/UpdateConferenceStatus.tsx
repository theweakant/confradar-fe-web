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
import { ROLES } from "@/constants/roles";
import { ApiResponse } from "@/types/api.type";

interface Conference {
  conferenceId: string;
  conferenceStatusId: string; // ✅ Bắt buộc có ID
  conferenceStatusName?: string; // có thể không có
  [key: string]: any;
}

interface UpdateConferenceStatusProps {
  open: boolean;
  onClose: () => void;
  conference: Conference;
}

// Chuẩn hóa tên trạng thái để so sánh an toàn
const normalizeStatus = (name: string): string => {
  return name.toLowerCase().replace(/\s+/g, "");
};

export const UpdateConferenceStatus: React.FC<UpdateConferenceStatusProps> = ({
  open,
  onClose,
  conference,
}) => {
  const { role } = useAuth();
  const { data: statusData } = useGetAllConferenceStatusesQuery();
  const [updateStatus, { isLoading }] = useUpdateOwnConferenceStatusMutation();

  const [newStatus, setNewStatus] = useState<string>("");
  const [reason, setReason] = useState<string>("");


  
  // 🔍 Lấy currentStatusName từ conferenceStatusId (ưu tiên hơn conferenceStatusName)
  const currentStatus = useMemo(() => {
    const statusId = conference?.conferenceStatusId;
    if (!statusId || !statusData?.data) return "Unknown";

    const matchedStatus = statusData.data.find(
      (s: any) => s.conferenceStatusId === statusId
    );
    return matchedStatus?.conferenceStatusName || "Unknown";
  }, [conference?.conferenceStatusId, statusData]);

  const normalizedCurrentStatus = normalizeStatus(currentStatus);

  // 🧠 Logic chuyển trạng thái (dùng tên đã chuẩn hóa để so sánh)
  const availableStatuses = useMemo<string[]>(() => {
    if (!role || normalizedCurrentStatus === "unknown") return [];

    const roleLower = role.toLowerCase();

    if (roleLower === ROLES.COLLABORATOR) {
      if (normalizedCurrentStatus === "pending") {
        return ["Accepted", "Rejected"];
      }
      return [];
    }

    if (roleLower === ROLES.CONFERENCE_ORGANIZER) {
      switch (normalizedCurrentStatus) {
        case "preparing":
          return ["Ready", "Canceled"];
        case "ready":
          return ["Completed", "OnHold"];
        case "onhold":
          return ["Ready", "Canceled"];
        default:
          return [];
      }
    }

    return [];
  }, [role, normalizedCurrentStatus]);

  // 🚀 Gửi request cập nhật
  const handleSubmit = async () => {
    if (!newStatus) return toast.error("Please select a new status");

    try {
      const res: ApiResponse = await updateStatus({
        confid: conference.conferenceId,
        newStatus,
        reason,
      }).unwrap();

      if (res.success) {
        toast.success("Conference status updated successfully!");
        onClose();
      } else {
        toast.error(res.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Update status error:", err);
      toast.error("Error updating status");
    }
  };

console.log("Role:", role);
console.log("Normalized Current Status:", normalizedCurrentStatus);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Conference Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Current Status</Label>
            <p className="text-sm font-medium text-gray-600">
              {currentStatus}
            </p>
          </div>

          <div>
            <Label>New Status</Label>
            <Select
              onValueChange={setNewStatus}
              value={newStatus}
              disabled={availableStatuses.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableStatuses.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">
                No valid transitions available for current status.
              </p>
            )}
          </div>

          <div>
            <Label>Reason (optional)</Label>
            <Textarea
              placeholder="Enter reason (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Updating..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};