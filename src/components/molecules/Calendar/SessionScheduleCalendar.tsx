"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Plus,
  Clock,
  Users,
  ImageIcon,
  Trash2,
  Save,
} from "lucide-react";
import BaseCalendar, { CalendarEvent, Room } from "./BaseCalendar";
import { DatePickerInput } from "@/components/atoms/DatePickerInput"; 
import {
  useGetAvailableRoomsBetweenDatesQuery,
} from "@/redux/services/room.service"; 

// ============================================================================
// TYPES (phải khớp với form cũ)
// ============================================================================

export interface Speaker {
  name: string;
  description?: string;
  image?: File | string; 
}

export interface SessionMedia {
  mediaFile: File | string;
}

export interface Session {
  title: string;
  description?: string;
  date: string; 
  startTime: string; 
  endTime: string;
  roomId: string;
  speaker: Speaker[];
  sessionMedias: SessionMedia[];
}

export interface SessionScheduleCalendarProps {
  sessions: Session[];
  onSessionsChange: (sessions: Session[]) => void;
  eventStartDate: string;
  eventEndDate: string;   
  conferenceId: string;
}

// ============================================================================
// SESSION FORM MODAL (tích hợp)
// ============================================================================

interface SessionFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (session: Session) => void;
  initialData?: Session;
  rooms: Room[];
  selectedDate?: Date;
  selectedTime?: string;
  selectedRoomId?: string;
  minDate: string;
  maxDate: string;
}

