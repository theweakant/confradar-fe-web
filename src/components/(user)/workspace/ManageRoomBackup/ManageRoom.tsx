"use client";

import { useState } from "react";
import { Plus, Home } from "lucide-react";
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
import { DestinationForm } from "@/components/(user)/workspace/admin/ManageRoom/DestinationForm/index";

import { useDestinationForm } from "@/redux/hooks/destination/useDestinationForm";
import {
  useGetAllRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} from "@/redux/services/room.service";
import { useGetAllDestinationsQuery } from "@/redux/services/destination.service";

import type { Room, RoomFormData } from "@/types/room.type";

export default function ManageRoom() {
  const {
    data: roomsResponse,
    isLoading: roomsLoading,
    refetch: refetchRooms,
  } = useGetAllRoomsQuery();
  const { data: destinationsResponse, isLoading: destinationsLoading } =
    useGetAllDestinationsQuery();

  const [createRoom, { isLoading: isCreating }] = useCreateRoomMutation();
  const [updateRoom, { isLoading: isUpdating }] = useUpdateRoomMutation();
  const [deleteRoom, { isLoading: isDeleting }] = useDeleteRoomMutation();

  const rooms = roomsResponse?.data || [];
  const destinations = destinationsResponse?.data || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null);

  const [isDestinationModalOpen, setIsDestinationModalOpen] = useState(false);
  const { handleSave: handleSaveDestination } = useDestinationForm();

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "available", label: "Có sẵn" },
    { value: "booked", label: "Đã đặt" },
    { value: "maintenance", label: "Bảo trì" },
  ];

  const filteredRooms = rooms.filter((room: Room) => {
    const matchesSearch =
      room.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all";
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

  const handleSave = async (data: RoomFormData) => {
    try {
      if (editingRoom) {
        const result = await updateRoom({
          id: editingRoom.roomId,
          data,
        }).unwrap();

        toast.success(result.message || "Cập nhật thông tin phòng thành công!");
      } else {
        const result = await createRoom(data).unwrap();
        toast.success(result.message || "Thêm phòng mới thành công!");
      }

      setIsFormModalOpen(false);
      setEditingRoom(null);
      refetchRooms();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra, vui lòng thử lại!";
      toast.error(message);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteRoomId(id);
  };

  const confirmDelete = async () => {
    if (deleteRoomId) {
      try {
        const result = await deleteRoom(deleteRoomId).unwrap();
        toast.success(result.message || "Xóa phòng thành công!");
        setDeleteRoomId(null);
        refetchRooms();
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra, vui lòng thử lại!";
        toast.error(message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Phòng</h1>
            <div className="flex gap-3">
              <Button
                onClick={handleCreate}
                className="flex items-center gap-2 whitespace-nowrap"
                disabled={isCreating || isUpdating}
              >
                <Plus className="w-5 h-5" />
                Thêm phòng mới
              </Button>

              <Button
                onClick={() => setIsDestinationModalOpen(true)}
                className="flex items-center gap-2 whitespace-nowrap bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-5 h-5" />
                Thêm địa điểm
              </Button>
            </div>
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
                <p className="text-3xl font-bold text-gray-900">
                  {roomsLoading ? "..." : rooms.length}
                </p>
              </div>
              <Home className="w-10 h-10 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {roomsLoading ? (
            <div className="p-8 text-center text-gray-500">
              Đang tải dữ liệu...
            </div>
          ) : (
            <RoomTable
              rooms={filteredRooms}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
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
          destinations={destinations}
          isLoading={isCreating || isUpdating}
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

      {/* Destination Modal */}
      <Modal
        isOpen={isDestinationModalOpen}
        onClose={() => setIsDestinationModalOpen(false)}
        title="Thêm địa điểm mới"
      >
        <DestinationForm
          destination={null}
          onSave={(data) => {
            handleSaveDestination(data);
            setIsDestinationModalOpen(false);
          }}
          onCancel={() => setIsDestinationModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteRoomId}
        onOpenChange={() => setDeleteRoomId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa phòng này? Hành động này không thể hoàn
              tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
