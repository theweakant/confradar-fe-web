import React from 'react';
import { ResearchConferenceDetailResponse } from '@/types/conference.type';
import { Calendar, Clock, Download, ExternalLink, FileText, Users } from 'lucide-react';

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
            {conference.researchPhase && (
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
                        
                        {/* Revision Round Deadlines */}
                        {conference.researchPhase.revisionRoundDeadlines && conference.researchPhase.revisionRoundDeadlines.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-white font-medium mb-2">Revision Rounds</h4>
                                <div className="space-y-2">
                                    {conference.researchPhase.revisionRoundDeadlines.map((round, index) => (
                                        <div key={round.revisionRoundDeadlineId || index} className="text-white/80 text-sm">
                                            Round {round.roundNumber}: {formatDate(round.endDate)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Ranking Files Section */}
            {conference.rankingFileUrls && conference.rankingFileUrls.length > 0 && (
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
            )}

            {/* Material Downloads Section */}
            {conference.materialDownloads && conference.materialDownloads.length > 0 && (
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
                        ))}
                    </div>
                </div>
            )}

            {/* Ranking Reference URLs Section */}
            {conference.rankingReferenceUrls && conference.rankingReferenceUrls.length > 0 && (
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
            )}

            {/* Research Sessions Section */}
            {conference.researchSessions && conference.researchSessions.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white mb-4">Research Sessions</h3>
                    <div className="space-y-4">
                        {conference.researchSessions.map((session) => (
                            <div key={session.conferenceSessionId} className="bg-white/20 backdrop-blur-md rounded-xl p-6">
                                <h4 className="text-xl font-bold text-white mb-2">{session.title}</h4>
                                {session.description && (
                                    <p className="text-white/80 text-sm mb-3">{session.description}</p>
                                )}
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
                                        <div className="flex flex-wrap gap-2">
                                            {session.sessionMedia.map((media, index) => (
                                                <a
                                                    key={media.mediaId || index}
                                                    href={media.mediaUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    Media {index + 1}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {(!conference.researchPhase && 
              (!conference.rankingFileUrls || conference.rankingFileUrls.length === 0) &&
              (!conference.materialDownloads || conference.materialDownloads.length === 0) &&
              (!conference.rankingReferenceUrls || conference.rankingReferenceUrls.length === 0) &&
              (!conference.researchSessions || conference.researchSessions.length === 0)) && (
                <div className="text-center text-white/70 py-8">
                    <p>Chưa có thông tin về research paper</p>
                </div>
            )}
        </div>
    );
};

export default ResearchPaperInformationTab;