"use client";

import { useState } from "react";
import {  FileText, Clock, CheckCircle, XCircle, AlertCircle, Edit3, ScanEye, UserPlus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link"

import { SearchFilter } from "@/components/molecules/SearchFilter";
import { PaperTable } from "@/components/(user)/workspace/organizer//ManagePaper/ManagePaper/PaperTable/index";
import { PaperDetail } from "@/components/(user)/workspace/organizer//ManagePaper/ManagePaper/PaperDetail/index";
import { PaperForm } from "@/components/(user)/workspace/organizer//ManagePaper/ManagePaper/PaperForm/index";
import { Paper } from "@/types/paper.type";
import { mockPaperData } from "@/data/mockPaper.data";
import {AssignReviewerData} from "@/types/paper.type"



export default function ReviewerManagePage() {


  const [papers, setPapers] = useState<Paper[]>(mockPaperData);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [conferenceFilter, setConferenceFilter] = useState("all");
  const [paperTypeFilter, setPaperTypeFilter] = useState("all");
  
  const [deletePaperId, setDeletePaperId] = useState<string | null>(null);
  const [viewPaper, setViewPaper] = useState<Paper | null>(null);
  const [assignPaper, setAssignPaper] = useState<Paper | null>(null);

  // Mock reviewer data
  const mockReviewers = [
    {
      id: "REV001",
      name: "Dr. Nguyễn Văn A",
      email: "nguyenvana@university.edu",
      expertise: ["AI", "Machine Learning", "Deep Learning"],
      assignedPapers: 3,
      maxPapers: 5,
    },
    {
      id: "REV002",
      name: "Dr. Trần Thị B",
      email: "tranthib@university.edu",
      expertise: ["Computer Vision", "Image Processing"],
      assignedPapers: 4,
      maxPapers: 5,
    },
    {
      id: "REV003",
      name: "Dr. Lê Văn C",
      email: "levanc@university.edu",
      expertise: ["NLP", "Text Mining"],
      assignedPapers: 2,
      maxPapers: 6,
    },
    {
      id: "REV004",
      name: "Dr. Phạm Thị D",
      email: "phamthid@university.edu",
      expertise: ["Quantum Computing", "Cryptography"],
      assignedPapers: 1,
      maxPapers: 4,
    },
    {
      id: "REV005",
      name: "Dr. Hoàng Văn E",
      email: "hoangvane@university.edu",
      expertise: ["Blockchain", "FinTech", "Security"],
      assignedPapers: 5,
      maxPapers: 5,
    },
  ];

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "submitted", label: "Đã nộp" },
    { value: "under_review", label: "Đang đánh giá" },
    { value: "revision_required", label: "Yêu cầu sửa" },
    { value: "accepted", label: "Chấp nhận" },
    { value: "rejected", label: "Từ chối" },
    { value: "withdrawn", label: "Đã rút" }
  ];

  const conferenceOptions = [
    { value: "all", label: "Tất cả hội thảo" },
    { value: "CONF001", label: "International Conference on AI 2024" },
    { value: "CONF002", label: "Computer Vision Summit 2024" },
    { value: "CONF003", label: "Quantum Computing Conference 2024" },
    { value: "CONF004", label: "FinTech & AI Conference 2024" }
  ];

  const paperTypeOptions = [
    { value: "all", label: "Tất cả loại bài" },
    { value: "full_paper", label: "Full Paper" },
    { value: "short_paper", label: "Short Paper" },
    { value: "poster", label: "Poster" },
    { value: "workshop", label: "Workshop" }
  ];

  const filteredPapers = papers.filter(paper => {
    const matchesSearch = 
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      paper.conferenceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.trackName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.submitterName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || paper.status === statusFilter;
    const matchesConference = conferenceFilter === "all" || paper.conferenceId === conferenceFilter;
    const matchesPaperType = paperTypeFilter === "all" || paper.paperType === paperTypeFilter;
    
    return matchesSearch && matchesStatus && matchesConference && matchesPaperType;
  });

  const handleView = (paper: Paper) => {
    setViewPaper(paper);
  };

  const handleEdit = (paper: Paper) => {
    setAssignPaper(paper);
  };

  const handleDelete = (id: string) => {
    setDeletePaperId(id);
  };

  const confirmDelete = () => {
    if (deletePaperId) {
      const paper = papers.find(p => p.id === deletePaperId);
      setPapers(prev => prev.filter(p => p.id !== deletePaperId));
      toast.success(`Xóa bài báo "${paper?.title}" thành công!`);
      setDeletePaperId(null);
    }
  };

  const handleAssignReviewer = (data: AssignReviewerData) => {
    // Update paper with new reviewers
    setPapers(prev => prev.map(paper => {
      if (paper.id === data.paperId) {
        return {
          ...paper,
          reviewers: [...new Set([...paper.reviewers, ...data.reviewerIds])],
        };
      }
      return paper;
    }));
    
    toast.success(`Đã giao ${data.reviewerIds.length} reviewer cho bài báo!`);
    setAssignPaper(null);
  };

  // Statistics calculations
  const stats = {
    total: papers.length,
    submitted: papers.filter(p => p.status === "submitted").length,
    underReview: papers.filter(p => p.status === "under_review").length,
    revisionRequired: papers.filter(p => p.status === "revision_required").length,
    accepted: papers.filter(p => p.status === "accepted").length,
    rejected: papers.filter(p => p.status === "rejected").length,
    withdrawn: papers.filter(p => p.status === "withdrawn").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý Bài báo</h1>
              <p className="text-gray-600 mt-2">
                Quản lý bài báo và đánh giá trên ConfRadar
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/workspace/organizer/manage-paper/assigned-papper-list">
                <Button className="flex items-center gap-2 whitespace-nowrap" variant="outline">
                  <ScanEye className="w-5 h-5" />
                  Xem danh sách bài báo đang chờ 
                </Button>
              </Link>
              <Button 
                className="flex items-center gap-2 whitespace-nowrap"
                onClick={() => {
                  if (papers.length > 0) {
                    setAssignPaper(papers[0]);
                  } else {
                    toast.info("Không có bài báo nào để giao reviewer");
                  }
                }}
              >
                <UserPlus className="w-5 h-5" />
                Giao Reviewer
              </Button>
            </div>
          </div>
        </div>

        <SearchFilter
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Tìm kiếm theo tiêu đề, tác giả, hội thảo, track..."
          filters={[
            {
              value: statusFilter,
              onValueChange: setStatusFilter,
              options: statusOptions,
            },
            {
              value: conferenceFilter,
              onValueChange: setConferenceFilter,
              options: conferenceOptions,
            },
            {
              value: paperTypeFilter,
              onValueChange: setPaperTypeFilter,
              options: paperTypeOptions,
            },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng bài báo</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đang đánh giá</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.underReview}
                </p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đã chấp nhận</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.accepted}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Yêu cầu sửa</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.revisionRequired}
                </p>
              </div>
              <Edit3 className="w-10 h-10 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đã nộp</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.submitted}
                </p>
              </div>
              <FileText className="w-10 h-10 text-blue-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Từ chối</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.rejected}
                </p>
              </div>
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đã rút</p>
                <p className="text-3xl font-bold text-gray-600">
                  {stats.withdrawn}
                </p>
              </div>
              <AlertCircle className="w-10 h-10 text-gray-500" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-sm mb-1 opacity-90">Tỷ lệ chấp nhận</p>
                <p className="text-3xl font-bold">
                  {stats.total > 0 
                    ? Math.round((stats.accepted / stats.total) * 100) 
                    : 0}%
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-white opacity-80" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <PaperTable
            papers={filteredPapers}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        <AlertDialog open={!!deletePaperId} onOpenChange={() => setDeletePaperId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa bài báo</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa bài báo này? Tất cả thông tin đánh giá và lịch sử sẽ bị xóa. Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete} 
                className="bg-red-600 hover:bg-red-700"
              >
                Xóa bài báo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* View Paper Detail Dialog */}
        <Dialog open={!!viewPaper} onOpenChange={() => setViewPaper(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chi tiết bài báo</DialogTitle>
            </DialogHeader>
            {viewPaper && (
              <PaperDetail 
                paper={viewPaper} 
                onClose={() => setViewPaper(null)} 
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Assign Reviewer Dialog */}
        <Dialog open={!!assignPaper} onOpenChange={() => setAssignPaper(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Giao reviewer cho bài báo
              </DialogTitle>
            </DialogHeader>
            {assignPaper && (
              <PaperForm
                paper={assignPaper}
                availableReviewers={mockReviewers}
                onSave={handleAssignReviewer}
                onCancel={() => setAssignPaper(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}