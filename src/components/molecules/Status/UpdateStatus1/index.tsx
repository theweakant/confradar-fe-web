// "use client";

// import { useState, useMemo, useCallback } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { toast } from "sonner";
// import { useAuth } from "@/redux/hooks/useAuth";
// import {
//   useGetAllConferenceStatusesQuery,
//   useUpdateOwnConferenceStatusMutation,
// } from "@/redux/services/status.service";
// import { useAddDaysSinceLastOnHoldMutation } from "@/redux/services/conference.service";
// import { ApiResponse } from "@/types/api.type";
// import { ConferenceStatus } from "@/types/conference.type";
// import { CollaboratorContract } from "@/types/contract.type";
// import {
//   Conference,
//   ConferenceType,
//   validateConferenceForStatusChange,
//   validateTimelineForOnHoldToReady,
// } from "./validateConferenceStatus";
// import { ConferenceValidationAlerts, TimeValidationAlerts } from "./ValidationAlerts";
// import { ApiError } from "@/types/api.type";
// import { Clock } from "lucide-react";
// import { useGlobalTime } from "@/utils/TimeContext";

// interface UpdateConferenceStatusProps {
//   open: boolean;
//   onClose: () => void;
//   conference: Conference;
//   conferenceType: ConferenceType;
//   contract?: CollaboratorContract | null;
//   onSuccess?: () => void;
// }

// export const UpdateConferenceStatus: React.FC<UpdateConferenceStatusProps> = ({
//   open,
//   onClose,
//   conference,
//   conferenceType,
//   contract,
//   onSuccess,
// }) => {
//   const { now } = useGlobalTime(); 

//   const { user } = useAuth();
//   const roles: string[] = Array.isArray(user?.role)
//     ? user.role.filter((r): r is string => typeof r === "string")
//     : user?.role
//       ? [user.role]
//       : [];

//   const { data: statusData } = useGetAllConferenceStatusesQuery();

//   const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateOwnConferenceStatusMutation();
//   const [addDays, { isLoading: isAddingDays }] = useAddDaysSinceLastOnHoldMutation();

//   const [selectedStatusId, setSelectedStatusId] = useState<string>("");
//   const [reason, setReason] = useState<string>("");
//   const [showEarlyCompleteConfirm, setShowEarlyCompleteConfirm] = useState<boolean>(false);
//   const [validationKey, setValidationKey] = useState(0);

//   const statusIdToNameMap = useMemo<Record<string, string>>(() => {
//     if (!statusData?.data) return {};
//     return statusData.data.reduce((acc, s: ConferenceStatus) => {
//       acc[s.conferenceStatusId] = s.conferenceStatusName;
//       return acc;
//     }, {} as Record<string, string>);
//   }, [statusData]);

//   const currentStatusName = statusIdToNameMap[conference?.conferenceStatusId || ""] || "N/A";
//   const targetStatusName = selectedStatusId ? statusIdToNameMap[selectedStatusId] : "";

//   const { missingRequired, missingRecommended } = useMemo(() => {
//     const needsValidation =
//       (currentStatusName === "Draft" && targetStatusName === "Pending") ||
//       (currentStatusName === "Preparing" && targetStatusName === "Ready");

//     if (!needsValidation) {
//       return { missingRequired: [], missingRecommended: [] };
//     }

//     return validateConferenceForStatusChange({
//       conference,
//       conferenceType,
//       contract,
//     });
//   }, [conference, conferenceType, currentStatusName, targetStatusName, contract, validationKey]);

//   const timeValidation = useMemo(() => {
//     if (currentStatusName === "OnHold" && targetStatusName === "Ready") {
//       return validateTimelineForOnHoldToReady(conference, conferenceType, now); 
//     }
//     return { valid: true, expiredDates: [], message: undefined };
//   }, [conference, conferenceType, currentStatusName, targetStatusName, now, validationKey]); 

