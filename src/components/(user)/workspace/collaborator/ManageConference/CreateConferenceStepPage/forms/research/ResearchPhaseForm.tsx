"use client";
import { useState } from "react";
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

export function ResearchPhaseForm({
  phases,
  onPhasesChange,
  ticketSaleStart,
  ticketSaleEnd,
  eventStartDate,
  eventEndDate,
  revisionAttemptAllowed = 2,
}: ResearchPhaseFormProps) {
  
  const [newRevisionRound, setNewRevisionRound] = useState({
    roundNumber: 1,
    startDate: "",
    durationInDays: 3,
  });

  const mainPhase = phases[0];
  const activePhase = phases.find((p) => p.isActive) || mainPhase;
  const getEmptyPhase = (isWaitlist: boolean = false): ResearchPhase => ({
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

    isWaitlist,
    isActive: false, 
    revisionRoundDeadlines: [],
  });

  const updateActivePhase = (updates: Partial<ResearchPhase>) => {
    onPhasesChange(phases.map((p) => (p.isActive ? { ...p, ...updates } : p)));
  };

  const updateRevisionDeadlines = (newDeadlines: RevisionRoundDeadline[]) => {
    onPhasesChange(
      phases.map((p) =>
        p.isActive ? { ...p, revisionRoundDeadlines: newDeadlines } : p
      )
    );
  };

  const calculateEndDate = (startDate: string, duration: number): string => {
    if (!startDate || duration <= 0) return "";
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + duration - 1);
    return end.toISOString().split("T")[0];
  };

  const handleAddRevisionRound = () => {
    if (activePhase.revisionRoundDeadlines.length >= revisionAttemptAllowed) {
      toast.error(`Số lượng vòng chỉnh sửa tối đa là ${revisionAttemptAllowed}!`);
      return;
    }
    if (!newRevisionRound.startDate) {
      toast.error("Vui lòng chọn ngày bắt đầu vòng chỉnh sửa!");
      return;
    }
    if (newRevisionRound.durationInDays <= 0) {
      toast.error("Số ngày phải lớn hơn 0!");
      return;
    }

    const endDate = calculateEndDate(newRevisionRound.startDate, newRevisionRound.durationInDays);

    const isOverlapping = activePhase.revisionRoundDeadlines.some((round) => {
      const existingStart = new Date(round.startSubmissionDate);
      const existingEnd = new Date(round.endSubmissionDate);
      const newStart = new Date(newRevisionRound.startDate);
      const newEnd = new Date(endDate);
      return newStart <= existingEnd && newEnd >= existingStart;
    });

    if (isOverlapping) {
      toast.error("Vòng chỉnh sửa này bị trùng thời gian với vòng khác!");
      return;
    }

    const nextRoundNumber = activePhase.revisionRoundDeadlines.length + 1;
    const newRound: RevisionRoundDeadline = {
      roundNumber: nextRoundNumber,
      startSubmissionDate: newRevisionRound.startDate,
      endSubmissionDate: endDate,
    };

    updateRevisionDeadlines([...activePhase.revisionRoundDeadlines, newRound]);

    setNewRevisionRound({
      roundNumber: nextRoundNumber + 1,
      startDate: "",
      durationInDays: 3,
    });

    toast.success("Đã thêm vòng chỉnh sửa!");
  };

  const handleRemoveRevisionRound = (index: number) => {
    updateRevisionDeadlines(
      activePhase.revisionRoundDeadlines.filter((_, i) => i !== index)
    );
    toast.success("Đã xóa vòng chỉnh sửa!");
  };

  const switchToMainPhase = () => {
    const updated = [...phases];
    updated[0] = { ...updated[0], isActive: true };
    if (updated[1]) updated[1] = { ...updated[1], isActive: false };
    onPhasesChange(updated);
  };

  const switchToWaitlistPhase = () => {
    const updated = [...phases];
    updated[0] = { ...updated[0], isActive: false };
    if (updated[1]) updated[1] = { ...updated[1], isActive: true };
    onPhasesChange(updated);
  };

  const createWaitlistFromMain = () => {
    let currentStartDate = mainPhase.cameraReadyEndDate
      ? new Date(mainPhase.cameraReadyEndDate)
      : new Date();

    if (mainPhase.cameraReadyEndDate) {
      currentStartDate.setDate(currentStartDate.getDate() + 1);
    }

    const formatDateISO = (date: Date) => date.toISOString().split("T")[0];

    // Registration
    const regisDuration = mainPhase.registrationDuration ?? 1;
    const regisStart = formatDateISO(currentStartDate);
    currentStartDate.setDate(currentStartDate.getDate() + regisDuration - 1);
    const regisEnd = formatDateISO(currentStartDate);
    currentStartDate.setDate(currentStartDate.getDate() + 1);

    // Full Paper
    const fullPaperDuration = mainPhase.fullPaperDuration ?? 1;
    const fullPaperStart = formatDateISO(currentStartDate);
    currentStartDate.setDate(currentStartDate.getDate() + fullPaperDuration - 1);
    const fullPaperEnd = formatDateISO(currentStartDate);
    currentStartDate.setDate(currentStartDate.getDate() + 1);

    // Review
    const reviewDuration = mainPhase.reviewDuration ?? 1;
    const reviewStart = formatDateISO(currentStartDate);
    currentStartDate.setDate(currentStartDate.getDate() + reviewDuration - 1);
    const reviewEnd = formatDateISO(currentStartDate);
    currentStartDate.setDate(currentStartDate.getDate() + 1);

    // Revise
    const reviseDuration = mainPhase.reviseDuration ?? 1;
    const reviseStart = formatDateISO(currentStartDate);
    currentStartDate.setDate(currentStartDate.getDate() + reviseDuration - 1);
    const reviseEnd = formatDateISO(currentStartDate);
    currentStartDate.setDate(currentStartDate.getDate() + 1);

    // Camera Ready
    const cameraReadyDuration = mainPhase.cameraReadyDuration ?? 1;
    const cameraReadyStart = formatDateISO(currentStartDate);
    currentStartDate.setDate(currentStartDate.getDate() + cameraReadyDuration - 1);
    const cameraReadyEnd = formatDateISO(currentStartDate);

    const copiedWaitlist: ResearchPhase = {
      registrationStartDate: regisStart,
      registrationEndDate: regisEnd,
      registrationDuration: regisDuration,
      fullPaperStartDate: fullPaperStart,
      fullPaperEndDate: fullPaperEnd,
      fullPaperDuration: fullPaperDuration,
      reviewStartDate: reviewStart,
      reviewEndDate: reviewEnd,
      reviewDuration: reviewDuration,
      reviseStartDate: reviseStart,
      reviseEndDate: reviseEnd,
      reviseDuration: reviseDuration,
      cameraReadyStartDate: cameraReadyStart,
      cameraReadyEndDate: cameraReadyEnd,
      cameraReadyDuration: cameraReadyDuration,
      isWaitlist: true,
      isActive: true,
      revisionRoundDeadlines: [],
    };

    onPhasesChange([mainPhase, copiedWaitlist]);
    toast.success("Đã tạo waitlist timeline từ main (không chồng lấn)!");
  };

  const resetActiveTimeline = () => {
    if (mainPhase.isActive) {
      // Đang ở timeline chính → reset main (phases[0])
      const newMain = getEmptyPhase(false);
      newMain.isActive = true;

      // Giữ nguyên waitlist nếu có
      const newPhases = [newMain];
      if (phases[1]) {
        // Giữ waitlist nguyên vẹn, nhưng đảm bảo không active
        newPhases.push({ ...phases[1], isActive: false });
      }

      onPhasesChange(newPhases);
      toast.success("Đã reset Timeline chính!");
    } else if (phases[1]?.isActive) {
      // Đang ở waitlist → reset chỉ waitlist (phases[1])
      const newWaitlist = getEmptyPhase(true);
      newWaitlist.isActive = true;

      // Giữ nguyên main phase
      const newPhases = [{ ...mainPhase, isActive: false }, newWaitlist];
      onPhasesChange(newPhases);
      toast.success("Đã reset Waitlist timeline!");
    }
  };

  const createEmptyWaitlist = () => {
    let newWaitlistStartDate = mainPhase.cameraReadyEndDate;
    if (newWaitlistStartDate) {
      const nextDay = new Date(new Date(newWaitlistStartDate).getTime() + 86400000);
      newWaitlistStartDate = nextDay.toISOString().split("T")[0];
    }

    const emptyWaitlist: ResearchPhase = {
      registrationStartDate: newWaitlistStartDate,
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
      isWaitlist: true,
      isActive: true,
      revisionRoundDeadlines: [],
    };
    onPhasesChange([mainPhase, emptyWaitlist]);
    toast.success("Đã tạo waitlist timeline mới!");
  };

