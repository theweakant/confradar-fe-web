// components/Session/LocalSessionList.tsx
import React from "react";
import { Users } from "lucide-react";
import { LocalSessionCard } from "./LocalSessionCard";
import type { Session } from "@/types/conference.type";

interface LocalSessionListProps {
  sessions: Session[];
  title?: string; 
  editable?: boolean;
  onEdit?: (session: Session, index: number) => void;
  onDelete?: (session: Session, index: number) => void;
  onChangeDate?: (session: Session, index: number) => void;
  onChangeRoom?: (session: Session, index: number) => void;
  renderActions?: (session: Session, index: number) => React.ReactNode;
}

export const LocalSessionList: React.FC<LocalSessionListProps> = ({
  sessions,
  title = "Phiên họp của bạn",
  editable = false,
  onEdit,
  onDelete,
  onChangeDate,  
  onChangeRoom,  
  renderActions,
}) => {
  if (sessions.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-orange-600" />
        <span className="text-sm font-semibold text-gray-700">
          {title} ({sessions.length})
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sessions.map((session, index) => (
          <LocalSessionCard
            key={session.sessionId || index} 
            session={session}
            isEditable={editable}
            onEdit={onEdit ? () => onEdit(session, index) : undefined}
            onDelete={onDelete ? () => onDelete(session, index) : undefined}
            onChangeDate={onChangeDate ? () => onChangeDate(session, index) : undefined} 
            onChangeRoom={onChangeRoom ? () => onChangeRoom(session, index) : undefined}  
            editableActions={renderActions ? renderActions(session, index) : null}
          />
        ))}
      </div>
    </div>
  );
};