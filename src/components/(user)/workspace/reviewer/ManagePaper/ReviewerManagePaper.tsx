"use client";

import { useEffect, useState, useMemo } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  FileText,
  ChevronDown,
  SortAsc,
  Grid,
  List,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaperTable } from "@/components/(user)/workspace/reviewer/ManagePaper/PaperTable";
import { AssignedPaper, AssignedPaperGroup } from "@/types/paper.type";
import { useListAssignedPapersQuery } from "@/redux/services/paper.service";
import CameraReadyList from "@/components/(user)/workspace/reviewer/CameraReadyList/index";
import { useConference } from "@/redux/hooks/useConference";
import { ConferenceResponse } from "@/types/conference.type";
import { steps } from "@/helper/paper";

type ViewMode = "all" | "by-conference";
type SortOption = "date-asc" | "date-desc" | "name-asc" | "name-desc" | "conference-asc";

interface FilterState {
  selectedPhase: string,
  status: string[];
  conferenceIds: string[];
}

export default function ReviewerManagePaperPage() {
  const router = useRouter();

  // State management
  const [viewMode, setViewMode] = useState<ViewMode>("by-conference");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<string>("");
  // const [filters, setFilters] = useState<FilterState>({
  //   selectedPhase: "",
  //   status: [],
  //   conferenceIds: []
  // });
  const [selectedConference, setSelectedConference] = useState<ConferenceResponse | null>(null);
  const [showCameraReady, setShowCameraReady] = useState(false);
  const [expandedStats, setExpandedStats] = useState(false);

  // API calls
  // const {
  //   lazyAssignedConferences,
  //   fetchAssignedConferences,
  //   assignedConferencesLoading,
  //   assignedConferencesError,
  // } = useConference();

  const {
    data: allAssignedPapersData,
    isLoading: loadingAllPapers,
    error: allPapersError,
  } = useListAssignedPapersQuery(
    { confId: undefined },
    { skip: false }
  );

  const assignedPaperGroups: AssignedPaperGroup[] = allAssignedPapersData?.data || [];

  // useEffect(() => {
  //   fetchAssignedConferences();
  // }, [fetchAssignedConferences]);

  // Flatten all papers for "all" view
  const allPapers: (AssignedPaper & { conferenceName: string })[] = useMemo(() => {
    return assignedPaperGroups.flatMap(group =>
      group.assignedPapers.map(paper => ({
        ...paper,
        conferenceName: group.conferenceName
      }))
    );
  }, [assignedPaperGroups]);

  const phaseStats = useMemo(() => {
    return steps.map((stage, index) => {
      const count = allPapers.filter(p => {
        // Tìm phase hiện tại của paper
        const currentStageIndex = steps
          .map((s, idx) => (p[s.key as keyof AssignedPaper] ? idx : null))
          .filter(id => id !== null)
          .pop();

        return currentStageIndex === index;
      }).length;

      return { ...stage, count };
    });
  }, [allPapers]);

  // const phaseStats = useMemo(() => {
  //   return steps.map((stage) => {
  //     const totalPapers = allPapers.length;
  //     const totalConferences = assignedPaperGroups.length;
  //     const count = allPapers.filter(p => {
  //       // Tìm phase hiện tại của paper
  //       const currentStageIndex = steps
  //         .map(s => (p[s.key as keyof AssignedPaper] ? s.id : null))
  //         .filter(id => id !== null)
  //         .pop();

  //       return currentStageIndex === stage.id;
  //     }).length;

  //     return { ...stage, count };
  //     // const count = allPapers.filter(p => p[stage.key as keyof AssignedPaper]).length;
  //   });
  // }, [allPapers]);

  // Get unique statuses for filter
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    allPapers.forEach(paper => {
      if (paper.cameraReadyId) statuses.add("Camera Ready");
      else if (paper.revisionPaperId) statuses.add("Revision");
      else if (paper.fullPaperId) statuses.add("Under Review");
      else statuses.add("Abstract Only");
    });
    return Array.from(statuses);
  }, [allPapers]);

  // Helper function to get paper status
  const getPaperStatus = (paper: AssignedPaper): string => {
    if (paper.cameraReadyId) return "Camera Ready";
    if (paper.revisionPaperId) return "Revision";
    if (paper.fullPaperId) return "Under Review";
    return "Abstract Only";
  };

  // Filter and search logic
  const filteredAndSortedData = useMemo(() => {
    let result = viewMode === "all" ? allPapers : assignedPaperGroups;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      if (viewMode === "all") {
        result = (result as typeof allPapers).filter(paper => {
          const paperTitleMatch = paper.title?.toLowerCase().includes(query);
          const conferenceMatch = paper.conferenceName.toLowerCase().includes(query);
          return paperTitleMatch || conferenceMatch;
        });
      } else {
        result = (result as AssignedPaperGroup[]).map(group => ({
          ...group,
          assignedPapers: group.assignedPapers.filter(paper => {
            const paperTitleMatch = paper.title?.toLowerCase().includes(query);
            const conferenceMatch = group.conferenceName.toLowerCase().includes(query);
            return paperTitleMatch || conferenceMatch;
          })
        })).filter(group =>
          group.conferenceName.toLowerCase().includes(query) ||
          group.assignedPapers.length > 0
        );
      }
    }

    // Status filter
    if (selectedPhase) {
      if (viewMode === "all") {
        result = (result as typeof allPapers).filter(paper => {
          const currentStageIndex = steps
            .map((s, idx) => (paper[s.key as keyof AssignedPaper] ? idx : null))
            .filter(id => id !== null)
            .pop();

          const selectedStageIndex = steps.findIndex(s => s.label === selectedPhase);
          return currentStageIndex === selectedStageIndex;
        });
      } else {
        result = (result as AssignedPaperGroup[]).map(group => ({
          ...group,
          assignedPapers: group.assignedPapers.filter(paper => {
            const currentStageIndex = steps
              .map((s, idx) => (paper[s.key as keyof AssignedPaper] ? idx : null))
              .filter(id => id !== null)
              .pop();

            const selectedStageIndex = steps.findIndex(s => s.label === selectedPhase);
            return currentStageIndex === selectedStageIndex;
          })
        })).filter(group => group.assignedPapers.length > 0);
      }
    }
    // if (selectedPhase) {
    //   if (viewMode === "all") {
    //     result = (result as typeof allPapers).filter(paper => {
    //       const currentStageIndex = steps
    //         .map(s => (paper[s.key as keyof AssignedPaper] ? s.id : null))
    //         .filter(id => id !== null)
    //         .pop();

    //       const selectedStage = steps.find(s => s.label === selectedPhase);
    //       return currentStageIndex === selectedStage?.id;
    //     });
    //   } else {
    //     result = (result as AssignedPaperGroup[]).map(group => ({
    //       ...group,
    //       assignedPapers: group.assignedPapers.filter(paper => {
    //         const currentStageIndex = steps
    //           .map(s => (paper[s.key as keyof AssignedPaper] ? s.id : null))
    //           .filter(id => id !== null)
    //           .pop();

    //         const selectedStage = steps.find(s => s.label === selectedPhase);
    //         return currentStageIndex === selectedStage?.id;
    //       })
    //     })).filter(group => group.assignedPapers.length > 0);
    //   }
    // }


    // if (filters.status.length > 0) {
    //   if (viewMode === "all") {
    //     result = (result as typeof allPapers).filter(paper =>
    //       filters.status.includes(getPaperStatus(paper))
    //     );
    //   } else {
    //     result = (result as AssignedPaperGroup[]).map(group => ({
    //       ...group,
    //       assignedPapers: group.assignedPapers.filter(paper =>
    //         filters.status.includes(getPaperStatus(paper))
    //       )
    //     })).filter(group => group.assignedPapers.length > 0);
    //   }
    // }

    // Conference filter
    // if (filters.conferenceIds.length > 0) {
    //   if (viewMode === "all") {
    //     result = (result as typeof allPapers).filter(paper =>
    //       filters.conferenceIds.includes(paper.conferenceId)
    //     );
    //   } else {
    //     result = (result as AssignedPaperGroup[]).filter(group =>
    //       filters.conferenceIds.includes(group.conferenceId)
    //     );
    //   }
    // }

    // Sorting
    if (viewMode === "all") {
      const papers = [...result] as typeof allPapers;
      switch (sortOption) {
        case "date-asc":
          papers.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case "date-desc":
          papers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case "name-asc":
          papers.sort((a, b) => a.paperId.localeCompare(b.paperId));
          break;
        case "name-desc":
          papers.sort((a, b) => b.paperId.localeCompare(a.paperId));
          break;
        case "conference-asc":
          papers.sort((a, b) => a.conferenceName.localeCompare(b.conferenceName));
          break;
      }
    } else {
      const groups = [...result] as AssignedPaperGroup[];
      switch (sortOption) {
        case "name-asc":
        case "conference-asc":
          groups.sort((a, b) => a.conferenceName.localeCompare(b.conferenceName));
          break;
        case "name-desc":
          groups.sort((a, b) => b.conferenceName.localeCompare(a.conferenceName));
          break;
        case "date-desc":
          groups.sort((a, b) => {
            const aLatest = Math.max(...a.assignedPapers.map(p => new Date(p.createdAt).getTime()));
            const bLatest = Math.max(...b.assignedPapers.map(p => new Date(p.createdAt).getTime()));
            return bLatest - aLatest;
          });
          break;
        case "date-asc":
          groups.sort((a, b) => {
            const aLatest = Math.max(...a.assignedPapers.map(p => new Date(p.createdAt).getTime()));
            const bLatest = Math.max(...b.assignedPapers.map(p => new Date(p.createdAt).getTime()));
            return aLatest - bLatest;
          });
          break;
      }
    }

    return result;
  }, [allPapers, assignedPaperGroups, viewMode, searchQuery, selectedPhase, sortOption]);

  // Statistics
  const stats = useMemo(() => {
    const totalPapers = allPapers.length;
    const totalConferences = assignedPaperGroups.length;
    const underReview = allPapers.filter(p => p.fullPaperId && !p.revisionPaperId && !p.cameraReadyId).length;
    const revision = allPapers.filter(p => p.revisionPaperId).length;
    const cameraReady = allPapers.filter(p => p.cameraReadyId).length;

    return { totalPapers, totalConferences, underReview, revision, cameraReady };
  }, [allPapers, assignedPaperGroups]);

  const handleViewPaper = (paper: AssignedPaper) => {
    router.push(`/workspace/reviewer/manage-paper/${paper.paperId}`);
  };

  // const handleConferenceClick = (conference: AssignedPaperGroup) => {
  //   const conf = lazyAssignedConferences?.find(c => c.conferenceId === conference.conferenceId);
  //   if (conf) {
  //     setSelectedConference(conf);
  //   }
  // };

  // const toggleFilter = (type: keyof FilterState, value: string) => {
  //   setFilters(prev => ({
  //     ...prev,
  //     [type]: prev[type].includes(value)
  //       ? prev[type].filter(v => v !== value)
  //       : [...prev[type], value]
  //   }));
  // };

  // const clearFilters = () => {
  //   setFilters({ status: [], conferenceIds: [] });
  // };

  // const activeFilterCount = filters.status.length + filters.conferenceIds.length;
  const activeFilterCount = selectedPhase ? 1 : 0;

  // Loading UI
  if (loadingAllPapers) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Error UI
  if (allPapersError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Có lỗi xảy ra khi tải dữ liệu</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Tải lại
          </Button>
        </div>
      </div>
    );
  }

  // Detail view for selected conference
  // if (selectedConference) {
  //   const conferenceGroup = assignedPaperGroups.find(g => g.conferenceId === selectedConference.conferenceId);
  //   const conferencePapers = conferenceGroup?.assignedPapers || [];

  //   return (
  //     <div className="min-h-screen bg-gray-50 p-6">
  //       <div className="max-w-7xl mx-auto space-y-6">
  //         <Button
  //           variant="ghost"
  //           onClick={() => setSelectedConference(null)}
  //           className="flex items-center gap-2"
  //         >
  //           <ArrowLeft className="w-4 h-4" />
  //           Quay lại danh sách
  //         </Button>

  //         <div>
  //           <h1 className="text-3xl font-bold text-gray-900">
  //             {selectedConference.conferenceName}
  //           </h1>
  //           <p className="text-gray-600 mt-2">
  //             Danh sách các bài báo được giao trong hội nghị này
  //           </p>
  //         </div>

  //         <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
  //           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  //             <div>
  //               <p className="text-sm text-gray-600">Conference ID</p>
  //               <p className="font-mono text-sm font-semibold text-gray-900 mt-1">
  //                 {selectedConference.conferenceId}
  //               </p>
  //             </div>
  //             <div>
  //               <p className="text-sm text-gray-600">Ngày diễn ra</p>
  //               <p className="text-sm font-semibold text-gray-900 mt-1">
  //                 {selectedConference.startDate &&
  //                   new Date(selectedConference.startDate).toLocaleDateString("vi-VN")}{" "}
  //                 -{" "}
  //                 {selectedConference.endDate &&
  //                   new Date(selectedConference.endDate).toLocaleDateString("vi-VN")}
  //               </p>
  //             </div>
  //             <div>
  //               <p className="text-sm text-gray-600">Số bài báo được giao</p>
  //               <p className="text-sm font-semibold text-gray-900 mt-1">
  //                 {conferencePapers.length}
  //               </p>
  //             </div>
  //           </div>
  //         </div>

  //         {conferencePapers.length > 0 ? (
  //           <div className="bg-white rounded-xl shadow-sm overflow-hidden">
  //             <PaperTable papers={conferencePapers} onView={handleViewPaper} />
  //           </div>
  //         ) : (
  //           <div className="text-center py-12">
  //             <p className="text-gray-500 text-lg">
  //               Không có bài báo nào được giao trong hội nghị này.
  //             </p>
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   );
  // }

  // Main view
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý Bài báo - Reviewer
          </h1>
          <p className="text-gray-600 mt-2">
            Danh sách các bài báo được giao cho bạn
          </p>
        </div>

        {/* Statistics Cards */}
        {/* <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex flex-row gap-4">
            <div className="flex-1 bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
              <p className="text-sm text-gray-600">Tổng bài báo</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPapers}</p>
            </div>
            <div className="flex-1 bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
              <p className="text-sm text-gray-600">Hội nghị</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalConferences}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Thống kê theo giai đoạn</h2>
              <p className="text-sm text-gray-500">
                Hiển thị số lượng bài báo theo từng phase của quy trình
              </p>
            </div>
            <button
              onClick={() => setExpandedStats(!expandedStats)}
              className="text-sm text-blue-600 hover:underline"
            >
              {expandedStats ? "Thu gọn" : "Xem tất cả 4 phase"}
            </button>
          </div>

          <div
            className={`mt-4 grid gap-4 transition-all ${expandedStats ? "grid-cols-1 md:grid-cols-4" : "grid-cols-1 md:grid-cols-2"
              }`}
          >

            {expandedStats
              ? phaseStats.map((stage, index) => (
                <div
                  key={index}
                  className={`rounded-lg border-l-4 p-4 ${index === 0
                    ? "border-gray-400"
                    : index === 1
                      ? "border-yellow-500"
                      : index === 2
                        ? "border-orange-500"
                        : "border-green-600"
                    } bg-gradient-to-br from-gray-50 to-white`}
                >
                  <p className="text-sm text-gray-600">{stage.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stage.count}</p>
                </div>
              ))
              : (() => {
                const currentStage = phaseStats.findLast(s => s.count > 0) || phaseStats[0];
                const currentIndex = phaseStats.indexOf(currentStage);
                return (
                  <div
                    className={`rounded-lg border-l-4 p-4 ${currentIndex === 0
                      ? "border-gray-400"
                      : currentIndex === 1
                        ? "border-yellow-500"
                        : currentIndex === 2
                          ? "border-orange-500"
                          : "border-green-600"
                      } bg-gradient-to-br from-gray-50 to-white`}
                  >
                    <p className="text-sm text-gray-600">{currentStage.label} (hiện tại)</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{currentStage.count}</p>
                  </div>
                );
              })()}
          </div>
        </div> */}
        {/* Statistics Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Tổng bài báo</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPapers}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
            <p className="text-sm text-gray-600">Hội nghị</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalConferences}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-600">Đang review</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.underReview}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
            <p className="text-sm text-gray-600">Cần sửa</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.revision}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-600">Camera Ready</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.cameraReady}</p>
          </div>
        </div> */}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
          {/* View Mode Toggle */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("by-conference")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${viewMode === "by-conference"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                <Grid className="w-4 h-4" />
                Theo hội nghị
              </button>
              <button
                onClick={() => setViewMode("all")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${viewMode === "all"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                <List className="w-4 h-4" />
                Tất cả bài báo
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedPhase}
                onChange={(e) => setSelectedPhase(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Tất cả các phase</option>
                {steps.map((stage, index) => (
                  <option key={index} value={stage.label}>
                    {stage.label}
                  </option>
                ))}
              </select>
              {/* <select
                value={selectedPhase}
                onChange={(e) => setSelectedPhase(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Tất cả các phase</option>
                {steps.map(stage => (
                  <option key={stage.id} value={stage.label}>
                    {stage.label}
                  </option>
                ))}
              </select> */}
              {selectedPhase && (
                <button
                  onClick={() => setSelectedPhase("")}
                  className="text-gray-400 hover:text-gray-600"
                  title="Xóa bộ lọc"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* <div className="flex items-center gap-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Lọc
                {activeFilterCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div> */}
          </div>

          {/* Search and Sort */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên bài báo hoặc hội nghị..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <SortAsc className="w-4 h-4 text-gray-400" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date-desc">Mới nhất</option>
                <option value="date-asc">Cũ nhất</option>
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
                {viewMode === "all" && <option value="conference-asc">Theo hội nghị</option>}
              </select>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
                {selectedPhase && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPhase("")}
                    className="text-blue-600"
                  >
                    Xóa bộ lọc
                  </Button>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Giai đoạn (Phase)
                </label>
                <select
                  value={selectedPhase}
                  onChange={(e) => setSelectedPhase(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tất cả các phase</option>
                  {steps.map((stage, index) => (
                    <option key={index} value={stage.label}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {/* {showFilters && (
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-blue-600"
                  >
                    Xóa tất cả
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Trạng thái
                  </label>
                  <div className="space-y-2">
                    {uniqueStatuses.map(status => (
                      <label key={status} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.status.includes(status)}
                          onChange={() => toggleFilter("status", status)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Hội nghị
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {assignedPaperGroups.map(group => (
                      <label key={group.conferenceId} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.conferenceIds.includes(group.conferenceId)}
                          onChange={() => toggleFilter("conferenceIds", group.conferenceId)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{group.conferenceName}</span>
                        <span className="text-xs text-gray-500">({group.assignedPapers.length})</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )} */}
        </div>

        {/* Content */}
        {viewMode === "by-conference" ? (
          // Conference grouped view
          <div className="space-y-4">
            {(filteredAndSortedData as AssignedPaperGroup[]).length > 0 ? (
              (filteredAndSortedData as AssignedPaperGroup[]).map(group => (
                <div key={group.conferenceId} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
                  // onClick={() => handleConferenceClick(group)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {group.conferenceName}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Conference ID: {group.conferenceId}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-gray-900">
                            {group.assignedPapers.length} bài báo
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <PaperTable papers={group.assignedPapers} onView={handleViewPaper} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  Không tìm thấy kết quả phù hợp
                </p>
              </div>
            )}
          </div>
        ) : (
          // All papers flat view
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {(filteredAndSortedData as typeof allPapers).length > 0 ? (
              <PaperTable
                papers={filteredAndSortedData as AssignedPaper[]}
                onView={handleViewPaper}
              />
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  Không tìm thấy kết quả phù hợp
                </p>
              </div>
            )}
          </div>
        )}

        {/* Camera Ready Dialog */}
        {/* <Dialog open={showCameraReady} onOpenChange={setShowCameraReady}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Duyệt Camera Ready</DialogTitle>
            </DialogHeader>
            <CameraReadyList />
          </DialogContent>
        </Dialog> */}
      </div>
    </div>
  );
}