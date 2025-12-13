// components/pages/ConferenceDetailPage/Tab/CreatePhaseForm.tsx

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { DatePickerInput } from "@/components/atoms/DatePickerInput";
import { formatCurrency, formatDate } from "@/helper/format";
import { toast } from "sonner";
import type {
  ResearchConferencePhaseResponse,
  ConferencePriceResponse,
  ResearchPhase,
  RevisionRoundDeadline,
} from "@/types/conference.type";

interface CreatePhaseFormProps {
  lastPhase: ResearchConferencePhaseResponse;
  authorPrices: ConferencePriceResponse[];
  conferenceStartDate: string;
  revisionAttemptAllowed: number; // ← thêm prop này
  onSubmit: (data: {
    newPhase: ResearchPhase;
    authorConferencePriceIds: string[];
  }) => Promise<void>;
}

const addDays = (dateStr: string | undefined, days: number = 1): string | undefined => {
  if (!dateStr) return undefined;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return undefined;
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
};

const calculateEndDate = (startDate: string, duration: number): string => {
  if (!startDate || duration <= 0) return "";
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return "";
  const end = new Date(start);
  end.setDate(start.getDate() + duration - 1);
  return end.toISOString().split("T")[0];
};

const getEmptyPhase = (): ResearchPhase => ({
  registrationStartDate: "",
  registrationEndDate: "",
  registrationDuration: 1,
  fullPaperStartDate: "",
  fullPaperEndDate: "",
  fullPaperDuration: 1,
  reviewStartDate: "",
  reviewEndDate: "",
  reviewDuration: 1,
  reviseStartDate: "",
  reviseEndDate: "",
  reviseDuration: 1,
  cameraReadyStartDate: "",
  cameraReadyEndDate: "",
  cameraReadyDuration: 1,
  abstractDecideStatusStart: "",
  abstractDecideStatusEnd: "",
  abstractDecideStatusDuration: 1,
  fullPaperDecideStatusStart: "",
  fullPaperDecideStatusEnd: "",
  fullPaperDecideStatusDuration: 1,
  revisionPaperDecideStatusStart: "",
  revisionPaperDecideStatusEnd: "",
  revisionPaperDecideStatusDuration: 1,
  authorPaymentStart: "",
  authorPaymentEnd: "",
  authorPaymentDuration: 1,
  revisionRoundDeadlines: [],
});

