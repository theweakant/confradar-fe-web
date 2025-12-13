"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { DatePickerInput } from "@/components/atoms/DatePickerInput";
import { formatDate } from "@/helper/format";
import { toast } from "sonner";
import type { ResearchPhase, RevisionRoundDeadline } from "@/types/conference.type";

interface ResearchPhaseFormProps {
  phases: ResearchPhase[];
  onPhasesChange: (phases: ResearchPhase[]) => void;
  ticketSaleStart: string;
  ticketSaleEnd: string;
  eventStartDate: string;
  eventEndDate: string;
  revisionAttemptAllowed: number;
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

export function ResearchPhaseForm({
  phases,
  onPhasesChange,
  ticketSaleStart,
  ticketSaleEnd,
  eventStartDate,
  eventEndDate,
  revisionAttemptAllowed = 2,
}: ResearchPhaseFormProps) {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [newRevisionRound, setNewRevisionRound] = useState({
    roundNumber: 1,
    startDate: "", 
    durationInDays: 3,
  });

  useEffect(() => {
    if (phases.length === 0) {
      onPhasesChange([getEmptyPhase()]);
    }
  }, [phases.length, onPhasesChange]);

  const activePhase = phases[activePhaseIndex] || getEmptyPhase();

  const updateActivePhase = (updates: Partial<ResearchPhase>) => {
    const newPhases = [...phases];
    newPhases[activePhaseIndex] = { ...newPhases[activePhaseIndex], ...updates };
    onPhasesChange(newPhases);
  };

  const getFieldNames = (fieldPrefix: string) => {
    const specialFields = [
      "abstractDecideStatus",
      "fullPaperDecideStatus", 
      "revisionPaperDecideStatus",
      "authorPayment"
    ];
    const isSpecial = specialFields.includes(fieldPrefix);
    return {
      startKey: isSpecial ? `${fieldPrefix}Start` : `${fieldPrefix}StartDate`,
      endKey: isSpecial ? `${fieldPrefix}End` : `${fieldPrefix}EndDate`,
      durationKey: `${fieldPrefix}Duration`
    };
  };

  const updatePhaseStartDate = (fieldPrefix: string, newStartDate: string) => {
    const { startKey, endKey, durationKey } = getFieldNames(fieldPrefix);
    const currentDuration = (activePhase[durationKey as keyof ResearchPhase] as number) || 1;
    let updates: Partial<ResearchPhase> = { [startKey]: newStartDate };
    if (newStartDate && currentDuration > 0) {
      const endDate = calculateEndDate(newStartDate, currentDuration);
      updates = { ...updates, [endKey]: endDate };
    }
    updateActivePhase(updates);
  };

  const updatePhaseDuration = (fieldPrefix: string, newDuration: number) => {
    const { startKey, endKey, durationKey } = getFieldNames(fieldPrefix);
    const startDate = activePhase[startKey as keyof ResearchPhase] as string | undefined;
    let updates: Partial<ResearchPhase> = { [durationKey]: newDuration };
    if (startDate && newDuration > 0) {
      const endDate = calculateEndDate(startDate, newDuration);
      updates = { ...updates, [endKey]: endDate };
    }
    updateActivePhase(updates);
  };

  const handleAddNewPhase = () => {
    if (phases.length === 0) {
      onPhasesChange([getEmptyPhase()]);
      setActivePhaseIndex(0);
      return;
    }

    const lastPhase = phases[phases.length - 1];
    if (!lastPhase.authorPaymentEnd) {
      toast.error("Vui lòng hoàn thành phase trước khi tạo phase mới!");
      return;
    }

    let currentStart = addDays(lastPhase.authorPaymentEnd);
    if (!currentStart) return;

    const createSegmentWithChaining = (duration: number): [string, string] => {
      const start = currentStart!;
      const end = calculateEndDate(start, duration);
      currentStart = addDays(end)!;
      return [start, end];
    };

    const [regStart, regEnd] = createSegmentWithChaining(lastPhase.registrationDuration || 1);
    const [absStart, absEnd] = createSegmentWithChaining(lastPhase.abstractDecideStatusDuration || 1);
    const [fpStart, fpEnd] = createSegmentWithChaining(lastPhase.fullPaperDuration || 1);
    const [revStart, revEnd] = createSegmentWithChaining(lastPhase.reviewDuration || 1);
    const [fpdStart, fpdEnd] = createSegmentWithChaining(lastPhase.fullPaperDecideStatusDuration || 1);
    const [rvStart, rvEnd] = createSegmentWithChaining(lastPhase.reviseDuration || 1);
    const [rpdStart, rpdEnd] = createSegmentWithChaining(lastPhase.revisionPaperDecideStatusDuration || 1);
    const [crStart, crEnd] = createSegmentWithChaining(lastPhase.cameraReadyDuration || 1);
    const [apStart, apEnd] = createSegmentWithChaining(lastPhase.authorPaymentDuration || 1);

    const newRevisionRounds: RevisionRoundDeadline[] = [];
    if (lastPhase.revisionRoundDeadlines.length > 0 && revisionAttemptAllowed > 0) {
      const totalReviseDays = Math.floor(
        (new Date(rvEnd).getTime() - new Date(rvStart).getTime()) / 86400000
      ) + 1;
      const numRounds = Math.min(lastPhase.revisionRoundDeadlines.length, revisionAttemptAllowed);
      const daysPerRound = Math.floor(totalReviseDays / numRounds);
      let roundStart = rvStart;
      for (let i = 0; i < numRounds; i++) {
        const isLastRound = i === numRounds - 1;
        const roundEnd = isLastRound 
          ? rvEnd
          : calculateEndDate(roundStart, daysPerRound);
        newRevisionRounds.push({
          roundNumber: i + 1,
          startSubmissionDate: roundStart,
          endSubmissionDate: roundEnd,
        });
        if (!isLastRound) {
          roundStart = addDays(roundEnd) || roundStart;
        }
      }
    }

    const newPhase: ResearchPhase = {
      registrationStartDate: regStart,
      registrationEndDate: regEnd,
      registrationDuration: lastPhase.registrationDuration || 1,
      abstractDecideStatusStart: absStart,
      abstractDecideStatusEnd: absEnd,
      abstractDecideStatusDuration: lastPhase.abstractDecideStatusDuration || 1,
      fullPaperStartDate: fpStart,
      fullPaperEndDate: fpEnd,
      fullPaperDuration: lastPhase.fullPaperDuration || 1,
      reviewStartDate: revStart,
      reviewEndDate: revEnd,
      reviewDuration: lastPhase.reviewDuration || 1,
      fullPaperDecideStatusStart: fpdStart,
      fullPaperDecideStatusEnd: fpdEnd,
      fullPaperDecideStatusDuration: lastPhase.fullPaperDecideStatusDuration || 1,
      reviseStartDate: rvStart,
      reviseEndDate: rvEnd,
      reviseDuration: lastPhase.reviseDuration || 1,
      revisionPaperDecideStatusStart: rpdStart,
      revisionPaperDecideStatusEnd: rpdEnd,
      revisionPaperDecideStatusDuration: lastPhase.revisionPaperDecideStatusDuration || 1,
      cameraReadyStartDate: crStart,
      cameraReadyEndDate: crEnd,
      cameraReadyDuration: lastPhase.cameraReadyDuration || 1,
      authorPaymentStart: apStart,
      authorPaymentEnd: apEnd,
      authorPaymentDuration: lastPhase.authorPaymentDuration || 1,
      revisionRoundDeadlines: newRevisionRounds, 
    };

    onPhasesChange([...phases, newPhase]);
    setActivePhaseIndex(phases.length);
    toast.success(`Đã thêm phase mới với ${newRevisionRounds.length} vòng chỉnh sửa!`);
  };

  const handleAddRevisionRound = () => {
    const isRoundOne = activePhase.revisionRoundDeadlines.length === 0;

    const startSubmissionDate = isRoundOne
      ? activePhase.reviseStartDate
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

    if (activePhase.reviseEndDate && new Date(endSubmissionDate) > new Date(activePhase.reviseEndDate)) {
      toast.error("Ngày kết thúc vòng chỉnh sửa vượt quá thời gian chỉnh sửa cho phép!");
      return;
    }

    // Validate overlap (chỉ áp dụng cho round ≥2)
    if (!isRoundOne) {
      const isOverlapping = activePhase.revisionRoundDeadlines.some((round) => {
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

    const nextRoundNumber = activePhase.revisionRoundDeadlines.length + 1;
    const newRound: RevisionRoundDeadline = {
      roundNumber: nextRoundNumber,
      startSubmissionDate,
      endSubmissionDate,
    };

    updateActivePhase({ revisionRoundDeadlines: [...activePhase.revisionRoundDeadlines, newRound] });

    // Reset form cho vòng tiếp theo
    setNewRevisionRound({
      roundNumber: nextRoundNumber + 1,
      startDate: "", // cho round ≥2, người dùng sẽ chọn lại
      durationInDays: 3,
    });

    toast.success("Đã thêm vòng chỉnh sửa!");
  };

  const handleRemoveRevisionRound = (index: number) => {
    const updated = [...activePhase.revisionRoundDeadlines];
    updated.splice(index, 1);
    updateActivePhase({ revisionRoundDeadlines: updated });
    toast.success("Đã xóa vòng chỉnh sửa!");
  };

  const resetActivePhase = () => {
    updateActivePhase(getEmptyPhase());
    toast.success("Đã reset phase hiện tại!");
  };

  return (
    <div className="space-y-6">
      {eventStartDate && eventEndDate && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-gray-600 mb-1">Ngày bán</div>
              <div className="font-medium">{formatDate(ticketSaleStart)} → {formatDate(ticketSaleEnd)}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Ngày tổ chức</div>
              <div className="font-medium">{formatDate(eventStartDate)} → {formatDate(eventEndDate)}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Đã tạo vòng</div>
              <div className="font-medium">{activePhase.revisionRoundDeadlines.length} / {revisionAttemptAllowed}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Số lần chỉnh sửa cho phép</div>
              <div className="font-medium text-purple-600">{revisionAttemptAllowed}</div>
            </div>
          </div>
          <div className="text-xs text-blue-600 mt-3 pt-3 border-t border-blue-200">
            Các giai đoạn research phải kết thúc trước ngày hội nghị bắt đầu
          </div>
        </div>
      )}

      <div>
        <div className="flex flex-wrap gap-2 mb-4">
          {phases.map((_, idx) => (
            <Button
              key={idx}
              size="sm"
              variant={idx === activePhaseIndex ? "default" : "outline"}
              onClick={() => setActivePhaseIndex(idx)}
            >
              Giai đoạn {idx + 1}
            </Button>
          ))}
          <Button size="sm" variant="outline" onClick={handleAddNewPhase}>
            + Thêm giai đoạn
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={resetActivePhase}
          >
            Reset
          </Button>
        </div>
      </div>

      <PhaseSection
        title="1. Đăng ký tham dự"
        startDate={activePhase.registrationStartDate}
        endDate={activePhase.registrationEndDate}
        duration={activePhase.registrationDuration ?? 1}
        onStartDateChange={(val) => updatePhaseStartDate("registration", val)}
        onDurationChange={(val) => updatePhaseDuration("registration", val)}
        minDate={activePhaseIndex === 0 ? undefined : addDays(phases[activePhaseIndex - 1].authorPaymentEnd)}
        maxDate={eventStartDate ? addDays(eventStartDate, -1) : undefined}
      />

      <PhaseSection
        title="2. Quyết định trạng thái Abstract"
        startDate={activePhase.abstractDecideStatusStart}
        endDate={activePhase.abstractDecideStatusEnd}
        duration={activePhase.abstractDecideStatusDuration ?? 1}
        onStartDateChange={(val) => updatePhaseStartDate("abstractDecideStatus", val)}
        onDurationChange={(val) => updatePhaseDuration("abstractDecideStatus", val)}
        minDate={addDays(activePhase.registrationEndDate)}
      />

      <PhaseSection
        title="3. Nộp Full Paper"
        startDate={activePhase.fullPaperStartDate}
        endDate={activePhase.fullPaperEndDate}
        duration={activePhase.fullPaperDuration ?? 1}
        onStartDateChange={(val) => updatePhaseStartDate("fullPaper", val)}
        onDurationChange={(val) => updatePhaseDuration("fullPaper", val)}
        minDate={addDays(activePhase.abstractDecideStatusEnd)}
      />

      <PhaseSection
        title="4. Giai đoạn Reviewer đánh giá"
        startDate={activePhase.reviewStartDate}
        endDate={activePhase.reviewEndDate}
        duration={activePhase.reviewDuration ?? 1}
        onStartDateChange={(val) => updatePhaseStartDate("review", val)}
        onDurationChange={(val) => updatePhaseDuration("review", val)}
        minDate={addDays(activePhase.fullPaperEndDate)}
      />

      <PhaseSection
        title="5. Quyết định trạng thái Full Paper"
        startDate={activePhase.fullPaperDecideStatusStart}
        endDate={activePhase.fullPaperDecideStatusEnd}
        duration={activePhase.fullPaperDecideStatusDuration ?? 1}
        onStartDateChange={(val) => updatePhaseStartDate("fullPaperDecideStatus", val)}
        onDurationChange={(val) => updatePhaseDuration("fullPaperDecideStatus", val)}
        minDate={addDays(activePhase.reviewEndDate)}
      />

      <div>
        <h4 className="font-medium mb-3 flex items-center gap-2">
          6. Giai đoạn Final Review (Reviewer với Author)
          {activePhase.reviseStartDate && activePhase.reviseEndDate && (
            <span className="text-sm text-orange-600">
              ({formatDate(activePhase.reviseStartDate)} → {formatDate(activePhase.reviseEndDate)})
            </span>
          )}
        </h4>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <DatePickerInput
            label="Ngày bắt đầu"
            value={activePhase.reviseStartDate}
            onChange={(val) => updatePhaseStartDate("revise", val)}
            minDate={addDays(activePhase.fullPaperDecideStatusEnd)}
            required
          />
          <FormInput
            label="Số ngày"
            type="number"
            min="1"
            value={activePhase.reviseDuration}
            onChange={(val) => updatePhaseDuration("revise", Number(val))}
            placeholder="VD: 15"
          />
          <div>
            <label className="block text-sm font-medium mb-2">Ngày kết thúc</label>
            <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 flex items-center h-[42px]">
              {activePhase.reviseEndDate ? (
                <span className="text-gray-900">{formatDate(activePhase.reviseEndDate)}</span>
              ) : (
                <span className="text-gray-400">--/--/----</span>
              )}
            </div>
          </div>
        </div>

        {revisionAttemptAllowed > 0 && (
          <div className="pl-4 border-l-2 border-orange-200">
            <h5 className="font-medium mb-2">
              Deadline từng vòng ({activePhase.revisionRoundDeadlines.length})
            </h5>
            {activePhase.revisionRoundDeadlines.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-3">
                {activePhase.revisionRoundDeadlines.map((round, idx) => (
                  <div key={idx} className="p-2 bg-gray-50 rounded border border-gray-200">
                    <div className="text-sm font-medium">Vòng {idx + 1}</div>
                    <div className="text-xs text-gray-600">
                      {formatDate(round.startSubmissionDate)} → {formatDate(round.endSubmissionDate)}
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

            {/* Form thêm vòng mới */}
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

              {activePhase.revisionRoundDeadlines.length === 0 ? (
                <div>
                  <label className="block text-sm font-medium mb-2">Ngày bắt đầu</label>
                  <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 flex items-center h-[42px]">
                    {activePhase.reviseStartDate ? (
                      <span className="text-gray-900">{formatDate(activePhase.reviseStartDate)}</span>
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
                    activePhase.revisionRoundDeadlines.length > 0
                      ? addDays(
                          activePhase.revisionRoundDeadlines[
                            activePhase.revisionRoundDeadlines.length - 1
                          ].endSubmissionDate
                        )
                      : activePhase.reviseStartDate || undefined
                  }
                  maxDate={activePhase.reviseEndDate || undefined}
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
                      activePhase.revisionRoundDeadlines.length === 0
                        ? activePhase.reviseStartDate
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
                disabled={activePhase.revisionRoundDeadlines.length >= revisionAttemptAllowed}
              >
                Thêm vòng
              </Button>
            </div>
          </div>
        )}
      </div>

      <PhaseSection
        title="7. Quyết định trạng thái Final Review"
        startDate={activePhase.revisionPaperDecideStatusStart}
        endDate={activePhase.revisionPaperDecideStatusEnd}
        duration={activePhase.revisionPaperDecideStatusDuration ?? 1}
        onStartDateChange={(val) => updatePhaseStartDate("revisionPaperDecideStatus", val)}
        onDurationChange={(val) => updatePhaseDuration("revisionPaperDecideStatus", val)}
        minDate={addDays(activePhase.reviseEndDate)}
      />

      <PhaseSection
        title="8. Nộp Camera Ready"
        startDate={activePhase.cameraReadyStartDate}
        endDate={activePhase.cameraReadyEndDate}
        duration={activePhase.cameraReadyDuration ?? 1}
        onStartDateChange={(val) => updatePhaseStartDate("cameraReady", val)}
        onDurationChange={(val) => updatePhaseDuration("cameraReady", val)}
        minDate={addDays(activePhase.revisionPaperDecideStatusEnd)}
      />

      <PhaseSection
        title="9. Giai đoạn tác giả thanh toán chi phí"
        startDate={activePhase.authorPaymentStart}
        endDate={activePhase.authorPaymentEnd}
        duration={activePhase.authorPaymentDuration ?? 1}
        onStartDateChange={(val) => updatePhaseStartDate("authorPayment", val)}
        onDurationChange={(val) => updatePhaseDuration("authorPayment", val)}
        minDate={addDays(activePhase.cameraReadyEndDate)}
        maxDate={activePhaseIndex === 0 ? addDays(eventStartDate, -1) : eventStartDate ? addDays(eventStartDate, -1) : undefined}
      />
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