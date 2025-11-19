import React, { useState, useEffect, useMemo } from "react";
import { Clock, Users, MapPin, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { Session, Speaker } from "@/types/conference.type";

interface SingleSessionFormProps {
  conferenceId: string;
  roomId: string;
  roomDisplayName: string;
  roomNumber?: string;
  date: string; 
  startTime: string; 
  endTime: string; 
  existingSessions?: Session[];
  initialSession?: Session; // ✅ THÊM PROP NÀY
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
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Thêm diễn giả</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên diễn giả <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newSpeaker.name}
              onChange={(e) => setNewSpeaker({ ...newSpeaker, name: e.target.value })}
              placeholder="VD: Nguyễn Văn A"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              value={newSpeaker.description}
              onChange={(e) => setNewSpeaker({ ...newSpeaker, description: e.target.value })}
              placeholder="Chức vụ, kinh nghiệm..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Dưới 4MB, định dạng PNG hoặc JPG</p>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleAdd}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Chi tiết phiên họp</h3>
            <p className="text-sm text-gray-600 mt-1">Tổng cộng: {sessions.length} phiên họp</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <AlertCircle className="w-16 h-16 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-medium">Chưa có phiên họp nào</p>
            <p className="text-sm mt-2">Hãy tạo phiên họp đầu tiên của bạn!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <h4 className="font-bold text-gray-900 mb-2 text-base line-clamp-2">
                  {session.title}
                </h4>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">
                      {formatTime(session.startTime)} - {formatTime(session.endTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-4 h-4" />
                    <span>Thời lượng: {calculateDuration(session.startTime, session.endTime)}</span>
                  </div>
                </div>

                {session.description && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {session.description}
                    </p>
                  </div>
                )}

                {session.speaker && session.speaker.length > 0 && (
                  <div className="border-t border-blue-200 pt-3 mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-semibold text-gray-700 uppercase">
                        Diễn giả ({session.speaker.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {session.speaker.map((speaker, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 shadow-sm border border-blue-100"
                        >
                          {speaker.image && (
                            <img
                              src={speaker.image instanceof File ? URL.createObjectURL(speaker.image) : speaker.image}
                              alt={speaker.name}
                              className="w-6 h-6 rounded-full object-cover border border-blue-200"
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

        <div className="flex justify-end mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
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
  initialSession, // ✅ NHẬN PROP
  onSave,
  onCancel,
}: SingleSessionFormProps) {
  // ✅ TÍNH TOÁN TIME RANGE TỪ initialSession
  const calculateTimeRangeFromSession = (session?: Session): number => {
    if (!session) return 1;
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    const diffMs = end.getTime() - start.getTime();
    return diffMs / (1000 * 60 * 60); // Convert to hours
  };

  const [formData, setFormData] = useState({
    title: initialSession?.title || "",
    description: initialSession?.description || "",
    selectedStartTime: initialSession?.startTime || slotStartTime,
    timeRange: initialSession ? calculateTimeRangeFromSession(initialSession) : 1,
    speakers: initialSession?.speaker || ([] as Speaker[]),
  });

  const [calculatedEndTime, setCalculatedEndTime] = useState(initialSession?.endTime || slotEndTime);
  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);
  const [isSessionDetailModalOpen, setIsSessionDetailModalOpen] = useState(false);

  const isEditMode = !!initialSession;

  // Generate start time options
  const startTimeOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];
    const slotStart = new Date(slotStartTime);
    const slotEnd = new Date(slotEndTime);
    
    let currentHour = new Date(slotStart);
    currentHour.setMinutes(0, 0, 0);
    if (currentHour < slotStart) {
      currentHour.setHours(currentHour.getHours() + 1);
    }
    
    while (currentHour < slotEnd) {
      const hourValue = currentHour.toISOString();
      const hourLabel = currentHour.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      
      options.push({ value: hourValue, label: hourLabel });
      currentHour = new Date(currentHour.getTime() + 60 * 60 * 1000);
    }
    
    if (options.length === 0) {
      options.push({
        value: slotStartTime,
        label: formatTime(slotStartTime),
      });
    }
    
    return options;
  }, [slotStartTime, slotEndTime]);

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
    const max = new Date(slotEndTime);
    const diffMs = max.getTime() - start.getTime();
    const hours = diffMs / (1000 * 60 * 60);
    return Math.max(0.5, Math.floor(hours * 2) / 2);
  }, [formData.selectedStartTime, slotEndTime]);

  useEffect(() => {
    const start = new Date(formData.selectedStartTime);
    const proposedEnd = new Date(start.getTime() + formData.timeRange * 60 * 60 * 1000);
    const maxEnd = new Date(slotEndTime);

    if (proposedEnd > maxEnd) {
      setCalculatedEndTime(slotEndTime);
      const maxHours = (maxEnd.getTime() - start.getTime()) / (1000 * 60 * 60);
      setFormData(prev => ({ ...prev, timeRange: Math.floor(maxHours * 2) / 2 }));
    } else {
      setCalculatedEndTime(proposedEnd.toISOString());
    }
  }, [formData.timeRange, formData.selectedStartTime, slotEndTime]);

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

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề session!");
      return;
    }

    if (formData.speakers.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 diễn giả!");
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
      ...(initialSession || {}), // ✅ GIỮ LẠI sessionId và các field khác nếu edit
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
      sessionMedias: initialSession?.sessionMedias || [],
    };

    onSave(session);
    toast.success(isEditMode ? "Đã cập nhật session thành công!" : "Đã tạo session thành công!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {isEditMode ? "Chỉnh sửa phiên họp" : "Tạo phiên họp mới"}
        </h3>
        <p className="text-sm text-gray-600">
          {isEditMode 
            ? "Cập nhật thông tin chi tiết cho phiên họp"
            : "Điền thông tin chi tiết cho phiên họp trong khung giờ đã chọn"}
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-3">
          <CalendarIcon className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700">Ngày</div>
            <div className="text-base font-semibold text-gray-900">{formatDate(date)}</div>
          </div>
          {existingSessions.length > 0 && (
            <button
              onClick={() => setIsSessionDetailModalOpen(true)}
              className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border border-green-300"
            >
              <span>{existingSessions.length} session</span>
              <span className="text-green-600">→</span>
            </button>
          )}
        </div>

        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-gray-700">Khung giờ trống có sẵn</div>
            <div className="text-base font-semibold text-gray-900">
              {formatTime(slotStartTime)} - {formatTime(slotEndTime)}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Tổng thời lượng: {calculateDuration(slotStartTime, slotEndTime)}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-gray-700">Phòng</div>
            <div className="text-base font-semibold text-gray-900">
              {roomDisplayName}
              {roomNumber && <span className="text-sm text-gray-600 ml-2">(Số: {roomNumber})</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tiêu đề phiên họp <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="VD: Giới thiệu công nghệ AI trong giáo dục"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Mô tả nội dung phiên họp..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giờ bắt đầu <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.selectedStartTime}
            onChange={(e) => setFormData({ ...formData, selectedStartTime: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {startTimeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Chọn giờ bắt đầu trong khoảng {formatTime(slotStartTime)} - {formatTime(slotEndTime)}
          </p>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Tối thiểu: 0.5 giờ (30 phút) • Tối đa: {maxTimeRange} giờ (dựa trên giờ bắt đầu đã chọn)
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-green-900">Xem trước thời gian session</div>
            </div>
          </div>
          <div className="ml-7 space-y-1">
            <div className="text-sm text-gray-700">
              <span className="font-medium">Bắt đầu:</span> {formatTime(formData.selectedStartTime)}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">Kết thúc:</span> {formatTime(calculatedEndTime)}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">Thời lượng:</span> {calculateDuration(formData.selectedStartTime, calculatedEndTime)}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Diễn giả <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-gray-500">
              {formData.speakers.length} diễn giả
            </span>
          </div>

          {formData.speakers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-3">
              {formData.speakers.map((speaker, idx) => (
                <div
                  key={idx}
                  className="relative bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  {speaker.image && (
                    <img
                      src={speaker.image instanceof File ? URL.createObjectURL(speaker.image) : speaker.image}
                      alt={speaker.name}
                      className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-2 border-blue-200"
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
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-sm"
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
            className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4" />
            Thêm diễn giả
          </button>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {isEditMode ? "Cập nhật phiên họp" : "Tạo phiên họp"}
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