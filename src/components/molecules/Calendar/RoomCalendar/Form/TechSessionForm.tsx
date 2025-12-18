import React, { useState, useEffect, useMemo } from "react";
import { Clock, Users, MapPin, Calendar as CalendarIcon, AlertCircle, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import type { Session, Speaker, SessionMedia } from "@/types/conference.type";
import { ImageUpload } from "@/components/atoms/ImageUpload";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
interface SingleSessionFormProps {
  conferenceId: string;
  roomId: string;
  roomDisplayName: string;
  roomNumber?: string;
  date: string; 
  startTime: string; 
  endTime: string; 
  existingSessions?: Session[];
  initialSession?: Session;
  onSave: (session: Session) => void;
  onCancel: () => void;
}

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
    setNewSpeaker({ name: "", description: "", image: null });
    onClose();
    toast.success("Đã thêm diễn giả!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg p-5 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold text-gray-900">Thêm diễn giả</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên diễn giả <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newSpeaker.name}
              onChange={(e) => setNewSpeaker({ ...newSpeaker, name: e.target.value })}
              placeholder="VD: Nguyễn Văn A"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              value={newSpeaker.description}
              onChange={(e) => setNewSpeaker({ ...newSpeaker, description: e.target.value })}
              placeholder="Chức vụ, kinh nghiệm..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ảnh diễn giả <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 4 * 1024 * 1024) {
                    toast.error("Kích thước ảnh phải dưới 4MB!");
                    return;
                  }
                  setNewSpeaker({ ...newSpeaker, image: file });
                }
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Dưới 4MB, định dạng PNG hoặc JPG</p>
          </div>

          <div className="flex gap-2 mt-5">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleAdd}
              className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thêm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SessionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: Session[];
}

