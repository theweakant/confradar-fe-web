"use client";

import { Users, AlertCircle } from "lucide-react";
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

interface AssignReviewerDialogProps {
  open: boolean;
  onClose: () => void;
  selectedReviewer: string;
  isHeadReviewer: boolean;
  reviewersList: ReviewerListResponse[];
  isLoadingReviewersList: boolean;
  isAssigning: boolean;
  onReviewerChange: (value: string) => void;
  onHeadReviewerChange: (value: boolean) => void;
  onAssign: () => void;
}

export function AssignReviewerDialog({
  open,
  onClose,
  selectedReviewer,
  isHeadReviewer,
  reviewersList,
  isLoadingReviewersList,
  isAssigning,
  onReviewerChange,
  onHeadReviewerChange,
  onAssign,
}: AssignReviewerDialogProps) {
  const hasAvailableReviewers = reviewersList.length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Step 1: Gán Reviewer
          </DialogTitle>
          <DialogDescription>
            Chọn reviewer để đánh giá bài báo này
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Thông báo nếu không còn reviewer */}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn Reviewer
            </label>
            <select
              value={selectedReviewer}
              onChange={(e) => onReviewerChange(e.target.value)}
              disabled={isLoadingReviewersList || !hasAvailableReviewers}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {!hasAvailableReviewers 
                  ? "Không còn reviewer khả dụng" 
                  : "Chọn reviewer"}
              </option>
              {isLoadingReviewersList ? (
                <option disabled>Đang tải...</option>
              ) : (
                reviewersList.map((rev) => (
                  <option key={rev.userId} value={rev.userId}>
                    {rev.fullName || rev.email || rev.userId}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <input
              type="checkbox"
              checked={isHeadReviewer}
              onChange={(e) => onHeadReviewerChange(e.target.checked)}
              id="isHeadReviewer"
              disabled={!hasAvailableReviewers}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
            <label 
              htmlFor="isHeadReviewer" 
              className={`text-sm font-medium ${
                hasAvailableReviewers ? "text-gray-700" : "text-gray-400"
              }`}
            >
              Giao làm Head Reviewer
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {hasAvailableReviewers ? "Hủy" : "Đóng"}
          </Button>
          {hasAvailableReviewers && (
            <Button
              onClick={onAssign}
              disabled={isAssigning || isLoadingReviewersList || !selectedReviewer}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAssigning ? "Đang xử lý..." : "Gán Reviewer"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}