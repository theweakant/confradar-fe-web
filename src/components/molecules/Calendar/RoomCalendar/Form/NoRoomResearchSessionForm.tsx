import React, { useState, useEffect, useMemo } from "react";
import { Clock, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { ResearchSession, SessionMedia } from "@/types/conference.type";
import { ImageUpload } from "@/components/atoms/ImageUpload";

interface NoRoomResearchSessionFormProps {
  conferenceId: string;
  conferenceStartDate: string; // "YYYY-MM-DD"
  conferenceEndDate: string;   // "YYYY-MM-DD"
  existingSessions?: ResearchSession[];
  initialSession?: ResearchSession;
  open: boolean;
  onSave: (session: ResearchSession) => void;
  onClose: () => void;
}

/**
 * Form tạo hoặc chỉnh sửa phiên họp nghiên cứu KHÔNG CẦN PHÒNG.
 * - Cho phép chọn ngày trong khoảng [conferenceStartDate, conferenceEndDate]
 * - Không có diễn giả (speaker)
 * - Không gắn phòng (roomId = null)
 */
export function NoRoomResearchSessionForm({
  conferenceId,
  conferenceStartDate,
  conferenceEndDate,
  existingSessions = [],
  initialSession,
  open,
  onSave,
  onClose,
}: NoRoomResearchSessionFormProps) {
  const isEditMode = !!initialSession;
  const [selectedDate, setSelectedDate] = useState<string>(
    initialSession?.date || conferenceStartDate
  );

  const calculateTimeRangeFromSession = (session?: ResearchSession): number => {
    if (!session?.startTime || !session?.endTime) return 1;
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    const diffMs = end.getTime() - start.getTime();
    return diffMs > 0 ? diffMs / (1000 * 60 * 60) : 1;
  };

  const [formData, setFormData] = useState({
    title: initialSession?.title || "",
    description: initialSession?.description || "",
    selectedStartTime: initialSession?.startTime || `${selectedDate}T06:00:00`,
    timeRange: initialSession ? calculateTimeRangeFromSession(initialSession) : 1,
    sessionMedias: initialSession?.sessionMedias || ([] as SessionMedia[]),
  });

  const [calculatedEndTime, setCalculatedEndTime] = useState(
    initialSession?.endTime || `${selectedDate}T07:00:00`
  );

  // Reset thời gian khi đổi ngày (chỉ khi tạo mới)
  useEffect(() => {
    if (!isEditMode) {
      const newStartTime = `${selectedDate}T06:00:00`;
      setFormData((prev) => ({
        ...prev,
        selectedStartTime: newStartTime,
        timeRange: 1,
      }));
      setCalculatedEndTime(`${selectedDate}T07:00:00`);
    }
  }, [selectedDate, isEditMode]);

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

  // Tạo danh sách giờ bắt đầu từ 06:00 đến 23:00 theo ngày đã chọn
  const startTimeOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];
    for (let hour = 6; hour <= 23; hour++) {
      const timeStr = `${hour.toString().padStart(2, "0")}:00`;
      const isoString = `${selectedDate}T${timeStr}:00`;
      options.push({
        value: isoString,
        label: timeStr,
      });
    }
    return options;
  }, [selectedDate]);

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMinutes = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h${minutes > 0 ? ` ${minutes}p` : ""}`;
  };

  // Tính thời lượng tối đa không vượt quá 23:59
  const maxTimeRange = useMemo(() => {
    const start = new Date(formData.selectedStartTime);
    const endOfDay = new Date(start);
    endOfDay.setHours(23, 59, 59, 999);
    const diffMs = endOfDay.getTime() - start.getTime();
    const hours = diffMs / (1000 * 60 * 60);
    return Math.max(0.5, Math.floor(hours * 2) / 2);
  }, [formData.selectedStartTime]);

  // Tự động cập nhật giờ kết thúc
  useEffect(() => {
    const start = new Date(formData.selectedStartTime);
    const proposedEnd = new Date(start.getTime() + formData.timeRange * 60 * 60 * 1000);
    const endOfDay = new Date(start);
    endOfDay.setHours(23, 59, 59, 999);

    if (proposedEnd > endOfDay) {
      setCalculatedEndTime(endOfDay.toISOString());
      const maxHours = (endOfDay.getTime() - start.getTime()) / (1000 * 60 * 60);
      setFormData((prev) => ({ ...prev, timeRange: Math.max(0.5, Math.floor(maxHours * 2) / 2) }));
    } else {
      setCalculatedEndTime(proposedEnd.toISOString());
    }
  }, [formData.timeRange, formData.selectedStartTime]);

  const handleMediaChange = (fileOrFiles: File | File[] | null) => {
    if (!fileOrFiles || (Array.isArray(fileOrFiles) && fileOrFiles.length === 0)) {
      setFormData((prev) => ({ ...prev, sessionMedias: [] }));
      return;
    }
    const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
    const sessionMedias: SessionMedia[] = files.map((file) => ({
      mediaFile: file,
      mediaUrl: "",
    }));
    setFormData((prev) => ({ ...prev, sessionMedias }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề phiên họp!");
      return;
    }

    if (formData.timeRange < 0.5) {
      toast.error("Thời lượng tối thiểu là 0.5 giờ (30 phút)!");
      return;
    }

    if (formData.timeRange > maxTimeRange) {
      toast.error(`Thời lượng tối đa là ${maxTimeRange} giờ (theo giờ bắt đầu đã chọn)!`);
      return;
    }

    const startDate = new Date(formData.selectedStartTime);
    const endDate = new Date(calculatedEndTime);
    const startDay = startDate.toISOString().split("T")[0];
    const endDay = endDate.toISOString().split("T")[0];
    if (startDay !== endDay) {
      toast.error("Phiên họp không được kéo dài qua ngày hôm sau. Vui lòng chọn thời gian kết thúc trước 23:59.");
      return;
    }

    if (selectedDate < conferenceStartDate || selectedDate > conferenceEndDate) {
      toast.error(
        `Ngày phải nằm trong khoảng từ ${formatDate(conferenceStartDate)} đến ${formatDate(conferenceEndDate)}`
      );
      return;
    }

    const session: ResearchSession = {
      sessionId: initialSession?.sessionId,
      conferenceId,
      title: formData.title,
      description: formData.description,
      date: selectedDate,
      startTime: formData.selectedStartTime,
      endTime: calculatedEndTime,
      timeRange: formData.timeRange,
      roomId: "", 
      roomDisplayName: undefined,
      roomNumber: undefined,
      sessionMedias: formData.sessionMedias,
    };

    onSave(session);
    toast.success(isEditMode ? "Đã cập nhật phiên họp thành công!" : "Đã tạo phiên họp thành công!");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[50] p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {isEditMode ? "Chỉnh sửa phiên họp" : "Tạo phiên họp mới (không phòng)"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {!isEditMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày tổ chức <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={conferenceStartDate}
                  max={conferenceEndDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarIcon className="w-4 h-4 text-blue-600" />
                  <div className="text-xs font-medium text-blue-900">Ngày</div>
                </div>
                <div className="text-sm font-semibold text-gray-900">{formatDate(selectedDate)}</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-green-600" />
                  <div className="text-xs font-medium text-green-900">Khung giờ</div>
                </div>
                <div className="text-sm font-semibold text-gray-900">06:00 - 23:59</div>
                <div className="text-xs text-gray-600 mt-0.5">Toàn bộ ngày</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề phiên họp <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="VD: Thảo luận về AI trong giáo dục"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả nội dung phiên họp..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giờ bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.selectedStartTime}
                    onChange={(e) => setFormData({ ...formData, selectedStartTime: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {startTimeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
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
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        setFormData({ ...formData, timeRange: val });
                      }
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Tối thiểu: 0.5 giờ • Tối đa: {maxTimeRange} giờ (không qua 23:59)
              </p>

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
                    <span className="font-medium">Thời lượng:</span>{" "}
                    {calculateDuration(formData.selectedStartTime, calculatedEndTime)}
                  </div>
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Hình ảnh phiên họp</label>
                  {formData.sessionMedias.length > 0 && (
                    <span className="text-xs text-gray-500">{formData.sessionMedias.length} file đã chọn</span>
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
            </div>

            <div className="flex gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={onClose}
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
          </div>
        </div>
      </div>
    </div>
  );
}