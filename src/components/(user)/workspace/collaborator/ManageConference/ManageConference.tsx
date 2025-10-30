"use client";

import { useState } from "react";
import { 
  Plus,  
  Calendar
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

import { ConferenceStepForm } from "@/components/(user)/workspace/collaborator/ManageConference/ConferenceForm/index";
import { ConferenceDetail } from "@/components/(user)/workspace/collaborator/ManageConference/ConferenceDetail";
import { ConferenceTable } from "@/components/(user)/workspace/collaborator/ManageConference/ConferenceTable";
import { Conference, ConferenceFormData  } from "@/types/conference.type";

export default function ManageConference() {
  const [conferences, setConferences] = useState<Conference[]>(mockConferences);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingConference, setEditingConference] = useState<Conference | null>(null);
  const [viewingConference, setViewingConference] = useState<Conference  | null>(null);
  const [deleteConferenceId, setDeleteConferenceId] = useState<string | null>(null);

  const categoryOptions = [
    { value: "all", label: "Tất cả danh mục" },
    { value: "category-1", label: "Công nghệ" },
    { value: "category-2", label: "Nghiên cứu" },
    { value: "category-3", label: "Kinh doanh" },
    { value: "category-4", label: "Giáo dục" },
  ];

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "draft", label: "Nháp" },
    { value: "published", label: "Đã xuất bản" },
    { value: "open", label: "Đang mở đăng ký" },
    { value: "closed", label: "Đã đóng đăng ký" },
    { value: "ongoing", label: "Đang diễn ra" },
    { value: "completed", label: "Đã kết thúc" },
    { value: "cancelled", label: "Đã hủy" },
  ];

  const filteredConferences = conferences.filter(conf => {
    const matchesSearch = 
      conf.conferenceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conf.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conf.address.toLowerCase().includes(searchQuery.toLowerCase());


    return matchesSearch;
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

  const handleDelete = (id: string) => {
    setDeleteConferenceId(id);
  };

  const confirmDelete = () => {
    if (deleteConferenceId) {
      setConferences(prev => prev.filter(c => c.conferenceId !== deleteConferenceId));
      toast.success("Xóa hội thảo thành công!");
      setDeleteConferenceId(null);
    }
  };

  const totalConferences = conferences.length;

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
        title={editingConference ? "Chỉnh sửa hội thảo công nghệ" : "Thêm hội thảo công nghệ mới"}
        size="lg"
      >
        <ConferenceStepForm
          conference={editingConference}
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
            conferenceId={viewingConference.conferenceId}
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