"use client";

import { useState } from "react";
import {  
  Plus, 
  UserCheck, 
  UserX,
  Users
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
import { mockUsers } from "@/data/mockUser.data";

import { SearchFilter } from "@/components/molecules/SearchFilter";
import { Modal } from "@/components/molecules/Modal";
import { UserDetail } from "@/components/(user)/workspace/organizer/ManageUser/UserDetail/index";
import { ReviewerForm } from "@/components/(user)/workspace/organizer/ManageReviewer/ReviewerForm/index";
import { UserTable } from "@/components/(user)/workspace/organizer/ManageUser/UserTable/index";
import { User, UserFormData } from "@/types/user.type";

export default function ManageReviewer() {
  // Filter only reviewers from mockUsers
  const initialReviewers = mockUsers.filter(
    user => user.role === "localreviewer" || user.role === "externalreviewer"
  );
  
  const [reviewers, setReviewers] = useState<User[]>(initialReviewers);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingReviewer, setEditingReviewer] = useState<User | null>(null);
  const [viewingReviewer, setViewingReviewer] = useState<User | null>(null);
  const [deleteReviewerId, setDeleteReviewerId] = useState<string | null>(null);

  const roleOptions = [
    { value: "all", label: "Tất cả loại" },
    { value: "localreviewer", label: "Phản biện nội bộ" },
    { value: "externalreviewer", label: "Phản biện bên ngoài" }
  ];
  
  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "active", label: "Hoạt động" },
    { value: "inactive", label: "Không hoạt động" }
  ];

  const filteredReviewers = reviewers.filter(reviewer => {
    const matchesSearch = reviewer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reviewer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || reviewer.role === filterRole;
    const matchesStatus = filterStatus === "all" || reviewer.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreate = () => {
    setEditingReviewer(null);
    setIsFormModalOpen(true);
  };

  const handleView = (reviewer: User) => {
    setViewingReviewer(reviewer);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (reviewer: User) => {
    setEditingReviewer(reviewer);
    setIsFormModalOpen(true);
  };

  const handleSave = (data: UserFormData) => {
    if (editingReviewer) {
      setReviewers(prev => prev.map(r => 
        r.userId === editingReviewer.userId 
          ? { ...r, ...data }
          : r
      ));
      toast.success("Cập nhật phản biện thành công!");
    } else {
      const newReviewer: User = {
        ...data,
        userId: Date.now().toString(),
        status: "active",
        registeredConferences: 0,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      setReviewers(prev => [...prev, newReviewer]);
      toast.success("Thêm phản biện thành công!");
    }
    setIsFormModalOpen(false);
    setEditingReviewer(null);
  };

  const handleDelete = (id: string) => {
    setDeleteReviewerId(id);
  };

  const confirmDelete = () => {
    if (deleteReviewerId) {
      setReviewers(prev => prev.filter(r => r.userId !== deleteReviewerId));
      toast.success("Xóa phản biện thành công!");
      setDeleteReviewerId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Reviewer</h1>
            <Button
              onClick={handleCreate}
              className="flex items-center gap-2 whitespace-nowrap mt-6"
            >
              <Plus className="w-5 h-5" />
              Thêm reviewer
            </Button>
          </div>
          <p className="text-gray-600 mt-2">
            Quản lý thông tin phản biện viên trên ConfRadar
          </p>
        </div>

        <SearchFilter
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Tìm kiếm..."
          filters={[
            {
              value: filterRole,
              onValueChange: setFilterRole,
              options: roleOptions,
            },
            {
              value: filterStatus,
              onValueChange: setFilterStatus,
              options: statusOptions,
            },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng reviewers</p>
                <p className="text-3xl font-bold text-gray-900">{reviewers.length}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đang hoạt động</p>
                <p className="text-3xl font-bold text-green-600">
                  {reviewers.filter(r => r.status === "active").length}
                </p>
              </div>
              <UserCheck className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Phản biện nội bộ</p>
                <p className="text-3xl font-bold text-purple-600">
                  {reviewers.filter(r => r.role === "localreviewer").length}
                </p>
              </div>
              <Users className="w-10 h-10 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Phản biện bên ngoài</p>
                <p className="text-3xl font-bold text-orange-600">
                  {reviewers.filter(r => r.role === "externalreviewer").length}
                </p>
              </div>
              <UserX className="w-10 h-10 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <UserTable
            users={filteredReviewers}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingReviewer(null);
        }} 
        title={editingReviewer ? "Chỉnh sửa reviewer" : "Thêm reviewer mới"}
      >
        <ReviewerForm
          user={editingReviewer}
          onSave={handleSave}
          onCancel={() => {
            setIsFormModalOpen(false);
            setEditingReviewer(null);
          }}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setViewingReviewer(null);
        }}
        title="Chi tiết reviewer"
      >
        {viewingReviewer && (
          <UserDetail
            user={viewingReviewer}
            onClose={() => {
              setIsDetailModalOpen(false);
              setViewingReviewer(null);
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteReviewerId} onOpenChange={() => setDeleteReviewerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa reviewer này? Hành động này không thể hoàn tác.
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