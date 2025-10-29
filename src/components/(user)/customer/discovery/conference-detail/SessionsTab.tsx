import Image from 'next/image';
import { X, MapPin, Clock, Calendar, Star } from 'lucide-react';
import { ConferenceResponse, TechnicalConferenceDetailResponse, ResearchConferenceDetailResponse, TechnicalConferenceSessionResponse, ResearchConferenceSessionResponse } from "@/types/conference.type";

// Sessions Tab Component
interface SessionsTabProps {
  conference: TechnicalConferenceDetailResponse | ResearchConferenceDetailResponse;
  formatDate: (dateString?: string) => string;
  formatTime: (timeString?: string) => string;
}

const SessionsTab: React.FC<SessionsTabProps> = ({
  conference,
  formatDate,
  formatTime
}) => {
  const isResearch = conference.isResearchConference === true;
  const sessions = isResearch 
    ? (conference as ResearchConferenceDetailResponse).researchSessions || []
    :  (conference as TechnicalConferenceDetailResponse).sessions || [];
    
      return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Lịch trình Sessions</h2>
      <div className="space-y-4">
        {sessions.length > 0 ? sessions.map((session, index) => {
          if (isResearch) {
            const s = session as ResearchConferenceSessionResponse;
              return (
                <div
                  key={s.conferenceSessionId || index}
                  className="bg-white/20 backdrop-blur-md rounded-xl p-6 hover:shadow-lg transition-shadow text-white"
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
                      <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                      {s.description && (
                        <p className="text-white/80 text-sm mb-3">
                          {s.description}
                        </p>
                      )}

                      <div className="space-y-2 mb-3">
                        {s.startTime && s.endTime && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-white" />
                            <span className="text-sm text-white">
                              {formatTime(s.startTime)} - {formatTime(s.endTime)}
                            </span>
                          </div>
                        )}
                        {s.date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-white" />
                            <span className="text-sm text-white">
                              {formatDate(s.date)}
                            </span>
                          </div>
                        )}
                        {s.sessionMedia && s.sessionMedia.length > 0 && (
                          <div className="mt-3">
                            <p className="text-white font-medium mb-2">
                              Session Media:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {s.sessionMedia.map((media, idx) => (
                                <a
                                  key={media.conferenceSessionMediaId || idx}
                                  href={media.conferenceSessionMediaUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 text-sm"
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
                </div>
              );
            }
          //   const s = session as ResearchConferenceSessionResponse;
          //   return (
          //     <div key={s.conferenceSessionId || index} className="bg-white/20 backdrop-blur-md rounded-xl p-6 hover:shadow-lg transition-shadow text-white">
          //       <div className="flex flex-col md:flex-row gap-4">
          //         <div className="relative w-full md:w-48 aspect-video rounded-lg overflow-hidden flex-shrink-0">
          //           <Image
          //             src={conference.bannerImageUrl || '/images/customer_route/confbannerbg2.jpg'}
          //             alt={s.title || 'Session'}
          //             fill
          //             className="object-cover"
          //           />
          //         </div>
          //         <div className="flex-1">
          //           <h3 className="text-xl font-bold mb-2">{s.title}</h3>
          //           {s.description && <p className="text-white/80 text-sm mb-3">{s.description}</p>}
                    
          //           <div className="space-y-2 mb-3">
          //             {s.startTime && s.endTime && (
          //               <div className="flex items-center gap-2">
          //                 <Clock className="w-4 h-4 text-white" />
          //                 <span className="text-sm text-white">{formatTime(s.startTime)} - {formatTime(s.endTime)}</span>
          //               </div>
          //             )}
          //             {s.date && (
          //               <div className="flex items-center gap-2">
          //                 <Calendar className="w-4 h-4 text-white" />
          //                 <span className="text-sm text-white">{formatDate(s.date)}</span>
          //               </div>
          //             )}
          //             {s.sessionMedia && s.sessionMedia.length > 0 && (
          //               <div className="mt-3">
          //                 <p className="text-white font-medium mb-2">Session Media:</p>
          //                 <div className="flex flex-wrap gap-2">
          //                   {s.sessionMedia.map((media, idx) => (
          //                     <a
          //                       key={media.conferenceSessionMediaId || idx}
          //                       href={media.conferenceSessionMediaUrl}
          //                       target="_blank"
          //                       rel="noopener noreferrer"
          //                       className="text-blue-400 hover:text-blue-300 text-sm"
          //                     >
          //                       Media {idx + 1}
          //                     </a>
          //                   ))}
          //                 </div>
          //               </div>
          //             )}
          //           </div>
          //         </div>
          //       </div>
          //     </div>
          //   );
          // } 
          else {
            const s = session as TechnicalConferenceSessionResponse;
              return (
                <div
                  key={s.conferenceSessionId || index}
                  className="bg-white/20 backdrop-blur-md rounded-xl p-6 hover:shadow-lg transition-shadow text-white"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative w-full md:w-48 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={
                          s.speakers?.[0]?.image ||
                          conference.bannerImageUrl ||
                          "/images/customer_route/confbannerbg2.jpg"
                        }
                        alt={s.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                      {s.description && (
                        <p className="text-white/80 text-sm mb-3">
                          {s.description}
                        </p>
                      )}

                      <div className="space-y-2 mb-3">
                        {s.startTime && s.endTime && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-white" />
                            <span className="text-sm text-white">
                              {formatTime(s.startTime)} - {formatTime(s.endTime)}
                            </span>
                          </div>
                        )}

                        {s.sessionDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-white" />
                            <span className="text-sm text-white">
                              {formatDate(s.sessionDate)}
                            </span>
                          </div>
                        )}

                        {s.room && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-white" />
                            <span className="text-sm text-white">
                              {s.room.displayName ||
                                s.room.number ||
                                "Phòng chưa xác định"}
                            </span>
                          </div>
                        )}

                        {s.speakers && s.speakers.length > 0 && (
                          <div>
                            <span className="font-medium text-white">
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
                                    <p className="text-sm text-white">
                                      {speaker.name}
                                    </p>
                                    {speaker.description && (
                                      <p className="text-xs text-white/70">
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
                            <p className="text-white font-medium mb-2">
                              Session Media:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {s.sessionMedia.map((media, idx) => (
                                <a
                                  key={media.conferenceSessionMediaId || idx}
                                  href={media.conferenceSessionMediaUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 text-sm"
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
                </div>
              );
            }
          }
        ) : (
          <div className="text-center text-white/70 py-8">
            <p>Chưa có thông tin về sessions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsTab;

//   return (
//     <div>
//       <h2 className="text-2xl font-bold text-white mb-6">Lịch trình Sessions</h2>
//       <div className="space-y-4">
//         {sessions.map((session) => {
//           // Handle different session types
//           const sessionKey = 'sessionId' in session ? session.sessionId : session.conferenceSessionId;
//           const sessionDate = 'sessionDate' in session ? session.sessionDate : session.date;
          
//           return (
//             <div key={sessionKey} className="bg-white/20 backdrop-blur-md rounded-xl p-6 hover:shadow-lg transition-shadow text-white">
//               <div className="flex flex-col md:flex-row gap-4">
//                 <div className="relative w-full md:w-48 aspect-video rounded-lg overflow-hidden flex-shrink-0">
//                   <Image
//                     src={conference.bannerImageUrl || '/images/customer_route/confbannerbg2.jpg'}
//                     alt={session.title || 'Session'}
//                     fill
//                     className="object-cover"
//                   />
//                 </div>
//                 <div className="flex-1">
//                   <h3 className="text-xl font-bold mb-2">{session.title}</h3>
//                   {session.description && (
//                     <p className="text-white/80 text-sm mb-3">{session.description}</p>
//                   )}
//                   <div className="space-y-2 mb-3">
//                     {session.startTime && session.endTime && (
//                       <div className="flex items-center gap-2">
//                         <Clock className="w-4 h-4 text-white" />
//                         <span className="text-sm text-white">
//                           {formatTime(session.startTime)} - {formatTime(session.endTime)}
//                         </span>
//                       </div>
//                     )}
//                     {sessionDate && (
//                       <div className="flex items-center gap-2">
//                         <Calendar className="w-4 h-4 text-white" />
//                         <span className="text-sm text-white">{formatDate(sessionDate)}</span>
//                       </div>
//                     )}
//                     {'room' in session && session.room && (
//                       <div className="flex items-center gap-2">
//                         <MapPin className="w-4 h-4 text-white" />
//                         <span className="text-sm text-white">
//                           {session.room.displayName || session.room.number || 'Phòng chưa xác định'}
//                         </span>
//                       </div>
//                     )}
//                     {'speakers' in session && session.speakers && session.speakers.length > 0 && (
//                       <div>
//                         <span className="font-medium text-white">Diễn giả:</span>
//                         {session.speakers.map((speaker, index) => (
//                           <p key={speaker.speakerId} className="text-sm text-white ml-2">
//                             {speaker.name}
//                             {speaker.description && (
//                               <span className="text-white/80 text-xs block">
//                                 {speaker.description}
//                               </span>
//                             )}
//                           </p>
//                         ))}
//                       </div>
//                     )}
//                     {'speaker' in session && session.speaker && (
//                       <div>
//                         <p className="text-sm text-white">
//                           <span className="font-medium">Diễn giả:</span> {session.speaker.name}
//                         </p>
//                         {session.speaker.description && (
//                           <p className="text-white/80 text-xs mt-1">
//                             <span className="font-medium">Về diễn giả:</span> {session.speaker.description}
//                           </p>
//                         )}
//                       </div>
//                     )}
//                   </div>
                  
//                   {/* Session Media for research sessions */}
//                   {'sessionMedia' in session && session.sessionMedia && session.sessionMedia.length > 0 && (
//                     <div className="mt-3">
//                       <p className="text-white font-medium mb-2">Session Media:</p>
//                       <div className="flex flex-wrap gap-2">
//                         {session.sessionMedia.map((media, index) => (
//                           <a
//                             key={media.mediaId || index}
//                             href={media.mediaUrl}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="text-blue-400 hover:text-blue-300 text-sm"
//                           >
//                             Media {index + 1}
//                           </a>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//         {sessions.length === 0 && (
//           <div className="text-center text-white/70 py-8">
//             <p>Chưa có thông tin về sessions</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SessionsTab;