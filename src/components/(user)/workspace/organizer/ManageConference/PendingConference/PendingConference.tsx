"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, MapPin, Users, Tag, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useLazyGetPendingConferencesQuery,
  useApproveConferenceMutation,
} from "@/redux/services/conference.service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { ApiError } from "@/types/api.type";
import { ConferenceResponse } from "@/types/conference.type";
export default function PendingConference() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [selectedConference, setSelectedConference] = useState<string | null>(
    null
  );

  const [isApproveAction, setIsApproveAction] = useState<boolean>(true);
  const [reason, setReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const [getPendingConferences, { data, isLoading, isFetching }] = useLazyGetPendingConferencesQuery();
  const [approveConference, { isLoading: isSubmitting }] = useApproveConferenceMutation();

  useEffect(() => {
    getPendingConferences({ page, pageSize });
  }, [page, pageSize, getPendingConferences]);

  const handleOpenDialog = (conferenceId: string, approve: boolean) => {
    setSelectedConference(conferenceId);
    setIsApproveAction(approve);
    setReason("");
    setDialogOpen(true);
  };
  const handleConferenceClick = (conferenceId: string) => {
    router.push(`/workspace/organizer/manage-conference/view-detail/${conferenceId}`);
  };
  const handleSubmit = async () => {
    if (!selectedConference) return;

    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do!");
      return;
    }

    try {
      await approveConference({
        conferenceId: selectedConference,
        reason: reason.trim(),
        isApprove: isApproveAction,
      }).unwrap();

      toast.success(
        isApproveAction ? "Đã phê duyệt hội nghị thành công!" : "Đã từ chối hội nghị!"
      );

      getPendingConferences({ page, pageSize });

      setDialogOpen(false);
      setSelectedConference(null);
      setReason("");
    } catch (error: unknown) { 
      const err = error as ApiError; 
      const errorMessage = err?.Message || "Có lỗi xảy ra, hãy thử lại!"; 
      toast.error(errorMessage); 
      }
  };

  const pendingConferences = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/workspace/organizer/manage-conference">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Hội nghị chờ duyệt</h1>
          <p className="text-gray-600 mt-2">
            Danh sách các hội nghị đang chờ phê duyệt từ ban tổ chức
          </p>
        </div>

        {isLoading || isFetching ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-gray-600 mt-4">Đang tải...</p>
          </div>
        ) : pendingConferences.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không có hội nghị chờ duyệt
            </h3>
            <p className="text-gray-600">
              Hiện tại không có hội nghị nào đang chờ phê duyệt
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6">
              {pendingConferences.map((conference: ConferenceResponse) => (
                  <div
                    key={conference.conferenceId}
                    className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleConferenceClick(conference.conferenceId)}
                  >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {conference.conferenceName}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {conference.description}
                      </p>
                    </div>
                    {conference.bannerImageUrl && (
                      <img
                        src={conference.bannerImageUrl}
                        alt={conference.conferenceName || "banner"}
                        className="w-28 h-16 object-cover rounded-md ml-4"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>
                        Người tạo:{" "}
                        {conference.createdBy ?? "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Tag className="w-4 h-4 mr-2" />
                      <span>
                        Danh mục: {conference.conferenceCategoryId ?? "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{conference.address ?? "N/A"}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>
                        {conference.startDate
                          ? new Date(conference.startDate).toLocaleDateString(
                              "vi-VN"
                            )
                          : "N/A"}{" "}
                        -{" "}
                        {conference.endDate
                          ? new Date(conference.endDate).toLocaleDateString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>
                        Sức chứa: {conference.totalSlot ?? "N/A"} người
                        {conference.availableSlot != null && (
                          <span className="ml-2 text-xs text-gray-500">
                            (Còn: {conference.availableSlot})
                          </span>
                        )}
                      </span>
                    </div>

                    {conference.createdAt && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>
                          Nộp ngày:{" "}
                          {new Date(conference.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      Chờ phê duyệt
                    </span>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(conference.conferenceId, false);
                        }}
                        disabled={isSubmitting}
                      >
                        Từ chối
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(conference.conferenceId, true);
                        }}
                        disabled={isSubmitting}
                      >
                        Phê duyệt
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isFetching}
                >
                  Trang trước
                </Button>
                <span className="text-sm text-gray-600">
                  Trang {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || isFetching}
                >
                  Trang sau
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Approval/Rejection Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isApproveAction ? "Phê duyệt hội nghị" : "Từ chối hội nghị"}
            </DialogTitle>
            <DialogDescription>
              {isApproveAction
                ? "Vui lòng nhập lý do phê duyệt hội nghị này."
                : "Vui lòng nhập lý do từ chối hội nghị này."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">
                Lý do {isApproveAction ? "phê duyệt" : "từ chối"}
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setSelectedConference(null);
                setReason("");
              }}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !reason.trim()}
              className={
                isApproveAction
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}