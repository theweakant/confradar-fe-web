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

// Helper: add/subtract days from a date string
const addDays = (dateStr: string | undefined, days: number = 1): string | undefined => {
  if (!dateStr) return undefined;
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
};

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

  const getEmptyPhase = (isWaitlist: boolean = false): ResearchPhase => ({
    // === User submission phases ===
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

    revisionPaperReviewStart: "",
    revisionPaperReviewEnd: "",
    revisionPaperReviewDuration: 1,

    revisionPaperDecideStatusStart: "",
    revisionPaperDecideStatusEnd: "",
    revisionPaperDecideStatusDuration: 1,

    cameraReadyDecideStatusStart: "",
    cameraReadyDecideStatusEnd: "",
    cameraReadyDecideStatusDuration: 1,

    isWaitlist,
    isActive: !isWaitlist,
    revisionRoundDeadlines: [],
  });

  const mainPhase = phases[0] || getEmptyPhase(false);
  const waitlistPhase = phases[1];
  const activePhase = phases.find((p) => p.isActive) || mainPhase;

  useEffect(() => {
    if (phases.length === 0) {
      const main = getEmptyPhase(false);
      main.isActive = true;
      const waitlist = getEmptyPhase(true);
      onPhasesChange([main, waitlist]);
    } else if (phases.length === 1) {
      const waitlist = getEmptyPhase(true);
      onPhasesChange([...phases, waitlist]);
    }
  }, []);

  const updateActivePhase = (updates: Partial<ResearchPhase>) => {
    onPhasesChange(phases.map((p) => (p.isActive ? { ...p, ...updates } : p)));
  };

  const updateWaitlistPhaseWithAutoCalculation = (field: string, value: string) => {
    const currentWaitlist = phases[1];
    const currentMainPhase = phases[0];
    if (!currentWaitlist?.isActive) return;

    let updates: Partial<ResearchPhase> = { [field]: value };
    const mapFieldToDuration = {
      registrationStartDate: "registrationDuration",
      fullPaperStartDate: "fullPaperDuration",
      reviewStartDate: "reviewDuration",
      reviseStartDate: "reviseDuration",
      cameraReadyStartDate: "cameraReadyDuration",
      abstractDecideStatusStart: "abstractDecideStatusDuration",
      fullPaperDecideStatusStart: "fullPaperDecideStatusDuration",
      revisionPaperReviewStart: "revisionPaperReviewDuration",
      revisionPaperDecideStatusStart: "revisionPaperDecideStatusDuration",
      cameraReadyDecideStatusStart: "cameraReadyDecideStatusDuration",
    } as const;

    const durationKey = mapFieldToDuration[field as keyof typeof mapFieldToDuration];
    if (durationKey && value) {
      const duration = currentMainPhase[durationKey] ?? 1;
      const endDate = calculateEndDate(value, duration);
      updates = {
        [field]: value,
        [field.replace("Start", "End")]: endDate,
        [durationKey]: duration,
      };
    }

    updateActivePhase(updates);
  };

  const updateWaitlistPhaseDuration = (fieldPrefix: string, newDuration: number) => {
    const currentWaitlist = phases[1];
    if (!currentWaitlist?.isActive) return;

    const startDateKey = `${fieldPrefix}StartDate` as keyof ResearchPhase;
    const endDateKey = `${fieldPrefix}EndDate` as keyof ResearchPhase;
    const durationKey = `${fieldPrefix}Duration` as keyof ResearchPhase;

    const startDate = currentWaitlist[startDateKey] as string | undefined;
    let updates: Partial<ResearchPhase> = { [durationKey]: newDuration };

    if (startDate && newDuration > 0) {
      const endDate = calculateEndDate(startDate, newDuration);
      updates = { ...updates, [endDateKey]: endDate };
    }

    updateActivePhase(updates);
  };

  const updatePhaseDuration = (phaseKey: string, newDuration: number) => {
    const startDateKey = `${phaseKey}Start` as keyof ResearchPhase;
    const endDateKey = `${phaseKey}End` as keyof ResearchPhase;
    const durationKey = `${phaseKey}Duration` as keyof ResearchPhase;

    const startDate = activePhase[startDateKey] as string | undefined;
    let updates: Partial<ResearchPhase> = { [durationKey]: newDuration };

    if (startDate && newDuration > 0) {
      const endDate = calculateEndDate(startDate, newDuration);
      updates = { ...updates, [endDateKey]: endDate };
    }

    updateActivePhase(updates);
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
    
    if (activePhase.reviseEndDate && new Date(endDate) > new Date(activePhase.reviseEndDate)) {
      toast.error("Ngày kết thúc vòng chỉnh sửa vượt quá thời gian chỉnh sửa cho phép!");
      return;
    }

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
    const currentMainPhase = phases[0];
    if (!currentMainPhase.cameraReadyEndDate) {
      toast.error("Vui lòng hoàn thành Timeline chính trước khi tạo Waitlist!");
      return;
    }
    
    const currentStartDate = new Date(currentMainPhase.cameraReadyEndDate);
    currentStartDate.setDate(currentStartDate.getDate() + 1);
    const formatDateISO = (date: Date) => date.toISOString().split("T")[0];

    const createPhase = (duration: number): [string, string] => {
      const start = formatDateISO(currentStartDate);
      currentStartDate.setDate(currentStartDate.getDate() + duration - 1);
      const end = formatDateISO(currentStartDate);
      currentStartDate.setDate(currentStartDate.getDate() + 1);
      return [start, end];
    };

    const regisDur = currentMainPhase.registrationDuration ?? 1;
    const [regisStart, regisEnd] = createPhase(regisDur);

    const absDur = currentMainPhase.abstractDecideStatusDuration ?? 1;
    const [absDecStart, absDecEnd] = createPhase(absDur);

    const fpDur = currentMainPhase.fullPaperDuration ?? 1;
    const [fpStart, fpEnd] = createPhase(fpDur);

    const revDur = currentMainPhase.reviewDuration ?? 1;
    const [revStart, revEnd] = createPhase(revDur);

    const fpDecDur = currentMainPhase.fullPaperDecideStatusDuration ?? 1;
    const [fpDecStart, fpDecEnd] = createPhase(fpDecDur);

    const reviseDur = currentMainPhase.reviseDuration ?? 1;
    const [reviseStart, reviseEnd] = createPhase(reviseDur);

    const revPaperRevDur = currentMainPhase.revisionPaperReviewDuration ?? 1;
    const [revPaperRevStart, revPaperRevEnd] = createPhase(revPaperRevDur);

    const revPaperDecDur = currentMainPhase.revisionPaperDecideStatusDuration ?? 1;
    const [revPaperDecStart, revPaperDecEnd] = createPhase(revPaperDecDur);

    const camDur = currentMainPhase.cameraReadyDuration ?? 1;
    const [camStart, camEnd] = createPhase(camDur);

    const camDecDur = currentMainPhase.cameraReadyDecideStatusDuration ?? 1;
    const [camDecStart, camDecEnd] = createPhase(camDecDur);

    const copiedWaitlist: ResearchPhase = {
      // Submission
      registrationStartDate: regisStart,
      registrationEndDate: regisEnd,
      registrationDuration: regisDur,
      fullPaperStartDate: fpStart,
      fullPaperEndDate: fpEnd,
      fullPaperDuration: fpDur,
      reviewStartDate: revStart,
      reviewEndDate: revEnd,
      reviewDuration: revDur,
      reviseStartDate: reviseStart,
      reviseEndDate: reviseEnd,
      reviseDuration: reviseDur,
      cameraReadyStartDate: camStart,
      cameraReadyEndDate: camEnd,
      cameraReadyDuration: camDur,

      // Decision
      abstractDecideStatusStart: absDecStart,
      abstractDecideStatusEnd: absDecEnd,
      abstractDecideStatusDuration: absDur,
      fullPaperDecideStatusStart: fpDecStart,
      fullPaperDecideStatusEnd: fpDecEnd,
      fullPaperDecideStatusDuration: fpDecDur,
      revisionPaperReviewStart: revPaperRevStart,
      revisionPaperReviewEnd: revPaperRevEnd,
      revisionPaperReviewDuration: revPaperRevDur,
      revisionPaperDecideStatusStart: revPaperDecStart,
      revisionPaperDecideStatusEnd: revPaperDecEnd,
      revisionPaperDecideStatusDuration: revPaperDecDur,
      cameraReadyDecideStatusStart: camDecStart,
      cameraReadyDecideStatusEnd: camDecEnd,
      cameraReadyDecideStatusDuration: camDecDur,

      isWaitlist: true,
      isActive: false,
      revisionRoundDeadlines: [],
    };

    onPhasesChange([{ ...currentMainPhase }, copiedWaitlist]);
    toast.success("Đã tạo Waitlist Timeline! Bạn có thể chỉnh sửa ngày tháng.");
  };

  const resetActiveTimeline = () => {
    if (mainPhase.isActive) {
      const newMain = getEmptyPhase(false);
      newMain.isActive = true;
      const newPhases = [newMain];
      if (phases[1]) {
        newPhases.push({ ...phases[1], isActive: false });
      }
      onPhasesChange(newPhases);
      toast.success("Đã reset Timeline chính!");
    } else if (phases[1]?.isActive) {
      const newWaitlist = getEmptyPhase(true);
      newWaitlist.isActive = true;
      const newPhases = [{ ...mainPhase, isActive: false }, newWaitlist];
      onPhasesChange(newPhases);
      toast.success("Đã reset Waitlist timeline!");
    }
  };

  const isWaitlistActive = activePhase.isWaitlist;

  return (
    <div className="space-y-6">
      {/* Info Header */}
      {eventStartDate && eventEndDate && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-gray-600 mb-1">Ngày bán vé</div>
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
            Timeline research (bao gồm Waitlist) phải kết thúc trước ngày bán vé
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
          >
            Waitlist Phase
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={resetActiveTimeline}
          >
            Reset timeline
          </Button>
        </div>

        {isWaitlistActive && (
          <div className="mb-6">
            <Button size="sm" variant="outline" onClick={createWaitlistFromMain}>
              Tạo Waitlist Timeline từ Main Timeline
            </Button>
          </div>
        )}

        {isWaitlistActive && waitlistPhase && waitlistPhase.registrationStartDate && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
            <p className="text-sm text-green-800">
              ✓ Bạn có thể tùy chỉnh ngày tháng cho Waitlist Timeline. 
              Chỉ cần nhập ngày bắt đầu, duration sẽ tự động lấy từ Main Phase.
            </p>
          </div>
        )}
      </div>

      {/* TIMELINE THEO THỨ TỰ MỚI */}

      {/* 1. Registration */}
      <PhaseSection
        title="1. Đăng ký tham dự"
        startDate={activePhase.registrationStartDate}
        endDate={activePhase.registrationEndDate}
        duration={activePhase.registrationDuration ?? 1}
        onStartDateChange={(val) => {
          if (isWaitlistActive) {
            updateWaitlistPhaseWithAutoCalculation('registrationStartDate', val);
          } else {
            updateActivePhase({ registrationStartDate: val });
          }
        }}
        onDurationChange={(val) => {
          if (isWaitlistActive) {
            updateWaitlistPhaseDuration('registration', val);
          } else {
            updateActivePhase({ registrationDuration: val });
          }
        }}
        minDate={activePhase.isWaitlist && mainPhase.cameraReadyDecideStatusEnd ? addDays(mainPhase.cameraReadyDecideStatusEnd) : undefined}
        maxDate={ticketSaleStart ? addDays(ticketSaleStart, -1) : undefined}
        isWaitlistManual={isWaitlistActive}
        showDuration={!!(activePhase.registrationStartDate && activePhase.registrationEndDate)}
      />

      {/* 2. Abstract Decide Status - SAU Registration */}
      <PhaseSection
        title="2. Quyết định Abstract"
        startDate={activePhase.abstractDecideStatusStart}
        endDate={activePhase.abstractDecideStatusEnd}
        duration={activePhase.abstractDecideStatusDuration ?? 1}
        onStartDateChange={(val) => {
          if (isWaitlistActive) {
            updateWaitlistPhaseWithAutoCalculation('abstractDecideStatusStart', val);
          } else {
            updateActivePhase({ abstractDecideStatusStart: val });
          }
        }}
        onDurationChange={(val) => {
          if (isWaitlistActive) {
            updateWaitlistPhaseDuration('abstractDecideStatus', val);
          } else {
            updatePhaseDuration('abstractDecideStatus', val);
          }
        }}
        minDate={addDays(activePhase.registrationEndDate) || undefined}
        isWaitlistManual={isWaitlistActive}
        showDuration={!!(activePhase.abstractDecideStatusStart && activePhase.abstractDecideStatusEnd)}
      />

      {/* 3. Full Paper - SAU Abstract Decide */}
      <PhaseSection
        title="3. Nộp bài full paper"
        startDate={activePhase.fullPaperStartDate}
        endDate={activePhase.fullPaperEndDate}
        duration={activePhase.fullPaperDuration ?? 1}
        onStartDateChange={(val) => {
          if (isWaitlistActive) {
            updateWaitlistPhaseWithAutoCalculation('fullPaperStartDate', val);
          } else {
            updateActivePhase({ fullPaperStartDate: val });
          }
        }}
        onDurationChange={(val) => {
          if (isWaitlistActive) {
            updateWaitlistPhaseDuration('fullPaper', val);
          } else {
            updateActivePhase({ fullPaperDuration: val });
          }
        }}       
        minDate={
          addDays(activePhase.abstractDecideStatusEnd) || 
          undefined
        }
        isWaitlistManual={isWaitlistActive}
        showDuration={!!(activePhase.fullPaperStartDate && activePhase.fullPaperEndDate)}
      />

      {/* 4. Review - SAU Full Paper */}
      <PhaseSection
        title="4. Phản biện"
        startDate={activePhase.reviewStartDate}
        endDate={activePhase.reviewEndDate}
        duration={activePhase.reviewDuration ?? 1}
        onStartDateChange={(val) => {
          if (isWaitlistActive) {
            updateWaitlistPhaseWithAutoCalculation('reviewStartDate', val);
          } else {
            updateActivePhase({ reviewStartDate: val });
          }
        }}
        onDurationChange={(val) => {
          if (isWaitlistActive) {
            updateWaitlistPhaseDuration('review', val);
          } else {
            updateActivePhase({ reviewDuration: val });
          }
        }}
        minDate={
          addDays(activePhase.fullPaperEndDate) || 
          undefined
        }
        isWaitlistManual={isWaitlistActive}
        showDuration={!!(activePhase.reviewStartDate && activePhase.reviewEndDate)}
      />

      {/* 5. Full Paper Decide Status - SAU Review */}
      <PhaseSection
        title="5. Quyết định Full Paper"
        startDate={activePhase.fullPaperDecideStatusStart}
        endDate={activePhase.fullPaperDecideStatusEnd}
        duration={activePhase.fullPaperDecideStatusDuration ?? 1}
        onStartDateChange={(val) => {
          if (isWaitlistActive) {
            updateWaitlistPhaseWithAutoCalculation('fullPaperDecideStatusStart', val);
          } else {
            updateActivePhase({ fullPaperDecideStatusStart: val });
          }
        }}
        onDurationChange={(val) => {
          if (isWaitlistActive) {
            updateWaitlistPhaseDuration('fullPaperDecideStatus', val);
          } else {
            updatePhaseDuration('fullPaperDecideStatus', val);
          }
        }}
        minDate={addDays(activePhase.reviewEndDate) || undefined}
        isWaitlistManual={isWaitlistActive}
        showDuration={!!(activePhase.fullPaperDecideStatusStart && activePhase.fullPaperDecideStatusEnd)}
      />

      {/* 6. Revise - SAU Full Paper Decide */}
      <div>
        <h4 className="font-medium mb-3 flex items-center gap-2">
          6. Chỉnh sửa
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
            onChange={(val) => {
              if (isWaitlistActive) {
                updateWaitlistPhaseWithAutoCalculation('reviseStartDate', val);
              } else {
                updateActivePhase({ reviseStartDate: val });
              }
            }}
            minDate={addDays(activePhase.fullPaperDecideStatusEnd) || undefined}
            required
          />
          <FormInput
            label="Số ngày"
            type="number"
            min="1"
            value={activePhase.reviseDuration}
            onChange={(val) => {
              const numVal = Number(val);
              if (isWaitlistActive) {
                updateWaitlistPhaseDuration('revise', numVal);
              } else {
                updateActivePhase({ reviseDuration: numVal });
              }
            }}           
            placeholder="VD: 15"
          />
          <div>
            <label className="block text-sm font-medium mb-2">
              Ngày kết thúc
              {isWaitlistActive && activePhase.reviseStartDate && activePhase.reviseEndDate && (
                <span className="text-xs text-gray-500 ml-2">
                  ({activePhase.reviseDuration} ngày)
                </span>
              )}
            </label>
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
                minDate={
                  activePhase.revisionRoundDeadlines.length > 0
                    ? addDays(activePhase.revisionRoundDeadlines[activePhase.revisionRoundDeadlines.length - 1].endSubmissionDate)
                    : activePhase.reviseStartDate || undefined
                }
                maxDate={activePhase.reviseEndDate || undefined}
              />
              <FormInput
                label="Số ngày"
                type="number"
                min="1"
                max={
                  newRevisionRound.startDate && activePhase.reviseEndDate
                    ? Math.max(1, Math.floor((new Date(activePhase.reviseEndDate).getTime() - new Date(newRevisionRound.startDate).getTime()) / 86400000) + 1)
                    : undefined
                }
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

      {/* 7. Revision Paper Review - SAU Revise End */}
      <PhaseSection
        title="7. Phản biện Paper Review"
        startDate={activePhase.revisionPaperReviewStart}
        endDate={activePhase.revisionPaperReviewEnd}
        duration={activePhase.revisionPaperReviewDuration ?? 1}
        onStartDateChange={(val) => {
          if (isWaitlistActive) {
            updateWaitlistPhaseWithAutoCalculation('revisionPaperReviewStart', val);
          } else {
            updateActivePhase({ revisionPaperReviewStart: val });
          }
        }}
        onDurationChange={(val) => {
          if (isWaitlistActive) {
            updateWaitlistPhaseDuration('revisionPaperReview', val);
          } else {
            updatePhaseDuration('revisionPaperReview', val);
          }
        }}
        minDate={
          addDays(activePhase.reviseEndDate) || 
          undefined
        }
        isWaitlistManual={isWaitlistActive}
        showDuration={!!(activePhase.revisionPaperReviewStart && activePhase.revisionPaperReviewEnd)}
      />

      {/* 8. Revision Paper Decide Status - SAU Revision Paper Review */}
      <PhaseSection
        title="8. Quyết định Revision Paper"
        startDate={activePhase.revisionPaperDecideStatusStart}
        endDate={activePhase.revisionPaperDecideStatusEnd}
        duration={activePhase.revisionPaperDecideStatusDuration ?? 1}
        onStartDateChange={(val) => {
          if (isWaitlistActive) {
            updateWaitlistPhaseWithAutoCalculation('revisionPaperDecideStatusStart', val);
          } else {
            updateActivePhase({ revisionPaperDecideStatusStart: val });
          }
        }}
        onDurationChange={(val) => {
          if (isWaitlistActive) {
            updateWaitlistPhaseDuration('revisionPaperDecideStatus', val);
          } else {
            updatePhaseDuration('revisionPaperDecideStatus', val);
          }
        }}
        minDate={addDays(activePhase.revisionPaperReviewEnd) || undefined}
        isWaitlistManual={isWaitlistActive}
        showDuration={!!(activePhase.revisionPaperDecideStatusStart && activePhase.revisionPaperDecideStatusEnd)}
      />

      {/* 9. Camera Ready - SAU Revision Paper Decide */}
      <PhaseSection
        title="9. Camera Ready"
        startDate={activePhase.cameraReadyStartDate}
        endDate={activePhase.cameraReadyEndDate}
        duration={activePhase.cameraReadyDuration ?? 1}
        onStartDateChange={(val) => {
          if (isWaitlistActive) {
            updateWaitlistPhaseWithAutoCalculation('cameraReadyStartDate', val);
          } else {
            updateActivePhase({ cameraReadyStartDate: val });
          }
        }}
        onDurationChange={(val) => {
          if (isWaitlistActive) {
            updateWaitlistPhaseDuration('cameraReady', val);
          } else {
            updateActivePhase({ cameraReadyDuration: val });
          }
        }}
        minDate={addDays(activePhase.revisionPaperDecideStatusEnd) || undefined}
        maxDate={ticketSaleStart ? addDays(ticketSaleStart, -1) : undefined}
        isWaitlistManual={isWaitlistActive}
        showDuration={!!(activePhase.cameraReadyStartDate && activePhase.cameraReadyEndDate)}
      />

      {/* 10. Camera Ready Decide Status - SAU Camera Ready Start */}
      <PhaseSection
        title="10. Quyết định Camera Ready"
        startDate={activePhase.cameraReadyDecideStatusStart}
        endDate={activePhase.cameraReadyDecideStatusEnd}
        duration={activePhase.cameraReadyDecideStatusDuration ?? 1}
        onStartDateChange={(val) => {
          if (isWaitlistActive) {
            updateWaitlistPhaseWithAutoCalculation('cameraReadyDecideStatusStart', val);
          } else {
            updateActivePhase({ cameraReadyDecideStatusStart: val });
          }
        }}
        onDurationChange={(val) => {
          if (isWaitlistActive) {
            updateWaitlistPhaseDuration('cameraReadyDecideStatus', val);
          } else {
            updatePhaseDuration('cameraReadyDecideStatus', val);
          }
        }}
        minDate={addDays(activePhase.cameraReadyEndDate) || undefined}
        isWaitlistManual={isWaitlistActive}
        showDuration={!!(activePhase.cameraReadyDecideStatusStart && activePhase.cameraReadyDecideStatusEnd)}
      />
    </div>
  );
}

// Helper Component
interface PhaseSectionProps {
  title: string;
  startDate: string;
  endDate: string;
  duration: number;
  onStartDateChange: (val: string) => void;
  onDurationChange: (val: number) => void;
  minDate?: string;
  maxDate?: string;
  isWaitlistManual?: boolean;
  showDuration?: boolean;
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
  isWaitlistManual = false,
  showDuration = false,
}: PhaseSectionProps) {
  return (
    <div>
      <h4 className="font-medium mb-3 flex items-center gap-2">
        {title}
        {showDuration && (
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
          <label className="block text-sm font-medium mb-2">
            Ngày kết thúc
            {isWaitlistManual && startDate && endDate && (
              <span className="text-xs text-gray-500 ml-2">
                ({duration} ngày)
              </span>
            )}
          </label>
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