//   const hasCollaboratorRole = roles.some(
//     (r) => typeof r === "string" && r.toLowerCase().replace(/\s+/g, "").includes("collaborator")
//   );
//   const hasOrganizerRole = roles.some(
//     (r) => typeof r === "string" && r.toLowerCase().replace(/\s+/g, "").includes("conferenceorganizer")
//   );

//   const availableStatusOptions = useMemo<{ id: string; name: string }[]>(() => {
//     if (!hasOrganizerRole && !hasCollaboratorRole) return [];

//     const nameToIdMap: Record<string, string> = {};
//     statusData?.data.forEach((s: ConferenceStatus) => {
//       nameToIdMap[s.conferenceStatusName] = s.conferenceStatusId;
//     });

//     let allowedNames: string[] = [];
//     switch (currentStatusName) {
//       case "Draft":
//         allowedNames = hasCollaboratorRole ? ["Pending"] : [];
//         break;
//       case "Pending":
//         allowedNames = hasCollaboratorRole ? ["Draft"] : [];
//         break;
//       case "Preparing":
//         allowedNames = ["Ready"];
//         break;
//       case "Ready":
//         allowedNames = ["Completed", "OnHold"];
//         break;
//       case "OnHold":
//         allowedNames = ["Ready", "Cancelled"];
//         break;
//       case "Rejected":
//         allowedNames = [];
//         break;
//       default:
//         if (hasOrganizerRole || hasCollaboratorRole) {
//           allowedNames = ["Completed"];
//         } else {
//           allowedNames = [];
//         }
//         break;
//     }

//     return allowedNames
//       .map((name) => ({
//         id: nameToIdMap[name],
//         name,
//       }))
//       .filter((opt) => opt.id);
//   }, [roles, currentStatusName, statusData, hasCollaboratorRole, hasOrganizerRole]);

//   const needsDataValidation =
//     (currentStatusName === "Draft" && targetStatusName === "Pending") ||
//     (currentStatusName === "Preparing" && targetStatusName === "Ready");

//   const needsTimeValidation = currentStatusName === "OnHold" && targetStatusName === "Ready";

//   const canSubmit =
//     !isUpdatingStatus &&
//     selectedStatusId &&
//     (!needsDataValidation || missingRequired.length === 0) &&
//     (!needsTimeValidation || timeValidation.valid);

//   const performStatusUpdate = async () => {
//     try {
//       if (!conference?.conferenceId) {
//         toast.error("Không tìm thấy ID!");
//         return;
//       }

//       const res: ApiResponse = await updateStatus({
//         confid: conference.conferenceId,
//         newStatus: selectedStatusId,
//         reason,
//       }).unwrap();

//       if (res.success) {
//         toast.success(res.message || "Cập nhật trạng thái thành công!");
//         onSuccess?.();
//         setSelectedStatusId("");
//         setReason("");
//         onClose();
//       } else {
//         toast.error(res.message || "Cập nhật thất bại");
//       }
//     } catch (err) {
//       const apiError = err as { data?: ApiError };
//       toast.error(apiError.data?.message || "Có lỗi xảy ra khi cập nhật");
//     }
//   };

//   const handleSubmit = async () => {
//     if (!selectedStatusId) {
//       return toast.error("Vui lòng chọn trạng thái mới");
//     }

//     if (targetStatusName === "Completed") {
//       const endDate = conference.endDate ? new Date(conference.endDate) : null;

//       // ✅ Dùng `now` thay vì `new Date()`
//       if (!endDate || now <= endDate) {
//         setShowEarlyCompleteConfirm(true);
//         return;
//       }
//     }

//     await performStatusUpdate();
//   };

//   const handleConfirmEarlyComplete = () => {
//     setShowEarlyCompleteConfirm(false);
//     performStatusUpdate();
//   };

//   const handleAutoUpdateTime = useCallback(async () => {
//     if (!conference?.conferenceId) return;

//     try {
//       const res = await addDays(conference.conferenceId).unwrap();
//       toast.success(res.message || "Đã cập nhật thời gian thành công!");
//       setValidationKey((prev) => prev + 1);
//       onSuccess?.();
//     } catch (err) {
//       const error = err as { data?: ApiError };
//       const message = error.data?.message || "Có lỗi xảy ra khi cập nhật thời gian";
//       toast.error(message);
//     }
//   }, [addDays, conference?.conferenceId, onSuccess]);

