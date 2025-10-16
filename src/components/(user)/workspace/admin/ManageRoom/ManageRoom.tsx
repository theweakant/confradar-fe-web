"use client";

import { useState } from "react";
import { Plus, Home, CheckCircle, XCircle, Building } from "lucide-react";
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

import { SearchFilter } from "@/components/molecules/SearchFilter";
import { Modal } from "@/components/molecules/Modal";
import { RoomDetail } from "@/components/(user)/workspace/admin/ManageRoom/RoomDetail/index";
import { RoomForm } from "@/components/(user)/workspace/admin/ManageRoom/RoomForm/index";
import { RoomTable } from "@/components/(user)/workspace/admin/ManageRoom/RoomTable/index";

import { mockRooms } from "@/data/mockRoom.data";
import { Room, RoomFormData } from "@/types/room.type";

export default function ManageRoom() {
  const [rooms, setRooms] = useState<Room[]>(mockRooms);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null);

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "available", label: "Có sẵn" },
    { value: "booked", label: "Đã đặt" },
    { value: "maintenance", label: "Bảo trì" },
  ];

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || room.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = () => {
    setEditingRoom(null);
    setIsFormModalOpen(true);
  };

  const handleView = (room: Room) => {
    setViewingRoom(room);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setIsFormModalOpen(true);
  };

  const handleSave = (data: RoomFormData) => {
    if (editingRoom) {
      setRooms((prev) =>
        prev.map((r) =>
          r.roomId === editingRoom.roomId ? { ...r, ...data } : r
        )
      );
      toast.success("Cập nhật thông tin phòng thành công!");
    } else {
      const newRoom: Room = {
        ...data,
        roomId: Date.now().toString(),
      };
      setRooms((prev) => [...prev, newRoom]);
      toast.success("Thêm phòng mới thành công!");
    }
    setIsFormModalOpen(false);
    setEditingRoom(null);
  };

  const handleDelete = (id: string) => {
    setDeleteRoomId(id);
  };

  const confirmDelete = () => {
    if (deleteRoomId) {
      setRooms((prev) => prev.filter((r) => r.roomId !== deleteRoomId));
      toast.success("Xóa phòng thành công!");
      setDeleteRoomId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Phòng</h1>
            <Button
              onClick={handleCreate}
              className="flex items-center gap-2 whitespace-nowrap mt-6"
            >
              <Plus className="w-5 h-5" />
              Thêm phòng mới
            </Button>
          </div>
          <p className="text-gray-600 mt-2">
            Quản lý thông tin các phòng trong hệ thống
          </p>
        </div>

        {/* Search & Filter */}
        <SearchFilter
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Tìm kiếm phòng..."
          filters={[
            {
              value: filterStatus,
              onValueChange: setFilterStatus,
              options: statusOptions,
            },
          ]}
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng số phòng</p>
                <p className="text-3xl font-bold text-gray-900">{rooms.length}</p>
              </div>
              <Home className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Phòng có sẵn</p>
                <p className="text-3xl font-bold text-green-600">
                  {rooms.filter((r) => r.status === "available").length}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đang bảo trì</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {rooms.filter((r) => r.status === "maintenance").length}
                </p>
              </div>
              <Building className="w-10 h-10 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đã đặt</p>
                <p className="text-3xl font-bold text-red-600">
                  {rooms.filter((r) => r.status === "booked").length}
                </p>
              </div>
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <RoomTable
            rooms={filteredRooms}
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
          setEditingRoom(null);
        }}
        title={editingRoom ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
      >
        <RoomForm
          room={editingRoom}
          onSave={handleSave}
          onCancel={() => {
            setIsFormModalOpen(false);
            setEditingRoom(null);
          }}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setViewingRoom(null);
        }}
        title="Chi tiết phòng"
      >
        {viewingRoom && (
          <RoomDetail
            room={viewingRoom}
            onClose={() => {
              setIsDetailModalOpen(false);
              setViewingRoom(null);
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteRoomId} onOpenChange={() => setDeleteRoomId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa phòng này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
