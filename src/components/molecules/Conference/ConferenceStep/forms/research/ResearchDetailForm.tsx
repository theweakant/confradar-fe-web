import { useEffect, useState } from "react";
import { FormInput } from "@/components/molecules/FormInput";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import { Building2 } from "lucide-react";
import { PublisherSelectionModal } from "@/components/molecules/Conference/ConferenceStep/modal/PublisherSelectionModal";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { ResearchDetail } from "@/types/conference.type";
import { Publisher } from "@/types/publisher.type";

interface ResearchDetailFormProps {
  formData: ResearchDetail;
  onChange: (data: ResearchDetail) => void;
  rankingOptions: Array<{ value: string; label: string }>;
  isRankingLoading: boolean;
  validationErrors?: Record<string, string>;
  totalSlot: number;
  publisherOptions: Array<{ value: string; label: string }>;
  isPublisherLoading: boolean;
  publishers?: Publisher[]; // ✅ THÊM: Full publisher data
}

export function ResearchDetailForm({
  formData,
  onChange,
  rankingOptions,
  isRankingLoading,
  validationErrors = {},
  totalSlot,
  publisherOptions,
  isPublisherLoading,
  publishers = [], // ✅ THÊM
}: ResearchDetailFormProps) {
  const currentYear = new Date().getFullYear();
  const [publisherModalOpen, setPublisherModalOpen] = useState(false);

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

  const handlePublisherSelect = (publisherId: string) => {
    handleChange("publisherId", publisherId);
  };

  const selectedRanking = rankingOptions.find(
    (opt) => opt.value === formData.rankingCategoryId
  );
  const rankType = selectedRanking?.label;

  const selectedPublisher = publishers.find(
    (pub) => pub.publisherId === formData.publisherId
  );

  return (
    <div className="space-y-4">
      {/* ✅ THAY ĐỔI: Publisher Selection Button */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nhà xuất bản <span className="text-red-500">*</span>
        </label>
        
        {/* Display Selected Publisher */}
        {selectedPublisher ? (
          <div className="border-2 border-blue-600 bg-blue-50 rounded-lg p-4 mb-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                {selectedPublisher.logoUrl && (
                  <img
                    src={selectedPublisher.logoUrl}
                    alt={selectedPublisher.name}
                    className="h-10 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-gray-900">
                    {selectedPublisher.name}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Format: {selectedPublisher.paperFormat}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPublisherModalOpen(true)}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                Thay đổi
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setPublisherModalOpen(true)}
            disabled={isPublisherLoading}
            className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-gray-700 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Building2 className="w-5 h-5" />
            <span className="font-medium">
              {isPublisherLoading ? "Đang tải..." : "Chọn nhà xuất bản"}
            </span>
          </button>
        )}
        
        {validationErrors.publisherId && (
          <p className="text-xs text-red-500 mt-1">{validationErrors.publisherId}</p>
        )}
      </div>

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
        {/* Loại xếp hạng */}
        <div className="space-y-2">
          <Label htmlFor="rankingCategoryId">
            Loại xếp hạng <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.rankingCategoryId || ""}
            onValueChange={handleRankingCategoryChange}
            disabled={isRankingLoading}
          >
            <SelectTrigger id="rankingCategoryId" className={validationErrors.rankingCategoryId ? "border-red-500" : ""}>
              <SelectValue placeholder="Chọn loại xếp hạng" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {rankingOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {validationErrors.rankingCategoryId && (
            <p className="text-xs text-red-500">{validationErrors.rankingCategoryId}</p>
          )}
        </div>

        {/* Giá trị xếp hạng */}
        {formData.rankingCategoryId && (
          <>
            {rankType === "Core" || rankType === "CoreRanking" ? (
              <div className="space-y-2">
                <Label htmlFor="rankValue">
                  Giá trị xếp hạng <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.rankValue}
                  onValueChange={(val) => handleChange("rankValue", val)}
                >
                  <SelectTrigger id="rankValue" className={validationErrors.rankValue ? "border-red-500" : ""}>
                    <SelectValue placeholder="Chọn giá trị" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Q1">Q1</SelectItem>
                      <SelectItem value="Q2">Q2</SelectItem>
                      <SelectItem value="Q3">Q3</SelectItem>
                      <SelectItem value="Q4">Q4</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {validationErrors.rankValue && (
                  <p className="text-xs text-red-500">{validationErrors.rankValue}</p>
                )}
              </div>
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

      {/* ✅ Publisher Selection Modal */}
      <PublisherSelectionModal
        open={publisherModalOpen}
        publishers={publishers}
        selectedPublisherId={formData.publisherId}
        onClose={() => setPublisherModalOpen(false)}
        onSelect={handlePublisherSelect}
        isLoading={isPublisherLoading}
      />
    </div>
  );
}