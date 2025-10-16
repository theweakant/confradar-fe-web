"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  Plus,  
  Calendar,
  Users,
  Clock,
  FileText,
  Microscope,
  Cpu,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { mockConferences } from "@/data/mockConference.data";

import { Modal } from "@/components/molecules/Modal";
import { StatCard } from "@/components/molecules/StatCard";
import { SearchFilter } from "@/components/molecules/SearchFilter";

import { ConferenceDetail } from "@/components/(user)/workspace/admin/ManageConference/ConferenceDetail";
import { ConferenceTable } from "@/components/(user)/workspace/admin/ManageConference/ConferenceTable";
import { Conference, ConferenceFormData } from "@/types/conference.type";

import {TechConferenceForm} from "@/components/(user)/workspace/organizer/ManageConference/ConferenceForm/TechForm";
import {ResearchConferenceForm} from "@/components/(user)/workspace/organizer/ManageConference/ConferenceForm/ResearchForm";

type ConferenceType = "tech" | "research" | null;

export default function ManageConference() {
  const [conferences, setConferences] = useState<Conference[]>(mockConferences);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingConference, setEditingConference] = useState<Conference | null>(null);
  const [viewingConference, setViewingConference] = useState<Conference | null>(null);
  const [deleteConferenceId, setDeleteConferenceId] = useState<string | null>(null);
  const [selectedConferenceType, setSelectedConferenceType] = useState<ConferenceType>(null);

  const categoryOptions = [
    { value: "all", label: "Tất cả danh mục" },
    { value: "technology", label: "Công nghệ" },
    { value: "research", label: "Nghiên cứu" },
    { value: "business", label: "Kinh doanh" },
    { value: "education", label: "Giáo dục" },
  ];

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "upcoming", label: "Sắp diễn ra" },
    { value: "ongoing", label: "Đang diễn ra" },
    { value: "completed", label: "Đã kết thúc" },
    { value: "cancelled", label: "Đã hủy" },
  ];

  const filteredConferences = conferences.filter(conf => {
    const matchesSearch = 
      conf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conf.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conf.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === "all" || conf.category === filterCategory;
    const matchesStatus = filterStatus === "all" || conf.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreate = () => {
    setEditingConference(null);
    setSelectedConferenceType(null);
    setIsModalOpen(true);
  };

  const handleEdit = (conference: Conference) => {
    setEditingConference(conference);
    setSelectedConferenceType("tech"); // Default to tech for editing, adjust based on your logic
    setIsModalOpen(true);
  };

  const handleView = (conference: Conference) => {
    setViewingConference(conference);
    setIsDetailOpen(true);
  };

  const handleSave = (data: ConferenceFormData) => {
    if (editingConference) {
      setConferences(prev => prev.map(c => 
        c.id === editingConference.id 
          ? { ...c, ...data }
          : c
      ));
      toast.success("Cập nhật hội thảo thành công!");
    } else {
      const newConference: Conference = {
        ...data,
        id: Date.now().toString(),
        currentAttendees: 0
      };
      setConferences(prev => [...prev, newConference]);
      toast.success("Thêm hội thảo thành công!");
    }
    setIsModalOpen(false);
    setEditingConference(null);
    setSelectedConferenceType(null);
  };

  const handleDelete = (id: string) => {
    setDeleteConferenceId(id);
  };

  const confirmDelete = () => {
    if (deleteConferenceId) {
      setConferences(prev => prev.filter(c => c.id !== deleteConferenceId));
      toast.success("Xóa hội thảo thành công!");
      setDeleteConferenceId(null);
    }
  };

  const handleSelectConferenceType = (type: ConferenceType) => {
    setSelectedConferenceType(type);
  };

  const totalConferences = conferences.length;
  const upcomingConferences = conferences.filter(c => c.status === "upcoming").length;
  const ongoingConferences = conferences.filter(c => c.status === "ongoing").length;
  const completedConferences = conferences.filter(c => c.status === "completed").length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Hội thảo</h1>
            <Button
              onClick={handleCreate}
              className="flex items-center gap-2 whitespace-nowrap mt-6"
            >
              <Plus className="w-5 h-5" />
              Thêm hội thảo
            </Button>
          </div>
          <p className="text-gray-600 mt-2">
            Quản lý thông tin các hội thảo trên ConfRadar
          </p>
        </div>

        <SearchFilter
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Tìm kiếm..."
          filters={[
            {
              value: filterCategory,
              onValueChange: setFilterCategory,
              options: categoryOptions,
            },
            {
              value: filterStatus,
              onValueChange: setFilterStatus,
              options: statusOptions,
            },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Tổng hội thảo"
            value={totalConferences}
            icon={<Calendar className="w-10 h-10" />}
            color="blue"
          />
          <StatCard
            title="Sắp diễn ra"
            value={upcomingConferences}
            icon={<Clock className="w-10 h-10" />}
            color="purple"
          />
          <StatCard
            title="Đang diễn ra"
            value={ongoingConferences}
            icon={<Users className="w-10 h-10" />}
            color="green"
          />
          <StatCard
            title="Đã kết thúc"
            value={completedConferences}
            icon={<FileText className="w-10 h-10" />}
            color="orange"
          />
        </div>

        <div className="flex justify-end mb-4">
          <Link href="/workspace/organizer/manage-conference/pending-conference">
            <Button 
              variant="link" 
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1.5"
            >
              Xem hội nghị đang chờ duyệt
            </Button>
          </Link>
        </div>

        <ConferenceTable
          conferences={filteredConferences}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Modal for Creating/Editing Conference */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingConference(null);
          setSelectedConferenceType(null);
        }}
        title={
          editingConference 
            ? "Chỉnh sửa hội thảo" 
            : selectedConferenceType 
              ? "Thêm hội thảo mới"
              : "Chọn loại hội thảo"
        }
        size="lg"
      >
        {!editingConference && !selectedConferenceType ? (
          // Conference Type Selection Screen
          <div className="py-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
              Chọn loại hội thảo bạn muốn tạo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => handleSelectConferenceType("tech")}
                className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-8 transition-all hover:border-blue-500 hover:shadow-lg"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-full bg-blue-100 p-4 transition-colors group-hover:bg-blue-500">
                    <Cpu className="h-10 w-10 text-blue-600 transition-colors group-hover:text-white" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Tech Conference</h4>
                    <p className="text-sm text-gray-600">
                      Hội thảo về công nghệ, lập trình, AI, và các chủ đề kỹ thuật
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSelectConferenceType("research")}
                className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-8 transition-all hover:border-green-500 hover:shadow-lg"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-full bg-green-100 p-4 transition-colors group-hover:bg-green-500">
                    <Microscope className="h-10 w-10 text-green-600 transition-colors group-hover:text-white" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Research Conference</h4>
                    <p className="text-sm text-gray-600">
                      Hội thảo nghiên cứu khoa học, học thuật và đổi mới
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        ) : selectedConferenceType === "tech" ? (
          <TechConferenceForm
            conference={editingConference}
            onSave={handleSave}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingConference(null);
              setSelectedConferenceType(null);
            }}
          />
        ) : selectedConferenceType === "research" ? (
          <ResearchConferenceForm
            conference={editingConference}
            onSave={handleSave}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingConference(null);
              setSelectedConferenceType(null);
            }}
          />
        ) : null}
      </Modal>

      {/* Modal for Viewing Conference Details */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setViewingConference(null);
        }}
        title="Chi tiết hội thảo"
        size="lg"
      >
        {viewingConference && (
          <ConferenceDetail
            conference={viewingConference}
            onClose={() => {
              setIsDetailOpen(false);
              setViewingConference(null);
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConferenceId} onOpenChange={() => setDeleteConferenceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa hội thảo này? Hành động này không thể hoàn tác và sẽ xóa tất cả các đăng ký liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}