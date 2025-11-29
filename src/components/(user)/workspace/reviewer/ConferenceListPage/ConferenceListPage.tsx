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
    ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
    useGetConferencesHasAssignedPaperForLocalReviewerQuery,
    useGetConferencesHasAssignedPaperForExternalReviewerQuery,
} from "@/redux/services/conference.service";
import { ConferenceForReviewerView } from "@/types/conference.type";

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

interface ConferenceCardProps {
    conference: ConferenceForReviewerView;
    onClick: () => void;
}

const ConferenceCard = ({ conference, onClick }: ConferenceCardProps) => {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group border border-gray-200 hover:border-blue-400"
        >
            {/* Banner Image */}
            <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 relative overflow-hidden">
                {conference.bannerImageUrl ? (
                    <img
                        src={conference.bannerImageUrl}
                        alt={conference.conferenceName ?? 'Tên chưa xác định'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-16 h-16 text-white/30" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Rank Badge */}
                {conference.researchConferenceDetail?.rankValue && (
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                        <Award className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-semibold text-gray-900">
                            {conference.researchConferenceDetail?.rankValue}
                        </span>
                        {conference.researchConferenceDetail?.rankYear && (
                            <span className="text-xs text-gray-500">({conference.researchConferenceDetail?.rankYear})</span>
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {conference.conferenceName}
                </h3>

                <div className="space-y-2.5 mb-4">
                    {/* Date */}
                    {conference.startDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span>
                                {new Date(conference.startDate).toLocaleDateString("vi-VN")}
                                {conference.endDate && (
                                    <>
                                        {" - "}
                                        {new Date(conference.endDate).toLocaleDateString("vi-VN")}
                                    </>
                                )}
                            </span>
                        </div>
                    )}

                    {/* Location */}
                    {conference.address && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <span className="line-clamp-1">{conference.address}</span>
                        </div>
                    )}

                    {/* Papers Assigned */}
                    {/* <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="font-medium text-gray-900">
                            {conference.totalPapersAssigned || 0} bài báo được giao
                        </span>
                    </div> */}
                </div>

                {/* View Button */}
                <div className="flex items-center justify-end text-blue-600 font-medium text-sm group-hover:text-blue-700">
                    <span>Xem chi tiết</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </div>
    );
};

interface EmptyStateProps {
    message: string;
    showIcon?: boolean;
}

const EmptyState = ({ message, showIcon = true }: EmptyStateProps) => {
    return (
        <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
            {showIcon && <FileText className="w-16 h-16 text-gray-300 mb-4" />}
            <p className="text-gray-500 text-lg text-center">{message}</p>
        </div>
    );
};

const LoadingState = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải danh sách hội nghị...</p>
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

interface ConferenceListPageProps {
    reviewerType: "local" | "external";
}

export default function ConferenceListPage({
    reviewerType,
}: ConferenceListPageProps) {
    const router = useRouter();

    // State
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState<"date-asc" | "date-desc" | "name-asc" | "name-desc">("date-desc");
    const [filterRank, setFilterRank] = useState<string>("");

    // API Calls based on reviewer type
    const {
        data: localData,
        isLoading: localLoading,
        error: localError,
        refetch: refetchLocal,
    } = useGetConferencesHasAssignedPaperForLocalReviewerQuery(undefined, {
        skip: reviewerType !== "local",
    });

    const {
        data: externalData,
        isLoading: externalLoading,
        error: externalError,
        refetch: refetchExternal,
    } = useGetConferencesHasAssignedPaperForExternalReviewerQuery(undefined, {
        skip: reviewerType !== "external",
    });

    const conferences: ConferenceForReviewerView[] =
        reviewerType === "local"
            ? localData?.data || []
            : externalData?.data || [];
    const isLoading = reviewerType === "local" ? localLoading : externalLoading;
    const error = reviewerType === "local" ? localError : externalError;

    // Get unique ranks for filter
    const uniqueRanks = useMemo(() => {
        const ranks = new Set<string>();
        conferences.forEach((conf) => {
            if (conf.researchConferenceDetail?.rankValue) ranks.add(conf.researchConferenceDetail?.rankValue);
        });
        return Array.from(ranks).sort();
    }, [conferences]);

    // Filter and Sort Logic
    const filteredAndSortedConferences = useMemo(() => {
        let result = [...conferences];

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (conf) =>
                    conf.conferenceName?.toLowerCase().includes(query) ||
                    conf.address?.toLowerCase().includes(query)
            );
        }

        // Rank filter
        if (filterRank) {
            result = result.filter((conf) => conf.researchConferenceDetail?.rankValue === filterRank);
        }

        // Sort
        switch (sortOption) {
            case "date-asc":
                result.sort((a, b) => {
                    if (!a.startDate) return 1;
                    if (!b.startDate) return -1;
                    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
                });
                break;
            case "date-desc":
                result.sort((a, b) => {
                    if (!a.startDate) return 1;
                    if (!b.startDate) return -1;
                    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
                });
                break;
            case "name-asc":
                result.sort((a, b) =>
                    (a.conferenceName ?? "").localeCompare(b.conferenceName ?? "")
                );
                break;
            case "name-desc":
                result.sort((a, b) =>
                    (b.conferenceName ?? "").localeCompare(a.conferenceName ?? "")
                );
                break;
        }

        return result;
    }, [conferences, searchQuery, filterRank, sortOption]);

    // Statistics
    const stats = useMemo(() => {
        const totalConferences = conferences.length;
        // const totalPapers = conferences.reduce(
        //     (sum, conf) => sum + (conf.totalPapersAssigned || 0),
        //     0
        // );
        const upcomingConferences = conferences.filter(
            (conf) => conf.startDate && new Date(conf.startDate) > new Date()
        ).length;

        return { totalConferences, upcomingConferences }; //totalPapers
    }, [conferences]);

    // Handlers
    const handleConferenceClick = (conference: ConferenceForReviewerView) => {
        router.push(
            `/workspace/${reviewerType}-reviewer/manage-paper/conference-has-assigned-papers-detail/${conference.conferenceId}?type=${reviewerType}`
        );
    };

    const handleRetry = () => {
        if (reviewerType === "local") {
            refetchLocal();
        } else {
            refetchExternal();
        }
    };

    // Loading State
    if (isLoading) {
        return <LoadingState />;
    }

    // Error State
    if (error) {
        return <ErrorState onRetry={handleRetry} />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Hội nghị được giao đánh giá
                    </h1>
                    <p className="text-gray-600">
                        Danh sách các hội nghị mà bạn được giao làm {reviewerType === "local" ? "reviewer nội bộ" : "reviewer bên ngoài"}
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Tổng hội nghị</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats.totalConferences}
                                </p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            {/* <div>
                                <p className="text-sm text-gray-600 mb-1">Tổng bài báo</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats.totalPapers}
                                </p>
                            </div> */}
                            <div className="bg-green-50 p-3 rounded-lg">
                                <FileText className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Sắp diễn ra</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats.upcomingConferences}
                                </p>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg">
                                <Award className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên hội nghị, địa điểm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* Rank Filter */}
                        {uniqueRanks.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-gray-400" />
                                <select
                                    value={filterRank}
                                    onChange={(e) => setFilterRank(e.target.value)}
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                >
                                    <option value="">Tất cả hạng</option>
                                    {uniqueRanks.map((rank) => (
                                        <option key={rank} value={rank}>
                                            {rank}
                                        </option>
                                    ))}
                                </select>
                                {filterRank && (
                                    <button
                                        onClick={() => setFilterRank("")}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Sort */}
                        <select
                            value={sortOption}
                            onChange={(e) =>
                                setSortOption(e.target.value as "date-asc" | "date-desc" | "name-asc" | "name-desc")
                            }
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                            <option value="date-desc">Mới nhất</option>
                            <option value="date-asc">Cũ nhất</option>
                            <option value="name-asc">Tên A-Z</option>
                            <option value="name-desc">Tên Z-A</option>
                        </select>
                    </div>

                    {/* Active Filters Info */}
                    {(searchQuery || filterRank) && (
                        <div className="mt-3 pt-3 border-t flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Hiển thị {filteredAndSortedConferences.length} / {conferences.length} hội nghị
                            </p>
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setFilterRank("");
                                }}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    )}
                </div>

                {/* Conference Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedConferences.length > 0 ? (
                        filteredAndSortedConferences.map((conference) => (
                            <ConferenceCard
                                key={conference.conferenceId}
                                conference={conference}
                                onClick={() => handleConferenceClick(conference)}
                            />
                        ))
                    ) : (
                        <EmptyState
                            message={
                                searchQuery || filterRank
                                    ? "Không tìm thấy hội nghị phù hợp với bộ lọc"
                                    : "Chưa có hội nghị nào được giao"
                            }
                        />
                    )}
                </div>
            </div>
        </div>
    );
}