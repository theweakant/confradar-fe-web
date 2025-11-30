"use client";

import { useState, useMemo } from "react";
import {
    Search,
    Filter,
    Calendar,
    MapPin,
    FileText,
    AlertCircle,
    X,
    Award,
    ArrowLeft,
    Users,
    Clock,
    DollarSign,
    ExternalLink,
    SortAsc,
    Eye,
    CheckCircle,
    XCircle,
    Timer,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    useListAssignedPapersQuery,
} from "@/redux/services/paper.service";
import { ResearchConferenceDetailResponse } from "@/types/conference.type";
import { AssignedPaper, AssignedPaperGroup } from "@/types/paper.type";
import { steps } from "@/helper/paper";
import { useGetResearchConferenceDetailQuery } from "@/redux/services/conference.service";
import TimelineDialog from "@/components/molecules/TimelineDialog";

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

interface ConferenceHeaderProps {
    conference: ResearchConferenceDetailResponse;
}

const ConferenceHeader = ({ conference }: ConferenceHeaderProps) => {
    const [isTimelineOpen, setIsTimelineOpen] = useState(false);

    const currentPhase = conference.researchPhase?.[0] || null;
    const revisionDeadlines = currentPhase?.revisionRoundDeadlines || [];

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            {/* Banner */}
            <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 relative overflow-hidden">
                {conference.bannerImageUrl ? (
                    <img
                        src={conference.bannerImageUrl}
                        alt={conference.conferenceName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-20 h-20 text-white/30" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {conference.conferenceName}
                            </h1>
                            {conference.description && (
                                <p className="text-white/90 text-sm line-clamp-2">
                                    {conference.description}
                                </p>
                            )}
                        </div>
                        {conference.rankValue && (
                            <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                                <Award className="w-5 h-5 text-yellow-600" />
                                <span className="font-bold text-gray-900">
                                    {conference.rankValue}
                                </span>
                                {conference.rankYear && (
                                    <span className="text-sm text-gray-600">({conference.rankYear})</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Info Grid */}
            <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Date */}
                    {conference.startDate && (
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-50 p-2 rounded-lg">
                                <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Thời gian</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {new Date(conference.startDate).toLocaleDateString("vi-VN")}
                                </p>
                                {conference.endDate && (
                                    <p className="text-sm text-gray-600">
                                        đến {new Date(conference.endDate).toLocaleDateString("vi-VN")}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Location */}
                    {conference.address && (
                        <div className="flex items-start gap-3">
                            <div className="bg-red-50 p-2 rounded-lg">
                                <MapPin className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Địa điểm</p>
                                <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                                    {conference.address}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Slots */}
                    {conference.totalSlot !== undefined && (
                        <div className="flex items-start gap-3">
                            <div className="bg-purple-50 p-2 rounded-lg">
                                <Users className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Chỗ tham dự</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {conference.availableSlot || 0} / {conference.totalSlot}
                                </p>
                                <p className="text-xs text-gray-600">còn trống</p>
                            </div>
                        </div>
                    )}

                    {/* Review Fee */}
                    {conference.reviewFee !== undefined && (
                        <div className="flex items-start gap-3">
                            <div className="bg-green-50 p-2 rounded-lg">
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Phí đánh giá</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {conference.reviewFee.toLocaleString("vi-VN")} VNĐ
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Additional Info */}
                <div className="mt-4 pt-4 border-t grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {conference.numberPaperAccept !== undefined && (
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Số bài báo cho phép nộp tối đa</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {conference.numberPaperAccept}
                            </p>
                        </div>
                    )}
                    {conference.revisionAttemptAllowed !== undefined && (
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Số vòng chỉnh sửa tối đa</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {conference.revisionAttemptAllowed}
                            </p>
                        </div>
                    )}
                    {conference.allowListener !== undefined && (
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Cho phép thính giả tham dự?</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {conference.allowListener ? "Có" : "Không"}
                            </p>
                        </div>
                    )}
                    {conference.rankingCategoryName !== undefined && (
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Loại xếp hạng</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {conference.rankingCategoryName}
                            </p>
                        </div>
                    )}
                    {conference.rankingDescription !== undefined && (
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Mô tả về xếp hạng</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {conference.rankingDescription}
                            </p>
                        </div>
                    )}
                    {conference.paperFormat !== undefined && (
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Định dạng bài báo chấp nhận</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {conference.paperFormat}
                            </p>
                        </div>
                    )}
                    {conference.conferenceId && (
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Mã Hội nghị</p>
                            <p className="text-xs font-mono font-semibold text-gray-900 truncate">
                                {conference.conferenceId}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 flex justify-end">
                <button
                    onClick={() => setIsTimelineOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Calendar className="w-4 h-4" />
                    Xem Timeline
                </button>
            </div>

            {/* Timeline Dialog */}
            <TimelineDialog
                isOpen={isTimelineOpen}
                onClose={() => setIsTimelineOpen(false)}
                phaseData={currentPhase}
                revisionDeadlines={revisionDeadlines}
                // variant="submitted"
                theme="light"
            />
        </div>
    );
};

interface PaperTableProps {
    papers: AssignedPaper[];
    onView: (paper: AssignedPaper) => void;
}

const PaperTable = ({ papers, onView }: PaperTableProps) => {
    const getPaperStatus = (paper: AssignedPaper) => {
        if (paper.cameraReadyId) return { label: "Camera Ready", color: "green" };
        if (paper.revisionPaperId) return { label: "Revision", color: "orange" };
        if (paper.fullPaperId) return { label: "Under Review", color: "yellow" };
        return { label: "Abstract Only", color: "gray" };
    };

    const getPhaseInfo = (paper: AssignedPaper) => {
        const currentStageIndex = steps
            .map((s, idx) => (paper[s.key as keyof AssignedPaper] ? idx : null))
            .filter((id) => id !== null)
            .pop();

        if (currentStageIndex !== undefined && currentStageIndex !== null) {
            return steps[currentStageIndex];
        }
        return null;
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Tiêu đề
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Giai đoạn
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Trạng thái
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Ngày tạo
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Thao tác
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {papers.map((paper) => {
                        const status = getPaperStatus(paper);
                        const phase = getPhaseInfo(paper);
                        return (
                            <tr
                                key={paper.paperId}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-4 py-4">
                                    <div className="flex items-start gap-2">
                                        <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-900 line-clamp-2">
                                                {paper.title || "Không có tiêu đề"}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                ID: {paper.paperId}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    {phase ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                            {phase.label}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-4 py-4">
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                    ${status.color === "green"
                                                ? "bg-green-50 text-green-700"
                                                : status.color === "orange"
                                                    ? "bg-orange-50 text-orange-700"
                                                    : status.color === "yellow"
                                                        ? "bg-yellow-50 text-yellow-700"
                                                        : "bg-gray-50 text-gray-700"
                                            }`}
                                    >
                                        {status.color === "green" && (
                                            <CheckCircle className="w-3 h-3" />
                                        )}
                                        {status.color === "orange" && <Timer className="w-3 h-3" />}
                                        {status.label}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <p className="text-sm text-gray-600">
                                        {new Date(paper.createdAt).toLocaleDateString("vi-VN")}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(paper.createdAt).toLocaleTimeString("vi-VN")}
                                    </p>
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <button
                                        onClick={() => onView(paper)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Xem
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};


const LoadingState = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
        </div>
    );
};

interface ErrorStateProps {
    onRetry: () => void;
}

const ErrorState = ({ onRetry }: ErrorStateProps) => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Có lỗi xảy ra khi tải dữ liệu</p>
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Tải lại
                </button>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface ConferenceDetailPageProps {
    conferenceId: string;
}

export default function ConferenceDetailPage({
    conferenceId,
}: ConferenceDetailPageProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const reviewerType = searchParams.get("type") || "local";

    // State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPhase, setSelectedPhase] = useState<string>("");
    const [sortOption, setSortOption] = useState<
        "date-asc" | "date-desc" | "name-asc" | "name-desc"
    >("date-desc");

    // API Calls
    const {
        data: conferenceData,
        isLoading: conferenceLoading,
        error: conferenceError,
        refetch: refetchConference,
    } = useGetResearchConferenceDetailQuery(conferenceId);

    const {
        data: papersData,
        isLoading: papersLoading,
        error: papersError,
        refetch: refetchPapers,
    } = useListAssignedPapersQuery({ confId: conferenceId });

    const conference = conferenceData?.data;
    const paperGroups: AssignedPaperGroup[] = papersData?.data || [];
    const papers: AssignedPaper[] =
        paperGroups.length > 0 ? paperGroups[0].assignedPapers : [];

    // Phase Statistics
    const phaseStats = useMemo(() => {
        return steps.map((stage, index) => {
            const count = papers.filter((p) => {
                const currentStageIndex = steps
                    .map((s, idx) => (p[s.key as keyof AssignedPaper] ? idx : null))
                    .filter((id) => id !== null)
                    .pop();
                return currentStageIndex === index;
            }).length;
            return { ...stage, count };
        });
    }, [papers]);

    // Filter and Sort Logic
    const filteredAndSortedPapers = useMemo(() => {
        let result = [...papers];

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter((paper) =>
                paper.title?.toLowerCase().includes(query)
            );
        }

        // Phase filter
        if (selectedPhase) {
            result = result.filter((paper) => {
                const currentStageIndex = steps
                    .map((s, idx) => (paper[s.key as keyof AssignedPaper] ? idx : null))
                    .filter((id) => id !== null)
                    .pop();
                const selectedStageIndex = steps.findIndex(
                    (s) => s.label === selectedPhase
                );
                return currentStageIndex === selectedStageIndex;
            });
        }

        // Sort
        switch (sortOption) {
            case "date-asc":
                result.sort(
                    (a, b) =>
                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );
                break;
            case "date-desc":
                result.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                break;
            case "name-asc":
                result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
                break;
            case "name-desc":
                result.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
                break;
        }

        return result;
    }, [papers, searchQuery, selectedPhase, sortOption]);

    // Handlers
    const handleViewPaper = (paper: AssignedPaper) => {
        router.push(`/workspace/reviewer/manage-paper/${paper.paperId}`);
    };

    const handleBack = () => {
        // router.push(`/workspace/reviewer/conferences?type=${reviewerType}`);
        router.back;
    };

    const handleRetry = () => {
        refetchConference();
        refetchPapers();
    };

    // Loading State
    if (conferenceLoading || papersLoading) {
        return <LoadingState />;
    }

    // Error State
    if (conferenceError || papersError || !conference) {
        return <ErrorState onRetry={handleRetry} />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Quay lại danh sách hội nghị</span>
                </button>

                {/* Conference Header */}
                <div className="mb-6">
                    <ConferenceHeader conference={conference} />
                </div>

                {/* Phase Statistics */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Thống kê theo giai đoạn
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {phaseStats.map((stage, index) => (
                            <div
                                key={index}
                                className={`rounded-lg border-l-4 p-4 ${index === 0
                                    ? "border-gray-400 bg-gray-50"
                                    : index === 1
                                        ? "border-yellow-500 bg-yellow-50"
                                        : index === 2
                                            ? "border-orange-500 bg-orange-50"
                                            : "border-green-600 bg-green-50"
                                    }`}
                            >
                                <p className="text-sm text-gray-600 mb-1">{stage.label}</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stage.count}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Papers Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    {/* Controls */}
                    <div className="p-4 border-b space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Danh sách bài báo ({papers.length})
                            </h2>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo tiêu đề bài báo..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Phase Filter */}
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-400" />
                                <select
                                    value={selectedPhase}
                                    onChange={(e) => setSelectedPhase(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                                >
                                    <option value="">Tất cả giai đoạn</option>
                                    {steps.map((stage, index) => (
                                        <option key={index} value={stage.label}>
                                            {stage.label}
                                        </option>
                                    ))}
                                </select>
                                {selectedPhase && (
                                    <button
                                        onClick={() => setSelectedPhase("")}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Sort */}
                            <div className="flex items-center gap-2">
                                <SortAsc className="w-4 h-4 text-gray-400" />
                                <select
                                    value={sortOption}
                                    onChange={(e) =>
                                        setSortOption(e.target.value as "date-asc" | "date-desc" | "name-asc" | "name-desc")
                                    }
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                >
                                    <option value="date-desc">Mới nhất</option>
                                    <option value="date-asc">Cũ nhất</option>
                                    <option value="name-asc">Tên A-Z</option>
                                    <option value="name-desc">Tên Z-A</option>
                                </select>
                            </div>
                        </div>

                        {/* Filter Info */}
                        {(searchQuery || selectedPhase) && (
                            <div className="flex items-center justify-between pt-2 border-t">
                                <p className="text-sm text-gray-600">
                                    Hiển thị {filteredAndSortedPapers.length} / {papers.length}{" "}
                                    bài báo
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSelectedPhase("");
                                    }}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Papers Table */}
                    {filteredAndSortedPapers.length > 0 ? (
                        <PaperTable
                            papers={filteredAndSortedPapers}
                            onView={handleViewPaper}
                        />
                    ) : (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">
                                {searchQuery || selectedPhase
                                    ? "Không tìm thấy bài báo phù hợp với bộ lọc"
                                    : "Chưa có bài báo nào được giao"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}