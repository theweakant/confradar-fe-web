"use client"

import { useState } from "react";
import { RoomCalendar, type RoomCalendarProps } from "@/components/(user)/workspace/TestRoomCalendar/RoomCalendar";
import { SingleSessionForm } from "./SingleSessionForm";
import { Session } from "@/types/conference.type";

export default function TestRoomCalendar() {
  const [selectedRoomData, setSelectedRoomData] = useState<Parameters<NonNullable<RoomCalendarProps["onRoomSelect"]>>[0] | null>(null);

  const handleSaveSession = (session: Session) => {
    console.log("Session to save:", session);
    // Gửi API hoặc cập nhật state sessions...
    setSelectedRoomData(null);
  };

  return (
    <div>
      <RoomCalendar onRoomSelect={setSelectedRoomData} />

      {selectedRoomData && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center p-4 z-50">
          <SingleSessionForm
            {...selectedRoomData}
            onSave={handleSaveSession}
            onCancel={() => setSelectedRoomData(null)}
          />
        </div>
      )}
    </div>
  );
}