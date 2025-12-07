import Image from "next/image";
import { MapPin, Clock, Calendar, MessageSquare } from "lucide-react";
import {
  TechnicalConferenceDetailResponse,
  ResearchConferenceDetailResponse,
  TechnicalConferenceSessionResponse,
  ResearchConferenceSessionResponse,
} from "@/types/conference.type";
import { useState } from "react";
import { useSubmitConferenceFeedbackMutation } from "@/redux/services/conference.service";
import { toast } from "sonner";
import SessionFeedbackDialog from "./SessionFeedbackDialog";
import { formatTimeDate } from "@/helper/format";

// Sessions Tab Component
interface SessionsTabProps {
  conference:
  | TechnicalConferenceDetailResponse
  | ResearchConferenceDetailResponse;
  formatDate: (dateString?: string) => string;
  formatTime: (timeString?: string) => string;
  formatDateTime: (dateTimeString?: string) => string;
  setSelectedImage: (image: string | null) => void;
}

const SessionsTab: React.FC<SessionsTabProps> = ({
  conference,
  formatDate,
  formatTime,
  formatDateTime,
  setSelectedImage
}) => {
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TechnicalConferenceSessionResponse | ResearchConferenceSessionResponse | null>(null);

  const [submitFeedback, { isLoading: isSubmittingFeedback }] =
    useSubmitConferenceFeedbackMutation();

  const isResearch = conference.isResearchConference === true;
  const sessions = isResearch
    ? (conference as ResearchConferenceDetailResponse).researchSessions || []
    : (conference as TechnicalConferenceDetailResponse).sessions || [];

  const isSessionEnded = (session: TechnicalConferenceSessionResponse | ResearchConferenceSessionResponse) => {
    const endTimeString = session.endTime || session.date;
    if (!endTimeString) return false;
    const endTime = new Date(endTimeString);
    return endTime <= new Date();
  };

  const handleOpenFeedbackDialog = (session: TechnicalConferenceSessionResponse | ResearchConferenceSessionResponse) => {
    setSelectedSession(session);
    setFeedbackDialogOpen(true);
  };

  const handleSubmitFeedback = async (rating: number, message: string) => {
    if (!selectedSession) return;

    try {
      await submitFeedback({
        conferenceSessionId: selectedSession.conferenceSessionId,
        rating,
        message,
      }).unwrap();

      toast.success("Đánh giá của bạn đã được gửi thành công!");
      setFeedbackDialogOpen(false);
    } catch (error: unknown) {
      toast.error("Không thể gửi đánh giá. Vui lòng thử lại!");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Lịch trình Sessions
      </h2>
      <div className="space-y-4">
        {sessions.length > 0 ? (
          [...sessions]
            .sort((a, b) => {
              const dateA = new Date(
                ("date" in a ? a.date : a.startTime) || "",
              ).getTime();
              const dateB = new Date(
                ("date" in b ? b.date : b.startTime) || "",
              ).getTime();
              if (dateA !== dateB) return dateA - dateB;

              const timeA = new Date(a.startTime || "").getTime();
              const timeB = new Date(b.startTime || "").getTime();
              return timeA - timeB;
            })
            .map((session, index) => {
              const sessionEnded = isSessionEnded(session);
              const feedbackCount = session.feedback?.length || 0;

              if (isResearch) {
                const s = session as ResearchConferenceSessionResponse;
                return (
                  <div
                    key={s.conferenceSessionId || index}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Session Banner */}
                      <div className="relative w-full md:w-48 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={
                            conference.bannerImageUrl ||
                            "/images/customer_route/confbannerbg2.jpg"
                          }
                          alt={s.title || "Session"}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Session Info */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2 text-gray-900">
                          {s.title || "Phiên họp chưa đặt tên"}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {s.description || "Chưa có mô tả cho phiên họp này"}
                        </p>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-700" />
                            <span className="text-sm text-gray-700">
                              {s.startTime && s.endTime
                                ? `${formatTimeDate(s.startTime)} - ${formatTimeDate(s.endTime)}`
                                : "Thời gian chưa xác định"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-700" />
                            <span className="text-sm text-gray-700">
                              {s.date
                                ? formatDate(s.date)
                                : "Ngày chưa xác định"}
                            </span>
                          </div>
                          {s.sessionMedia && s.sessionMedia.length > 0 && (
                            <div className="mt-3">
                              <p className="text-gray-900 font-medium mb-2">
                                Session Media:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {s.sessionMedia.map((media, idx) => (
                                  <a
                                    key={media.conferenceSessionMediaId || idx}
                                    href={media.conferenceSessionMediaUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 text-sm"
                                  >
                                    Media {idx + 1}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {s.sessionMedia && s.sessionMedia.length > 0 && (
                      <div className="mt-3">
                        <p className="text-gray-900 font-medium mb-2">Session Media:</p>
                        <div className="flex flex-wrap gap-2">
                          {s.sessionMedia.map((media) => {
                            const isImage = /\.(png|jpe?g|gif|webp)$/i.test(media.conferenceSessionMediaUrl || "");
                            const isVideo = /\.(mp4|webm|ogg)$/i.test(media.conferenceSessionMediaUrl || "");

                            return (
                              <div
                                key={media.conferenceSessionMediaId}
                                className="w-24 h-24 cursor-pointer rounded-lg overflow-hidden border border-gray-300"
                                onClick={() => setSelectedImage(media.conferenceSessionMediaUrl || "")}
                              >
                                {isImage && (
                                  <img
                                    src={media.conferenceSessionMediaUrl}
                                    alt="Media"
                                    className="w-full h-full object-cover"
                                  />
                                )}
                                {isVideo && (
                                  <video
                                    src={media.conferenceSessionMediaUrl}
                                    className="w-full h-full object-cover"
                                    muted
                                    loop
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleOpenFeedbackDialog(session)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span>
                          {sessionEnded ? "Xem & Thêm đánh giá" : "Xem đánh giá"}
                          {feedbackCount > 0 && ` (${feedbackCount})`}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              }
              else {
                const s = session as TechnicalConferenceSessionResponse;
                return (
                  <div
                    key={s.conferenceSessionId || index}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative w-full md:w-48 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={
                            // s.speakers?.[0]?.image ||
                            conference.bannerImageUrl ||
                            "/images/customer_route/confbannerbg2.jpg"
                          }
                          alt={s.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2 text-gray-900">{s.title}</h3>
                        {s.description && (
                          <p className="text-gray-600 text-sm mb-3">
                            {s.description}
                          </p>
                        )}

                        <div className="space-y-2 mb-3">
                          {s.startTime && s.endTime && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-700" />
                              <span className="text-sm text-gray-700">
                                {formatTimeDate(s.startTime)} -{" "}
                                {formatTimeDate(s.endTime)}
                              </span>
                            </div>
                          )}

                          {s.sessionDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-700" />
                              <span className="text-sm text-gray-700">
                                {formatDate(s.sessionDate)}
                              </span>
                            </div>
                          )}

                          {s.room && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-700" />
                              <span className="text-sm text-gray-700">
                                {s.room.displayName ||
                                  s.room.number ||
                                  "Phòng chưa xác định"}
                              </span>
                            </div>
                          )}

                          {s.speakers && s.speakers.length > 0 && (
                            <div>
                              <span className="font-medium text-gray-900">
                                Diễn giả:
                              </span>
                              <div className="mt-1 space-y-1">
                                {s.speakers.map((speaker) => (
                                  <div
                                    key={speaker.speakerId}
                                    className="flex items-center gap-2 ml-2"
                                  >
                                    {speaker.image && (
                                      <Image
                                        src={speaker.image}
                                        alt={speaker.name}
                                        width={28}
                                        height={28}
                                        className="rounded-full object-cover"
                                      />
                                    )}
                                    <div>
                                      <p className="text-sm text-gray-900">
                                        {speaker.name}
                                      </p>
                                      {speaker.description && (
                                        <p className="text-xs text-gray-600">
                                          {speaker.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {s.sessionMedia && s.sessionMedia.length > 0 && (
                            <div className="mt-3">
                              <p className="text-gray-900 font-medium mb-2">
                                Session Media:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {s.sessionMedia.map((media, idx) => (
                                  <a
                                    key={media.conferenceSessionMediaId || idx}
                                    href={media.conferenceSessionMediaUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 text-sm"
                                  >
                                    Media {idx + 1}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {s.sessionMedia && s.sessionMedia.length > 0 && (
                      <div className="mt-3">
                        <p className="text-gray-900 font-medium mb-2">Session Media:</p>
                        <div className="flex flex-wrap gap-2">
                          {s.sessionMedia.map((media) => {
                            const isImage = /\.(png|jpe?g|gif|webp)$/i.test(media.conferenceSessionMediaUrl || "");
                            const isVideo = /\.(mp4|webm|ogg)$/i.test(media.conferenceSessionMediaUrl || "");

                            return (
                              <div
                                key={media.conferenceSessionMediaId}
                                className="w-24 h-24 cursor-pointer rounded-lg overflow-hidden border border-gray-300"
                                onClick={() => setSelectedImage(media.conferenceSessionMediaUrl || "")}
                              >
                                {isImage && (
                                  <img
                                    src={media.conferenceSessionMediaUrl}
                                    alt="Media"
                                    className="w-full h-full object-cover"
                                  />
                                )}
                                {isVideo && (
                                  <video
                                    src={media.conferenceSessionMediaUrl}
                                    className="w-full h-full object-cover"
                                    muted
                                    loop
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleOpenFeedbackDialog(session)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span>
                          {sessionEnded ? "Xem & Thêm đánh giá" : "Xem đánh giá"}
                          {feedbackCount > 0 && ` (${feedbackCount})`}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              }
            })
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Chưa có thông tin về sessions</p>
          </div>
        )}
      </div>

      {selectedSession && (
        <SessionFeedbackDialog
          isOpen={feedbackDialogOpen}
          onClose={() => setFeedbackDialogOpen(false)}
          sessionTitle={selectedSession.title || "Session"}
          sessionId={selectedSession.conferenceSessionId}
          feedbacks={selectedSession.feedback || []}
          canSubmitFeedback={isSessionEnded(selectedSession)}
          onSubmitFeedback={handleSubmitFeedback}
          isSubmitting={isSubmittingFeedback}
        />
      )}
    </div>
  );
};

export default SessionsTab;

// import Image from "next/image";
// import { MapPin, Clock, Calendar, MessageSquare } from "lucide-react";
// import {
//   TechnicalConferenceDetailResponse,
//   ResearchConferenceDetailResponse,
//   TechnicalConferenceSessionResponse,
//   ResearchConferenceSessionResponse,
// } from "@/types/conference.type";
// import { useState } from "react";
// import { useSubmitConferenceFeedbackMutation } from "@/redux/services/conference.service";
// import { toast } from "sonner";
// import SessionFeedbackDialog from "./SessionFeedbackDialog";
// import { formatTimeDate } from "@/helper/format";

// // Sessions Tab Component
// interface SessionsTabProps {
//   conference:
//   | TechnicalConferenceDetailResponse
//   | ResearchConferenceDetailResponse;
//   formatDate: (dateString?: string) => string;
//   formatTime: (timeString?: string) => string;
//   formatDateTime: (dateTimeString?: string) => string;
//   setSelectedImage: (image: string | null) => void;
// }

// const SessionsTab: React.FC<SessionsTabProps> = ({
//   conference,
//   formatDate,
//   formatTime,
//   formatDateTime,
//   setSelectedImage
// }) => {
//   const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
//   const [selectedSession, setSelectedSession] = useState<TechnicalConferenceSessionResponse | ResearchConferenceSessionResponse | null>(null);

//   const [submitFeedback, { isLoading: isSubmittingFeedback }] =
//     useSubmitConferenceFeedbackMutation();

//   const isResearch = conference.isResearchConference === true;
//   const sessions = isResearch
//     ? (conference as ResearchConferenceDetailResponse).researchSessions || []
//     : (conference as TechnicalConferenceDetailResponse).sessions || [];

//   const isSessionEnded = (session: TechnicalConferenceSessionResponse | ResearchConferenceSessionResponse) => {
//     const endTimeString = session.endTime || session.date;
//     if (!endTimeString) return false;
//     const endTime = new Date(endTimeString);
//     return endTime <= new Date();
//   };

//   const handleOpenFeedbackDialog = (session: TechnicalConferenceSessionResponse | ResearchConferenceSessionResponse) => {
//     setSelectedSession(session);
//     setFeedbackDialogOpen(true);
//   };

//   const handleSubmitFeedback = async (rating: number, message: string) => {
//     if (!selectedSession) return;

//     try {
//       await submitFeedback({
//         conferenceSessionId: selectedSession.conferenceSessionId,
//         rating,
//         message,
//       }).unwrap();

//       toast.success("Đánh giá của bạn đã được gửi thành công!");
//       setFeedbackDialogOpen(false);
//     } catch (error: unknown) {
//       toast.error("Không thể gửi đánh giá. Vui lòng thử lại!");
//     }
//   };

//   return (
//     <div>
//       <h2 className="text-2xl font-bold text-white mb-6">
//         Lịch trình Sessions
//       </h2>
//       <div className="space-y-4">
//         {sessions.length > 0 ? (
//           [...sessions]
//             .sort((a, b) => {
//               const dateA = new Date(
//                 ("date" in a ? a.date : a.startTime) || "",
//               ).getTime();
//               const dateB = new Date(
//                 ("date" in b ? b.date : b.startTime) || "",
//               ).getTime();
//               if (dateA !== dateB) return dateA - dateB;

//               const timeA = new Date(a.startTime || "").getTime();
//               const timeB = new Date(b.startTime || "").getTime();
//               return timeA - timeB;
//             })
//             .map((session, index) => {
//               const sessionEnded = isSessionEnded(session);
//               const feedbackCount = session.feedback?.length || 0;

//               if (isResearch) {
//                 const s = session as ResearchConferenceSessionResponse;
//                 return (
//                   <div
//                     key={s.conferenceSessionId || index}
//                     className="bg-white/20 backdrop-blur-md rounded-xl p-6 hover:shadow-lg transition-shadow text-white"
//                   >
//                     <div className="flex flex-col md:flex-row gap-4">
//                       {/* Session Banner */}
//                       <div className="relative w-full md:w-48 aspect-video rounded-lg overflow-hidden flex-shrink-0">
//                         <Image
//                           src={
//                             conference.bannerImageUrl ||
//                             "/images/customer_route/confbannerbg2.jpg"
//                           }
//                           alt={s.title || "Session"}
//                           fill
//                           className="object-cover"
//                         />
//                       </div>

//                       {/* Session Info */}
//                       <div className="flex-1">
//                         <h3 className="text-xl font-bold mb-2">
//                           {s.title || "Phiên họp chưa đặt tên"}
//                         </h3>
//                         <p className="text-white/80 text-sm mb-3">
//                           {s.description || "Chưa có mô tả cho phiên họp này"}
//                         </p>

//                         <div className="space-y-2 mb-3">
//                           <div className="flex items-center gap-2">
//                             <Clock className="w-4 h-4 text-white" />
//                             <span className="text-sm text-white">
//                               {s.startTime && s.endTime
//                                 ? `${formatTimeDate(s.startTime)} - ${formatTimeDate(s.endTime)}`
//                                 : "Thời gian chưa xác định"}
//                             </span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Calendar className="w-4 h-4 text-white" />
//                             <span className="text-sm text-white">
//                               {s.date
//                                 ? formatDate(s.date)
//                                 : "Ngày chưa xác định"}
//                             </span>
//                           </div>
//                           {s.sessionMedia && s.sessionMedia.length > 0 && (
//                             <div className="mt-3">
//                               <p className="text-white font-medium mb-2">
//                                 Session Media:
//                               </p>
//                               <div className="flex flex-wrap gap-2">
//                                 {s.sessionMedia.map((media, idx) => (
//                                   <a
//                                     key={media.conferenceSessionMediaId || idx}
//                                     href={media.conferenceSessionMediaUrl}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="text-blue-400 hover:text-blue-300 text-sm"
//                                   >
//                                     Media {idx + 1}
//                                   </a>
//                                 ))}
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                     {s.sessionMedia && s.sessionMedia.length > 0 && (
//                       <div className="mt-3">
//                         <p className="text-white font-medium mb-2">Session Media:</p>
//                         <div className="flex flex-wrap gap-2">
//                           {s.sessionMedia.map((media) => {
//                             const isImage = /\.(png|jpe?g|gif|webp)$/i.test(media.conferenceSessionMediaUrl || "");
//                             const isVideo = /\.(mp4|webm|ogg)$/i.test(media.conferenceSessionMediaUrl || "");

//                             return (
//                               <div
//                                 key={media.conferenceSessionMediaId}
//                                 className="w-24 h-24 cursor-pointer rounded-lg overflow-hidden border border-white/20"
//                                 onClick={() => setSelectedImage(media.conferenceSessionMediaUrl || "")}
//                               >
//                                 {isImage && (
//                                   <img
//                                     src={media.conferenceSessionMediaUrl}
//                                     alt="Media"
//                                     className="w-full h-full object-cover"
//                                   />
//                                 )}
//                                 {isVideo && (
//                                   <video
//                                     src={media.conferenceSessionMediaUrl}
//                                     className="w-full h-full object-cover"
//                                     muted
//                                     loop
//                                   />
//                                 )}
//                               </div>
//                             );
//                           })}
//                         </div>
//                       </div>
//                     )}

//                     <div className="mt-4 pt-4 border-t border-white/20">
//                       <button
//                         onClick={() => handleOpenFeedbackDialog(session)}
//                         className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
//                       >
//                         <MessageSquare className="w-5 h-5" />
//                         <span>
//                           {sessionEnded ? "Xem & Thêm đánh giá" : "Xem đánh giá"}
//                           {feedbackCount > 0 && ` (${feedbackCount})`}
//                         </span>
//                       </button>
//                     </div>
//                   </div>
//                 );
//               }
//               else {
//                 const s = session as TechnicalConferenceSessionResponse;
//                 return (
//                   <div
//                     key={s.conferenceSessionId || index}
//                     className="bg-white/20 backdrop-blur-md rounded-xl p-6 hover:shadow-lg transition-shadow text-white"
//                   >
//                     <div className="flex flex-col md:flex-row gap-4">
//                       <div className="relative w-full md:w-48 aspect-video rounded-lg overflow-hidden flex-shrink-0">
//                         <Image
//                           src={
//                             // s.speakers?.[0]?.image ||
//                             conference.bannerImageUrl ||
//                             "/images/customer_route/confbannerbg2.jpg"
//                           }
//                           alt={s.title}
//                           fill
//                           className="object-cover"
//                         />
//                       </div>

//                       <div className="flex-1">
//                         <h3 className="text-xl font-bold mb-2">{s.title}</h3>
//                         {s.description && (
//                           <p className="text-white/80 text-sm mb-3">
//                             {s.description}
//                           </p>
//                         )}

//                         <div className="space-y-2 mb-3">
//                           {s.startTime && s.endTime && (
//                             <div className="flex items-center gap-2">
//                               <Clock className="w-4 h-4 text-white" />
//                               <span className="text-sm text-white">
//                                 {formatTimeDate(s.startTime)} -{" "}
//                                 {formatTimeDate(s.endTime)}
//                               </span>
//                             </div>
//                           )}

//                           {s.sessionDate && (
//                             <div className="flex items-center gap-2">
//                               <Calendar className="w-4 h-4 text-white" />
//                               <span className="text-sm text-white">
//                                 {formatDate(s.sessionDate)}
//                               </span>
//                             </div>
//                           )}

//                           {s.room && (
//                             <div className="flex items-center gap-2">
//                               <MapPin className="w-4 h-4 text-white" />
//                               <span className="text-sm text-white">
//                                 {s.room.displayName ||
//                                   s.room.number ||
//                                   "Phòng chưa xác định"}
//                               </span>
//                             </div>
//                           )}

//                           {s.speakers && s.speakers.length > 0 && (
//                             <div>
//                               <span className="font-medium text-white">
//                                 Diễn giả:
//                               </span>
//                               <div className="mt-1 space-y-1">
//                                 {s.speakers.map((speaker) => (
//                                   <div
//                                     key={speaker.speakerId}
//                                     className="flex items-center gap-2 ml-2"
//                                   >
//                                     {speaker.image && (
//                                       <Image
//                                         src={speaker.image}
//                                         alt={speaker.name}
//                                         width={28}
//                                         height={28}
//                                         className="rounded-full object-cover"
//                                       />
//                                     )}
//                                     <div>
//                                       <p className="text-sm text-white">
//                                         {speaker.name}
//                                       </p>
//                                       {speaker.description && (
//                                         <p className="text-xs text-white/70">
//                                           {speaker.description}
//                                         </p>
//                                       )}
//                                     </div>
//                                   </div>
//                                 ))}
//                               </div>
//                             </div>
//                           )}

//                           {s.sessionMedia && s.sessionMedia.length > 0 && (
//                             <div className="mt-3">
//                               <p className="text-white font-medium mb-2">
//                                 Session Media:
//                               </p>
//                               <div className="flex flex-wrap gap-2">
//                                 {s.sessionMedia.map((media, idx) => (
//                                   <a
//                                     key={media.conferenceSessionMediaId || idx}
//                                     href={media.conferenceSessionMediaUrl}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="text-blue-400 hover:text-blue-300 text-sm"
//                                   >
//                                     Media {idx + 1}
//                                   </a>
//                                 ))}
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     {s.sessionMedia && s.sessionMedia.length > 0 && (
//                       <div className="mt-3">
//                         <p className="text-white font-medium mb-2">Session Media:</p>
//                         <div className="flex flex-wrap gap-2">
//                           {s.sessionMedia.map((media) => {
//                             const isImage = /\.(png|jpe?g|gif|webp)$/i.test(media.conferenceSessionMediaUrl || "");
//                             const isVideo = /\.(mp4|webm|ogg)$/i.test(media.conferenceSessionMediaUrl || "");

//                             return (
//                               <div
//                                 key={media.conferenceSessionMediaId}
//                                 className="w-24 h-24 cursor-pointer rounded-lg overflow-hidden border border-white/20"
//                                 onClick={() => setSelectedImage(media.conferenceSessionMediaUrl || "")}
//                               >
//                                 {isImage && (
//                                   <img
//                                     src={media.conferenceSessionMediaUrl}
//                                     alt="Media"
//                                     className="w-full h-full object-cover"
//                                   />
//                                 )}
//                                 {isVideo && (
//                                   <video
//                                     src={media.conferenceSessionMediaUrl}
//                                     className="w-full h-full object-cover"
//                                     muted
//                                     loop
//                                   />
//                                 )}
//                               </div>
//                             );
//                           })}
//                         </div>
//                       </div>
//                     )}

//                     <div className="mt-4 pt-4 border-t border-white/20">
//                       <button
//                         onClick={() => handleOpenFeedbackDialog(session)}
//                         className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
//                       >
//                         <MessageSquare className="w-5 h-5" />
//                         <span>
//                           {sessionEnded ? "Xem & Thêm đánh giá" : "Xem đánh giá"}
//                           {feedbackCount > 0 && ` (${feedbackCount})`}
//                         </span>
//                       </button>
//                     </div>
//                   </div>
//                 );
//               }
//             })
//         ) : (
//           <div className="text-center text-white/70 py-8">
//             <p>Chưa có thông tin về sessions</p>
//           </div>
//         )}
//       </div>

//       {selectedSession && (
//         <SessionFeedbackDialog
//           isOpen={feedbackDialogOpen}
//           onClose={() => setFeedbackDialogOpen(false)}
//           sessionTitle={selectedSession.title || "Session"}
//           sessionId={selectedSession.conferenceSessionId}
//           feedbacks={selectedSession.feedback || []}
//           canSubmitFeedback={isSessionEnded(selectedSession)}
//           onSubmitFeedback={handleSubmitFeedback}
//           isSubmitting={isSubmittingFeedback}
//         />
//       )}
//     </div>
//   );
// };

// export default SessionsTab;

// //   return (
// //     <div>
// //       <h2 className="text-2xl font-bold text-white mb-6">Lịch trình Sessions</h2>
// //       <div className="space-y-4">
// //         {sessions.map((session) => {
// //           // Handle different session types
// //           const sessionKey = 'sessionId' in session ? session.sessionId : session.conferenceSessionId;
// //           const sessionDate = 'sessionDate' in session ? session.sessionDate : session.date;

// //           return (
// //             <div key={sessionKey} className="bg-white/20 backdrop-blur-md rounded-xl p-6 hover:shadow-lg transition-shadow text-white">
// //               <div className="flex flex-col md:flex-row gap-4">
// //                 <div className="relative w-full md:w-48 aspect-video rounded-lg overflow-hidden flex-shrink-0">
// //                   <Image
// //                     src={conference.bannerImageUrl || '/images/customer_route/confbannerbg2.jpg'}
// //                     alt={session.title || 'Session'}
// //                     fill
// //                     className="object-cover"
// //                   />
// //                 </div>
// //                 <div className="flex-1">
// //                   <h3 className="text-xl font-bold mb-2">{session.title}</h3>
// //                   {session.description && (
// //                     <p className="text-white/80 text-sm mb-3">{session.description}</p>
// //                   )}
// //                   <div className="space-y-2 mb-3">
// //                     {session.startTime && session.endTime && (
// //                       <div className="flex items-center gap-2">
// //                         <Clock className="w-4 h-4 text-white" />
// //                         <span className="text-sm text-white">
// //                           {formatTime(session.startTime)} - {formatTime(session.endTime)}
// //                         </span>
// //                       </div>
// //                     )}
// //                     {sessionDate && (
// //                       <div className="flex items-center gap-2">
// //                         <Calendar className="w-4 h-4 text-white" />
// //                         <span className="text-sm text-white">{formatDate(sessionDate)}</span>
// //                       </div>
// //                     )}
// //                     {'room' in session && session.room && (
// //                       <div className="flex items-center gap-2">
// //                         <MapPin className="w-4 h-4 text-white" />
// //                         <span className="text-sm text-white">
// //                           {session.room.displayName || session.room.number || 'Phòng chưa xác định'}
// //                         </span>
// //                       </div>
// //                     )}
// //                     {'speakers' in session && session.speakers && session.speakers.length > 0 && (
// //                       <div>
// //                         <span className="font-medium text-white">Diễn giả:</span>
// //                         {session.speakers.map((speaker, index) => (
// //                           <p key={speaker.speakerId} className="text-sm text-white ml-2">
// //                             {speaker.name}
// //                             {speaker.description && (
// //                               <span className="text-white/80 text-xs block">
// //                                 {speaker.description}
// //                               </span>
// //                             )}
// //                           </p>
// //                         ))}
// //                       </div>
// //                     )}
// //                     {'speaker' in session && session.speaker && (
// //                       <div>
// //                         <p className="text-sm text-white">
// //                           <span className="font-medium">Diễn giả:</span> {session.speaker.name}
// //                         </p>
// //                         {session.speaker.description && (
// //                           <p className="text-white/80 text-xs mt-1">
// //                             <span className="font-medium">Về diễn giả:</span> {session.speaker.description}
// //                           </p>
// //                         )}
// //                       </div>
// //                     )}
// //                   </div>

// //                   {/* Session Media for research sessions */}
// //                   {'sessionMedia' in session && session.sessionMedia && session.sessionMedia.length > 0 && (
// //                     <div className="mt-3">
// //                       <p className="text-white font-medium mb-2">Session Media:</p>
// //                       <div className="flex flex-wrap gap-2">
// //                         {session.sessionMedia.map((media, index) => (
// //                           <a
// //                             key={media.mediaId || index}
// //                             href={media.mediaUrl}
// //                             target="_blank"
// //                             rel="noopener noreferrer"
// //                             className="text-blue-400 hover:text-blue-300 text-sm"
// //                           >
// //                             Media {index + 1}
// //                           </a>
// //                         ))}
// //                       </div>
// //                     </div>
// //                   )}
// //                 </div>
// //               </div>
// //             </div>
// //           );
// //         })}
// //         {sessions.length === 0 && (
// //           <div className="text-center text-white/70 py-8">
// //             <p>Chưa có thông tin về sessions</p>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default SessionsTab;
