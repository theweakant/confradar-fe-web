// // src/components/molecules/Calendar/Room/AssignToSessionModal.tsx
// import React from "react";
// import { X } from "lucide-react";
// import {
//   Dialog,
//   DialogPanel,
//   DialogTitle,
//   Transition,
//   TransitionChild,
// } from "@headlessui/react";
// import { useGetAllSessionsOfConferenceQuery } from "@/redux/services/conference.service";
// import type { Session } from "@/types/conference.type";

// interface AssignToSessionModalProps {
//   open: boolean;
//   paperId: string;
//   conferenceId: string;
//   onClose: () => void;
//   onSessionSelect: (sessionId: string) => void;
// }

// const AssignToSessionModal: React.FC<AssignToSessionModalProps> = ({
//   open,
//   paperId,
//   conferenceId,
//   onClose,
//   onSessionSelect,
// }) => {
//   const { data, isLoading, error } = useGetAllSessionsOfConferenceQuery(
//     { conferenceId },
//     { skip: !open }
//   );

//   const sessions = data?.data || [];

//   const formatDateTime = (isoString: string) => {
//     const d = new Date(isoString);
//     return d.toLocaleString("vi-VN", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   return (
//     <Transition appear show={open} as={React.Fragment}>
//       <Dialog as="div" className="relative z-50" onClose={onClose}>
//         <TransitionChild
//           enter="ease-out duration-300"
//           enterFrom="opacity-0"
//           enterTo="opacity-100"
//           leave="ease-in duration-200"
//           leaveFrom="opacity-100"
//           leaveTo="opacity-0"
//         >
//           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
//         </TransitionChild>

//         <div className="fixed inset-0 overflow-y-auto">
//           <div className="flex min-h-full items-center justify-center p-4">
//             <TransitionChild
//               enter="ease-out duration-300"
//               enterFrom="opacity-0 scale-95"
//               enterTo="opacity-100 scale-100"
//               leave="ease-in duration-200"
//               leaveFrom="opacity-100 scale-100"
//               leaveTo="opacity-0 scale-95"
//             >
//               <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
//                 <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
//                   <DialogTitle className="text-lg font-semibold text-white">
//                     Chọn phiên họp để gán bài báo
//                   </DialogTitle>
//                   <button
//                     onClick={onClose}
//                     className="text-gray-300 hover:text-white"
//                   >
//                     <X className="w-5 h-5" />
//                   </button>
//                 </div>

//                 <div className="p-4 max-h-[60vh] overflow-y-auto">
//                   {isLoading ? (
//                     <div className="text-center py-6 text-gray-500">
//                       Đang tải danh sách phiên...
//                     </div>
//                   ) : error ? (
//                     <div className="text-center py-6 text-red-500">
//                       Lỗi khi tải phiên họp.
//                     </div>
//                   ) : sessions.length === 0 ? (
//                     <div className="text-center py-6 text-gray-500">
//                       Chưa có phiên họp nào.
//                     </div>
//                   ) : (
//                     <div className="space-y-3">
//                       {sessions.map((session: Session) => (
//                         <div
//                           key={session.sessionId}
//                           onClick={() => onSessionSelect(session.sessionId)}
//                           className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
//                         >
//                           <div className="font-medium text-gray-900">
//                             {session.title || "Không có tiêu đề"}
//                           </div>
//                           <div className="text-sm text-gray-600 mt-1">
//                             {session.roomDisplayName} • {formatDateTime(session.startTime)}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </DialogPanel>
//             </TransitionChild>
//           </div>
//         </div>
//       </Dialog>
//     </Transition>
//   );
// };

// export default AssignToSessionModal;