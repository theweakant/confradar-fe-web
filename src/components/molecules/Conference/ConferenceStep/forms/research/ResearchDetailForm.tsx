import { useEffect } from "react";
import { FormInput } from "@/components/molecules/FormInput";
import { FormSelect } from "@/components/molecules/FormSelect";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import type { ResearchDetail } from "@/types/conference.type";

interface ResearchDetailFormProps {
  formData: ResearchDetail;
  onChange: (data: ResearchDetail) => void;
  rankingOptions: Array<{ value: string; label: string }>;
  isRankingLoading: boolean;
  validationErrors?: Record<string, string>;
  totalSlot: number;
  publisherOptions: Array<{ value: string; label: string }>; // ✅ THÊM
  isPublisherLoading: boolean; // ✅ THÊM
}

export function ResearchDetailForm({
  formData,
  onChange,
  rankingOptions,
  isRankingLoading,
  validationErrors = {},
  totalSlot,
  publisherOptions, // ✅ THÊM
  isPublisherLoading, // ✅ THÊM
}: ResearchDetailFormProps) {
  const currentYear = new Date().getFullYear();

  const handleChange = <K extends keyof ResearchDetail>(
    field: K,
    value: ResearchDetail[K]
  ) => {
    onChange({ ...formData, [field]: value });
  };

  // Auto-adjust numberPaperAccept based on allowListener & totalSlot
  useEffect(() => {
    const allowListener = formData.allowListener;
    let newNumberPaperAccept: number | undefined;

    if (!allowListener) {
      if (formData.numberPaperAccept !== totalSlot) {
        newNumberPaperAccept = totalSlot;
      }
    } else {
      if (totalSlot > 0 && formData.numberPaperAccept >= totalSlot) {
        newNumberPaperAccept = Math.max(0, totalSlot - 1);
      }
    }

    if (newNumberPaperAccept !== undefined) {
      onChange({
        ...formData,
        numberPaperAccept: newNumberPaperAccept,
      });
    }
  }, [formData.allowListener, formData.numberPaperAccept, totalSlot, formData, onChange]);

  const handleRankingCategoryChange = (newCategoryId: string) => {
    onChange({
      ...formData,
      rankingCategoryId: newCategoryId,
      rankValue: "",
    });
  };

  const selectedRanking = rankingOptions.find(
    (opt) => opt.value === formData.rankingCategoryId
  );
  const rankType = selectedRanking?.label;

  return (
    <div className="space-y-4">
      {/* ✅ THÊM: Nhà xuất bản */}
      <FormSelect
        label="Nhà xuất bản"
        name="publisherId"
        value={formData.publisherId}
        onChange={(val) => handleChange("publisherId", val)}
        options={publisherOptions}
        error={validationErrors.publisherId}
        required
        disabled={isPublisherLoading}
      />

      {/* Grid: số bài báo, số lần sửa, phí nộp bài */}
      <div className="grid grid-cols-3 gap-4">
        <FormInput
          label="Số bài báo chấp nhận"
          name="numberPaperAccept"
          type="number"
          value={formData.numberPaperAccept}
          onChange={(val) => handleChange("numberPaperAccept", Number(val))}
          error={validationErrors.numberPaperAccept}
          placeholder="VD: 50"
          disabled={!formData.allowListener}
          max={formData.allowListener ? totalSlot - 1 : totalSlot}
          min="0"
        />

        <FormInput
          label="Số lần chỉnh sửa cho phép"
          name="revisionAttemptAllowed"
          type="number"
          value={formData.revisionAttemptAllowed}
          onChange={(val) => handleChange("revisionAttemptAllowed", Number(val))}
          error={validationErrors.revisionAttemptAllowed}
          placeholder="VD: 2"
        />

        {/* ✅ ĐỔI TÊN: reviewFee → submitPaperFee */}
        <FormInput
          label="Phí nộp bài báo (VND)"
          name="submitPaperFee"
          type="text"
          value={
            formData.submitPaperFee > 0
              ? formData.submitPaperFee.toLocaleString("vi-VN")
              : ""
          }
          onChange={(val) => {
            const rawValue = val.replace(/\D/g, "");
            const numValue = rawValue === "" ? 0 : Number(rawValue);
            handleChange("submitPaperFee", numValue);
          }}
          error={validationErrors.submitPaperFee}
          placeholder="VD: 500.000"
        />
      </div>

      {/* Xếp hạng */}
      <div className="grid grid-cols-3 gap-4">
        <FormSelect
          label="Loại xếp hạng"
          name="rankingCategoryId"
          value={formData.rankingCategoryId || ""}
          onChange={handleRankingCategoryChange}
          options={rankingOptions}
          error={validationErrors.rankingCategoryId}
          required
          disabled={isRankingLoading}
        />

        {/* Giá trị xếp hạng */}
        {formData.rankingCategoryId && (
          <>
            {rankType === "Core" || rankType === "CoreRanking" ? (
              <FormSelect
                label="Giá trị xếp hạng"
                name="rankValue"
                value={formData.rankValue}
                onChange={(val) => handleChange("rankValue", val)}
                options={[
                  { value: "Q1", label: "Q1" },
                  { value: "Q2", label: "Q2" },
                  { value: "Q3", label: "Q3" },
                  { value: "Q4", label: "Q4" },
                ]}
                error={validationErrors.rankValue}
                required
              />
            ) : (
              <FormInput
                label="Giá trị xếp hạng"
                name="rankValue"
                type="number"
                value={formData.rankValue}
                onChange={(val) => handleChange("rankValue", val)}
                error={validationErrors.rankValue}
                placeholder={
                  rankType === "IF" || rankType === "CiteScore"
                    ? "1.25"
                    : rankType === "H5"
                    ? "15"
                    : "Nhập giá trị > 0"
                }
                required
                min="1"
                step={
                  rankType === "IF" || rankType === "CiteScore" ? "0.01" : "1"
                }
              />
            )}
          </>
        )}

        {/* Năm xếp hạng */}
        <FormInput
          label="Năm xếp hạng"
          name="rankYear"
          type="number"
          value={formData.rankYear}
          onChange={(val) => handleChange("rankYear", Number(val))}
          max={currentYear}
          error={validationErrors.rankYear}
        />

        {/* Lưu ý xếp hạng */}
        {formData.rankingCategoryId && (
          <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
            <strong>Lưu ý:</strong>{" "}
            {rankType === "Core" || rankType === "CoreRanking"
              ? "Chọn Q1-Q4 cho xếp hạng Core."
              : rankType === "IF" || rankType === "CiteScore"
              ? "Nhập số thập phân không âm (ví dụ: 1.25)."
              : rankType === "H5"
              ? "Nhập số nguyên không âm (ví dụ: 15)."
              : "Nhập giá trị xếp hạng hợp lệ."}
          </div>
        )}
      </div>

      {/* Mô tả xếp hạng */}
      <FormTextArea
        label="Mô tả xếp hạng"
        name="rankingDescription"
        value={formData.rankingDescription}
        onChange={(val) => handleChange("rankingDescription", val)}
        error={validationErrors.rankingDescription}
        rows={3}
        placeholder="Mô tả chi tiết về xếp hạng của hội nghị..."
      />

      {/* Cho phép người nghe */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="allowListener"
          checked={formData.allowListener}
          onChange={(e) => handleChange("allowListener", e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="allowListener" className="text-sm font-medium">
          Cho phép người nghe tham dự (không nộp bài)
        </label>
      </div>
    </div>
  );
}