import React, { useState, useEffect, useMemo } from "react";
import { Clock, MapPin, Calendar as CalendarIcon, AlertCircle, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import type { Session, SessionMedia } from "@/types/conference.type";
import { ImageUpload } from "@/components/atoms/ImageUpload";

interface ResearchSingleSessionFormProps {
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

export function ResearchSingleSessionForm({
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
}: ResearchSingleSessionFormProps) {
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
    sessionMedias: initialSession?.sessionMedias || ([] as SessionMedia[]),
  });

  const [calculatedEndTime, setCalculatedEndTime] = useState(initialSession?.endTime || slotEndTime);

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
      //Chỉ giữ sessionId nếu đang edit
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
      speaker: [],
      sessionMedias: formData.sessionMedias,
    };

    onSave(session);
    toast.success(isEditMode ? "Đã cập nhật session thành công!" : "Đã tạo session thành công!");
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {isEditMode ? "Chỉnh sửa phiên họp" : "Tạo phiên họp mới"}
        </h3>
        <p className="text-sm text-gray-600">
          {isEditMode 
            ? "Cập nhật thông tin chi tiết cho phiên họp"
            : "Điền thông tin chi tiết cho phiên họp trong khung giờ đã chọn"}
        </p>
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
            placeholder="VD: Thảo luận nghiên cứu AI trong giáo dục"
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

        {/* Time Selection - 2 columns */}
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

        {/* MEDIA UPLOAD SECTION */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Hình ảnh phiên họp
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
    </div>
  );
}