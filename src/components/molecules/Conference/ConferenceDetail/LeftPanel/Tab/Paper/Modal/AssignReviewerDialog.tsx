"use client";

import { Users, AlertCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReviewerListResponse } from "@/types/user.type";
import {  useEffect } from "react";

interface AssignReviewerDialogProps {
  open: boolean;
  onClose: () => void;
  selectedReviewers: { userId: string; isHeadReviewer: boolean }[];
  reviewersList: ReviewerListResponse[];
  isLoadingReviewersList: boolean;
  isAssigning: boolean;
  onReviewersChange: (reviewers: { userId: string; isHeadReviewer: boolean }[]) => void;
  onAssign: () => void;
}

export function AssignReviewerDialog({
  open,
  onClose,
  selectedReviewers,
  reviewersList,
  isLoadingReviewersList,
  isAssigning,
  onReviewersChange,
  onAssign,
}: AssignReviewerDialogProps) {
  const hasAvailableReviewers = reviewersList.length > 0;
  const selectedReviewerIds = new Set(selectedReviewers.map((r) => r.userId));

  // Trích xuất reviewer đã chọn (để hiển thị trong dropdown head)
  const selectedReviewerObjects = reviewersList.filter((rev) =>
    selectedReviewerIds.has(rev.userId)
  );

  // Xác định head reviewer hiện tại (nếu có)
  const currentHeadReviewer = selectedReviewers.find((r) => r.isHeadReviewer)?.userId || "";

  // Khi người dùng thay đổi head reviewer
  const handleHeadReviewerChange = (userId: string) => {
    const updated = selectedReviewers.map((r) => ({
      ...r,
      isHeadReviewer: r.userId === userId,
    }));
    onReviewersChange(updated);
  };

  // Khi người dùng toggle chọn/deselect reviewer
  const handleReviewerToggle = (userId: string, checked: boolean) => {
    if (checked) {
      // Thêm reviewer mới, không phải head (mặc định)
      const newReviewer = { userId, isHeadReviewer: false };
      onReviewersChange([...selectedReviewers, newReviewer]);
    } else {
      // Gỡ reviewer
      const updated = selectedReviewers.filter((r) => r.userId !== userId);
      // Nếu gỡ head reviewer, không cần xử lý đặc biệt — head tự mất
      onReviewersChange(updated);
    }
  };

  // Nếu đã chọn reviewer nhưng chưa có head, tự động gán người đầu tiên làm head
  useEffect(() => {
    if (
      selectedReviewers.length > 0 &&
      !selectedReviewers.some((r) => r.isHeadReviewer)
    ) {
      const updated = selectedReviewers.map((r, idx) =>
        idx === 0 ? { ...r, isHeadReviewer: true } : r
      );
      onReviewersChange(updated);
    }
  }, [selectedReviewers, onReviewersChange]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Step 1: Gán Reviewer
          </DialogTitle>
          <DialogDescription>
            Chọn một hoặc nhiều reviewer. Chỉ một người có thể là <strong>Head Reviewer</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Cảnh báo không có reviewer */}
          {!isLoadingReviewersList && !hasAvailableReviewers && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-900 mb-1">
                    Không còn reviewer khả dụng
                  </h4>
                  <p className="text-sm text-amber-700">
                    Tất cả reviewer đã được gán vào bài báo này.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Danh sách reviewer để chọn */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn Reviewer
            </label>
            {isLoadingReviewersList ? (
              <div className="text-sm text-gray-500">Đang tải...</div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {reviewersList.length === 0 ? (
                  <p className="text-sm text-gray-500">Không có reviewer nào</p>
                ) : (
                  reviewersList.map((rev) => (
                    <div key={rev.userId} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`rev-${rev.userId}`}
                        checked={selectedReviewerIds.has(rev.userId)}
                        onChange={(e) => handleReviewerToggle(rev.userId, e.target.checked)}
                        disabled={!hasAvailableReviewers}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`rev-${rev.userId}`}
                        className={`text-sm flex items-center gap-2 ${
                          selectedReviewerIds.has(rev.userId) ? "font-medium" : "text-gray-600"
                        }`}
                      >
                        <User className="w-4 h-4" />
                        {rev.fullName || rev.email || rev.userId}
                        {selectedReviewers.find((r) => r.userId === rev.userId)?.isHeadReviewer && (
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full ml-auto">
                            Head
                          </span>
                        )}
                      </label>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Chọn Head Reviewer (chỉ khi có ≥1 reviewer) */}
          {selectedReviewerObjects.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn Head Reviewer
              </label>
              <select
                value={currentHeadReviewer}
                onChange={(e) => handleHeadReviewerChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {selectedReviewerObjects.map((rev) => (
                  <option key={rev.userId} value={rev.userId}>
                    {rev.fullName || rev.email || rev.userId}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Chỉ một reviewer có thể là Head Reviewer.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {hasAvailableReviewers ? "Hủy" : "Đóng"}
          </Button>
          {hasAvailableReviewers && (
            <Button
              onClick={onAssign}
              disabled={isAssigning || selectedReviewers.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAssigning ? "Đang xử lý..." : `Gán (${selectedReviewers.length})`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}