//   const getStatusColor = (statusName: string): string => {
//     switch (statusName) {
//       case "Draft":
//         return "text-gray-600 bg-gray-100 border border-gray-300";
//       case "Pending":
//         return "text-purple-600 bg-purple-100 border border-purple-300";
//       case "Preparing":
//         return "text-yellow-600 bg-yellow-100 border border-yellow-300";
//       case "Ready":
//         return "text-blue-600 bg-blue-100 border border-blue-300";
//       case "Completed":
//         return "text-green-600 bg-green-100 border border-green-300";
//       case "OnHold":
//         return "text-orange-600 bg-orange-100 border border-orange-300";
//       case "Cancelled":
//         return "text-red-600 bg-red-100 border border-red-300";
//       default:
//         return "text-gray-600 bg-gray-100 border border-gray-300";
//     }
//   };

//   const isLoading = isUpdatingStatus || isAddingDays;

//   return (
//     <>
//       <Dialog open={open} onOpenChange={onClose}>
//         <DialogContent className="max-w-md p-6 max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Cập nhật trạng thái</DialogTitle>
//           </DialogHeader>

//           {currentStatusName === "Completed" ? (
//             <div className="py-4 text-center">
//               <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm font-medium mb-3">
//                 Đã hoàn thành
//               </div>
//               <p className="text-sm text-gray-600">
//                 Sự kiện đã hoàn thành. Không thể cập nhật trạng thái.
//               </p>
//             </div>
//           ) : (
//             <>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                 <div>
//                   <Label className="text-sm font-medium">Trạng thái hiện tại</Label>
//                   <p
//                     className={`text-sm font-semibold mt-1 px-2 py-1 rounded-md inline-block ${getStatusColor(
//                       currentStatusName
//                     )}`}
//                   >
//                     {currentStatusName}
//                   </p>
//                 </div>

//                 <div>
//                   <Label className="text-sm font-medium">Trạng thái mới</Label>
//                   <Select
//                     onValueChange={setSelectedStatusId}
//                     value={selectedStatusId}
//                     disabled={availableStatusOptions.length === 0}
//                   >
//                     <SelectTrigger className="mt-1">
//                       <SelectValue placeholder="Chọn trạng thái mới" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {availableStatusOptions.map((opt) => (
//                         <SelectItem key={opt.id} value={opt.id}>
//                           {opt.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   {availableStatusOptions.length === 0 && (
//                     <p className="text-xs text-gray-400 mt-1">
//                       Không có trạng thái chuyển tiếp hợp lệ.
//                     </p>
//                   )}
//                 </div>
//               </div>

//               {currentStatusName === "Ready" && (conference.startDate || conference.endDate) && (
//                 <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
//                   <p className="text-sm text-blue-800">
//                     Thời gian diễn ra sự kiện:{" "}
//                     <span className="font-medium">
//                       {conference.startDate
//                         ? new Date(conference.startDate).toLocaleDateString("vi-VN")
//                         : "chưa xác định"}{" "}
//                       →{" "}
//                       {conference.endDate
//                         ? new Date(conference.endDate).toLocaleDateString("vi-VN")
//                         : "chưa xác định"}
//                     </span>
//                   </p>
//                 </div>
//               )}

//               <div className="mb-4">
//                 <Label className="text-sm font-medium">Lý do (tùy chọn)</Label>
//                 <Textarea
//                   placeholder="Nhập lý do (nếu có)"
//                   value={reason}
//                   onChange={(e) => setReason(e.target.value)}
//                   className="mt-1"
//                   rows={3}
//                 />
//               </div>

//               {needsDataValidation && (
//                 <div className="mb-4">
//                   <ConferenceValidationAlerts
//                     missingRequired={missingRequired}
//                     missingRecommended={missingRecommended}
//                   />
//                 </div>
//               )}

