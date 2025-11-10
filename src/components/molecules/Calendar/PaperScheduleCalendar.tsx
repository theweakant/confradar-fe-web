import React, { useState, useMemo } from "react";
import {
  X,
  Clock,
  MapPin,
  FileText,
  User,
  Save,
  Search,
  Calendar as CalendarIcon,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import BaseCalendar, { CalendarEvent, Room } from "./BaseCalendar";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Author {
  authorId: string;
  authorName: string;
  email?: string;
  affiliation?: string;
}

export interface Paper {
  paperId: string;
  title: string;
  abstract?: string;
  authors: Author[];
  status: "camera-ready" | "approved" | "pending" | "rejected";
  submittedDate?: string;
  approvedDate?: string;
  keywords?: string[];
  trackId?: string;
  trackName?: string;
}

export interface PaperPresentation {
  presentationId?: string;
  paperId: string;
  paper?: Paper;
  date: string;
  startTime: string;
  endTime: string;
  roomId: string;
  room?: Room;
  presentationType: "oral" | "poster";
  presenterName?: string;
  notes?: string;
  conferenceId?: string;
}

export interface PaperScheduleCalendarProps {
  conferenceId: string;
  papers?: Paper[]; // Camera-ready papers
  presentations?: PaperPresentation[]; // Already scheduled presentations
  rooms: Room[];
  onSchedulePaper?: (presentation: PaperPresentation) => Promise<void>;
  onUpdatePresentation?: (
    presentationId: string,
    presentation: PaperPresentation,
  ) => Promise<void>;
  onDeletePresentation?: (presentationId: string) => Promise<void>;
  isLoading?: boolean;
  useMockData?: boolean;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_ROOMS: Room[] = [
  {
    roomId: "room-1",
    roomName: "Conference Hall A",
    capacity: 150,
    floor: "1",
    building: "Main Building",
    equipment: ["Projector", "Microphone", "Pointer"],
  },
  {
    roomId: "room-2",
    roomName: "Seminar Room B",
    capacity: 80,
    floor: "2",
    building: "Main Building",
    equipment: ["Projector", "Whiteboard"],
  },
  {
    roomId: "room-3",
    roomName: "Presentation Room C",
    capacity: 60,
    floor: "2",
    building: "Annex",
    equipment: ["Projector", "Sound System"],
  },
  {
    roomId: "room-4",
    roomName: "Poster Hall D",
    capacity: 200,
    floor: "1",
    building: "Exhibition Center",
    equipment: ["Display Boards", "Lighting"],
  },
];

const MOCK_PAPERS: Paper[] = [
  {
    paperId: "paper-1",
    title:
      "Deep Learning Approaches for Natural Language Processing in Vietnamese",
    abstract:
      "This paper presents novel deep learning techniques for Vietnamese NLP tasks...",
    authors: [
      {
        authorId: "author-1",
        authorName: "Dr. Nguyen Van A",
        email: "nguyenvana@university.edu.vn",
        affiliation: "VNU University of Science",
      },
      {
        authorId: "author-2",
        authorName: "Tran Thi B",
        email: "tranthib@university.edu.vn",
        affiliation: "VNU University of Science",
      },
    ],
    status: "camera-ready",
    submittedDate: "2025-09-15T00:00:00",
    approvedDate: "2025-10-20T00:00:00",
    keywords: ["Deep Learning", "NLP", "Vietnamese"],
    trackId: "track-1",
    trackName: "Artificial Intelligence",
  },
  {
    paperId: "paper-2",
    title: "Blockchain-based Security Framework for IoT Networks",
    abstract:
      "We propose a novel blockchain framework for securing IoT communications...",
    authors: [
      {
        authorId: "author-3",
        authorName: "Le Van C",
        email: "levanc@tech.edu.vn",
        affiliation: "HCMC University of Technology",
      },
    ],
    status: "camera-ready",
    submittedDate: "2025-09-20T00:00:00",
    approvedDate: "2025-10-22T00:00:00",
    keywords: ["Blockchain", "IoT", "Security"],
    trackId: "track-2",
    trackName: "Blockchain & Security",
  },
  {
    paperId: "paper-3",
    title:
      "Machine Learning for Medical Image Analysis: A Comprehensive Survey",
    abstract:
      "This survey reviews state-of-the-art ML techniques for medical imaging...",
    authors: [
      {
        authorId: "author-4",
        authorName: "Pham Thi D",
        email: "phamthid@medical.edu.vn",
        affiliation: "University of Medicine and Pharmacy",
      },
      {
        authorId: "author-5",
        authorName: "Hoang Van E",
        email: "hoangvane@medical.edu.vn",
        affiliation: "University of Medicine and Pharmacy",
      },
    ],
    status: "camera-ready",
    submittedDate: "2025-09-18T00:00:00",
    approvedDate: "2025-10-25T00:00:00",
    keywords: ["Machine Learning", "Medical Imaging", "Survey"],
    trackId: "track-1",
    trackName: "Artificial Intelligence",
  },
  {
    paperId: "paper-4",
    title: "Quantum Computing Applications in Cryptography",
    abstract:
      "Exploring quantum algorithms for next-generation cryptographic systems...",
    authors: [
      {
        authorId: "author-6",
        authorName: "Vo Van F",
        email: "vovanf@quantum.edu.vn",
        affiliation: "Institute of Physics",
      },
    ],
    status: "camera-ready",
    submittedDate: "2025-09-25T00:00:00",
    approvedDate: "2025-10-28T00:00:00",
    keywords: ["Quantum Computing", "Cryptography"],
    trackId: "track-3",
    trackName: "Quantum Computing",
  },
  {
    paperId: "paper-5",
    title: "Sustainable Cloud Computing: Energy Efficiency Optimization",
    abstract:
      "Novel approaches to reduce energy consumption in cloud data centers...",
    authors: [
      {
        authorId: "author-7",
        authorName: "Nguyen Thi G",
        email: "nguyenthig@cloud.edu.vn",
        affiliation: "FPT University",
      },
    ],
    status: "camera-ready",
    submittedDate: "2025-09-22T00:00:00",
    approvedDate: "2025-10-30T00:00:00",
    keywords: ["Cloud Computing", "Sustainability", "Energy Efficiency"],
    trackId: "track-4",
    trackName: "Cloud & Infrastructure",
  },
  {
    paperId: "paper-6",
    title: "Edge Computing for Real-time Video Analytics",
    abstract:
      "Edge computing framework for processing video streams in real-time...",
    authors: [
      {
        authorId: "author-8",
        authorName: "Dang Van H",
        email: "dangvanh@edge.edu.vn",
        affiliation: "Hanoi University of Science and Technology",
      },
    ],
    status: "camera-ready",
    submittedDate: "2025-09-28T00:00:00",
    approvedDate: "2025-11-01T00:00:00",
    keywords: ["Edge Computing", "Video Analytics", "Real-time"],
    trackId: "track-4",
    trackName: "Cloud & Infrastructure",
  },
];

const MOCK_PRESENTATIONS: PaperPresentation[] = [
  {
    presentationId: "pres-1",
    paperId: "paper-1",
    date: "2025-11-15",
    startTime: "2025-11-15T09:00:00",
    endTime: "2025-11-15T09:20:00",
    roomId: "room-1",
    presentationType: "oral",
    presenterName: "Dr. Nguyen Van A",
    notes: "Opening session - AI track",
  },
  {
    presentationId: "pres-2",
    paperId: "paper-2",
    date: "2025-11-15",
    startTime: "2025-11-15T09:30:00",
    endTime: "2025-11-15T09:50:00",
    roomId: "room-2",
    presentationType: "oral",
    presenterName: "Le Van C",
  },
  {
    presentationId: "pres-3",
    paperId: "paper-4",
    date: "2025-11-15",
    startTime: "2025-11-15T14:00:00",
    endTime: "2025-11-15T17:00:00",
    roomId: "room-4",
    presentationType: "poster",
    presenterName: "Vo Van F",
    notes: "Poster session - All tracks",
  },
];

// ============================================================================
// PAPER LIST SIDEBAR
// ============================================================================

interface PaperListSidebarProps {
  papers: Paper[];
  scheduledPaperIds: string[];
  onSelectPaper: (paper: Paper) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const PaperListSidebar: React.FC<PaperListSidebarProps> = ({
  papers,
  scheduledPaperIds,
  onSelectPaper,
  searchQuery,
  onSearchChange,
}) => {
  const filteredPapers = papers.filter(
    (paper) =>
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.authors.some((a) =>
        a.authorName.toLowerCase().includes(searchQuery.toLowerCase()),
      ) ||
      paper.keywords?.some((k) =>
        k.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  const unscheduledPapers = filteredPapers.filter(
    (p) => !scheduledPaperIds.includes(p.paperId),
  );
  const scheduledPapers = filteredPapers.filter((p) =>
    scheduledPaperIds.includes(p.paperId),
  );

  return (
    <div className="w-80 border-r border-gray-200 bg-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Camera-Ready Papers ({papers.length})
        </h3>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm paper, tác giả..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Paper List */}
      <div className="flex-1 overflow-y-auto">
        {/* Unscheduled Papers */}
        {unscheduledPapers.length > 0 && (
          <div className="p-4">
            <div className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              CHƯA XẾP LỊCH ({unscheduledPapers.length})
            </div>
            <div className="space-y-2">
              {unscheduledPapers.map((paper) => (
                <div
                  key={paper.paperId}
                  onClick={() => onSelectPaper(paper)}
                  className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
                >
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                    {paper.title}
                  </h4>
                  <p className="text-xs text-gray-600 mb-2">
                    {paper.authors.map((a) => a.authorName).join(", ")}
                  </p>
                  {paper.trackName && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      {paper.trackName}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scheduled Papers */}
        {scheduledPapers.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-600" />
              ĐÃ XẾP LỊCH ({scheduledPapers.length})
            </div>
            <div className="space-y-2">
              {scheduledPapers.map((paper) => (
                <div
                  key={paper.paperId}
                  className="p-3 bg-green-50 border border-green-200 rounded-lg opacity-60"
                >
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                    {paper.title}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {paper.authors.map((a) => a.authorName).join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredPapers.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Không tìm thấy paper</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// PAPER SCHEDULE FORM MODAL
// ============================================================================

interface PaperScheduleFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (presentation: PaperPresentation) => void;
  paper: Paper;
  rooms: Room[];
  availableSlots?: { date: Date; time: string; roomId: string }[];
  initialData?: Partial<PaperPresentation>;
  selectedDate?: Date;
  selectedTime?: string;
  selectedRoomId?: string;
}

const PaperScheduleForm: React.FC<PaperScheduleFormProps> = ({
  open,
  onClose,
  onSubmit,
  paper,
  rooms,
  initialData,
  selectedDate,
  selectedTime,
  selectedRoomId,
}) => {
  const [formData, setFormData] = useState<Partial<PaperPresentation>>(() => {
    if (initialData) return initialData;

    // Auto-fill from slot selection
    if (selectedDate && selectedTime && selectedRoomId) {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(hours, minutes, 0, 0);

      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(startDateTime.getMinutes() + 20); // Default 20 mins for oral

      return {
        paperId: paper.paperId,
        date: selectedDate.toISOString().split("T")[0],
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        roomId: selectedRoomId,
        presentationType: "oral",
        presenterName: paper.authors[0]?.authorName || "",
      };
    }

    return {
      paperId: paper.paperId,
      presentationType: "oral",
      presenterName: paper.authors[0]?.authorName || "",
    };
  });

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.startTime || !formData.endTime || !formData.roomId) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    onSubmit({
      ...formData,
      paper,
    } as PaperPresentation);

    onClose();
  };

  const updateDuration = (type: "oral" | "poster") => {
    setFormData({ ...formData, presentationType: type });

    // Auto-update duration based on type
    if (formData.startTime) {
      const startTime = new Date(formData.startTime);
      const endTime = new Date(startTime);

      if (type === "oral") {
        endTime.setMinutes(startTime.getMinutes() + 20); // 20 mins for oral
      } else {
        endTime.setHours(startTime.getHours() + 3); // 3 hours for poster session
      }

      setFormData((prev) => ({ ...prev, endTime: endTime.toISOString() }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Xếp lịch Paper Presentation</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-green-800/30 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]"
        >
          {/* Paper Info (Read-only) */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2">{paper.title}</h3>
            <p className="text-sm text-gray-600 mb-2">
              <User className="w-3 h-3 inline mr-1" />
              {paper.authors.map((a) => a.authorName).join(", ")}
            </p>
            {paper.trackName && (
              <span className="text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded-full">
                {paper.trackName}
              </span>
            )}
          </div>

          {/* Presentation Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại trình bày <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateDuration("oral")}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.presentationType === "oral"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:border-blue-300"
                }`}
              >
                <div className="font-semibold mb-1">Oral Presentation</div>
                <div className="text-xs text-gray-600">20 phút trình bày</div>
              </button>
              <button
                type="button"
                onClick={() => updateDuration("poster")}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.presentationType === "poster"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:border-blue-300"
                }`}
              >
                <div className="font-semibold mb-1">Poster Session</div>
                <div className="text-xs text-gray-600">3 giờ trưng bày</div>
              </button>
            </div>
          </div>

          {/* Presenter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Người trình bày <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.presenterName || ""}
              onChange={(e) =>
                setFormData({ ...formData, presenterName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Chọn người trình bày</option>
              {paper.authors.map((author) => (
                <option key={author.authorId} value={author.authorName}>
                  {author.authorName}{" "}
                  {author.affiliation && `- ${author.affiliation}`}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Room */}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.startTime?.slice(0, 16) || ""}
                onChange={(e) => {
                  const startTime = new Date(e.target.value).toISOString();
                  const endTime = new Date(e.target.value);

                  if (formData.presentationType === "oral") {
                    endTime.setMinutes(endTime.getMinutes() + 20);
                  } else {
                    endTime.setHours(endTime.getHours() + 3);
                  }

                  setFormData({
                    ...formData,
                    startTime,
                    endTime: endTime.toISOString(),
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú
            </label>
            <textarea
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Ghi chú đặc biệt (tùy chọn)"
            />
          </div>

          {/* Room Availability Hint */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            <AlertCircle className="w-4 h-4 inline mr-2" />
            Lưu ý: Kiểm tra phòng trống trên lịch trước khi xếp lịch
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
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Xếp lịch
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN PAPER SCHEDULE CALENDAR
// ============================================================================

const PaperScheduleCalendar: React.FC<PaperScheduleCalendarProps> = ({
  conferenceId,
  papers: propPapers,
  presentations: propPresentations,
  rooms: propRooms,
  onSchedulePaper,
  onUpdatePresentation,
  onDeletePresentation,
  isLoading = false,
  useMockData = false,
}) => {
  const papers = useMockData ? MOCK_PAPERS : propPapers || [];
  const presentations = useMockData
    ? MOCK_PRESENTATIONS
    : propPresentations || [];
  const rooms = useMockData ? MOCK_ROOMS : propRooms;

  const [formOpen, setFormOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [selectedPresentation, setSelectedPresentation] =
    useState<PaperPresentation | null>(null);
  const [slotSelection, setSlotSelection] = useState<{
    date: Date;
    time: string;
    roomId: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Convert presentations to calendar events
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return presentations.map((pres) => {
      const paper = papers.find((p) => p.paperId === pres.paperId);
      return {
        eventId: pres.presentationId || pres.paperId,
        title: paper?.title || "Unknown Paper",
        description: `${pres.presentationType.toUpperCase()} - ${pres.presenterName}`,
        startTime: pres.startTime,
        endTime: pres.endTime,
        roomId: pres.roomId,
        room: rooms.find((r) => r.roomId === pres.roomId),
        type: "paper",
        color: pres.presentationType === "oral" ? "#10b981" : "#8b5cf6",
        metadata: { ...pres, paper },
      };
    });
  }, [presentations, papers, rooms]);

  const scheduledPaperIds = presentations.map((p) => p.paperId);

  const handlePaperSelect = (paper: Paper) => {
    setSelectedPaper(paper);
    setSelectedPresentation(null);
    setSlotSelection(null);
    setFormOpen(true);
  };

  const handleSlotClick = (date: Date, time: string, roomId: string) => {
    if (!selectedPaper) {
      alert("Vui lòng chọn paper từ danh sách bên trái trước");
      return;
    }
    setSlotSelection({ date, time, roomId });
    setFormOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    const presentation = event.metadata as unknown as (PaperPresentation & {
      paper?: Paper;
    });
    setSelectedPresentation(presentation);
    setSelectedPaper(presentation.paper || null);
    setSlotSelection(null);
    setFormOpen(true);
  };

  const handleSchedulePaper = async (presentation: PaperPresentation) => {
    console.log("Schedule paper:", presentation);
    if (onSchedulePaper) {
      await onSchedulePaper(presentation);
    }
    setFormOpen(false);
    setSelectedPaper(null);
    setSlotSelection(null);
  };

  const handleUpdatePresentation = async (presentation: PaperPresentation) => {
    console.log("Update presentation:", presentation);
    if (selectedPresentation?.presentationId && onUpdatePresentation) {
      await onUpdatePresentation(
        selectedPresentation.presentationId,
        presentation,
      );
    }
    setFormOpen(false);
    setSelectedPresentation(null);
    setSelectedPaper(null);
  };

  return (
    <div className="flex h-screen">
      {/* Paper List Sidebar */}
      <PaperListSidebar
        papers={papers}
        scheduledPaperIds={scheduledPaperIds}
        onSelectPaper={handlePaperSelect}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Calendar */}
      <div className="flex-1">
        <BaseCalendar
          events={calendarEvents}
          rooms={rooms}
          onSlotClick={handleSlotClick}
          onEventClick={handleEventClick}
          showTimeline={true}
          timelineHours={{ start: 8, end: 18 }}
          enableRoomFilter={true}
          isLoading={isLoading}
          title="Xếp lịch Paper Presentation"
          categoryColors={{
            paper: "#10b981",
          }}
        />
      </div>

      {/* Schedule Form Modal */}
      {formOpen && selectedPaper && (
        <PaperScheduleForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setSelectedPaper(null);
            setSelectedPresentation(null);
            setSlotSelection(null);
          }}
          onSubmit={
            selectedPresentation
              ? handleUpdatePresentation
              : handleSchedulePaper
          }
          paper={selectedPaper}
          rooms={rooms}
          initialData={selectedPresentation || undefined}
          selectedDate={slotSelection?.date}
          selectedTime={slotSelection?.time}
          selectedRoomId={slotSelection?.roomId}
        />
      )}
    </div>
  );
};

export default PaperScheduleCalendar;
