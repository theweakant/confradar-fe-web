"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { FormSelect } from "@/components/molecules/FormSelect";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import { DatePickerInput } from "@/components/atoms/DatePickerInput";
import { ImageUpload } from "@/components/atoms/ImageUpload";
import { formatDate, formatTimeDate } from "@/helper/format";
import { toast } from "sonner";
import type { Session, RoomInfoResponse, SessionMedia } from "@/types/conference.type";

interface ResearchSessionFormProps {
  sessions: Session[];
  onSessionsChange: (sessions: Session[]) => void;
  eventStartDate: string;
  eventEndDate: string;
  roomOptions: Array<{ value: string; label: string }>;
  roomsData?: { data: RoomInfoResponse[] };
  isRoomsLoading: boolean;
}

export function ResearchSessionForm({
  sessions,
  onSessionsChange,
  eventStartDate,
  eventEndDate,
  roomOptions,
  roomsData,
  isRoomsLoading,
}: ResearchSessionFormProps) {
  const [newSession, setNewSession] = useState<Omit<Session, "speaker">>({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    date: "",
    timeRange: 1,
    roomId: "",
    sessionMedias: [],
  });
const sessionMedias = newSession.sessionMedias;

  useEffect(() => {
    if (newSession.startTime && newSession.timeRange && newSession.timeRange > 0) {
      const start = new Date(newSession.startTime);
      const end = new Date(start);
      end.setHours(end.getHours() + Number(newSession.timeRange));
      const formattedEnd = end.toISOString().split("T")[0] + "T" + end.toTimeString().slice(0, 5);
      setNewSession((prev) => ({ ...prev, endTime: formattedEnd }));
    }
  }, [newSession.startTime, newSession.timeRange]);

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
        setNewSession((prev) => ({ ...prev, sessionMedias: [] }));
        return;
    }

    const sessionMedias: SessionMedia[] = files.map((file) => ({
        mediaFile: file,
        mediaUrl: "",
    }));

    setNewSession((prev) => ({ ...prev, sessionMedias }));
    };

  const handleAddSession = () => {
    if (!newSession.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề phiên họp!");
      return;
    }
    if (!newSession.date || !newSession.startTime || !newSession.endTime) {
      toast.error("Vui lòng nhập đầy đủ ngày và thời gian!");
      return;
    }
    if (!newSession.roomId) {
      toast.error("Vui lòng chọn phòng!");
      return;
    }

    // ✅ Format datetime đúng trước khi thêm vào sessions
    const formattedSession: Session = {
      ...newSession,
      // Đảm bảo startTime, endTime có đầy đủ date + time
      startTime: newSession.startTime, // Format: "YYYY-MM-DDTHH:mm"
      endTime: newSession.endTime,     // Format: "YYYY-MM-DDTHH:mm"
      date: newSession.date,           // Format: "YYYY-MM-DD"
      speaker: [], // BE research không dùng
    };

    onSessionsChange([...sessions, formattedSession]);

    // Reset form
    setNewSession({
      title: "",
      description: "",
      date: "",
      startTime: "",
      endTime: "",
      timeRange: 1,
      roomId: "",
      sessionMedias: [],
    });

    toast.success("Đã thêm phiên họp!");
  };

  const handleRemoveSession = (index: number) => {
    onSessionsChange(sessions.filter((_, i) => i !== index));
    toast.success("Đã xóa phiên họp!");
  };

  const handleEditSession = (session: Session, index: number) => {
    const { speaker, ...rest } = session;
    setNewSession(rest);
    onSessionsChange(sessions.filter((_, i) => i !== index));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-4">
      {/* Session List */}
      <div className="space-y-2 mb-4">
        {sessions.length === 0 ? (
          <div className="p-3 bg-gray-50 text-gray-600 rounded text-sm">
            Chưa có phiên họp nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {sessions.map((s, idx) => {
              const room = roomsData?.data.find((r) => r.roomId === s.roomId);
              return (
                <div key={idx} className="bg-white border rounded-xl p-4 shadow-sm">
                  <div className="font-semibold">{s.title}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {formatTimeDate(s.startTime)} – {formatTimeDate(s.endTime)}
                  </div>
                  {room && (
                    <div className="text-xs text-gray-500 mt-1">
                      Phòng: {room.number} – {room.displayName}
                    </div>
                  )}
                  {s.sessionMedias && s.sessionMedias.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      📎 {s.sessionMedias.length} file đã chọn
                    </div>
                  )}
                  <div className="flex justify-end gap-2 mt-3">
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
        <h4 className="font-medium">Thêm phiên họp mới</h4>

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
            label="Ngày"
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
                setNewSession({ ...newSession, startTime: `${newSession.date}T${val}` });
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
            required
          />
        </div>

        <FormSelect
          label="Phòng"
          value={newSession.roomId}
          onChange={(val) => setNewSession({ ...newSession, roomId: val })}
          options={roomOptions}
          required
          disabled={isRoomsLoading}
        />

        {/* ✅ Media Upload - LƯU FILE THẬT */}
        <div className="border-t pt-3">
          <h5 className="font-medium mb-2">
            Hình ảnh phiên họp 
            {newSession.sessionMedias?.length > 0 && (
            <span className="text-sm text-gray-600 ml-2">
                ({newSession.sessionMedias?.length} file đã chọn)
            </span>
            )}
          </h5>
          <ImageUpload
            label="Tải lên ảnh"
            subtext="Chọn một hoặc nhiều file ảnh"
            maxSizeMB={4}
            isList={true}
            onChange={handleMediaChange}
          />
        </div>

        <Button onClick={handleAddSession} className="w-full mt-4">
          Thêm phiên họp
        </Button>
      </div>
    </div>
  );
}