//               {needsTimeValidation && (
//                 <div className="mb-4">
//                   <TimeValidationAlerts
//                     expiredDates={timeValidation.expiredDates}
//                     message={timeValidation.message}
//                   />

//                   {timeValidation.expiredDates.length > 0 && (
//                     <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
//                       <div className="flex flex-col gap-2">
//                         <div className="flex items-start gap-2">
//                           <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
//                           <div>
//                             <p className="text-sm font-semibold text-blue-800">
//                               Tự động cập nhật thời gian
//                             </p>
//                             <p className="text-xs text-blue-600 mt-1">
//                               Chức năng này sẽ tự động cộng thêm ngày vào các mốc thời gian bị đáo hạn khi bạn &quot;OnHold&quot; quá lâu!
//                             </p>
//                           </div>
//                         </div>
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           className="w-fit ml-7 text-blue-700 border-blue-300 hover:bg-blue-100"
//                           onClick={handleAutoUpdateTime}
//                           disabled={isAddingDays}
//                         >
//                           {isAddingDays ? "Đang cập nhật..." : "Cập nhật tự động"}
//                         </Button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </>
//           )}

//           <DialogFooter className="flex justify-end gap-2">
//             <Button variant="outline" onClick={onClose}>
//               {currentStatusName === "Completed" ? "Đóng" : "Hủy"}
//             </Button>
//             {currentStatusName !== "Completed" && (
//               <Button onClick={handleSubmit} disabled={ isLoading}>
//                 {isLoading ? "Đang xử lý..." : "Xác nhận"}
//               </Button>
//             )}
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       <Dialog open={showEarlyCompleteConfirm} onOpenChange={setShowEarlyCompleteConfirm}>
//         <DialogContent className="max-w-md p-6">
//           <DialogHeader>
//             <DialogTitle>Xác nhận kết thúc sự kiện sớm</DialogTitle>
//           </DialogHeader>

//           <div className="text-sm text-gray-700 space-y-3">
//             {(() => {
//               // ✅ Dùng `now` từ useGlobalTime thay vì new Date()
//               const startDate = conference.startDate ? new Date(conference.startDate) : null;
//               const endDate = conference.endDate ? new Date(conference.endDate) : null;

//               if (startDate && now < startDate) {
//                 return "Sự kiện chưa diễn ra. Bạn có muốn kết thúc sớm?";
//               } else if (endDate && now <= endDate) {
//                 return "Vẫn còn đang trong thời gian diễn ra. Bạn có muốn kết thúc sớm?";
//               }
//               return "Bạn có chắc muốn kết thúc sớm?";
//             })()}

//             <p className="text-red-600 font-medium text-xs">
//               Thao tác kết thúc sớm này sẽ không được hoàn tác.
//             </p>
//           </div>

//           <DialogFooter className="flex justify-end gap-2">
//             <Button variant="outline" onClick={() => setShowEarlyCompleteConfirm(false)}>
//               Hủy
//             </Button>
//             <Button variant="destructive" onClick={handleConfirmEarlyComplete}>
//               Xác nhận kết thúc
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// };



"use client";

import { useState, useMemo, useCallback } from "react";
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
import { useAddDaysSinceLastOnHoldMutation } from "@/redux/services/conference.service";
import { useCancelTechnicalTicketMutation, useCancelResearchTicketMutation } from "@/redux/services/ticket.service";
import { useGetTicketHoldersQuery } from "@/redux/services/statistics.service";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "@/types/api.type";
import { ConferenceStatus } from "@/types/conference.type";
import { CollaboratorContract } from "@/types/contract.type";
import {
  Conference,
  ConferenceType,
  validateConferenceForStatusChange,
  validateTimelineForOnHoldToReady,
} from "./validateConferenceStatus";
import { ConferenceValidationAlerts, TimeValidationAlerts } from "./ValidationAlerts";
import { ApiError } from "@/types/api.type";
import { Clock, AlertTriangle } from "lucide-react";
import { useGlobalTime } from "@/utils/TimeContext";

