"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/molecules/FormSelect";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import { X, AlertCircle, CheckCircle2, User } from "lucide-react";
import { Paper } from "@/types/paper.type";

interface Reviewer {
  id: string;
  name: string;
  email: string;
  expertise: string[];
  assignedPapers: number;
  maxPapers: number;
}

interface AssignReviewerDto {
  paperId: string;
  reviewerIds: string[];
  notes?: string;
}

interface PaperFormProps {
  paper: Paper;
  availableReviewers: Reviewer[];
  onSave: (data: AssignReviewerDto) => void;
  onCancel: () => void;
}

export function PaperForm({ 
  paper, 
  availableReviewers,
  onSave, 
  onCancel 
}: PaperFormProps) {
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  // Check if reviewer has conflict of interest
  const hasConflict = (reviewer: Reviewer): boolean => {
    // Check if reviewer is also an author
    const isAuthor = paper.authors.some(
      author => author.toLowerCase() === reviewer.name.toLowerCase()
    );
    
    // Check if reviewer is the submitter
    const isSubmitter = reviewer.email === paper.submitterEmail;
    
    return isAuthor || isSubmitter;
  };

  // Check if reviewer is at max capacity
  const isAtMaxCapacity = (reviewer: Reviewer): boolean => {
    return reviewer.assignedPapers >= reviewer.maxPapers;
  };

  // Check if reviewer is already assigned
  const isAlreadyAssigned = (reviewerId: string): boolean => {
    return paper.reviewers.includes(reviewerId);
  };

  // Validate reviewer selection
  const validateReviewer = (reviewerId: string): string[] => {
    const validationErrors: string[] = [];
    const reviewer = availableReviewers.find(r => r.id === reviewerId);
    
    if (!reviewer) return validationErrors;

    if (hasConflict(reviewer)) {
      validationErrors.push(`${reviewer.name} có xung đột lợi ích với bài báo này`);
    }

    if (isAtMaxCapacity(reviewer)) {
      validationErrors.push(`${reviewer.name} đã đạt số lượng bài báo tối đa (${reviewer.maxPapers})`);
    }

    if (isAlreadyAssigned(reviewerId)) {
      validationErrors.push(`${reviewer.name} đã được giao bài báo này trước đó`);
    }

    return validationErrors;
  };

  const handleAddReviewer = (reviewerId: string) => {
    if (!reviewerId || reviewerId === "select") return;

    // Check if already selected
    if (selectedReviewers.includes(reviewerId)) {
      setErrors(["Reviewer này đã được chọn"]);
      return;
    }

    // Validate reviewer
    const validationErrors = validateReviewer(reviewerId);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSelectedReviewers(prev => [...prev, reviewerId]);
    setErrors([]);
  };

  const handleRemoveReviewer = (reviewerId: string) => {
    setSelectedReviewers(prev => prev.filter(id => id !== reviewerId));
    setErrors([]);
  };

  const handleSubmit = () => {
    // Validate that at least one reviewer is selected
    if (selectedReviewers.length === 0) {
      setErrors(["Vui lòng chọn ít nhất một reviewer"]);
      return;
    }

    // Final validation for all selected reviewers
    const allErrors: string[] = [];
    selectedReviewers.forEach(reviewerId => {
      const reviewerErrors = validateReviewer(reviewerId);
      allErrors.push(...reviewerErrors);
    });

    if (allErrors.length > 0) {
      setErrors(allErrors);
      return;
    }

    // Submit assignment
    onSave({
      paperId: paper.id,
      reviewerIds: selectedReviewers,
      notes: notes.trim() || undefined,
    });
  };

  const getReviewerById = (id: string) => {
    return availableReviewers.find(r => r.id === id);
  };

  // Filter out reviewers with conflicts and those already assigned
  const validReviewers = availableReviewers.filter(reviewer => {
    return !hasConflict(reviewer) && 
           !isAlreadyAssigned(reviewer.id) &&
           !selectedReviewers.includes(reviewer.id);
  });

  const reviewerOptions = [
    { value: "select", label: "-- Chọn reviewer --" },
    ...validReviewers.map(reviewer => ({
      value: reviewer.id,
      label: `${reviewer.name} (${reviewer.assignedPapers}/${reviewer.maxPapers} bài) - ${reviewer.expertise.join(", ")}`,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Paper Info */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-gray-900 mb-2">Thông tin bài báo</h4>
        <div className="space-y-1">
          <p className="text-sm">
            <span className="font-medium">Tiêu đề:</span> {paper.title}
          </p>
          <p className="text-sm">
            <span className="font-medium">Tác giả:</span> {paper.authors.join(", ")}
          </p>
          <p className="text-sm">
            <span className="font-medium">Track:</span> {paper.trackName}
          </p>
          <p className="text-sm">
            <span className="font-medium">Từ khóa:</span> {paper.keywords.join(", ")}
          </p>
        </div>
      </div>

      {/* Currently Assigned Reviewers */}
      {paper.reviewers.length > 0 && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Reviewer đã được giao ({paper.reviewers.length})
          </h4>
          <div className="space-y-2">
            {paper.reviewers.map((reviewerId) => {
              const reviewer = getReviewerById(reviewerId);
              return reviewer ? (
                <div key={reviewerId} className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-green-600" />
                  <span>{reviewer.name} - {reviewer.email}</span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Select Reviewer */}
      <div className="space-y-4">
        <FormSelect
          label="Chọn Reviewer"
          name="reviewer"
          value="select"
          onChange={handleAddReviewer}
          options={reviewerOptions}
          required
        />

        {/* Selected Reviewers */}
        {selectedReviewers.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Reviewer được chọn ({selectedReviewers.length})
            </label>
            <div className="space-y-2">
              {selectedReviewers.map((reviewerId) => {
                const reviewer = getReviewerById(reviewerId);
                if (!reviewer) return null;

                return (
                  <div
                    key={reviewerId}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{reviewer.name}</p>
                      <p className="text-sm text-gray-500">{reviewer.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          Đang xử lý: {reviewer.assignedPapers}/{reviewer.maxPapers} bài
                        </span>
                        <span className="text-xs text-blue-600">
                          {reviewer.expertise.join(", ")}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveReviewer(reviewerId)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        <FormTextArea
          label="Ghi chú (tùy chọn)"
          name="notes"
          value={notes}
          onChange={setNotes}
          placeholder="Thêm ghi chú về việc giao reviewer..."
          rows={3}
        />

        {/* Validation Errors */}
        {errors.length > 0 && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-red-900 mb-1">Lỗi xác thực</p>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-700">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Assignment Rules Info */}
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="font-medium text-yellow-900 mb-2">Quy tắc giao reviewer</p>
          <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
            <li>Reviewer không được là tác giả của bài báo</li>
            <li>Reviewer không được là người nộp bài</li>
            <li>Reviewer không được vượt quá số lượng bài báo tối đa</li>
            <li>Không thể giao cùng một reviewer hai lần cho cùng một bài báo</li>
          </ul>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Tổng reviewer khả dụng</p>
          <p className="text-2xl font-bold text-gray-900">{validReviewers.length}</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">Đã chọn</p>
          <p className="text-2xl font-bold text-blue-600">{selectedReviewers.length}</p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-600">Đã giao trước đó</p>
          <p className="text-2xl font-bold text-green-600">{paper.reviewers.length}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Hủy
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={selectedReviewers.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Xác nhận giao reviewer ({selectedReviewers.length})
        </Button>
      </div>
    </div>
  );
}