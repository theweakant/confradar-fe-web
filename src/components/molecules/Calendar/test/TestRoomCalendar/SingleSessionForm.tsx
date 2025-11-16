// components/molecules/Calendar/SingleSessionForm.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { FormTextArea } from "@/components/molecules/FormTextArea";
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
  // Tách giờ và phút từ startTime ban đầu
  const initialStartTime = new Date(startTime).toTimeString().slice(0, 5); // "HH:MM"
  const initialEndTime = new Date(endTime).toTimeString().slice(0, 5);
  
  // Tính thời lượng ban đầu (giờ)
  const initialDuration = (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60);

  const [session, setSession] = useState<Session>(
    existingSession || {
      title: "",
      description: "",
      date,
      startTime,
      endTime,
      timeRange: initialDuration,
      roomId,
      speaker: [],
      sessionMedias: [],
    }
  );

  const [selectedStartTime, setSelectedStartTime] = useState(initialStartTime);
  const [duration, setDuration] = useState(initialDuration);
  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);

  // Tự động tính endTime khi startTime hoặc duration thay đổi
  useEffect(() => {
    if (selectedStartTime && duration > 0) {
      const [hours, minutes] = selectedStartTime.split(":").map(Number);
      const start = new Date(date);
      start.setHours(hours, minutes, 0, 0);
      
      const end = new Date(start);
      end.setHours(end.getHours() + Math.floor(duration));
      end.setMinutes(end.getMinutes() + (duration % 1) * 60);
      
      const formattedStart = start.toISOString().slice(0, 16); // "yyyy-MM-ddTHH:mm"
      const formattedEnd = end.toISOString().slice(0, 16);
      
      setSession((prev) => ({
        ...prev,
        startTime: formattedStart,
        endTime: formattedEnd,
        timeRange: duration,
      }));
    }
  }, [selectedStartTime, duration, date]);
  console.log("time: ", selectedStartTime, duration, date)

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

  // Speaker Modal
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

      <div className="text-sm text-gray-600 mb-4 bg-blue-50 p-3 rounded-lg">
        <div><strong>Phòng:</strong> {roomNumber} - {roomDisplayName}</div>
        <div><strong>Ngày:</strong> {new Date(date).toLocaleDateString("vi-VN")}</div>
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

      {/* Chọn giờ bắt đầu và thời lượng */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giờ bắt đầu <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={selectedStartTime}
            onChange={(e) => setSelectedStartTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thời lượng (giờ) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      {/* Hiển thị giờ kết thúc tự động tính */}
      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-700">
          <strong>Thời gian:</strong>{" "}
          {new Date(session.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} –{" "}
          {new Date(session.endTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
          {" "}({duration} giờ)
        </div>
      </div>

      {/* Diễn giả */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Diễn giả ({session.speaker.length}) <span className="text-red-500">*</span>
          </label>
          <Button size="sm" variant="outline" onClick={() => setIsSpeakerModalOpen(true)}>
            + Thêm diễn giả
          </Button>
        </div>

        {session.speaker.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {session.speaker.map((spk, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full text-sm border border-blue-200">
                <span className="font-medium">{spk.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSpeaker(idx)}
                  className="text-red-500 hover:text-red-700 font-bold"
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

// Mini Speaker Modal
function SpeakerModalForSingleForm({ onClose, onAdd }: { onClose: () => void; onAdd: (s: Speaker) => void }) {
  const [speaker, setSpeaker] = useState({ 
    name: "", 
    description: "", 
    image: null as File | string | null 
  });

  const handleAdd = () => {
    if (!speaker.name.trim()) {
      toast.error("Vui lòng nhập tên diễn giả!");
      return;
    }

    onAdd({ ...speaker, image: speaker.image || "" } as Speaker);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Thêm diễn giả</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
            ✕
          </button>
        </div>
        <div className="space-y-3">
          <FormInput
            label="Tên diễn giả"
            value={speaker.name}
            onChange={(val) => setSpeaker({ ...speaker, name: val })}
            required
          />
          <FormTextArea
            label="Mô tả"
            value={speaker.description}
            onChange={(val) => setSpeaker({ ...speaker, description: val })}
            rows={3}
          />
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button onClick={handleAdd} className="flex-1">
              Thêm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}