function SessionDetailModal({ isOpen, onClose, sessions }: SessionDetailModalProps) {
  if (!isOpen) return null;

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMinutes = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h${minutes > 0 ? ` ${minutes}p` : ""}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70]">
      <div className="bg-white rounded-lg p-5 max-w-6xl w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Danh sách session ({sessions.length})</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="font-medium">Chưa có session nào</p>
            <p className="text-sm mt-1">Hãy tạo session đầu tiên của bạn!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sessions.map((session, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <h4 className="font-bold text-gray-900 mb-2 text-sm line-clamp-2">
                  {session.title}
                </h4>

                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="text-xs font-medium text-gray-700">
                    {formatTime(session.startTime)} - {formatTime(session.endTime)}
                  </span>
                  <span className="text-xs text-gray-600">
                    {calculateDuration(session.startTime, session.endTime)}
                  </span>
                </div>

                {session.speaker && session.speaker.length > 0 && (
                  <div className="border-t border-blue-200 pt-2 mt-2">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs font-semibold text-gray-700 uppercase">
                        Diễn giả ({session.speaker.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {session.speaker.map((speaker, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 bg-white rounded-full px-2 py-1 shadow-sm border border-blue-100"
                        >
                          {speaker.image && (
                            <img
                              src={speaker.image instanceof File ? URL.createObjectURL(speaker.image) : speaker.image}
                              alt={speaker.name}
                              className="w-5 h-5 rounded-full object-cover border border-blue-200"
                            />
                          )}
                          <span className="text-xs font-medium text-gray-800">
                            {speaker.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function SingleSessionForm({
  conferenceId,
  roomId,
  roomDisplayName,
  roomNumber,
  date,
  startTime: slotStartTime,
  endTime: slotEndTime,
  existingSessions = [],
  initialSession,
  onSave,
  onCancel,
}: SingleSessionFormProps) {
    console.log('📅 SingleSessionForm props:', {
    date,
    startTime: slotStartTime,
    endTime: slotEndTime,
    roomId,
  });
  const calculateTimeRangeFromSession = (session?: Session): number => {
    if (!session) return 1;
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    const diffMs = end.getTime() - start.getTime();
    return diffMs / (1000 * 60 * 60);
  };

  const [formData, setFormData] = useState({
    title: initialSession?.title || "",
    description: initialSession?.description || "",
    selectedStartTime: initialSession?.startTime || slotStartTime,
    timeRange: initialSession ? calculateTimeRangeFromSession(initialSession) : 1,
    speakers: initialSession?.speaker || ([] as Speaker[]),
    sessionMedias: initialSession?.sessionMedias || ([] as SessionMedia[]),
  });

  const [calculatedEndTime, setCalculatedEndTime] = useState(initialSession?.endTime || slotEndTime);
  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);
  const [isSessionDetailModalOpen, setIsSessionDetailModalOpen] = useState(false);

  const isEditMode = !!initialSession;
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };
const startTimeOptions = useMemo(() => {
  if (!date) return [];
  const options: Array<{ value: string; label: string }> = [];
  
  const dateStr = date; 
  
  for (let hour = 6; hour <= 23; hour++) {
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    const isoString = `${dateStr}T${timeStr}:00`;
    
    options.push({
      value: isoString,
      label: timeStr,
    });
  }
  
  return options;
}, [date]);



  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMinutes = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h${minutes > 0 ? ` ${minutes}p` : ""}`;
  };

const maxTimeRange = useMemo(() => {
  const start = new Date(formData.selectedStartTime);
  
  const endOfDay = new Date(start);
  endOfDay.setHours(23, 59, 59, 999);
  
  const diffMs = endOfDay.getTime() - start.getTime();
  const hours = diffMs / (1000 * 60 * 60);
  
  return Math.max(0.5, Math.floor(hours * 2) / 2);
}, [formData.selectedStartTime]);

useEffect(() => {
  // 👇 Thêm log debug
  console.log('⏰ Calculating endTime:', {
    selectedStartTime: formData.selectedStartTime,
    timeRange: formData.timeRange,
    startDate: new Date(formData.selectedStartTime),
    isValid: !isNaN(new Date(formData.selectedStartTime).getTime())
  });

  const start = new Date(formData.selectedStartTime);
  const proposedEnd = new Date(start.getTime() + formData.timeRange * 60 * 60 * 1000);
  
  // Tạo thời điểm 23:59:59 của cùng ngày
  const endOfDay = new Date(start);
  endOfDay.setHours(23, 59, 59, 999);

  // Nếu proposedEnd vượt quá 23:59, giới hạn lại
  if (proposedEnd > endOfDay) {
    setCalculatedEndTime(endOfDay.toISOString());
    const maxHours = (endOfDay.getTime() - start.getTime()) / (1000 * 60 * 60);
    setFormData(prev => ({ ...prev, timeRange: Math.floor(maxHours * 2) / 2 }));
  } else {
    setCalculatedEndTime(proposedEnd.toISOString());
  }
}, [formData.timeRange, formData.selectedStartTime]);

  useEffect(() => {
    if (!isEditMode) {
      setFormData(prev => ({ ...prev, timeRange: 1 }));
    }
  }, [formData.selectedStartTime, isEditMode]);

  const handleAddSpeaker = (speaker: Speaker) => {
    setFormData({
      ...formData,
      speakers: [...formData.speakers, speaker],
    });
  };

  const handleRemoveSpeaker = (index: number) => {
    setFormData({
      ...formData,
      speakers: formData.speakers.filter((_, i) => i !== index),
    });
    toast.success("Đã xóa diễn giả!");
  };

  const handleMediaChange = (fileOrFiles: File | File[] | null) => {
    let files: File[] | null = null;

    if (fileOrFiles === null) {
      files = null;
    } else if (Array.isArray(fileOrFiles)) {
      files = fileOrFiles;
    } else {
      files = [fileOrFiles];
    }

    if (!files || files.length === 0) {
      setFormData(prev => ({ ...prev, sessionMedias: [] }));
      return;
    }

    const sessionMedias: SessionMedia[] = files.map((file) => ({
      mediaFile: file,
      mediaUrl: "",
    }));

    setFormData(prev => ({ ...prev, sessionMedias }));
  };


const handleSubmit = () => {
  if (!formData.title.trim()) {
    toast.error("Vui lòng nhập tiêu đề session!");
    return;
  }


  
  if (formData.timeRange < 0.5) {
    toast.error("Thời lượng tối thiểu là 0.5 giờ (30 phút)!");
    return;
  }

  if (formData.timeRange > maxTimeRange) {
    toast.error(
      `Thời lượng tối đa là ${maxTimeRange} giờ (theo giờ bắt đầu đã chọn)!`
    );
    return;
  }

// Kiểm tra không qua ngày
const startDate = new Date(formData.selectedStartTime);
const endDate = new Date(calculatedEndTime);

const startDay = startDate.toISOString().split('T')[0];
const endDay = endDate.toISOString().split('T')[0];

if (startDay !== endDay) {
  toast.error("Session không được qua ngày hôm sau. Chọn thời gian kết thúc trước 23:59.");
  return;
}

  const proposedEnd = new Date(formData.selectedStartTime);
  proposedEnd.setTime(proposedEnd.getTime() + formData.timeRange * 60 * 60 * 1000);
  const maxEnd = new Date(slotEndTime);

  if (proposedEnd > maxEnd) {
    toast.error(
      `Thời gian kết thúc (${formatTime(proposedEnd.toISOString())}) vượt quá khung giờ trống (${formatTime(slotEndTime)})!`
    );
    return;
  }

  const session: Session = {
    sessionId: initialSession?.sessionId,
    
    conferenceId,
    title: formData.title,
    description: formData.description,
    date,
    startTime: formData.selectedStartTime,
    endTime: calculatedEndTime,
    timeRange: formData.timeRange,
    roomId,
    roomDisplayName,
    roomNumber,
    speaker: formData.speakers,
    sessionMedias: formData.sessionMedias,
  };


  onSave(session);
  toast.success(isEditMode ? "Đã cập nhật session thành công!" : "Đã tạo session thành công!");
};

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {isEditMode ? "Chỉnh sửa session" : "Tạo session mới"}
        </h3>
      </div>

      {/* Session Info Cards - 3 columns */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <div className="text-xs font-medium text-blue-900">Ngày</div>
          </div>
          <div className="text-sm font-semibold text-gray-900">{formatDate(date)}</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-green-600" />
            <div className="text-xs font-medium text-green-900">Khung giờ</div>
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {formatTime(slotStartTime)} - {formatTime(slotEndTime)}
          </div>
          <div className="text-xs text-gray-600 mt-0.5">
            {calculateDuration(slotStartTime, slotEndTime)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-3 relative">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-purple-600" />
            <div className="text-xs font-medium text-purple-900">Phòng</div>
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {roomDisplayName}
          </div>
          {roomNumber && (
            <div className="text-xs text-gray-600 mt-0.5">Số: {roomNumber}</div>
          )}
          {existingSessions.length > 0 && (
            <button
              onClick={() => setIsSessionDetailModalOpen(true)}
              className="absolute top-2 right-2 px-2 py-0.5 bg-white hover:bg-gray-50 text-purple-700 rounded text-xs font-semibold transition-colors border border-purple-300"
            >
              {existingSessions.length} phiên
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="VD: Giới thiệu công nghệ AI trong giáo dục"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Mô tả nội dung session..."
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        {/* Time Selection - 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giờ bắt đầu <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.selectedStartTime}
              onValueChange={(value) => setFormData({ ...formData, selectedStartTime: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn giờ bắt đầu" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                <SelectGroup>
                  {startTimeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thời lượng (giờ) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max={maxTimeRange}
              value={formData.timeRange}
              onChange={(e) => setFormData({ ...formData, timeRange: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Tối thiểu: 0.5 giờ • Tối đa: {maxTimeRange} giờ
        </p>

        {/* Preview - 3 columns */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-green-600" />
            <div className="text-sm font-medium text-green-900">Xem trước thời gian</div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="text-gray-700">
              <span className="font-medium">Bắt đầu:</span> {formatTime(formData.selectedStartTime)}
            </div>
            <div className="text-gray-700">
              <span className="font-medium">Kết thúc:</span> {formatTime(calculatedEndTime)}
            </div>
            <div className="text-gray-700">
              <span className="font-medium">Thời lượng:</span> {calculateDuration(formData.selectedStartTime, calculatedEndTime)}
            </div>
          </div>
        </div>

        <div className="border-t pt-3">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Hình ảnh session
            </label>
            {formData.sessionMedias.length > 0 && (
              <span className="text-xs text-gray-500">
                {formData.sessionMedias.length} file đã chọn
              </span>
            )}
          </div>

          <ImageUpload
            label=""
            subtext="Chọn một hoặc nhiều file ảnh (dưới 4MB mỗi file)"
            maxSizeMB={4}
            isList={true}
            onChange={handleMediaChange}
          />
        </div>

        <div className="border-t pt-3">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Diễn giả
            </label>
            <span className="text-xs text-gray-500">
              {formData.speakers.length > 0
                ? `${formData.speakers.length} diễn giả`
                : "Không có diễn giả"}
            </span>
          </div>

          {formData.speakers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-2">
              {formData.speakers.map((speaker, idx) => (
                <div
                  key={idx}
                  className="relative bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow"
                >
                  {speaker.image && (
                    <img
                      src={speaker.image instanceof File ? URL.createObjectURL(speaker.image) : speaker.image}
                      alt={speaker.name}
                      className="w-14 h-14 rounded-full object-cover mx-auto mb-2 border-2 border-blue-200"
                    />
                  )}
                  <div className="text-center">
                    <div className="font-medium text-sm text-gray-900">{speaker.name}</div>
                    {speaker.description && (
                      <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {speaker.description}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveSpeaker(idx)}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsSpeakerModalOpen(true)}
            className="w-full px-4 py-2 text-sm border-2 border-dashed border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4" />
            Thêm diễn giả
          </button>
        </div>
      </div>

      <div className="flex gap-2 pt-3 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {isEditMode ? "Cập nhật" : "Thêm"}
        </button>
      </div>

      <SpeakerModal
        isOpen={isSpeakerModalOpen}
        onClose={() => setIsSpeakerModalOpen(false)}
        onAdd={handleAddSpeaker}
      />

      <SessionDetailModal
        isOpen={isSessionDetailModalOpen}
        onClose={() => setIsSessionDetailModalOpen(false)}
        sessions={existingSessions}
      />
    </div>
  );
}