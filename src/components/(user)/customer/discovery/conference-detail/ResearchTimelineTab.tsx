import React, { useState } from "react";
import { Calendar, FileText, Users, CheckCircle, Clock } from "lucide-react";
import { ResearchConferenceDetailResponse, ResearchConferencePhaseResponse } from "@/types/conference.type";

interface ResearchTimelineTabProps {
    conference: ResearchConferenceDetailResponse;
    formatDate: (dateString?: string) => string;
}

const ResearchTimelineTab: React.FC<ResearchTimelineTabProps> = ({
    conference,
    formatDate,
}) => {
    const researchPhases = [...(conference.researchPhase || [])]
        .sort((a, b) => (a.phaseOrder || 0) - (b.phaseOrder || 0));

    const [activePhaseIndex, setActivePhaseIndex] = useState(0);


    const renderPhaseSection = (
        title: string,
        icon: React.ReactNode,
        items: Array<{ label: string; startDate?: string; endDate?: string; note?: string }>,
        color: string
    ) => {
        const hasData = items.some(item => item.startDate && item.endDate);
        if (!hasData) return null;

        return (
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    {icon}
                    <h5 className="text-lg font-semibold text-gray-900">{title}</h5>
                </div>
                <div className="space-y-3 pl-7">
                    {items.map((item, idx) => {
                        if (!item.startDate || !item.endDate) return null;
                        return (
                            <div key={idx} className={`bg-gray-50 rounded-lg p-4 border-l-4 ${color}`}>
                                <p className="text-gray-900 font-medium mb-1">{item.label}</p>
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(item.startDate)} - {formatDate(item.endDate)}</span>
                                </div>
                                {item.note && (
                                    <p className="text-gray-500 text-xs mt-2 italic">{item.note}</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderPhaseContent = (phase: ResearchConferencePhaseResponse) => {
        return (
            <div className="space-y-8">
                <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                    <div className="mb-6 pb-3 border-b border-gray-200">
                        <h4 className="text-xl font-bold text-gray-900">
                            Giai đoạn {phase.phaseOrder || 1}
                        </h4>
                        <div className="flex gap-3 mt-2">
                            {phase.isActive && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Đang hoạt động
                                </span>
                            )}
                            {!phase.isActive && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                                    Không hoạt động
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Các sections giữ nguyên như cũ */}
                    {renderPhaseSection(
                        "Đăng ký & Nộp bản tóm tắt (Abstract)",
                        <Users className="w-5 h-5 text-blue-600" />,
                        [
                            {
                                label: "Thời gian đăng ký với tư cách tác giả",
                                startDate: phase.registrationStartDate,
                                endDate: phase.registrationEndDate,
                                note: "Khách hàng nộp bài báo (bản giới thiêu Abstract) trong khoảng thời gian này"
                            },
                            // {
                            //     label: "Thời gian quyết định trạng thái bản tóm tắt (Abstract)",
                            //     startDate: phase.abstractDecideStatusStart,
                            //     endDate: phase.abstractDecideStatusEnd,
                            //     note: "Ban tổ chức phải quyết định trạng thái và phân công reviewer trong khoảng này"
                            // }
                        ],
                        "border-blue-500"
                    )}

                    {/* Full Paper Section */}
                    {renderPhaseSection(
                        "Nộp bài báo bản đầy đủ (Full Paper)",
                        <FileText className="w-5 h-5 text-green-600" />,
                        [
                            {
                                label: "Thời gian nộp bài báo bản đầy đủ",
                                startDate: phase.fullPaperStartDate,
                                endDate: phase.fullPaperEndDate,
                                note: "Khách hàng phải nộp full paper trong khoảng thời gian này"
                            },
                            // {
                            //     label: "Thời gian đánh giá",
                            //     startDate: phase.reviewStartDate,
                            //     endDate: phase.reviewEndDate,
                            //     note: "Các reviewer phải nộp đánh giá trong khoảng này"
                            // },
                            // {
                            //     label: "Thời gian quyết định trạng thái bài báo đầy đủ",
                            //     startDate: phase.fullPaperDecideStatusStart,
                            //     endDate: phase.fullPaperDecideStatusEnd,
                            //     note: "Head Reviewer phải quyết định trạng thái trong khoảng này"
                            // }
                        ],
                        "border-green-500"
                    )}

                    {/* Revision Paper Section */}
                    {renderPhaseSection(
                        "Vòng Final Review (Các vòng chỉnh sửa bài bóa)",
                        <Clock className="w-5 h-5 text-orange-600" />,
                        [
                            {
                                label: "Thời gian chỉnh sửa",
                                startDate: phase.reviseStartDate,
                                endDate: phase.reviseEndDate,
                                note: "Khách hàng sẽ nộp các bản chỉnh sửa theo nhận xét từ Head Reviewer. Head Reviewer sẽ gửi phản hồi và yêu cầu chỉnh sửa qua từng vòng trong khoảng này."
                            },
                            // {
                            //     label: "Thời gian quyết định trạng thái bài báo chỉnh sửa",
                            //     startDate: phase.revisionPaperDecideStatusStart,
                            //     endDate: phase.revisionPaperDecideStatusEnd,
                            //     note: "Head Reviewer phải quyết định trạng thái trong khoảng này"
                            // }
                        ],
                        "border-orange-500"
                    )}

                    {/* Revision Rounds */}
                    {phase.revisionRoundDeadlines &&
                        phase.revisionRoundDeadlines.length > 0 && (
                            <div className="mb-6 pl-7">
                                <h5 className="text-gray-900 font-medium mb-3">
                                    Các vòng chỉnh sửa chi tiết:
                                </h5>

                                <div className="space-y-3">
                                    {Array.from(phase.revisionRoundDeadlines)
                                        .sort((a, b) => (a.roundNumber || 0) - (b.roundNumber || 0))
                                        .map((round, index) => (
                                            <div
                                                key={round.revisionRoundDeadlineId || index}
                                                className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500"
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-gray-900 font-semibold">
                                                        Vòng {round.roundNumber}
                                                    </span>
                                                    <span className="text-gray-600 text-sm italic">
                                                        Deadline: {formatDate(round.endSubmissionDate)}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                    <span>
                                                        {formatDate(round.startSubmissionDate)}
                                                    </span>
                                                    <span className="text-orange-600 font-semibold">→</span>
                                                    <span>
                                                        {formatDate(round.endSubmissionDate)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                    {/* Camera Ready Section */}
                    {renderPhaseSection(
                        "Bản cuối cùng (Camera Ready)",
                        <FileText className="w-5 h-5 text-purple-600" />,
                        [
                            {
                                label: "Thời gian nộp bản camera ready",
                                startDate: phase.cameraReadyStartDate,
                                endDate: phase.cameraReadyEndDate,
                                note: "Khách hàng phải nộp bản chính thức camera-ready trong khoảng thời gian này"
                            },
                            // {
                            //     label: "Thời gian quyết định trạng thái camera ready",
                            //     startDate: phase.cameraReadyDecideStatusStart,
                            //     endDate: phase.cameraReadyDecideStatusEnd,
                            //     note: "Head Reviewer phải quyết định trạng thái trong khoảng này"
                            // }
                        ],
                        "border-purple-500"
                    )}
                </div>
            </div>
        );
    };


    if (researchPhases.length === 0) {
        return (
            <div className="text-center text-gray-500 py-8">
                <p>Chưa có thông tin timeline</p>
            </div>
        );
    }

    // const renderPhaseContent = (phases: ResearchConferencePhaseResponse[]) => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Timeline nộp bài báo</h2>

            {/* Sub-tabs - Dynamic cho nhiều phases */}
            <div className="flex gap-2 mb-6 bg-gray-100 rounded-lg p-1">
                {researchPhases.map((phase, index) => (
                    <button
                        key={phase.researchConferencePhaseId}
                        onClick={() => setActivePhaseIndex(index)}
                        className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${activePhaseIndex === index
                            ? "bg-blue-500 text-white shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        Phase {phase.phaseOrder || index + 1}
                    </button>
                ))}
            </div>

            {/* Info banner cho phase đang xem */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                    <strong>Phase {researchPhases[activePhaseIndex].phaseOrder || activePhaseIndex + 1}:</strong> Đây là lịch trình để nộp bài báo và tham gia hội nghị.
                    Vui lòng tuân thủ các mốc thời gian để đảm bảo bài báo của bạn được xem xét.
                </p>
            </div>

            {/* Render content của phase đang active */}
            {renderPhaseContent(researchPhases[activePhaseIndex])}
        </div>
    );
};

export default ResearchTimelineTab;