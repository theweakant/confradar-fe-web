import React from "react";
import { ResearchConferenceDetailResponse } from "@/types/conference.type";
import {
  Calendar,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Users,
} from "lucide-react";

interface ResearchPaperInformationTabProps {
  conference: ResearchConferenceDetailResponse;
  formatDate: (dateString?: string) => string;
  formatTime: (timeString?: string) => string;
}

const ResearchPaperInformationTab: React.FC<ResearchPaperInformationTabProps> = ({
  conference,
  formatDate,
  formatTime
}) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Research Paper Information</h2>

      {/* Research Phase Section */}
      {conference.researchPhase && conference.researchPhase.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Research Conference Timeline</h3>
          <div className="space-y-6">
            {conference.researchPhase.map((phase, phaseIndex) => (
              <div key={phase.researchConferencePhaseId} className="bg-white/20 backdrop-blur-md rounded-lg p-6">
                <div className="mb-4 pb-2 border-b border-white/20">
                  <h4 className="text-lg font-semibold text-white">Phase {phaseIndex + 1}</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {phase.registrationStartDate && phase.registrationEndDate && (
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-white font-medium">Registration Period</p>
                        <p className="text-white/80 text-sm">
                          {formatDate(phase.registrationStartDate)} - {formatDate(phase.registrationEndDate)}
                        </p>
                      </div>
                    </div>
                  )}

                  {phase.fullPaperStartDate && phase.fullPaperEndDate && (
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-white font-medium">Full Paper Submission</p>
                        <p className="text-white/80 text-sm">
                          {formatDate(phase.fullPaperStartDate)} - {formatDate(phase.fullPaperEndDate)}
                        </p>
                      </div>
                    </div>
                  )}

                  {phase.reviewStartDate && phase.reviewEndDate && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-yellow-400" />
                      <div>
                        <p className="text-white font-medium">Review Period</p>
                        <p className="text-white/80 text-sm">
                          {formatDate(phase.reviewStartDate)} - {formatDate(phase.reviewEndDate)}
                        </p>
                      </div>
                    </div>
                  )}

                  {phase.reviseStartDate && phase.reviseEndDate && (
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-orange-400" />
                      <div>
                        <p className="text-white font-medium">Revision Period</p>
                        <p className="text-white/80 text-sm">
                          {formatDate(phase.reviseStartDate)} - {formatDate(phase.reviseEndDate)}
                        </p>
                      </div>
                    </div>
                  )}

                  {phase.cameraReadyStartDate && phase.cameraReadyEndDate && (
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-white font-medium">Camera Ready</p>
                        <p className="text-white/80 text-sm">
                          {formatDate(phase.cameraReadyStartDate)} - {formatDate(phase.cameraReadyEndDate)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Research Phase Info */}
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-white/70 text-sm">Phase ID:</span>
                      <p className="text-white font-medium">{phase.researchConferencePhaseId || 'Chưa có ID phase'}</p>
                    </div>
                    <div>
                      <span className="text-white/70 text-sm">Conference ID:</span>
                      <p className="text-white font-medium">{phase.conferenceId || 'Chưa có Conference ID'}</p>
                    </div>
                    <div>
                      <span className="text-white/70 text-sm">Trạng thái gian đoạn:</span>
                      <p className="text-white font-medium">
                        {phase.isWaitlist !== undefined
                          ? (phase.isWaitlist ? 'Dành cho người dùng trong danh sách chờ (có thể diễn ra hoặc không)' : 'Giai đoạn chính của hội nghị')
                          : 'Chưa xác định'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-white/70 text-sm">Active Status:</span>
                      <p className="text-white font-medium">
                        {phase.isActive !== undefined
                          ? (phase.isActive ? 'Đang hoạt động' : 'Không hoạt động')
                          : 'Chưa xác định'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Revision Round Deadlines */}
                {phase.revisionRoundDeadlines && phase.revisionRoundDeadlines.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-white font-medium mb-2">Revision Rounds</h4>
                    <div className="space-y-2">
                      {Array.from(phase.revisionRoundDeadlines)
                        .sort((a, b) => (a.roundNumber || 0) - (b.roundNumber || 0))
                        .map((round, index) => (
                          <div key={round.revisionRoundDeadlineId || index} className="bg-white/10 rounded p-2">
                            <div className="flex justify-between items-center">
                              <span className="text-white font-medium">Round {round.roundNumber}</span>
                              <span className="text-white/80 text-sm">{formatDate(round.endSubmissionDate)}</span>
                            </div>
                            {round.revisionRoundDeadlineId && (
                              <div className="text-white/60 text-xs mt-1">
                                ID: {round.revisionRoundDeadlineId}
                              </div>
                            )}
                            {round.researchConferencePhaseId && (
                              <div className="text-white/60 text-xs">
                                Phase ID: {round.researchConferencePhaseId}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* {conference.researchPhase && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Research Conference Timeline</h3>
          <div className="bg-white/20 backdrop-blur-md rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conference.researchPhase.registrationStartDate && conference.researchPhase.registrationEndDate && (
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">Registration Period</p>
                    <p className="text-white/80 text-sm">
                      {formatDate(conference.researchPhase.registrationStartDate)} - {formatDate(conference.researchPhase.registrationEndDate)}
                    </p>
                  </div>
                </div>
              )}

              {conference.researchPhase.fullPaperStartDate && conference.researchPhase.fullPaperEndDate && (
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-medium">Full Paper Submission</p>
                    <p className="text-white/80 text-sm">
                      {formatDate(conference.researchPhase.fullPaperStartDate)} - {formatDate(conference.researchPhase.fullPaperEndDate)}
                    </p>
                  </div>
                </div>
              )}

              {conference.researchPhase.reviewStartDate && conference.researchPhase.reviewEndDate && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-white font-medium">Review Period</p>
                    <p className="text-white/80 text-sm">
                      {formatDate(conference.researchPhase.reviewStartDate)} - {formatDate(conference.researchPhase.reviewEndDate)}
                    </p>
                  </div>
                </div>
              )}

              {conference.researchPhase.reviseStartDate && conference.researchPhase.reviseEndDate && (
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-white font-medium">Revision Period</p>
                    <p className="text-white/80 text-sm">
                      {formatDate(conference.researchPhase.reviseStartDate)} - {formatDate(conference.researchPhase.reviseEndDate)}
                    </p>
                  </div>
                </div>
              )}

              {conference.researchPhase.cameraReadyStartDate && conference.researchPhase.cameraReadyEndDate && (
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white font-medium">Camera Ready</p>
                    <p className="text-white/80 text-sm">
                      {formatDate(conference.researchPhase.cameraReadyStartDate)} - {formatDate(conference.researchPhase.cameraReadyEndDate)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-white/70 text-sm">Phase ID:</span>
            <p className="text-white font-medium">{conference.researchPhase.researchConferencePhaseId || 'Chưa có ID phase'}</p>
          </div>
          <div>
            <span className="text-white/70 text-sm">Conference ID:</span>
            <p className="text-white font-medium">{conference.researchPhase.conferenceId || 'Chưa có Conference ID'}</p>
          </div>
          <div>
            <span className="text-white/70 text-sm">Waitlist Status:</span>
            <p className="text-white font-medium">
              {conference.researchPhase.isWaitlist !== undefined
                ? (conference.researchPhase.isWaitlist ? 'Có danh sách chờ' : 'Không có danh sách chờ')
                : 'Chưa xác định'
              }
            </p>
          </div>
          <div>
            <span className="text-white/70 text-sm">Active Status:</span>
            <p className="text-white font-medium">
              {conference.researchPhase.isActive !== undefined
                ? (conference.researchPhase.isActive ? 'Đang hoạt động' : 'Không hoạt động')
                : 'Chưa xác định'
              }
            </p>
          </div>
        </div>
      </div>


      {conference.researchPhase.revisionRoundDeadlines && conference.researchPhase.revisionRoundDeadlines.length > 0 && (
        <div className="mt-4">
          <h4 className="text-white font-medium mb-2">Revision Rounds</h4>
          <div className="space-y-2">
            {Array.from(conference.researchPhase.revisionRoundDeadlines || [])
              .sort((a, b) => (a.roundNumber || 0) - (b.roundNumber || 0))
              .map((round, index) => (
                <div key={round.revisionRoundDeadlineId || index} className="bg-white/10 rounded p-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Round {round.roundNumber}</span>
                    <span className="text-white/80 text-sm">{formatDate(round.endSubmissionDate)}</span>
                  </div>
                  {round.revisionRoundDeadlineId && (
                    <div className="text-white/60 text-xs mt-1">
                      ID: {round.revisionRoundDeadlineId}
                    </div>
                  )}
                  {round.researchConferencePhaseId && (
                    <div className="text-white/60 text-xs">
                      Phase ID: {round.researchConferencePhaseId}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

      )}

    </div>
        </div >
      )} */}

      {/* Ranking Files Section */}
      {
        conference.rankingFileUrls && conference.rankingFileUrls.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Ranking Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {conference.rankingFileUrls.map((file, index) => (
                <div key={file.rankingFileUrlId} className="bg-white/20 backdrop-blur-md rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-white font-medium">Ranking Document {index + 1}</p>
                      {file.fileUrl && (
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 mt-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Document
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }

      {/* Material Downloads Section */}
      {
        conference.materialDownloads && conference.materialDownloads.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Material Downloads</h3>
            <div className="space-y-4">
              {conference.materialDownloads.map((material) => (
                <div key={material.materialDownloadId} className="bg-white/20 backdrop-blur-md rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Download className="w-6 h-6 text-green-400" />
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{material.fileName || 'Download Material'}</h4>
                      {material.fileDescription && (
                        <p className="text-white/80 text-sm mt-1">{material.fileDescription}</p>
                      )}
                      {material.fileUrl && (
                        <a
                          href={material.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1 mt-2"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                //   )}
                //  </div>
              ))}
            </div>
          </div>
        )
      }

      {/* Ranking Reference URLs Section */}
      {
        conference.rankingReferenceUrls && conference.rankingReferenceUrls.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Ranking References</h3>
            <div className="space-y-3">
              {conference.rankingReferenceUrls.map((reference, index) => (
                <div key={reference.referenceUrlId} className="bg-white/20 backdrop-blur-md rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-5 h-5 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-white font-medium">Reference {index + 1}</p>
                      {reference.referenceUrl && (
                        <a
                          href={reference.referenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm break-all"
                        >
                          {reference.referenceUrl}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }

      {/* Research Sessions Section */}
      {
        conference.researchSessions && conference.researchSessions.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Research Sessions</h3>
            <div className="space-y-4">
              {Array.from(conference.researchSessions)
                .sort((a, b) => {
                  const dateA = new Date(a.date || '').getTime();
                  const dateB = new Date(b.date || '').getTime();
                  if (dateA !== dateB) return dateA - dateB;

                  const timeA = new Date(a.startTime || '').getTime();
                  const timeB = new Date(b.startTime || '').getTime();
                  return timeA - timeB;
                })
                .map((session) => (
                  <div key={session.conferenceSessionId} className="bg-white/20 backdrop-blur-md rounded-xl p-6">
                    <h4 className="text-xl font-bold text-white mb-2">{session.title || 'Chưa có tiêu đề session'}</h4>
                    {session.description && (
                      <p className="text-white/80 text-sm mb-3">{session.description}</p>
                    )}

                    {/* Session Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-white/70 text-sm">Session ID:</span>
                        <p className="text-white font-medium">{session.conferenceSessionId}</p>
                      </div>
                      <div>
                        <span className="text-white/70 text-sm">Conference ID:</span>
                        <p className="text-white font-medium">{session.conferenceId || 'Chưa có Conference ID'}</p>
                      </div>
                      <div>
                        <span className="text-white/70 text-sm">Room ID:</span>
                        <p className="text-white font-medium">{session.roomId || 'Chưa có Room ID'}</p>
                      </div>
                      {session.room && (
                        <div>
                          <span className="text-white/70 text-sm">Room Info:</span>
                          <p className="text-white font-medium">
                            {session.room.displayName || session.room.number || 'Chưa có thông tin phòng'}
                            {session.room.destinationId && ` (Destination: ${session.room.destinationId})`}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-white/70 mb-3">
                      {session.date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(session.date)}
                        </div>
                      )}
                      {session.startTime && session.endTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(session.startTime)} - {formatTime(session.endTime)}
                        </div>
                      )}
                    </div>

                    {/* Session Media */}
                    {session.sessionMedia && session.sessionMedia.length > 0 && (
                      <div className="mt-3">
                        <p className="text-white font-medium mb-2">Session Media:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {session.sessionMedia.map((media, index) => (
                            <div key={media.conferenceSessionMediaId || index} className="bg-white/10 rounded p-2">
                              <div className="text-white/70 text-xs mb-1">
                                Media ID: {media.conferenceSessionMediaId || 'N/A'}
                              </div>
                              {media.conferenceSessionMediaUrl && (
                                <a
                                  href={media.conferenceSessionMediaUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  View Media {index + 1}
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )
      }

      {/* Empty State */}
      {
        (!conference.researchPhase &&
          (!conference.rankingFileUrls || conference.rankingFileUrls.length === 0) &&
          (!conference.materialDownloads || conference.materialDownloads.length === 0) &&
          (!conference.rankingReferenceUrls || conference.rankingReferenceUrls.length === 0) &&
          (!conference.researchSessions || conference.researchSessions.length === 0)) && (
          <div className="text-center text-white/70 py-8">
            <p>Chưa có thông tin về research paper</p>
          </div>
        )
      }

    </div >
  );
};

export default ResearchPaperInformationTab;