const addOneDay = (dateStr: string | undefined): string | undefined => {
  if (!dateStr) return undefined;
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0];
};

  return (
    <div className="space-y-6">
      {/* Info Header */}
      {eventStartDate && eventEndDate && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-gray-600 mb-1">Ngày tổ chức</div>
              <div className="font-medium">{formatDate(eventStartDate)} → {formatDate(eventEndDate)}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Ngày bán vé</div>
              <div className="font-medium">{formatDate(ticketSaleStart)} → {formatDate(ticketSaleEnd)}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Số lần chỉnh sửa cho phép</div>
              <div className="font-medium text-purple-600">{revisionAttemptAllowed}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Đã tạo vòng</div>
              <div className="font-medium">{activePhase.revisionRoundDeadlines.length} / {revisionAttemptAllowed}</div>
            </div>
          </div>
          <div className="text-xs text-blue-600 mt-3 pt-3 border-t border-blue-200">
            Timeline research phải kết thúc trước ngày bán vé
          </div>
        </div>
      )}

      <div>
        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            variant={mainPhase.isActive ? "default" : "outline"}
            onClick={switchToMainPhase}
          >
            Timeline chính
          </Button>
          <Button
            size="sm"
            variant={phases[1]?.isActive ? "default" : "outline"}
            onClick={switchToWaitlistPhase}
            disabled={!phases[1]}
          >
            Waitlist
          </Button>
            <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={resetActiveTimeline}
          >
            Reset timeline hiện tại
          </Button>
        </div>

        {/* Nút tạo waitlist - chỉ hiện khi chưa có */}
          <div className="flex gap-2 mb-6">
            <Button size="sm" variant="outline" onClick={createWaitlistFromMain}>
              Tạo waitlist từ chính (nối tiếp)
            </Button>
            <Button size="sm" variant="outline" onClick={createEmptyWaitlist}>
              Tạo waitlist mới
            </Button>
          </div>
      </div>

      {/* Registration Phase */}
      <PhaseSection
        title="Đăng ký tham dự"
        startDate={activePhase.registrationStartDate}
        endDate={activePhase.registrationEndDate}
        duration={activePhase.registrationDuration ?? 1}
        onStartDateChange={(val) => updateActivePhase({ registrationStartDate: val })}
        onDurationChange={(val) => updateActivePhase({ registrationDuration: Number(val) })}
        minDate={activePhase.isWaitlist && mainPhase.cameraReadyEndDate ? new Date(new Date(mainPhase.cameraReadyEndDate).getTime() + 86400000).toISOString().split("T")[0] : undefined}
        maxDate={ticketSaleStart ? new Date(new Date(ticketSaleStart).getTime() - 86400000).toISOString().split("T")[0] : undefined}
      />

      {/* Full Paper Phase */}
      <PhaseSection
        title="Nộp bài full paper"
        startDate={activePhase.fullPaperStartDate}
        endDate={activePhase.fullPaperEndDate}
        duration={activePhase.fullPaperDuration ?? 1}
        onStartDateChange={(val) => updateActivePhase({ fullPaperStartDate: val })}
        onDurationChange={(val) => updateActivePhase({ fullPaperDuration: Number(val) })}
        minDate={addOneDay(activePhase.registrationEndDate) || undefined}
      />

      {/* Review Phase */}
      <PhaseSection
        title="Phản biện"
        startDate={activePhase.reviewStartDate}
        endDate={activePhase.reviewEndDate}
        duration={activePhase.reviewDuration ?? 1}
        onStartDateChange={(val) => updateActivePhase({ reviewStartDate: val })}
        onDurationChange={(val) => updateActivePhase({ reviewDuration: Number(val) })}
        minDate={addOneDay(activePhase.fullPaperEndDate) || undefined}
      />

      {/* Revision Phase with Rounds */}
      <div>
        <h4 className="font-medium mb-3 flex items-center gap-2">
          Chỉnh sửa
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
            onChange={(val) => updateActivePhase({ reviseStartDate: val })}
            minDate={addOneDay(activePhase.reviewEndDate) || undefined}
            required
          />
          <FormInput
            label="Số ngày"
            type="number"
            min="1"
            value={activePhase.reviseDuration}
            onChange={(val) => updateActivePhase({ reviseDuration: Number(val) })}
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

        {/* Revision Rounds */}
        {revisionAttemptAllowed > 0 && (
          <div className="pl-4 border-l-2 border-orange-200">
            <h5 className="font-medium mb-2">
              Deadline từng vòng chỉnh sửa ({activePhase.revisionRoundDeadlines.length})
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
              <DatePickerInput
                label="Ngày bắt đầu"
                value={newRevisionRound.startDate}
                onChange={(val) => setNewRevisionRound({ ...newRevisionRound, startDate: val })}
                minDate={activePhase.reviseStartDate || undefined}
                maxDate={activePhase.reviseEndDate || undefined}
              />
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
                  {newRevisionRound.startDate && newRevisionRound.durationInDays > 0 ? (
                    <span className="text-gray-900">
                      {formatDate(calculateEndDate(newRevisionRound.startDate, newRevisionRound.durationInDays))}
                    </span>
                  ) : (
                    <span className="text-gray-400">--/--/----</span>
                  )}
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

      {/* Camera Ready Phase */}
      <PhaseSection
        title="Camera Ready"
        startDate={activePhase.cameraReadyStartDate}
        endDate={activePhase.cameraReadyEndDate}
        duration={activePhase.cameraReadyDuration ?? 1}
        onStartDateChange={(val) => updateActivePhase({ cameraReadyStartDate: val })}
        onDurationChange={(val) => updateActivePhase({ cameraReadyDuration: Number(val) })}
        minDate={addOneDay(activePhase.reviseEndDate) || undefined}
        maxDate={ticketSaleStart ? addOneDay(new Date(ticketSaleStart).toISOString().split("T")[0]) : undefined}
      />
    </div>
  );
}

// Helper Component - Cập nhật để dùng DatePickerInput
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
  const getColorClass = () => {
    if (title.includes("Đăng ký")) return "text-blue-600";
    if (title.includes("full paper")) return "text-green-600";
    if (title.includes("Phản biện")) return "text-purple-600";
    if (title.includes("Chỉnh sửa")) return "text-orange-600";
    if (title.includes("Camera")) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div>
      <h4 className={`font-medium mb-3 flex items-center gap-2 ${getColorClass()}`}>
        {title}
        {startDate && endDate && (
          <span className="text-sm">
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
          placeholder="VD: 30"
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