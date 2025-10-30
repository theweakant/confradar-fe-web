"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import{Paper} from "@/types/paper.type"
import { useAssignPaperToReviewerMutation,  } from "@/redux/services/paper.service";
import { useGetReviewersListQuery } from "@/redux/services/user.service";

interface PaperDetailProps {
  paper: Paper;
  paperId: string;
  onClose: () => void;
}

export function PaperDetail({ paperId, onClose }: PaperDetailProps) {
  const [selectedReviewer, setSelectedReviewer] = useState<string>("");
  const [isHeadReviewer, setIsHeadReviewer] = useState(false);

  // Gọi API lấy danh sách reviewer
  const { data: reviewersData, isLoading: isLoadingReviewers } = useGetReviewersListQuery();
const reviewers = reviewersData?.data ?? [];

  // Mutation gọi API giao reviewer
  const [assignPaper, { isLoading }] = useAssignPaperToReviewerMutation();

  const handleAssign = async () => {
    if (!selectedReviewer) return alert("Vui lòng chọn reviewer!");

    try {
      const res = await assignPaper({
        userId: selectedReviewer,
        paperId,
        isHeadReviewer,
      }).unwrap();

      alert(res.message || "Giao reviewer thành công!");
      onClose();
    } catch (err: any) {
      console.error("Assign error:", err);
      alert(err?.data?.message || "Không thể giao reviewer");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Giao reviewer cho bài báo
      </h2>

      <div className="space-y-4">
        {/* Dropdown reviewer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chọn Reviewer
          </label>
          <select
            value={selectedReviewer}
            onChange={(e) => setSelectedReviewer(e.target.value)}
            disabled={isLoadingReviewers}
            className="w-full border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring focus:ring-blue-200"
          >
            <option value="">-- Chọn reviewer --</option>
            {isLoadingReviewers ? (
              <option disabled>Đang tải...</option>
            ) : reviewers.length === 0 ? (
              <option disabled>Không có reviewer nào</option>
            ) : (
              reviewers.map((rev: any) => (
                <option key={rev.userId} value={rev.userId}>
                  {rev.fullName || rev.email || rev.userId}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Checkbox Head Reviewer */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isHeadReviewer}
            onChange={(e) => setIsHeadReviewer(e.target.checked)}
            id="isHeadReviewer"
          />
          <label htmlFor="isHeadReviewer" className="text-sm text-gray-700">
            Giao làm Head Reviewer
          </label>
        </div>
      </div>

      {/* Footer buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          onClick={onClose}
          variant="outline"
          className="border border-gray-300 hover:bg-gray-50"
        >
          Đóng
        </Button>
        <Button
          onClick={handleAssign}
          disabled={isLoading || isLoadingReviewers}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? "Đang xử lý..." : "Giao reviewer"}
        </Button>
      </div>
    </div>
  );
}
