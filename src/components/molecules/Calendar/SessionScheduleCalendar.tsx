import React, { useState, useMemo } from "react";
import {
  X,
  Plus,
  Clock,
  MapPin,
  Users,
  Image as ImageIcon,
  Trash2,
  Save,
} from "lucide-react";
import BaseCalendar, { CalendarEvent, Room } from "./BaseCalendar";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Speaker {
  speakerId?: string;
  speakerName: string;
  description?: string;
  image?: File | string;
}

export interface SessionMedia {
  mediaId?: string;
  mediaFile: File | string; // File for new, string URL for existing
  mediaType?: "image" | "video" | "document";
}

export interface Session {
  sessionId?: string;
  title: string;
  description?: string;
  date: string; // ISO date string
  startTime: string; // ISO datetime string
  endTime: string; // ISO datetime string
  roomId: string;
  room?: Room;
  speakers?: Speaker[];
  sessionMedias?: SessionMedia[];
  conferenceId?: string;
  statusId?: string;
}

export interface SessionScheduleCalendarProps {
  conferenceId: string;
  sessions?: Session[];
  rooms: Room[];
  onCreateSession?: (session: Session) => Promise<void>;
  onUpdateSession?: (sessionId: string, session: Session) => Promise<void>;
  onDeleteSession?: (sessionId: string) => Promise<void>;
  isLoading?: boolean;
  useMockData?: boolean;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_ROOMS: Room[] = [
  {
    roomId: "room-1",
    roomName: "Hội trường A",
    capacity: 200,
    floor: "1",
    building: "Tòa A",
    equipment: ["Projector", "Microphone", "Sound System"],
  },
  {
    roomId: "room-2",
    roomName: "Phòng B201",
    capacity: 50,
    floor: "2",
    building: "Tòa B",
    equipment: ["Projector", "Whiteboard"],
  },
  {
    roomId: "room-3",
    roomName: "Lab C301",
    capacity: 30,
    floor: "3",
    building: "Tòa C",
    equipment: ["Computers", "Projector"],
  },
  {
    roomId: "room-4",
    roomName: "Workshop D101",
    capacity: 100,
    floor: "1",
    building: "Tòa D",
    equipment: ["Stage", "Sound System", "Lighting"],
  },
];

const MOCK_SESSIONS: Session[] = [
  {
    sessionId: "session-1",
    title: "Keynote: AI Revolution in Vietnam",
    description:
      "Opening keynote về xu hướng AI tại Việt Nam và khu vực Đông Nam Á",
    date: "2025-11-15",
    startTime: "2025-11-15T09:00:00",
    endTime: "2025-11-15T10:30:00",
    roomId: "room-1",
    speakers: [
      {
        speakerId: "speaker-1",
        speakerName: "Dr. Nguyễn Văn A",
        description: "AI Research Lead at VinAI",
        image: "https://i.pravatar.cc/150?img=1",
      },
    ],
    sessionMedias: [
      {
        mediaId: "media-1",
        mediaFile:
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
        mediaType: "image",
      },
    ],
  },
  {
    sessionId: "session-2",
    title: "Workshop: Machine Learning Basics",
    description: "Hands-on workshop về các kỹ thuật ML cơ bản",
    date: "2025-11-15",
    startTime: "2025-11-15T11:00:00",
    endTime: "2025-11-15T12:30:00",
    roomId: "room-3",
    speakers: [
      {
        speakerId: "speaker-2",
        speakerName: "Trần Thị B",
        description: "ML Engineer at FPT Software",
        image: "https://i.pravatar.cc/150?img=2",
      },
      {
        speakerId: "speaker-3",
        speakerName: "Lê Văn C",
        description: "Data Scientist",
        image: "https://i.pravatar.cc/150?img=3",
      },
    ],
  },
  {
    sessionId: "session-3",
    title: "Panel Discussion: Future of Work",
    description: "Thảo luận về tương lai của công việc trong thời đại AI",
    date: "2025-11-15",
    startTime: "2025-11-15T14:00:00",
    endTime: "2025-11-15T15:30:00",
    roomId: "room-1",
    speakers: [
      {
        speakerId: "speaker-4",
        speakerName: "Phạm Thị D",
        description: "CEO of TechCorp",
        image: "https://i.pravatar.cc/150?img=4",
      },
      {
        speakerId: "speaker-5",
        speakerName: "Hoàng Văn E",
        description: "HR Director",
        image: "https://i.pravatar.cc/150?img=5",
      },
    ],
  },
  {
    sessionId: "session-4",
    title: "Technical Workshop: Deep Learning",
    description: "Advanced workshop về Deep Learning và Neural Networks",
    date: "2025-11-16",
    startTime: "2025-11-16T09:00:00",
    endTime: "2025-11-16T11:00:00",
    roomId: "room-2",
    speakers: [
      {
        speakerId: "speaker-6",
        speakerName: "Ngô Văn F",
        description: "Deep Learning Researcher",
        image: "https://i.pravatar.cc/150?img=6",
      },
    ],
  },
  {
    sessionId: "session-5",
    title: "Networking Session",
    description: "Coffee break và networking với các speakers và attendees",
    date: "2025-11-16",
    startTime: "2025-11-16T15:00:00",
    endTime: "2025-11-16T16:00:00",
    roomId: "room-4",
    speakers: [],
  },
];

// ============================================================================
// SESSION FORM MODAL
// ============================================================================

interface SessionFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (session: Session) => void;
  initialData?: Partial<Session>;
  rooms: Room[];
  selectedDate?: Date;
  selectedTime?: string;
  selectedRoomId?: string;
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
}) => {
  const [formData, setFormData] = useState<Partial<Session>>(() => {
    if (initialData) return initialData;

    // Auto-fill from slot selection
    if (selectedDate && selectedTime && selectedRoomId) {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(hours, minutes, 0, 0);

      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(hours + 1, minutes, 0, 0); // Default 1 hour duration

      return {
        date: selectedDate.toISOString().split("T")[0],
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        roomId: selectedRoomId,
        speakers: [],
        sessionMedias: [],
      };
    }

    return { speakers: [], sessionMedias: [] };
  });

  const [speakers, setSpeakers] = useState<Speaker[]>(
    initialData?.speakers || [],
  );
  const [newSpeaker, setNewSpeaker] = useState<Speaker>({ speakerName: "" });
  const [mediaFiles, setMediaFiles] = useState<SessionMedia[]>(
    initialData?.sessionMedias || [],
  );

  if (!open) return null;

  const handleAddSpeaker = () => {
    if (newSpeaker.speakerName.trim()) {
      setSpeakers([...speakers, { ...newSpeaker }]);
      setNewSpeaker({ speakerName: "" });
    }
  };

  const handleRemoveSpeaker = (index: number) => {
    setSpeakers(speakers.filter((_, i) => i !== index));
  };

  const handleSpeakerImageUpload = (index: number, file: File) => {
    const updatedSpeakers = [...speakers];
    updatedSpeakers[index].image = file;
    setSpeakers(updatedSpeakers);
  };

  const handleMediaUpload = (files: FileList) => {
    const newMedias = Array.from(files).map((file) => ({
      mediaFile: file,
      mediaType: file.type.startsWith("image/")
        ? ("image" as const)
        : ("document" as const),
    }));
    setMediaFiles([...mediaFiles, ...newMedias]);
  };

  const handleRemoveMedia = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.roomId
    ) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    onSubmit({
      ...formData,
      speakers,
      sessionMedias: mediaFiles,
    } as Session);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {initialData?.sessionId ? "Cập nhật Session" : "Tạo Session mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-800/30 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]"
        >
          {/* Basic Info */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tiêu đề session"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Mô tả chi tiết về session"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date || ""}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phòng <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.roomId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, roomId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Chọn phòng</option>
                {rooms.map((room) => (
                  <option key={room.roomId} value={room.roomId}>
                    {room.roomName} ({room.capacity} người)
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
                  setFormData({
                    ...formData,
                    startTime: new Date(e.target.value).toISOString(),
                  })
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
                value={formData.endTime?.slice(0, 16) || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    endTime: new Date(e.target.value).toISOString(),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Speakers Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Diễn giả
            </label>

            {/* Speaker List */}
            <div className="space-y-2 mb-3">
              {speakers.map((speaker, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  {speaker.image && (
                    <img
                      src={
                        typeof speaker.image === "string"
                          ? speaker.image
                          : URL.createObjectURL(speaker.image)
                      }
                      alt={speaker.speakerName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {speaker.speakerName}
                    </div>
                    {speaker.description && (
                      <div className="text-sm text-gray-600">
                        {speaker.description}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpeaker(index)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Speaker Form */}
            <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <input
                type="text"
                value={newSpeaker.speakerName}
                onChange={(e) =>
                  setNewSpeaker({ ...newSpeaker, speakerName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Tên diễn giả"
              />
              <input
                type="text"
                value={newSpeaker.description || ""}
                onChange={(e) =>
                  setNewSpeaker({ ...newSpeaker, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Chức vụ / Mô tả"
              />
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setNewSpeaker({
                        ...newSpeaker,
                        image: e.target.files[0],
                      });
                    }
                  }}
                  className="flex-1 text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddSpeaker}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Thêm
                </button>
              </div>
            </div>
          </div>

          {/* Media Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ImageIcon className="w-4 h-4 inline mr-1" />
              Media Files (Ảnh/Tài liệu)
            </label>

            {/* Media Preview */}
            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-3">
                {mediaFiles.map((media, index) => (
                  <div key={index} className="relative group">
                    {media.mediaType === "image" && (
                      <img
                        src={
                          typeof media.mediaFile === "string"
                            ? media.mediaFile
                            : URL.createObjectURL(media.mediaFile)
                        }
                        alt="Media"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(index)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                e.target.files && handleMediaUpload(e.target.files)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {initialData?.sessionId ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN SESSION SCHEDULE CALENDAR
// ============================================================================

const SessionScheduleCalendar: React.FC<SessionScheduleCalendarProps> = ({
  conferenceId,
  sessions: propSessions,
  rooms: propRooms,
  onCreateSession,
  onUpdateSession,
  onDeleteSession,
  isLoading = false,
  useMockData = false,
}) => {
  const sessions = useMockData ? MOCK_SESSIONS : propSessions || [];
  const rooms = useMockData ? MOCK_ROOMS : propRooms;

  const [formOpen, setFormOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [slotSelection, setSlotSelection] = useState<{
    date: Date;
    time: string;
    roomId: string;
  } | null>(null);

  // Convert sessions to calendar events
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return sessions.map((session) => ({
      eventId: session.sessionId || "",
      title: session.title,
      description: session.description,
      startTime: session.startTime,
      endTime: session.endTime,
      roomId: session.roomId,
      room: rooms.find((r) => r.roomId === session.roomId),
      type: "session",
      color: "#3b82f6",
      metadata: session,
    }));
  }, [sessions, rooms]);

  const handleSlotClick = (date: Date, time: string, roomId: string) => {
    setSlotSelection({ date, time, roomId });
    setSelectedSession(null);
    setFormOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedSession(event.metadata as Session);
    setSlotSelection(null);
    setFormOpen(true);
  };

  const handleCreateSession = async (session: Session) => {
    console.log("Create session:", session);
    if (onCreateSession) {
      await onCreateSession(session);
    }
    setFormOpen(false);
    setSlotSelection(null);
  };

  const handleUpdateSession = async (session: Session) => {
    console.log("Update session:", session);
    if (selectedSession?.sessionId && onUpdateSession) {
      await onUpdateSession(selectedSession.sessionId, session);
    }
    setFormOpen(false);
    setSelectedSession(null);
  };

  return (
    <>
      <BaseCalendar
        events={calendarEvents}
        rooms={rooms}
        onSlotClick={handleSlotClick}
        onEventClick={handleEventClick}
        showTimeline={true}
        timelineHours={{ start: 8, end: 18 }}
        enableRoomFilter={true}
        isLoading={isLoading}
        title="Xếp lịch Session"
        categoryColors={{
          session: "#3b82f6",
        }}
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
        />
      )}
    </>
  );
};

export default SessionScheduleCalendar;
