// // components/Session/LocalSessionList.tsx
// import React from "react";
// import { Users } from "lucide-react";
// import { LocalSessionCard } from "./LocalSessionCard";
// import type { Session , ResearchSession} from "@/types/conference.type";

// interface LocalSessionListProps {
//   sessions: (Session | ResearchSession)[];
//   title?: string; 
//   editable?: boolean;
//   onEdit?: (session: Session | ResearchSession, index: number) => void;
//   onDelete?: (session: Session | ResearchSession, index: number) => void;
//   onChangeDate?: (session: Session | ResearchSession, index: number) => void;
//   onChangeRoom?: (session: Session | ResearchSession, index: number) => void;
//   renderActions?: (session: Session | ResearchSession, index: number) => React.ReactNode;
// }

// export const LocalSessionList: React.FC<LocalSessionListProps> = ({
//   sessions,
//   title = "Phiên họp của bạn",
//   editable = false,
//   onEdit,
//   onDelete,
//   onChangeDate,  
//   onChangeRoom,  
//   renderActions,
// }) => {
//   if (sessions.length === 0) return null;

//   return (
//     <div>
//       <div className="flex items-center gap-2 mb-3">
//         <Users className="w-4 h-4 text-orange-600" />
//         <span className="text-sm font-semibold text-gray-700">
//           {title} ({sessions.length})
//         </span>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//         {sessions.map((session, index) => (
//           <LocalSessionCard
//             key={`${session.sessionId}-${index}`} 
//             session={session}
//             isEditable={editable}
//             onEdit={onEdit ? () => onEdit(session, index) : undefined}
//             onDelete={onDelete ? () => onDelete(session, index) : undefined}
//             onChangeDate={onChangeDate ? () => onChangeDate(session, index) : undefined} 
//             onChangeRoom={onChangeRoom ? () => onChangeRoom(session, index) : undefined}  
//             editableActions={renderActions ? renderActions(session, index) : null}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// components/Session/Local/LocalSessionList.tsx
import React from "react";
import { AlertCircle } from "lucide-react";
import { LocalSessionCard } from "./LocalSessionCard"
import type { Session, ResearchSession } from "@/types/conference.type";

interface LocalSessionListProps {
  sessions: (Session | ResearchSession)[];
  title?: string;
  editable?: boolean;
  onEdit?: (session: Session | ResearchSession, index: number) => void;
  onDelete?: (session: Session | ResearchSession, index: number) => void;
  onChangeDate?: (session: Session | ResearchSession, index: number) => void;
  onChangeRoom?: (session: Session | ResearchSession, index: number) => void;
}

export const LocalSessionList: React.FC<LocalSessionListProps> = ({
  sessions,
  title = "Phiên họp",
  editable = false,
  onEdit,
  onDelete,
  onChangeDate,
  onChangeRoom,
}) => {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertCircle className="w-10 h-10 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">Chưa có phiên họp nào</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">
          {title} ({sessions.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sessions.map((session, index) => (
          <LocalSessionCard
            key={session.sessionId || `${session.title}-${index}`}
            session={session}
            isEditable={editable}
            onEdit={onEdit ? () => onEdit(session, index) : undefined}
            onDelete={onDelete ? () => onDelete(session, index) : undefined}
            onChangeDate={onChangeDate ? () => onChangeDate(session, index) : undefined}
            onChangeRoom={onChangeRoom ? () => onChangeRoom(session, index) : undefined}
          />
        ))}
      </div>
    </div>
  );
};