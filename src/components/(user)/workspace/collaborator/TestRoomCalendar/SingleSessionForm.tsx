// components/molecules/Calendar/SingleSessionForm.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import { FormSelect } from "@/components/molecules/FormSelect";
import { toast } from "sonner";
import type { Session, Speaker } from "@/types/conference.type";

interface SingleSessionFormProps {
  roomId: string;
  roomDisplayName: string;
  roomNumber: string;
  date: string;          // "yyyy-MM-dd"
  startTime: string;     // ISO string like "2025-11-20T14:00"
  endTime: string;       // ISO string like "2025-11-20T16:00"
  onSave: (session: Session) => void;
  onCancel: () => void;
  existingSession?: Session; // optional: hỗ trợ edit
}

export function SingleSessionForm({
  roomId,
  roomDisplayName,
  roomNumber,
  date,
  startTime,
  endTime,
  onSave,
  onCancel,
  existingSession,
}: SingleSessionFormProps) {
  const [session, setSession] = useState<Session>(
    existingSession || {
      title: "",
      description: "",
      date,
      startTime,
      endTime,
      timeRange: 1,
      roomId,
      speaker: [],
      sessionMedias: [],
    }
  );

  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);

  // Tính lại endTime nếu timeRange thay đổi (giống logic gốc)
  useEffect(() => {
    if (session.startTime && session.timeRange !== undefined && session.timeRange > 0) {
      const start = new Date(session.startTime);
      const end = new Date(start);
      end.setHours(end.getHours() + Number(session.timeRange));
      const formattedEnd = end.toISOString().slice(0, 16); // "yyyy-MM-ddTHH:mm"
      setSession((prev) => ({ ...prev, endTime: formattedEnd }));
    }
  }, [session.startTime, session.timeRange]);

  const handleAddSpeaker = (speaker: Speaker) => {
    setSession((prev) => ({
      ...prev,
      speaker: [...prev.speaker, speaker],
    }));
    toast.success("Đã thêm diễn giả!");
    setIsSpeakerModalOpen(false);
  };

  const handleRemoveSpeaker = (index: number) => {
    setSession((prev) => ({
      ...prev,
      speaker: prev.speaker.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    if (!session.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề phiên họp!");
      return;
    }
    if (session.speaker.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 diễn giả!");
      return;
    }

    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    if (end <= start) {
      toast.error("Thời gian kết thúc phải sau thời gian bắt đầu!");
      return;
    }

    onSave(session);
  };

  // Speaker Modal (rút gọn)
  if (isSpeakerModalOpen) {
    return (
      <SpeakerModalForSingleForm
        onClose={() => setIsSpeakerModalOpen(false)}
        onAdd={handleAddSpeaker}
      />
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow-md">
      <h3 className="text-lg font-semibold mb-4">
        Tạo phiên họp cho phòng: <span className="text-blue-600">{roomDisplayName}</span>
      </h3>

      <div className="text-sm text-gray-600 mb-4">
        <div>Ngày: {new Date(date).toLocaleDateString("vi-VN")}</div>
        <div>
          Thời gian: {new Date(startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} –{" "}
          {new Date(endTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      <FormInput
        label="Tiêu đề"
        value={session.title}
        onChange={(val) => setSession({ ...session, title: val })}
        required
      />

      <FormTextArea
        label="Mô tả"
        value={session.description || ""}
        onChange={(val) => setSession({ ...session, description: val })}
        rows={2}
      />

      {/* Thông tin phòng & thời gian — disabled */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phòng</label>
          <div className="px-3 py-2 bg-gray-100 rounded border text-gray-800">
            {roomNumber} - {roomDisplayName}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thời lượng (giờ)</label>
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={session.timeRange}
            onChange={(e) => setSession({ ...session, timeRange: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {/* Diễn giả */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Diễn giả ({session.speaker.length})</label>
          <Button size="sm" variant="outline" onClick={() => setIsSpeakerModalOpen(true)}>
            + Thêm
          </Button>
        </div>

        {session.speaker.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {session.speaker.map((spk, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-sm">
                {spk.name}
                <button
                  type="button"
                  onClick={() => handleRemoveSpeaker(idx)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Hủy
        </Button>
        <Button onClick={handleSubmit} className="flex-1">
          {existingSession ? "Cập nhật" : "Tạo phiên họp"}
        </Button>
      </div>
    </div>
  );
}

// Mini Speaker Modal — reuse logic but simplified
function SpeakerModalForSingleForm({ onClose, onAdd }: { onClose: () => void; onAdd: (s: Speaker) => void }) {
  const [speaker, setSpeaker] = useState({ name: "", description: "", image: null as File | string | null });

  const handleAdd = () => {
    if (!speaker.name.trim()) {
      toast.error("Vui lòng nhập tên diễn giả!");
      return;
    }    if (!speaker.image) {
      toast.error("Vui lòng chọn ảnh diễn giả!");
      return;
    }

    // Note: Bỏ qua validation ảnh để đơn giản — hoặc bạn có thể giữ nếu cần
    onAdd({ ...speaker, image: speaker.image || "" } as Speaker);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Thêm diễn giả</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <div className="space-y-3">
          <FormInput
            label="Tên"
            value={speaker.name}
            onChange={(val) => setSpeaker({ ...speaker, name: val })}
          />
          <FormTextArea
            label="Mô tả"
            value={speaker.description}
            onChange={(val) => setSpeaker({ ...speaker, description: val })}
            rows={2}
          />
          {/* Bỏ ImageUpload do bạn không dùng FileUpload */}
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={handleAdd}>Thêm</Button>
          </div>
        </div>
      </div>
    </div>
  );
}