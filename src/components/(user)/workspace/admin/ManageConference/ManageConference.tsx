"use client";

import { useState } from "react";
import { 
  Plus,  
  Calendar,
  Users,
  Clock,
  FileText,
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

import { ConferenceForm } from "@/components/(user)/workspace/admin/ManageConference/ConferenceForm";
import { ConferenceDetail } from "@/components/(user)/workspace/admin/ManageConference/ConferenceDetail";
import { ConferenceTable } from "@/components/(user)/workspace/admin/ManageConference/ConferenceTable";
import { Conference, ConferenceFormData } from "@/types/conference.type";

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
    setIsModalOpen(true);
  };

  const handleEdit = (conference: Conference) => {
    setEditingConference(conference);
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

        <ConferenceTable
          conferences={filteredConferences}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingConference(null);
        }}
        title={editingConference ? "Chỉnh sửa hội thảo" : "Thêm hội thảo mới"}
        size="lg"
      >
        <ConferenceForm
          conference={editingConference}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingConference(null);
          }}
        />
      </Modal>

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