const SessionFormModal: React.FC<SessionFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  rooms,
  selectedDate,
  selectedTime,
  selectedRoomId,
  minDate,
  maxDate,
}) => {
  const [formData, setFormData] = useState<Partial<Session>>(() => {
    if (initialData) {
      return { ...initialData };
    }

    // Auto-fill từ slot — KHÔNG có endTime
    if (selectedDate && selectedTime && selectedRoomId) {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(hours, minutes, 0, 0);

      return {
        date: selectedDate.toISOString().split("T")[0],
        startTime: startDateTime.toISOString(),
        roomId: selectedRoomId,
        speaker: [],
        sessionMedias: [],
      };
    }

    return { speaker: [], sessionMedias: [] };
  });

  const [speakers, setSpeakers] = useState<Speaker[]>(initialData?.speaker || []);
  const [newSpeaker, setNewSpeaker] = useState<Omit<Speaker, "image"> & { image: File | null }>({
    name: "",
    description: "",
    image: null,
  });
  const [mediaFiles, setMediaFiles] = useState<SessionMedia[]>(initialData?.sessionMedias || []);

  const [mediaPreview, setMediaPreview] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      setMediaPreview([]);
    }
  }, [open]);

  if (!open) return null;

  const handleAddSpeaker = () => {
    if (!newSpeaker.name.trim()) return;
    if (!newSpeaker.image) return;

    setSpeakers([...speakers, { ...newSpeaker, image: newSpeaker.image }]);
    setNewSpeaker({ name: "", description: "", image: null });
  };

  const handleRemoveSpeaker = (index: number) => {
    setSpeakers(speakers.filter((_, i) => i !== index));
  };

  const handleMediaUpload = (files: FileList) => {
    const newMedias = Array.from(files).map((file) => ({ mediaFile: file }));
    const previews = newMedias.map((m) => URL.createObjectURL(m.mediaFile as File));
    setMediaFiles([...mediaFiles, ...newMedias]);
    setMediaPreview([...mediaPreview, ...previews]);
  };

  const handleRemoveMedia = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
    if (mediaPreview[index]) URL.revokeObjectURL(mediaPreview[index]);
    setMediaPreview(mediaPreview.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.date ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.roomId
    ) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    onSubmit({
      title: formData.title,
      description: formData.description,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      roomId: formData.roomId,
      speaker: speakers,
      sessionMedias: mediaFiles,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {initialData ? "Chỉnh sửa Session" : "Tạo Session mới"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-blue-800/30 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Basic Info */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày <span className="text-red-500">*</span>
              </label>
              <DatePickerInput
                value={formData.date || ""}
                onChange={(val) => setFormData({ ...formData, date: val })}
                minDate={minDate}
                maxDate={maxDate}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phòng <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.roomId || ""}
                onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Chọn phòng</option>
                {rooms.map((room) => (
                  <option key={room.roomId} value={room.roomId}>
                    {room.roomName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.startTime?.slice(0, 16) || ""}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: new Date(e.target.value).toISOString() })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.endTime ? formData.endTime.slice(0, 16) : ""}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: new Date(e.target.value).toISOString() })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Speakers */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" /> Diễn giả
            </label>
            <div className="space-y-2 mb-3">
              {speakers.map((sp, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {sp.image && (
                    <img
                      src={typeof sp.image === "string" ? sp.image : URL.createObjectURL(sp.image)}
                      alt={sp.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{sp.name}</div>
                    {sp.description && <div className="text-sm text-gray-600">{sp.description}</div>}
                  </div>
                  <button type="button" onClick={() => handleRemoveSpeaker(i)} className="text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-2 p-3 bg-blue-50 rounded-lg border">
              <input
                type="text"
                value={newSpeaker.name}
                onChange={(e) => setNewSpeaker({ ...newSpeaker, name: e.target.value })}
                placeholder="Tên diễn giả"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                value={newSpeaker.description || ""}
                onChange={(e) => setNewSpeaker({ ...newSpeaker, description: e.target.value })}
                placeholder="Mô tả"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setNewSpeaker({ ...newSpeaker, image: e.target.files[0] });
                    }
                  }}
                  className="flex-1 text-sm"
                />
                <button type="button" onClick={handleAddSpeaker} className="px-3 py-2 bg-blue-600 text-white rounded">
                  Thêm
                </button>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ImageIcon className="w-4 h-4 inline mr-1" /> Media
            </label>
            {mediaPreview.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-2">
                {mediaPreview.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt="preview" className="w-full h-20 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && handleMediaUpload(e.target.files)}
              className="w-full text-sm"
            />
          </div>
        </form>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
            Hủy
          </button>
          <button type="submit" onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2">
            <Save className="w-4 h-4" />
            {initialData ? "Cập nhật" : "Tạo"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SessionScheduleCalendar: React.FC<SessionScheduleCalendarProps> = ({
  sessions,
  onSessionsChange,
  eventStartDate,
  eventEndDate,
  conferenceId,
}) => {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [slotSelection, setSlotSelection] = useState<{
    date: Date;
    time: string;
    roomId: string;
  } | null>(null);

  // Gọi API phòng trống
  const { data: availableRoomsData, isLoading: isLoadingRooms } = useGetAvailableRoomsBetweenDatesQuery({
    startdate: eventStartDate,
    endate: eventEndDate,
  });

  // Chuyển AvailableRoom[] → Room[]
  const rooms: Room[] = useMemo(() => {
    if (!availableRoomsData?.data) return [];
    const map = new Map<string, Room>();
    availableRoomsData.data.forEach((ar) => {
      if (!map.has(ar.roomId)) {
        map.set(ar.roomId, {
          roomId: ar.roomId,
          roomName: ar.roomDisplayName,
        });
      }
    });
    return Array.from(map.values());
  }, [availableRoomsData]);

  // Chuyển sessions → calendar events
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return sessions.map((s, i) => ({
      eventId: `session-${i}`,
      title: s.title,
      startTime: s.startTime,
      endTime: s.endTime,
      roomId: s.roomId,
      room: rooms.find((r) => r.roomId === s.roomId),
      type: "session",
      color: "#3b82f6",
      metadata: s,
    }));
  }, [sessions, rooms]);

  const handleSlotClick = (date: Date, time: string, roomId: string) => {
    // Kiểm tra ngày có trong khoảng không
    const dayStr = date.toISOString().split("T")[0];
    if (dayStr < eventStartDate || dayStr > eventEndDate) return;

    setSlotSelection({ date, time, roomId });
    setSelectedSession(null);
    setFormOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    const session = event.metadata as Session;
    setSelectedSession(session);
    setSlotSelection(null);
    setFormOpen(true);
  };

  const handleCreateSession = (session: Session) => {
    onSessionsChange([...sessions, session]);
    setFormOpen(false);
  };

  const handleUpdateSession = (updatedSession: Session) => {
    const updated = sessions.map((s) =>
      s === selectedSession ? updatedSession : s
    );
    onSessionsChange(updated);
    setFormOpen(false);
    setSelectedSession(null);
  };

  const handleDeleteSession = (sessionToDelete: Session) => {
    const updated = sessions.filter((s) => s !== sessionToDelete);
    onSessionsChange(updated);
  };

  return (
    <div className="bg-white p-4 rounded-lg border">
      <div className="mb-4 text-sm text-gray-600">
        Chọn ngày trong khoảng{" "}
        <span className="font-medium">{eventStartDate} – {eventEndDate}</span>
      </div>

      <BaseCalendar
        events={calendarEvents}
        rooms={rooms}
        onSlotClick={handleSlotClick}
        onEventClick={handleEventClick}
        showTimeline={true}
        timelineHours={{ start: 8, end: 18 }}
        enableRoomFilter={true}
        title="Lịch phiên họp"
        isLoading={isLoadingRooms}
        initialView="month"
      />

      {formOpen && (
        <SessionFormModal
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setSelectedSession(null);
            setSlotSelection(null);
          }}
          onSubmit={selectedSession ? handleUpdateSession : handleCreateSession}
          initialData={selectedSession || undefined}
          rooms={rooms}
          selectedDate={slotSelection?.date}
          selectedTime={slotSelection?.time}
          selectedRoomId={slotSelection?.roomId}
          minDate={eventStartDate}
          maxDate={eventEndDate}
        />
      )}

      {/* Nút xóa trong modal event (tuỳ chọn - nếu BaseCalendar hỗ trợ renderEventModal) */}
    </div>
  );
};