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
  onRemoveSession?: (sessionId: string) => void;
  eventStartDate: string;
  eventEndDate: string;
  roomOptions: Array<{ value: string; label: string }>;
  roomsData?: { data: RoomInfoResponse[] };
  isRoomsLoading: boolean;
}

export function ResearchSessionForm({
  sessions,
  onSessionsChange,
  onRemoveSession,
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
  if (!newSession.startTime || !newSession.timeRange || newSession.timeRange <= 0) {
    return;
  }

  const start = new Date(newSession.startTime);
  const startDay = new Date(start);
  startDay.setHours(0, 0, 0, 0);

  const endProposed = new Date(start);
  endProposed.setHours(endProposed.getHours() + Number(newSession.timeRange));

  const endOfDay = new Date(startDay);
  endOfDay.setHours(23, 59, 59, 999);

  let finalEndTime = endProposed;
  let finalTimeRange = newSession.timeRange;

  if (endProposed > endOfDay) {
    finalEndTime = endOfDay;
    const diffMs = finalEndTime.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    finalTimeRange = Math.floor(diffHours * 2) / 2;
    if (finalTimeRange < 0.5) {
      finalTimeRange = 0.5;
      finalEndTime = new Date(start);
      finalEndTime.setHours(start.getHours() + 0.5);
    }
  }

  const formattedEnd = finalEndTime.toISOString().slice(0, 16);

  if (finalTimeRange !== newSession.timeRange || formattedEnd !== newSession.endTime) {
    setNewSession((prev) => ({
      ...prev,
      timeRange: finalTimeRange,
      endTime: formattedEnd,
    }));
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

    if (newSession.endTime) {
      const sessionDatePart = newSession.date;
      const endTimeDatePart = newSession.endTime.split("T")[0];
      if (sessionDatePart !== endTimeDatePart) {
        toast.error("Thời gian kết thúc không được phép sang ngày hôm sau!");
        return;
      }
    }

    if (!newSession.roomId) {
      toast.error("Vui lòng chọn phòng!");
      return;
    }

    // ✅ Format datetime đúng trước khi thêm vào sessions
    const formattedSession: Session = {
      ...newSession,
      startTime: newSession.startTime,
      endTime: newSession.endTime,    
      date: newSession.date,   
      speaker: [], 
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
    const session = sessions[index];

    const updatedList = sessions.filter((_, i) => i !== index);
    onSessionsChange(updatedList);

    if (onRemoveSession && session.sessionId) {
      onRemoveSession(session.sessionId);
    }

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
            Chưa có phiên họp nào. Bạn có thể bỏ qua hoặc thêm phiên họp mới bên dưới.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {sessions.map((s, idx) => {
              const room = roomsData?.data.find((r) => r.roomId === s.roomId);

              return (
                <div
                  key={idx}
                  className="relative bg-white border border-gray-300 rounded-xl p-4 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="font-semibold text-gray-900">{s.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {formatTimeDate(s.startTime)} – {formatTimeDate(s.endTime)}
                    </div>
                    {room && (
                      <div className="text-xs text-gray-500 mt-1">
                        Phòng: <span className="font-medium">{room.number}</span> – {room.displayName}
                      </div>
                    )}
                    {s.sessionMedias && s.sessionMedias.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-600">
                          {s.sessionMedias.length} file đính kèm
                        </div>
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
            sublabel="Tối đa đến 23h59 cùng ngày"
            type="number"
            min="0.5"
            step="0.5"
            value={newSession.timeRange}
            onChange={(val) => setNewSession({ ...newSession, timeRange: Number(val) })}
            required
          />
        </div>

        {/* Preview time */}
        {newSession.startTime && newSession.endTime && (
          <div className="bg-blue-50 p-3 rounded space-y-1">
            <div className="text-sm text-gray-700">
              <span className="font-medium">Ngày:</span> {formatDate(newSession.date)}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">Thời gian:</span>{" "}
              {formatTimeDate(newSession.startTime).split(" ")[0]} –{" "}
              {formatTimeDate(newSession.endTime).split(" ")[0]}
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

        <div className="border-t pt-3">
          <h5 className="font-medium mb-2">
            Hình ảnh phiên họp 
            { (newSession.sessionMedias?.length ?? 0) > 0 && (
              <span className="text-sm text-gray-600 ml-2">
                ({newSession.sessionMedias?.length} file đã chọn)
              </span>
            ) }
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