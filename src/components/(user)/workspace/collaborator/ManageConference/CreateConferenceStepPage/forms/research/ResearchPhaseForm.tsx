import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { formatDate } from "@/helper/format";
import { toast } from "sonner";
import type { ResearchPhase, RevisionRoundDeadline } from "@/types/conference.type";

// Cập nhật interface props
interface ResearchPhaseFormProps {
  phases: ResearchPhase[];
  onPhasesChange: (phases: ResearchPhase[]) => void;
  ticketSaleStart: string;
  ticketSaleEnd: string;
  eventStartDate: string;
  eventEndDate: string;
  // Thêm prop mới
  revisionAttemptAllowed: number; 
}

export function ResearchPhaseForm({
  phases,
  onPhasesChange,
  ticketSaleStart,
  ticketSaleEnd,
  eventStartDate,
  eventEndDate,
  // Nhận giá trị mới
  revisionAttemptAllowed = 2, // Giá trị mặc định nếu không truyền
}: ResearchPhaseFormProps) {
  const [newRevisionRound, setNewRevisionRound] = useState({
    roundNumber: 1,
    startDate: "",
    durationInDays: 3,
  });

  const mainPhase = phases[0];
  const activePhase = phases.find((p) => p.isActive) || mainPhase;
  
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
    const { roundNumber, startDate, durationInDays } = newRevisionRound;

    // --- Cập nhật: Kiểm tra số lượng vòng đã đạt tối đa ---
    if (activePhase.revisionRoundDeadlines.length >= revisionAttemptAllowed) {
      toast.error(`Số lượng vòng chỉnh sửa tối đa là ${revisionAttemptAllowed}!`);
      return;
    }
    // ---

    if (!startDate) {
      toast.error("Vui lòng chọn ngày bắt đầu vòng chỉnh sửa!");
      return;
    }

    if (durationInDays <= 0) {
      toast.error("Số ngày phải lớn hơn 0!");
      return;
    }

    const endDate = calculateEndDate(startDate, durationInDays);

    // Check overlap
    const isOverlapping = activePhase.revisionRoundDeadlines.some((round) => {
      const existingStart = new Date(round.startSubmissionDate);
      const existingEnd = new Date(round.endSubmissionDate);
      const newStart = new Date(startDate);
      const newEnd = new Date(endDate);
      return newStart <= existingEnd && newEnd >= existingStart;
    });

    if (isOverlapping) {
      toast.error("Vòng chỉnh sửa này bị trùng thời gian với vòng khác!");
      return;
    }

    const newRound: RevisionRoundDeadline = {
      roundNumber,
      startSubmissionDate: startDate,
      endSubmissionDate: endDate,
    };

    updateRevisionDeadlines([...activePhase.revisionRoundDeadlines, newRound]);

    setNewRevisionRound({
      roundNumber: activePhase.revisionRoundDeadlines.length + 2,
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
    // Calculate the start date for the new waitlist phase (one day after main phase's cameraReadyEndDate)
    let newWaitlistStartDate = mainPhase.cameraReadyEndDate;
    if (newWaitlistStartDate) {
      const nextDay = new Date(new Date(newWaitlistStartDate).getTime() + 86400000); // Add 1 day in milliseconds
      newWaitlistStartDate = nextDay.toISOString().split("T")[0];
    }

    // Create the new waitlist phase based on main phase durations, but with new start date
    const copiedWaitlist: ResearchPhase = {
      // Registration
      registrationStartDate: newWaitlistStartDate,
      registrationEndDate: newWaitlistStartDate ? calculateEndDate(newWaitlistStartDate, mainPhase.registrationDuration ?? 1) : "",
      registrationDuration: mainPhase.registrationDuration ?? 1,
      
      // Full Paper
      fullPaperStartDate: newWaitlistStartDate ? calculateEndDate(newWaitlistStartDate, mainPhase.registrationDuration ?? 1) : "",
      fullPaperEndDate: newWaitlistStartDate ? calculateEndDate(newWaitlistStartDate, (mainPhase.registrationDuration ?? 1) + (mainPhase.fullPaperDuration ?? 1) - 1) : "",
      fullPaperDuration: mainPhase.fullPaperDuration ?? 1,
      
      // Review
      reviewStartDate: newWaitlistStartDate ? calculateEndDate(newWaitlistStartDate, (mainPhase.registrationDuration ?? 1) + (mainPhase.fullPaperDuration ?? 1) - 1) : "",
      reviewEndDate: newWaitlistStartDate ? calculateEndDate(newWaitlistStartDate, (mainPhase.registrationDuration ?? 1) + (mainPhase.fullPaperDuration ?? 1) + (mainPhase.reviewDuration ?? 1) - 2) : "",
      reviewDuration: mainPhase.reviewDuration ?? 1,
      
      // Revise
      reviseStartDate: newWaitlistStartDate ? calculateEndDate(newWaitlistStartDate, (mainPhase.registrationDuration ?? 1) + (mainPhase.fullPaperDuration ?? 1) + (mainPhase.reviewDuration ?? 1) - 2) : "",
      reviseEndDate: newWaitlistStartDate ? calculateEndDate(newWaitlistStartDate, (mainPhase.registrationDuration ?? 1) + (mainPhase.fullPaperDuration ?? 1) + (mainPhase.reviewDuration ?? 1) + (mainPhase.reviseDuration ?? 1) - 3) : "",
      reviseDuration: mainPhase.reviseDuration ?? 1,
      
      // Camera Ready
      cameraReadyStartDate: newWaitlistStartDate ? calculateEndDate(newWaitlistStartDate, (mainPhase.registrationDuration ?? 1) + (mainPhase.fullPaperDuration ?? 1) + (mainPhase.reviewDuration ?? 1) + (mainPhase.reviseDuration ?? 1) - 3) : "",
      cameraReadyEndDate: newWaitlistStartDate ? calculateEndDate(newWaitlistStartDate, (mainPhase.registrationDuration ?? 1) + (mainPhase.fullPaperDuration ?? 1) + (mainPhase.reviewDuration ?? 1) + (mainPhase.reviseDuration ?? 1) + (mainPhase.cameraReadyDuration ?? 1) - 4) : "",
      cameraReadyDuration: mainPhase.cameraReadyDuration ?? 1,
      
      isWaitlist: true,
      isActive: true,
      revisionRoundDeadlines: [], // Start with no revision rounds
    };

    onPhasesChange([mainPhase, copiedWaitlist]);
    toast.success("Đã tạo waitlist timeline từ main!");
  };

  const createEmptyWaitlist = () => {
    // Calculate the start date for the new waitlist phase (one day after main phase's cameraReadyEndDate)
    let newWaitlistStartDate = mainPhase.cameraReadyEndDate;
    if (newWaitlistStartDate) {
      const nextDay = new Date(new Date(newWaitlistStartDate).getTime() + 86400000); // Add 1 day in milliseconds
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

  return (
    <div className="space-y-6">
      {/* Info Header */}
      {eventStartDate && eventEndDate && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="text-sm">
            <strong>Ngày tổ chức:</strong> {formatDate(eventStartDate)} → {formatDate(eventEndDate)}
          </div>
          <div className="text-sm">
            <strong>Ngày bán vé:</strong> {formatDate(ticketSaleStart)} → {formatDate(ticketSaleEnd)}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            ⚠️ Timeline research phải kết thúc trước ngày bán vé
          </div>
          {/* --- Cập nhật UI: Hiển thị số lượng vòng tối đa --- */}
          <div className="text-xs text-purple-600 mt-1">
            📝 Số lần chỉnh sửa cho phép: <strong>{revisionAttemptAllowed}</strong>
          </div>
          <div className="text-xs text-gray-500">
             Đã tạo: <strong>{activePhase.revisionRoundDeadlines.length}</strong> vòng / {revisionAttemptAllowed}
          </div>
          {/* --- Kết thúc cập nhật UI --- */}
        </div>
      )}

      {/* Tab Switching */}
      <div>
        <h4 className="font-medium mb-3">Chọn timeline</h4>
        <div className="flex gap-2 mb-4">
          <Button
            variant={mainPhase.isActive ? "default" : "outline"}
            onClick={switchToMainPhase}
          >
            Timeline chính
          </Button>
          <Button
            variant={phases[1]?.isActive ? "default" : "outline"}
            onClick={switchToWaitlistPhase}
            disabled={!phases[1]} // Disable if waitlist doesn't exist
          >
            Waitlist Timeline
          </Button>
        </div>

        {/* Waitlist Creation Buttons */}
        {!phases[1]?.isActive && ( // Show only if waitlist doesn't exist or isn't active
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={createWaitlistFromMain}>
              Tạo waitlist timeline tương tự (nối tiếp main)
            </Button>
            <Button variant="outline" size="sm" onClick={createEmptyWaitlist}>
              Tạo waitlist timeline mới
            </Button>
          </div>
        )}
      </div>

      {/* Registration Phase */}
      <PhaseSection
        title="Đăng ký tham dự"
        startDate={activePhase.registrationStartDate}
        endDate={activePhase.registrationEndDate}
        duration={activePhase.registrationDuration ?? 1}
        onStartDateChange={(val) => updateActivePhase({ registrationStartDate: val })}
        onDurationChange={(val) => updateActivePhase({ registrationDuration: Number(val) })}
        minDate={activePhase.isWaitlist ? mainPhase.cameraReadyEndDate ? new Date(new Date(mainPhase.cameraReadyEndDate).getTime() + 86400000).toISOString().split("T")[0] : undefined : undefined}
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
        minDate={activePhase.registrationEndDate || undefined}
      />

      {/* Review Phase */}
      <PhaseSection
        title="Phản biện"
        startDate={activePhase.reviewStartDate}
        endDate={activePhase.reviewEndDate}
        duration={activePhase.reviewDuration ?? 1}
        onStartDateChange={(val) => updateActivePhase({ reviewStartDate: val })}
        onDurationChange={(val) => updateActivePhase({ reviewDuration: Number(val) })}
        minDate={activePhase.fullPaperEndDate || undefined}
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
          <FormInput
            label="Ngày bắt đầu"
            type="date"
            value={activePhase.reviseStartDate}
            onChange={(val) => updateActivePhase({ reviseStartDate: val })}
            min={activePhase.reviewEndDate || undefined}
            required
          />
          <FormInput
            label="Số ngày"
            type="number"
            min="1"
            value={activePhase.reviseDuration}
            onChange={(val) => updateActivePhase({ reviseDuration: Number(val) })}
            placeholder="VD: 15 ngày"
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
        <div className="pl-4 border-l-2 border-orange-200">
          <h5 className="font-medium mb-2">
            Deadline từng vòng chỉnh sửa ({activePhase.revisionRoundDeadlines.length})
          </h5>

          {activePhase.revisionRoundDeadlines.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-3">
              {activePhase.revisionRoundDeadlines.map((round, idx) => (
                <div key={idx} className="p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="text-sm font-medium">Vòng {round.roundNumber}</div>
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

          {/* Add Round Form */}
          <div className="grid grid-cols-4 gap-2">
            <FormInput
              label="Vòng thứ"
              type="number"
              min="1"
              value={newRevisionRound.roundNumber}
              onChange={(val) =>
                setNewRevisionRound({ ...newRevisionRound, roundNumber: Number(val) })
              }
            />
            <FormInput
              label="Ngày bắt đầu"
              type="date"
              value={newRevisionRound.startDate}
              onChange={(val) => setNewRevisionRound({ ...newRevisionRound, startDate: val })}
              min={activePhase.reviseStartDate || undefined}
              max={activePhase.reviseEndDate || undefined}
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
            {/* --- Cập nhật UI: Disable nút nếu đạt max --- */}
            <Button 
              onClick={handleAddRevisionRound} 
              className="mt-6"
              disabled={activePhase.revisionRoundDeadlines.length >= revisionAttemptAllowed}
            >
              Thêm vòng
            </Button>
            {/* --- Kết thúc cập nhật UI --- */}
          </div>
        </div>
      </div>

      {/* Camera Ready Phase */}
      <PhaseSection
        title="Camera Ready"
        startDate={activePhase.cameraReadyStartDate}
        endDate={activePhase.cameraReadyEndDate}
        duration={activePhase.cameraReadyDuration ?? 1}
        onStartDateChange={(val) => updateActivePhase({ cameraReadyStartDate: val })}
        onDurationChange={(val) => updateActivePhase({ cameraReadyDuration: Number(val) })}
        minDate={activePhase.reviseEndDate || undefined}
        maxDate={ticketSaleStart ? new Date(new Date(ticketSaleStart).getTime() - 86400000).toISOString().split("T")[0] : undefined}
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
        <FormInput
          label="Ngày bắt đầu"
          type="date"
          value={startDate}
          onChange={onStartDateChange}
          min={minDate}
          max={maxDate}
          required
        />
        <FormInput
          label="Số ngày"
          type="number"
          min="1"
          value={duration}
          onChange={(val) => onDurationChange(Number(val))}
          placeholder="VD: 30 ngày"
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