export function CreatePhaseForm({
  lastPhase,
  authorPrices,
  conferenceStartDate,
  revisionAttemptAllowed = 2,
  onSubmit,
}: CreatePhaseFormProps) {
  const [phase, setPhase] = useState<ResearchPhase>(getEmptyPhase());
  const [selectedAuthorPriceIds, setSelectedAuthorPriceIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State cho form thêm vòng chỉnh sửa
  const [newRevisionRound, setNewRevisionRound] = useState({
    roundNumber: 1,
    startDate: "",
    durationInDays: 3,
  });

  useEffect(() => {
    setSelectedAuthorPriceIds(authorPrices.map((p) => p.conferencePriceId));
  }, [authorPrices]);

  const updatePhase = (updates: Partial<ResearchPhase>) => {
    setPhase((prev) => ({ ...prev, ...updates }));
  };

  const getFieldNames = (fieldPrefix: string) => {
    const specialFields = [
      "abstractDecideStatus",
      "fullPaperDecideStatus",
      "revisionPaperDecideStatus",
      "authorPayment",
    ];
    const isSpecial = specialFields.includes(fieldPrefix);
    return {
      startKey: isSpecial ? `${fieldPrefix}Start` : `${fieldPrefix}StartDate`,
      endKey: isSpecial ? `${fieldPrefix}End` : `${fieldPrefix}EndDate`,
      durationKey: `${fieldPrefix}Duration`,
    };
  };

  const updatePhaseStartDate = (fieldPrefix: string, newStartDate: string) => {
    const { startKey, endKey, durationKey } = getFieldNames(fieldPrefix);
    const currentDuration = (phase[durationKey as keyof ResearchPhase] as number) || 1;
    let updates: Partial<ResearchPhase> = { [startKey]: newStartDate };
    if (newStartDate && currentDuration > 0) {
      const endDate = calculateEndDate(newStartDate, currentDuration);
      updates = { ...updates, [endKey]: endDate };
    }
    updatePhase(updates);
  };

  const updatePhaseDuration = (fieldPrefix: string, newDuration: number) => {
    const { startKey, endKey, durationKey } = getFieldNames(fieldPrefix);
    const startDate = phase[startKey as keyof ResearchPhase] as string | undefined;
    let updates: Partial<ResearchPhase> = { [durationKey]: newDuration };
    if (startDate && newDuration > 0) {
      const endDate = calculateEndDate(startDate, newDuration);
      updates = { ...updates, [endKey]: endDate };
    }
    updatePhase(updates);
  };

  const handleAddRevisionRound = () => {
    const isRoundOne = phase.revisionRoundDeadlines.length === 0;
    const startSubmissionDate = isRoundOne
      ? phase.reviseStartDate
      : newRevisionRound.startDate;

    if (!startSubmissionDate) {
      toast.error("Vui lòng chọn ngày bắt đầu vòng chỉnh sửa!");
      return;
    }
    if (newRevisionRound.durationInDays <= 0) {
      toast.error("Số ngày phải lớn hơn 0!");
      return;
    }

    const endSubmissionDate = calculateEndDate(startSubmissionDate, newRevisionRound.durationInDays);
    if (phase.reviseEndDate && new Date(endSubmissionDate) > new Date(phase.reviseEndDate)) {
      toast.error("Ngày kết thúc vòng chỉnh sửa vượt quá thời gian chỉnh sửa cho phép!");
      return;
    }

    // Validate overlap
    if (!isRoundOne) {
      const isOverlapping = phase.revisionRoundDeadlines.some((round) => {
        const existingStart = new Date(round.startSubmissionDate);
        const existingEnd = new Date(round.endSubmissionDate);
        const newStart = new Date(startSubmissionDate);
        const newEnd = new Date(endSubmissionDate);
        return newStart <= existingEnd && newEnd >= existingStart;
      });
      if (isOverlapping) {
        toast.error("Vòng chỉnh sửa này bị trùng thời gian với vòng khác!");
        return;
      }
    }

    const nextRoundNumber = phase.revisionRoundDeadlines.length + 1;
    const newRound: RevisionRoundDeadline = {
      roundNumber: nextRoundNumber,
      startSubmissionDate,
      endSubmissionDate,
    };

    updatePhase({ revisionRoundDeadlines: [...phase.revisionRoundDeadlines, newRound] });

    setNewRevisionRound({
      roundNumber: nextRoundNumber + 1,
      startDate: "",
      durationInDays: 3,
    });

    toast.success("Đã thêm vòng chỉnh sửa!");
  };

  const handleRemoveRevisionRound = (index: number) => {
    const updated = [...phase.revisionRoundDeadlines];
    updated.splice(index, 1);
    updatePhase({ revisionRoundDeadlines: updated });
    toast.success("Đã xóa vòng chỉnh sửa!");
  };

  const validatePhase = (): boolean => {
    if (selectedAuthorPriceIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một loại chi phí tác giả");
      return false;
    }

    const fields = [
      "registration",
      "abstractDecideStatus",
      "fullPaper",
      "review",
      "fullPaperDecideStatus",
      "revise",
      "revisionPaperDecideStatus",
      "cameraReady",
      "cameraReadyDecideStatus",
      "authorPayment",
    ];

    for (let i = 0; i < fields.length - 1; i++) {
      const currentField = fields[i];
      const nextField = fields[i + 1];
      const { endKey: currentEndKey } = getFieldNames(currentField);
      const { startKey: nextStartKey } = getFieldNames(nextField);

      const currentEnd = phase[currentEndKey as keyof ResearchPhase] as string;
      const nextStart = phase[nextStartKey as keyof ResearchPhase] as string;

      if (!currentEnd || !nextStart) {
        toast.error(`Vui lòng hoàn thành ngày kết thúc của "${currentField}"`);
        return false;
      }

      if (new Date(currentEnd) >= new Date(nextStart)) {
        toast.error(`"${nextField}" phải bắt đầu sau khi "${currentField}" kết thúc`);
        return false;
      }
    }

    if (lastPhase.authorPaymentEnd) {
      const regStart = phase.registrationStartDate;
      if (regStart && new Date(regStart) <= new Date(lastPhase.authorPaymentEnd)) {
        toast.error(`Ngày đăng ký phải bắt đầu sau ${formatDate(lastPhase.authorPaymentEnd)}`);
        return false;
      }
    }

    if (conferenceStartDate) {
      const authorPaymentEnd = phase.authorPaymentEnd;
      if (authorPaymentEnd && new Date(authorPaymentEnd) >= new Date(conferenceStartDate)) {
        toast.error(`Ngày kết thúc thanh toán phải trước ${formatDate(conferenceStartDate)}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validatePhase()) return;

    setIsSubmitting(true);
    try {
      const {
        registrationDuration,
        fullPaperDuration,
        reviewDuration,
        reviseDuration,
        cameraReadyDuration,
        abstractDecideStatusDuration,
        fullPaperDecideStatusDuration,
        revisionPaperDecideStatusDuration,
        authorPaymentDuration,
        ...phaseWithoutDuration
      } = phase;

      await onSubmit({
        newPhase: phaseWithoutDuration,
        authorConferencePriceIds: selectedAuthorPriceIds,
      });
      toast.success("Đã tạo Phase mới thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Tạo phase thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Section */}
      {lastPhase && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-gray-600 mb-1">Phase hiện tại</div>
              <div className="font-medium">Phase {lastPhase.phaseOrder}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Ngày hội nghị</div>
              <div className="font-medium">{formatDate(conferenceStartDate)}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Đã tạo vòng chỉnh sửa</div>
              <div className="font-medium">
                {phase.revisionRoundDeadlines.length} / {revisionAttemptAllowed}
              </div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Số lần chỉnh sửa cho phép</div>
              <div className="font-medium text-purple-600">{revisionAttemptAllowed}</div>
            </div>
          </div>
        </div>
      )}

      {/* Author Prices Selection */}
      <div>
        <h4 className="font-medium mb-2">Chọn loại chi phí áp dụng cho tác giả:</h4>
        <div className="grid grid-cols-2 gap-2">
          {authorPrices.map((price) => (
            <label
              key={price.conferencePriceId}
              className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selectedAuthorPriceIds.includes(price.conferencePriceId)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedAuthorPriceIds([
                      ...selectedAuthorPriceIds,
                      price.conferencePriceId,
                    ]);
                  } else {
                    setSelectedAuthorPriceIds(
                      selectedAuthorPriceIds.filter((id) => id !== price.conferencePriceId)
                    );
                  }
                }}
                className="w-4 h-4"
              />
              <span>
                {price.ticketName} ({formatCurrency(price.ticketPrice)})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* === Các Phase Section giống `ResearchPhaseForm` === */}
      {/* 1-5: Các bước trước Final Review */}
      <PhaseSection
        title="1. Đăng ký tham dự"
        startDate={phase.registrationStartDate || ""}
        endDate={phase.registrationEndDate || ""}
        duration={phase.registrationDuration ?? 1}
        onStartDateChange={(val) => updatePhaseStartDate("registration", val)}
        onDurationChange={(val) => updatePhaseDuration("registration", val)}
        minDate={lastPhase?.authorPaymentEnd ? addDays(lastPhase.authorPaymentEnd) : undefined}
        maxDate={addDays(conferenceStartDate, -1)}
      />

      <PhaseSection
        title="2. Quyết định trạng thái Abstract"
        startDate={phase.abstractDecideStatusStart || ""}
        endDate={phase.abstractDecideStatusEnd || ""}
        duration={phase.abstractDecideStatusDuration ?? 1}
        onStartDateChange={(val) => updatePhaseStartDate("abstractDecideStatus", val)}
        onDurationChange={(val) => updatePhaseDuration("abstractDecideStatus", val)}
        minDate={addDays(phase.registrationEndDate)}
      />

      <PhaseSection
        title="3. Nộp Full Paper"
        startDate={phase.fullPaperStartDate || ""}
        endDate={phase.fullPaperEndDate || ""}
        duration={phase.fullPaperDuration ?? 1}
        onStartDateChange={(val) => updatePhaseStartDate("fullPaper", val)}
        onDurationChange={(val) => updatePhaseDuration("fullPaper", val)}
        minDate={addDays(phase.abstractDecideStatusEnd)}
      />

      <PhaseSection
        title="4. Giai đoạn Reviewer đánh giá"
        startDate={phase.reviewStartDate || ""}
        endDate={phase.reviewEndDate || ""}
        duration={phase.reviewDuration ?? 1}
        onStartDateChange={(val) => updatePhaseStartDate("review", val)}
        onDurationChange={(val) => updatePhaseDuration("review", val)}
        minDate={addDays(phase.fullPaperEndDate)}
      />

      <PhaseSection
        title="5. Quyết định trạng thái Full Paper"
        startDate={phase.fullPaperDecideStatusStart || ""}
        endDate={phase.fullPaperDecideStatusEnd || ""}
        duration={phase.fullPaperDecideStatusDuration ?? 1}
        onStartDateChange={(val) => updatePhaseStartDate("fullPaperDecideStatus", val)}
        onDurationChange={(val) => updatePhaseDuration("fullPaperDecideStatus", val)}
        minDate={addDays(phase.reviewEndDate)}
      />

      {/* 6. Final Review + Revision Rounds */}
      <div>
        <h4 className="font-medium mb-3 flex items-center gap-2">
          6. Giai đoạn Final Review (Reviewer với Author)
          {phase.reviseStartDate && phase.reviseEndDate && (
            <span className="text-sm text-orange-600">
              ({formatDate(phase.reviseStartDate)} → {formatDate(phase.reviseEndDate)})
            </span>
          )}
        </h4>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <DatePickerInput
            label="Ngày bắt đầu"
            value={phase.reviseStartDate || ""}
            onChange={(val) => updatePhaseStartDate("revise", val)}
            minDate={addDays(phase.fullPaperDecideStatusEnd)}
            required
          />
          <FormInput
            label="Số ngày"
            type="number"
            min="1"
            value={phase.reviseDuration}
            onChange={(val) => updatePhaseDuration("revise", Number(val))}
            placeholder="VD: 15"
          />
          <div>
            <label className="block text-sm font-medium mb-2">Ngày kết thúc</label>
            <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 flex items-center h-[42px]">
              {phase.reviseEndDate ? (
                <span className="text-gray-900">{formatDate(phase.reviseEndDate)}</span>
              ) : (
                <span className="text-gray-400">--/--/----</span>
              )}
            </div>
          </div>
        </div>

        {revisionAttemptAllowed > 0 && (
          <div className="pl-4 border-l-2 border-orange-200">
            <h5 className="font-medium mb-2">
              Deadline từng vòng ({phase.revisionRoundDeadlines.length})
            </h5>

            {phase.revisionRoundDeadlines.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-3">
                {phase.revisionRoundDeadlines.map((round, idx) => (
                  <div key={idx} className="p-2 bg-gray-50 rounded border border-gray-200">
                    <div className="text-sm font-medium">Vòng {idx + 1}</div>
                    <div className="text-xs text-gray-600">
                      {formatDate(round.startSubmissionDate)} →{" "}
                      {formatDate(round.endSubmissionDate)}
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveRevisionRound(idx)}
                      className="w-full mt-2"
                    >
                      Xóa
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              <FormInput
                label="Vòng thứ"
                type="number"
                min="1"
                value={newRevisionRound.roundNumber}
                onChange={(val) =>
                  setNewRevisionRound({ ...newRevisionRound, roundNumber: Number(val) })
                }
                disabled
              />

              {phase.revisionRoundDeadlines.length === 0 ? (
                <div>
                  <label className="block text-sm font-medium mb-2">Ngày bắt đầu</label>
                  <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 flex items-center h-[42px]">
                    {phase.reviseStartDate ? (
                      <span className="text-gray-900">{formatDate(phase.reviseStartDate)}</span>
                    ) : (
                      <span className="text-gray-400">--/--/----</span>
                    )}
                  </div>
                </div>
              ) : (
                <DatePickerInput
                  label="Ngày bắt đầu"
                  value={newRevisionRound.startDate}
                  onChange={(val) =>
                    setNewRevisionRound({ ...newRevisionRound, startDate: val })
                  }
                  minDate={
                    phase.revisionRoundDeadlines.length > 0
                      ? addDays(
                          phase.revisionRoundDeadlines[
                            phase.revisionRoundDeadlines.length - 1
                          ].endSubmissionDate
                        )
                      : phase.reviseStartDate || undefined
                  }
                  maxDate={phase.reviseEndDate || undefined}
                />
              )}

              <FormInput
                label="Số ngày"
                type="number"
                min="1"
                value={newRevisionRound.durationInDays}
                onChange={(val) =>
                  setNewRevisionRound({ ...newRevisionRound, durationInDays: Number(val) })
                }
              />

              <div>
                <label className="block text-sm font-medium mb-2">Ngày kết thúc</label>
                <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 flex items-center h-[42px]">
                  {(() => {
                    const start =
                      phase.revisionRoundDeadlines.length === 0
                        ? phase.reviseStartDate
                        : newRevisionRound.startDate;
                    if (start && newRevisionRound.durationInDays > 0) {
                      return (
                        <span className="text-gray-900">
                          {formatDate(calculateEndDate(start, newRevisionRound.durationInDays))}
                        </span>
                      );
                    }
                    return <span className="text-gray-400">--/--/----</span>;
                  })()}
                </div>
              </div>

              <Button
                onClick={handleAddRevisionRound}
                className="mt-6"
                size="sm"
                disabled={phase.revisionRoundDeadlines.length >= revisionAttemptAllowed}
              >
                Thêm vòng
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 7-10: Các bước sau */}
      <PhaseSection
        title="7. Quyết định trạng thái Final Review"
        startDate={phase.revisionPaperDecideStatusStart || ""}
        endDate={phase.revisionPaperDecideStatusEnd || ""}
        duration={phase.revisionPaperDecideStatusDuration ?? 1}
        onStartDateChange={(val) =>
          updatePhaseStartDate("revisionPaperDecideStatus", val)
        }
        onDurationChange={(val) =>
          updatePhaseDuration("revisionPaperDecideStatus", val)
        }
        minDate={addDays(phase.reviseEndDate)}
      />

      <PhaseSection
        title="8. Nộp Camera Ready"
        startDate={phase.cameraReadyStartDate || ""}
        endDate={phase.cameraReadyEndDate || ""}
        duration={phase.cameraReadyDuration ?? 1}
        onStartDateChange={(val) => updatePhaseStartDate("cameraReady", val)}
        onDurationChange={(val) => updatePhaseDuration("cameraReady", val)}
        minDate={addDays(phase.revisionPaperDecideStatusEnd)}
        maxDate={addDays(conferenceStartDate, -1)}
      />

      <PhaseSection
        title="9. Giai đoạn tác giả thanh toán chi phí"
        startDate={phase.authorPaymentStart || ""}
        endDate={phase.authorPaymentEnd || ""}
        duration={phase.authorPaymentDuration ?? 1}
        onStartDateChange={(val) => updatePhaseStartDate("authorPayment", val)}
        onDurationChange={(val) => updatePhaseDuration("authorPayment", val)}
        minDate={addDays(phase.cameraReadyEndDate)}
        maxDate={addDays(conferenceStartDate, -1)}
      />

      {/* Submit Button */}
      <div className="pt-4 border-t border-gray-200">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? "Đang tạo..." : "Tạo Phase"}
        </Button>
      </div>
    </div>
  );
}

interface PhaseSectionProps {
  title: string;
  startDate: string;
  endDate: string;
  duration: number;
  onStartDateChange: (val: string) => void;
  onDurationChange: (val: number) => void;
  minDate?: string;
  maxDate?: string;
}

function PhaseSection({
  title,
  startDate,
  endDate,
  duration,
  onStartDateChange,
  onDurationChange,
  minDate,
  maxDate,
}: PhaseSectionProps) {
  return (
    <div>
      <h4 className="font-medium mb-3 flex items-center gap-2">
        {title}
        {startDate && endDate && (
          <span className="text-sm text-gray-600">
            ({formatDate(startDate)} → {formatDate(endDate)})
          </span>
        )}
      </h4>
      <div className="grid grid-cols-3 gap-4">
        <DatePickerInput
          label="Ngày bắt đầu"
          value={startDate}
          onChange={onStartDateChange}
          minDate={minDate}
          maxDate={maxDate}
          required
        />
        <FormInput
          label="Số ngày"
          type="number"
          min="1"
          value={duration}
          onChange={(val) => onDurationChange(Number(val))}
          placeholder="VD: 7"
        />
        <div>
          <label className="block text-sm font-medium mb-2">Ngày kết thúc</label>
          <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 flex items-center h-[42px]">
            {endDate ? (
              <span className="text-gray-900">{formatDate(endDate)}</span>
            ) : (
              <span className="text-gray-400">--/--/----</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}