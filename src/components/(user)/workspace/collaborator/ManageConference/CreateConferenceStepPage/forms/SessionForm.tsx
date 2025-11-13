import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { FormSelect } from "@/components/molecules/FormSelect";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import { DatePickerInput } from "@/components/atoms/DatePickerInput";
import { ImageUpload } from "@/components/atoms/ImageUpload";
import { formatDate, formatTimeDate } from "@/helper/format";
import { toast } from "sonner";
import type { Session, Speaker, RoomInfoResponse } from "@/types/conference.type";
import { useStepNavigation } from "../hooks";

interface SessionFormProps {
  sessions: Session[];
  onSessionsChange: (sessions: Session[]) => void;
  onRemoveSession?: (sessionId: string) => void;
  eventStartDate: string;
  eventEndDate: string;
  roomOptions: Array<{ value: string; label: string }>;
  roomsData?: { data: RoomInfoResponse[] };
  isRoomsLoading: boolean;
}

// Speaker Modal Component
interface SpeakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (speaker: Speaker) => void;
}

function SpeakerModal({ isOpen, onClose, onAdd }: SpeakerModalProps) {
  const [newSpeaker, setNewSpeaker] = useState<Omit<Speaker, "image"> & { image: File | null }>({
    name: "",
    description: "",
    image: null,
  });

  const handleAdd = () => {
    if (!newSpeaker.name.trim()) {
      toast.error("Vui lòng nhập tên diễn giả!");
      return;
    }

    if (!newSpeaker.image) {
      toast.error("Vui lòng chọn ảnh diễn giả!");
      return;
    }

    onAdd(newSpeaker as Speaker);

    // Reset form
    setNewSpeaker({ name: "", description: "", image: null });
    onClose();
    toast.success("Đã thêm diễn giả!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Thêm diễn giả</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <FormInput
            label="Tên diễn giả"
            value={newSpeaker.name}
            onChange={(val) => setNewSpeaker({ ...newSpeaker, name: val })}
            placeholder="VD: Nguyễn Văn A"
          />

          <FormTextArea
            label="Mô tả"
            value={newSpeaker.description}
            onChange={(val) => setNewSpeaker({ ...newSpeaker, description: val })}
            rows={2}
            placeholder="Chức vụ, kinh nghiệm..."
          />

          <ImageUpload
            label="Ảnh diễn giả"
            subtext="Dưới 4MB, định dạng PNG hoặc JPG"
            maxSizeMB={4}
            height="h-32"
            onChange={(file) => setNewSpeaker({ ...newSpeaker, image: file as File | null })}
          />

          <div className="flex gap-3 mt-6">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Hủy
            </Button>
            <Button onClick={handleAdd} className="flex-1">
              Thêm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SessionForm({
  sessions,
  onSessionsChange,
  onRemoveSession,
  eventStartDate,
  eventEndDate,
  roomOptions,
  roomsData,
  isRoomsLoading,
}: SessionFormProps) {
  const { currentStep, isStepCompleted, handleUnmarkCompleted } = useStepNavigation();

  const [newSession, setNewSession] = useState<Session>({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    date: "",
    timeRange: 1,
    roomId: "",
    speaker: [],
    sessionMedias: [],
  });

  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);

  useEffect(() => {
    if (isStepCompleted(currentStep)) {
      handleUnmarkCompleted(currentStep);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newSession]);

  // Auto calculate end time when startTime or timeRange changes
  useEffect(() => {
    if (newSession.startTime && newSession.timeRange && newSession.timeRange > 0) {
      const start = new Date(newSession.startTime);
      const end = new Date(start);
      end.setHours(end.getHours() + Number(newSession.timeRange));

      const formattedEnd = end.toLocaleString("sv-SE").replace(" ", "T").slice(0, 16);
      setNewSession((prev) => ({ ...prev, endTime: formattedEnd }));
    }
  }, [newSession.startTime, newSession.timeRange]);

  const handleAddSpeaker = (speaker: Speaker) => {
    setNewSession({
      ...newSession,
      speaker: [...newSession.speaker, speaker],
    });
  };

  const handleRemoveSpeaker = (index: number) => {
    setNewSession({
      ...newSession,
      speaker: newSession.speaker.filter((_, i) => i !== index),
    });
    toast.success("Đã xóa diễn giả!");
  };

  const handleAddSession = () => {
    if (!newSession.title || newSession.speaker.length === 0) {
      toast.error("Vui lòng nhập tiêu đề và ít nhất 1 diễn giả!");
      return;
    }

    if (!newSession.date || !newSession.startTime || !newSession.endTime) {
      toast.error("Vui lòng nhập đầy đủ ngày và thời gian!");
      return;
    }

    if (!eventStartDate || !eventEndDate) {
      toast.error("Không tìm thấy thông tin thời gian sự kiện!");
      return;
    }

    const confStart = new Date(eventStartDate);
    const confEnd = new Date(eventEndDate);
    const sessionDate = new Date(newSession.date);

    confStart.setHours(0, 0, 0, 0);
    confEnd.setHours(0, 0, 0, 0);
    sessionDate.setHours(0, 0, 0, 0);

    if (sessionDate < confStart || sessionDate > confEnd) {
      toast.error(
        `Ngày phiên họp phải trong khoảng ${confStart.toLocaleDateString("vi-VN")} - ${confEnd.toLocaleDateString("vi-VN")}!`
      );
      return;
    }

    if (newSession.startTime && newSession.endTime) {
      const start = new Date(newSession.startTime);
      const end = new Date(newSession.endTime);
      const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

      if (durationMinutes < 30) {
        toast.error("Thời lượng phiên họp phải ít nhất 30 phút!");
        return;
      }

      if (durationMinutes < 0) {
        toast.error("Thời gian kết thúc phải sau thời gian bắt đầu!");
        return;
      }
    }

    onSessionsChange([...sessions, newSession]);
    setNewSession({
      title: "",
      description: "",
      date: "",
      startTime: "",
      endTime: "",
      timeRange: 1,
      roomId: "",
      speaker: [],
      sessionMedias: [],
    });

    toast.success("Đã thêm session!");
  };

  const handleRemoveSession = (index: number) => {
    const session = sessions[index];

    if (onRemoveSession && session.sessionId) {
      onRemoveSession(session.sessionId);
    } else {
      onSessionsChange(sessions.filter((_, i) => i !== index));
      toast.success("Đã xóa session!");
    }
  };

  const handleEditSession = (session: Session, index: number) => {
    setNewSession(session);
    onSessionsChange(sessions.filter((_, i) => i !== index));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-4">
      {/* Session List */}
      <div className="space-y-2 mb-4">
        {sessions.length === 0 ? (
          <div className="p-3 bg-gray-50 text-gray-600 rounded text-sm">
            Chưa có phiên họp nào. Bạn có thể bỏ qua hoặc thêm phiên họp mới bên dưới.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {sessions.map((s, idx) => {
              const room = roomsData?.data.find((r: RoomInfoResponse) => r.roomId === s.roomId);

              return (
                <div
                  key={idx}
                  className="relative bg-white border border-gray-300 rounded-xl p-4 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="font-semibold text-gray-900">{s.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {formatTimeDate(s.startTime)} - {formatTimeDate(s.endTime)}
                    </div>
                    {room && (
                      <div className="text-xs text-gray-500 mt-1">
                        Phòng: <span className="font-medium">{room.number}</span> - {room.displayName}
                      </div>
                    )}
                    {s.speaker.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm font-medium text-gray-800 mb-1">Diễn giả:</div>
                        <ul className="space-y-1 text-sm text-gray-600">
                          {s.speaker.map((spk, spkIdx) => (
                            <li key={spkIdx} className="ml-2">
                              <span className="font-medium">{spk.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => handleEditSession(s, idx)}>
                      Sửa
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleRemoveSession(idx)}>
                      Xóa
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add New Session Form */}
      <div className="border p-4 rounded space-y-3">
        <h4 className="font-medium flex items-center gap-2">
          Thêm phiên họp mới
          {eventStartDate && eventEndDate && (
            <span className="text-sm text-green-600">
              ({formatDate(eventStartDate)} → {formatDate(eventEndDate)})
            </span>
          )}
        </h4>

        <FormInput
          label="Tiêu đề"
          value={newSession.title}
          onChange={(val) => setNewSession({ ...newSession, title: val })}
          required
        />

        <FormTextArea
          label="Mô tả"
          value={newSession.description || ""}
          onChange={(val) => setNewSession({ ...newSession, description: val })}
          rows={2}
        />

        <div className="grid grid-cols-3 gap-3">
          <DatePickerInput
            label="Ngày bắt đầu session"
            value={newSession.date}
            onChange={(val) => setNewSession({ ...newSession, date: val })}
            minDate={eventStartDate}
            maxDate={eventEndDate}
            required
          />

          <FormInput
            label="Thời gian bắt đầu"
            type="time"
            value={newSession.startTime ? newSession.startTime.split("T")[1]?.slice(0, 5) : ""}
            onChange={(val) => {
              if (newSession.date) {
                const datetime = `${newSession.date}T${val}`;
                setNewSession({ ...newSession, startTime: datetime });
              } else {
                toast.error("Vui lòng chọn ngày trước!");
              }
            }}
            required
            disabled={!newSession.date}
          />

          <FormInput
            label="Thời lượng (giờ)"
            type="number"
            min="0.5"
            step="0.5"
            value={newSession.timeRange}
            onChange={(val) => setNewSession({ ...newSession, timeRange: Number(val) })}
            placeholder="VD: 2 giờ"
            required
          />
        </div>

        {/* Preview time */}
        {newSession.startTime && newSession.endTime && (
          <div className="bg-blue-50 p-3 rounded space-y-1">
            <div className="text-sm text-gray-700">
              <span className="font-medium">Bắt đầu:</span> {formatTimeDate(newSession.startTime)}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">Kết thúc:</span> {formatTimeDate(newSession.endTime)}
            </div>
          </div>
        )}

        <FormSelect
          label="Phòng"
          value={newSession.roomId}
          onChange={(val) => setNewSession({ ...newSession, roomId: val })}
          options={roomOptions}
          required
          disabled={isRoomsLoading}
        />

        {/* Speaker Management */}
        <div className="border-t pt-3">
          <h5 className="font-medium mb-2">Diễn giả ({newSession.speaker.length})</h5>

          {newSession.speaker.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-3">
              {newSession.speaker.map((spk, idx) => (
                <div
                  key={idx}
                  className="relative bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center text-center shadow-sm"
                >
                  {spk.image && (
                    <img
                      src={spk.image instanceof File ? URL.createObjectURL(spk.image) : spk.image}
                      alt={spk.name}
                      className="w-16 h-16 rounded-full object-cover mb-2 border border-blue-200"
                    />
                  )}
                  <div className="font-medium text-sm text-gray-900">{spk.name}</div>
                  {spk.description && <div className="text-xs text-gray-600 mt-1">{spk.description}</div>}

                  <button
                    type="button"
                    onClick={() => handleRemoveSpeaker(idx)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button
            size="sm"
            onClick={() => setIsSpeakerModalOpen(true)}
            className="w-full"
            variant="outline"
          >
            + Thêm diễn giả
          </Button>
        </div>

        <Button onClick={handleAddSession} className="w-full mt-4">
          Thêm phiên họp
        </Button>
      </div>

      {/* Speaker Modal */}
      <SpeakerModal
        isOpen={isSpeakerModalOpen}
        onClose={() => setIsSpeakerModalOpen(false)}
        onAdd={handleAddSpeaker}
      />
    </div>
  );
}