interface UpdateConferenceStatusProps {
  open: boolean;
  onClose: () => void;
  conference: Conference;
  conferenceType: ConferenceType;
  contract?: CollaboratorContract | null;
  onSuccess?: () => void;
}

export const UpdateConferenceStatus: React.FC<UpdateConferenceStatusProps> = ({
  open,
  onClose,
  conference,
  conferenceType,
  contract,
  onSuccess,
}) => {
  const { now } = useGlobalTime(); 

  const { user } = useAuth();
  const roles: string[] = Array.isArray(user?.role)
    ? user.role.filter((r): r is string => typeof r === "string")
    : user?.role
      ? [user.role]
      : [];

  const { data: statusData } = useGetAllConferenceStatusesQuery();
  
  const { data: ticketHoldersData } = useGetTicketHoldersQuery(
    conference?.conferenceId ? conference.conferenceId : skipToken
  );
  
  const ticketHolders = Array.isArray(ticketHoldersData?.data?.items) 
    ? ticketHoldersData.data.items 
    : [];

  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateOwnConferenceStatusMutation();
  const [addDays, { isLoading: isAddingDays }] = useAddDaysSinceLastOnHoldMutation();
  const [cancelTechTicket, { isLoading: isCancellingTech }] = useCancelTechnicalTicketMutation();
  const [cancelResearchTicket, { isLoading: isCancellingResearch }] = useCancelResearchTicketMutation();

  const [selectedStatusId, setSelectedStatusId] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [showEarlyCompleteConfirm, setShowEarlyCompleteConfirm] = useState<boolean>(false);
  const [showCancelTicketsConfirm, setShowCancelTicketsConfirm] = useState<boolean>(false);
  const [validationKey, setValidationKey] = useState(0);

  const statusIdToNameMap = useMemo<Record<string, string>>(() => {
    if (!statusData?.data) return {};
    return statusData.data.reduce((acc, s: ConferenceStatus) => {
      acc[s.conferenceStatusId] = s.conferenceStatusName;
      return acc;
    }, {} as Record<string, string>);
  }, [statusData]);

  const currentStatusName = statusIdToNameMap[conference?.conferenceStatusId || ""] || "N/A";
  const targetStatusName = selectedStatusId ? statusIdToNameMap[selectedStatusId] : "";

  const { missingRequired, missingRecommended } = useMemo(() => {
    const needsValidation =
      (currentStatusName === "Draft" && targetStatusName === "Pending") ||
      (currentStatusName === "Preparing" && targetStatusName === "Ready");

    if (!needsValidation) {
      return { missingRequired: [], missingRecommended: [] };
    }

    return validateConferenceForStatusChange({
      conference,
      conferenceType,
      contract,
    });
  }, [conference, conferenceType, currentStatusName, targetStatusName, contract, validationKey]);

  const timeValidation = useMemo(() => {
    if (currentStatusName === "OnHold" && targetStatusName === "Ready") {
      return validateTimelineForOnHoldToReady(conference, conferenceType, now); 
    }
    return { valid: true, expiredDates: [], message: undefined };
  }, [conference, conferenceType, currentStatusName, targetStatusName, now, validationKey]); 

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
      case "Pending":
        allowedNames = hasCollaboratorRole ? ["Draft"] : [];
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
      case "Rejected":
        allowedNames = [];
        break;
      default:
        if (hasOrganizerRole || hasCollaboratorRole) {
          allowedNames = ["Completed"];
        } else {
          allowedNames = [];
        }
        break;
    }

    return allowedNames
      .map((name) => ({
        id: nameToIdMap[name],
        name,
      }))
      .filter((opt) => opt.id);
  }, [roles, currentStatusName, statusData, hasCollaboratorRole, hasOrganizerRole]);

  const needsDataValidation =
    (currentStatusName === "Draft" && targetStatusName === "Pending") ||
    (currentStatusName === "Preparing" && targetStatusName === "Ready");

  const needsTimeValidation = currentStatusName === "OnHold" && targetStatusName === "Ready";

  const canSubmit =
    !isUpdatingStatus &&
    selectedStatusId &&
    (!needsDataValidation || missingRequired.length === 0) &&
    (!needsTimeValidation || timeValidation.valid);

  const cancelAllTickets = async () => {
    if (ticketHolders.length === 0) {
      return; 
    }

    try {
      const ticketIds = ticketHolders.map(holder => holder.ticketId);
      
      if (conferenceType === "technical") {
        await cancelTechTicket({ ticketIds }).unwrap();
        toast.success(`Đã hủy ${ticketIds.length} vé thành công!`);
      } else if (conferenceType === "research") {
        await cancelResearchTicket({ ticketIds }).unwrap();
        toast.success(`Đã hủy ${ticketIds.length} chi phí thành công!`);
      } else {
        await cancelTechTicket({ ticketIds }).unwrap();
        toast.success(`Đã hủy ${ticketIds.length} vé thành công!`);
      }
    } catch (err) {
      console.error("Lỗi khi hủy vé:", err);
      const apiError = err as { data?: ApiError };
      toast.error(apiError.data?.message || "Không thể hủy vé. Vui lòng thử lại.");
      throw err; 
    }
  };

  const performStatusUpdate = async () => {
    try {
      if (!conference?.conferenceId) {
        toast.error("Không tìm thấy ID!");
        return;
      }

      // If changing to Cancelled from OnHold, cancel all tickets first
      if (currentStatusName === "OnHold" && targetStatusName === "Cancelled") {
        await cancelAllTickets();
      }

      const res: ApiResponse = await updateStatus({
        confid: conference.conferenceId,
        newStatus: selectedStatusId,
        reason,
      }).unwrap();

      if (res.success) {
        toast.success(res.message || "Cập nhật trạng thái thành công!");
        onSuccess?.();
        setSelectedStatusId("");
        setReason("");
        onClose();
      } else {
        toast.error(res.message || "Cập nhật thất bại");
      }
    } catch (err) {
      const apiError = err as { data?: ApiError };
      toast.error(apiError.data?.message || "Có lỗi xảy ra khi cập nhật");
    }
  };

  const handleSubmit = async () => {
    if (!selectedStatusId) {
      return toast.error("Vui lòng chọn trạng thái mới");
    }

    if (currentStatusName === "OnHold" && targetStatusName === "Cancelled" && ticketHolders.length > 0) {
      setShowCancelTicketsConfirm(true);
      return;
    }

    if (targetStatusName === "Completed") {
      const endDate = conference.endDate ? new Date(conference.endDate) : null;

      if (!endDate || now <= endDate) {
        setShowEarlyCompleteConfirm(true);
        return;
      }
    }

    await performStatusUpdate();
  };

  const handleConfirmEarlyComplete = () => {
    setShowEarlyCompleteConfirm(false);
    performStatusUpdate();
  };

  const handleConfirmCancelTickets = () => {
    setShowCancelTicketsConfirm(false);
    performStatusUpdate();
  };

  const handleAutoUpdateTime = useCallback(async () => {
    if (!conference?.conferenceId) return;

    try {
      const res = await addDays(conference.conferenceId).unwrap();
      toast.success(res.message || "Đã cập nhật thời gian thành công!");
      setValidationKey((prev) => prev + 1);
      onSuccess?.();
    } catch (err) {
      const error = err as { data?: ApiError };
      const message = error.data?.message || "Có lỗi xảy ra khi cập nhật thời gian";
      toast.error(message);
    }
  }, [addDays, conference?.conferenceId, onSuccess]);

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

  const isLoading = isUpdatingStatus || isAddingDays || isCancellingTech || isCancellingResearch;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái</DialogTitle>
          </DialogHeader>

          {currentStatusName === "Completed" ? (
            <div className="py-4 text-center">
              <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm font-medium mb-3">
                Đã hoàn thành
              </div>
              <p className="text-sm text-gray-600">
                Sự kiện đã hoàn thành. Không thể cập nhật trạng thái.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-sm font-medium">Trạng thái hiện tại</Label>
                  <p
                    className={`text-sm font-semibold mt-1 px-2 py-1 rounded-md inline-block ${getStatusColor(
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
                    <SelectTrigger className="mt-1">
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

              {currentStatusName === "Ready" && (conference.startDate || conference.endDate) && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    Thời gian diễn ra sự kiện:{" "}
                    <span className="font-medium">
                      {conference.startDate
                        ? new Date(conference.startDate).toLocaleDateString("vi-VN")
                        : "chưa xác định"}{" "}
                      →{" "}
                      {conference.endDate
                        ? new Date(conference.endDate).toLocaleDateString("vi-VN")
                        : "chưa xác định"}
                    </span>
                  </p>
                </div>
              )}

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

              {needsDataValidation && (
                <div className="mb-4">
                  <ConferenceValidationAlerts
                    missingRequired={missingRequired}
                    missingRecommended={missingRecommended}
                  />
                </div>
              )}

              {needsTimeValidation && (
                <div className="mb-4">
                  <TimeValidationAlerts
                    expiredDates={timeValidation.expiredDates}
                    message={timeValidation.message}
                  />

                  {timeValidation.expiredDates.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start gap-2">
                          <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-blue-800">
                              Tự động cập nhật thời gian
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              Chức năng này sẽ tự động cộng thêm ngày vào các mốc thời gian bị đáo hạn khi bạn &quot;OnHold&quot; quá lâu!
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-fit ml-7 text-blue-700 border-blue-300 hover:bg-blue-100"
                          onClick={handleAutoUpdateTime}
                          disabled={isAddingDays}
                        >
                          {isAddingDays ? "Đang cập nhật..." : "Cập nhật tự động"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              {currentStatusName === "Completed" ? "Đóng" : "Hủy"}
            </Button>
            {currentStatusName !== "Completed" && (
              <Button onClick={handleSubmit} disabled={!canSubmit || isLoading}>
                {isLoading ? "Đang xử lý..." : "Xác nhận"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Early Complete Confirmation Dialog */}
      <Dialog open={showEarlyCompleteConfirm} onOpenChange={setShowEarlyCompleteConfirm}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Xác nhận kết thúc sự kiện sớm</DialogTitle>
          </DialogHeader>

          <div className="text-sm text-gray-700 space-y-3">
            {(() => {
              const startDate = conference.startDate ? new Date(conference.startDate) : null;
              const endDate = conference.endDate ? new Date(conference.endDate) : null;

              if (startDate && now < startDate) {
                return "Sự kiện chưa diễn ra. Bạn có muốn kết thúc sớm?";
              } else if (endDate && now <= endDate) {
                return "Vẫn còn đang trong thời gian diễn ra. Bạn có muốn kết thúc sớm?";
              }
              return "Bạn có chắc muốn kết thúc sớm?";
            })()}

            <p className="text-red-600 font-medium text-xs">
              Thao tác kết thúc sớm này sẽ không được hoàn tác.
            </p>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEarlyCompleteConfirm(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleConfirmEarlyComplete}>
              Xác nhận kết thúc
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCancelTicketsConfirm} onOpenChange={setShowCancelTicketsConfirm}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Xác nhận hủy toàn bộ vé
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                Bạn còn <span className="font-bold text-lg">{ticketHolders.length}</span> {conferenceType === "technical" ? "vé" : "chi phí"} đã bán.
              </p>
              <p className="text-sm text-red-800 mt-2">
                &quot;Cancelled&quot; hội thảo này sẽ <span className="font-semibold">hủy toàn bộ {conferenceType === "technical" ? "vé" : "chi phí"}</span>. 
                Vui lòng chắc chắn với quyết định của bạn!
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-800">
                  Hành động này <strong>không thể hoàn tác</strong>. Tất cả {conferenceType === "technical" ? "vé" : "chi phí"} sẽ bị hủy vĩnh viễn.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowCancelTicketsConfirm(false)}
              disabled={isLoading}
            >
              Quay lại
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancelTickets}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Đang hủy vé..." : "Xác nhận hủy toàn bộ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};