"use client";

import { useState } from "react";
import {  
  Plus, 
  UserCheck, 
  UserX,
  Shield
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
import { UserDetail } from "@/components/(user)/workspace/admin/ManageUser/UserDetail/index";
import { UserForm } from "@/components/(user)/workspace/admin/ManageUser/UserForm/index";
import { UserTable } from "@/components/(user)/workspace/admin/ManageUser/UserTable/index";
import { User, UserFormData } from "@/types/user.type";


export default function ManageUser() {
  const [users, setUsers] = useState<User[]>(mockUsers);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const roleOptions = [
    { value: "all", label: "Tất cả danh mục" },
    { value: "admin", label: "Quản trị viên" },
    { value: "organizer", label: "Người tổ chức" },
    { value: "attendee", label: "Người tham dự" }
  ];
  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "active", label: "Hoạt động" },
    { value: "inactive", label: "Không hoạt động" }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });


  const handleCreate = () => {
    setEditingUser(null);
    setIsFormModalOpen(true);
  };

  const handleView = (user: User) => {
    setViewingUser(user);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormModalOpen(true);
  };

  const handleSave = (data: UserFormData) => {
    if (editingUser) {
      setUsers(prev => prev.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...data }
          : u
      ));
      toast.success("Cập nhật người dùng thành công!");
    } else {
      const newUser: User = {
        ...data,
        id: Date.now().toString(),
        registeredConferences: 0,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      setUsers(prev => [...prev, newUser]);
      toast.success("Thêm người dùng thành công!");

    }
    setIsFormModalOpen(false);
    setEditingUser(null);
  };

  const handleDelete = (id: string) => {
    setDeleteUserId(id);
  };

  const confirmDelete = () => {
    if (deleteUserId) {
      setUsers(prev => prev.filter(u => u.id !== deleteUserId));
      toast.success("Xóa người dùng thành công!");

      setDeleteUserId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Người dùng</h1>
          <Button
            onClick={handleCreate}
            className="flex items-center gap-2 whitespace-nowrap mt-6"
          >
            <Plus className="w-5 h-5" />
            Thêm người dùng
          </Button>
        </div>
        <p className="text-gray-600 mt-2">
          Quản lý thông tin người dùng trên ConfRadar
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
                <p className="text-sm text-gray-600 mb-1">Tổng người dùng</p>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              </div>
              <UserCheck className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đang hoạt động</p>
                <p className="text-3xl font-bold text-green-600">
                  {users.filter(u => u.status === "active").length}
                </p>
              </div>
              <UserCheck className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Không hoạt động</p>
                <p className="text-3xl font-bold text-red-600">
                  {users.filter(u => u.status === "inactive").length}
                </p>
              </div>
              <UserX className="w-10 h-10 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Quản trị viên</p>
                <p className="text-3xl font-bold text-purple-600">
                  {users.filter(u => u.role === "admin").length}
                </p>
              </div>
              <Shield className="w-10 h-10 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <UserTable
            users={filteredUsers}
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
          setEditingUser(null);
        }}
        title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
      >
        <UserForm
          user={editingUser}
          onSave={handleSave}
          onCancel={() => {
            setIsFormModalOpen(false);
            setEditingUser(null);
          }}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setViewingUser(null);
        }}
        title="Chi tiết người dùng"
      >
        {viewingUser && (
          <UserDetail
            user={viewingUser}
            onClose={() => {
              setIsDetailModalOpen(false);
              setViewingUser(null);
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
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