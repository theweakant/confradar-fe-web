// src/app/.../Tab/PaperAssignmentTab.tsx
"use client";

import { useState } from "react";
import RoomCalendar from "@/components/molecules/Calendar/Room/RoomCalendar"; 
import { Session } from "@/types/conference.type";
import { useAssignPresenterToSessionMutation } from "@/redux/services/paper.service"; 
import { toast } from "sonner"; 

interface PaperAssignmentTabProps {
  conferenceId: string;
}

export const PaperAssignmentTab: React.FC<PaperAssignmentTabProps> = ({ conferenceId }) => {
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [assignPresenter, { isLoading: isAssigning }] = useAssignPresenterToSessionMutation();

  // Xử lý sau khi session được tạo
const handleSessionCreated = async (session: Session) => {
  if (!session.sessionId) {
    console.error("Session created but missing sessionId");
    toast.error("Không thể gán bài báo: session không hợp lệ.");
    return;
  }

  if (!selectedPaperId) {
    toast.info("Session đã được tạo, nhưng chưa gán bài báo.");
    return;
  }

  try {
    await assignPresenter({
      paperId: selectedPaperId,
      sessionId: session.sessionId, 
    }).unwrap();

    toast.success("Đã gán bài báo vào session thành công!");
    setSelectedPaperId(null);
  } catch (err) {
    console.error("Gán bài báo thất bại:", err);
    toast.error("Không thể gán bài báo vào session. Vui lòng thử lại.");
  }
};

  return (
    <div className="p-2">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Xếp bài báo vào phiên họp</h2>
      <p className="text-sm text-gray-600 mb-6">
        Chọn một bài báo từ danh sách bên phải, sau đó click vào khung giờ trống để tạo và gán vào session.
      </p>

      <RoomCalendar
        conferenceId={conferenceId}
        onShowPaper={true}
        onPaperSelected={setSelectedPaperId}
        onSessionCreated={handleSessionCreated}
        startDate={new Date().toISOString().split("T")[0]}
      />
    </div>
  );
};

// // src/app/.../Tab/PaperAssignmentTab.tsx (cập nhật)
// "use client";

// import { useState } from "react";
// import RoomCalendar from "@/components/molecules/Calendar/Room/RoomCalendar";
// import AssignToSessionModal from "@/components/molecules/Calendar/Room/Session/AssignToSessionModal";
// import { useAssignPresenterToSessionMutation } from "@/redux/services/paper.service";
// import { toast } from "sonner";

// interface PaperAssignmentTabProps {
//   conferenceId: string;
// }

// export const PaperAssignmentTab: React.FC<PaperAssignmentTabProps> = ({ conferenceId }) => {
//   const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
//   const [assignPresenter] = useAssignPresenterToSessionMutation();

//   // ✅ Xử lý gán bài báo vào session có sẵn
//   const handleAssignToSession = async (sessionId: string) => {
//     if (!selectedPaperId) return;

//     try {
//       await assignPresenter({
//         paperId: selectedPaperId,
//         sessionId,
//       }).unwrap();

//       toast.success("Đã gán bài báo vào phiên họp!");
//       setSelectedPaperId(null); // Đóng modal & reset
//     } catch (err) {
//       console.error("Gán bài báo thất bại:", err);
//       toast.error("Không thể gán bài báo. Vui lòng thử lại.");
//     }
//   };

//   return (
//     <div className="p-2">
//       <h2 className="text-xl font-semibold text-gray-100 mb-4">Gán bài báo vào phiên họp</h2>
//       <p className="text-sm text-gray-400 mb-6">
//         Chọn “Gán vào phiên” trên bài báo chưa được gán, sau đó chọn phiên họp mục tiêu.
//       </p>

//       {/* Modal gán bài báo */}
//       <AssignToSessionModal
//         open={!!selectedPaperId}
//         paperId={selectedPaperId!}
//         conferenceId={conferenceId}
//         onClose={() => setSelectedPaperId(null)}
//         onSessionSelect={handleAssignToSession}
//       />

//       {/* Calendar chỉ để xem (không tạo session) */}
//       <RoomCalendar
//         conferenceId={conferenceId}
//         onShowPaper={true}
//         onPaperSelected={setSelectedPaperId} 
//         startDate={new Date().toISOString().split("T")[0]}
//       />
//     </div>
//   );
// };