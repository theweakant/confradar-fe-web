"use client";

import { useState } from "react";
import { Plus, Home, MapPin } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import { SearchFilter } from "@/components/molecules/SearchFilter";
import { Modal } from "@/components/molecules/Modal";
import { RoomDetail } from "@/components/(user)/workspace/admin/ManageRoom/RoomDetail/index";
import { RoomForm } from "@/components/(user)/workspace/admin/ManageRoom/RoomForm/index";
import { RoomTable } from "@/components/(user)/workspace/admin/ManageRoom/RoomTable/index";
import { DestinationForm } from "@/components/(user)/workspace/admin/ManageRoom/DestinationForm/index";
import { DestinationDetail } from "@/components/(user)/workspace/admin/ManageRoom/DestinationDetail";
import DestinationTable from "@/components/(user)/workspace/admin/ManageRoom/DestinationTable";

import { useDestinationForm } from "@/redux/hooks/destination/useDestinationForm";
import {
  useGetAllRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} from "@/redux/services/room.service";
import {
  useGetAllDestinationsQuery,
  useCreateDestinationMutation,
  useUpdateDestinationMutation,
} from "@/redux/services/destination.service";

import type { Room, RoomFormData } from "@/types/room.type";
import type {
  Destination,
  DestinationFormData,
} from "@/types/destination.type";

export default function ManageRoom() {
  const {
    data: roomsResponse,
    isLoading: roomsLoading,
    refetch: refetchRooms,
  } = useGetAllRoomsQuery();
  const {
    data: destinationsResponse,
    isLoading: destinationsLoading,
    refetch: refetchDestinations,
  } = useGetAllDestinationsQuery();

  const [createRoom, { isLoading: isCreatingRoom }] = useCreateRoomMutation();
  const [updateRoom, { isLoading: isUpdatingRoom }] = useUpdateRoomMutation();
  const [deleteRoom, { isLoading: isDeletingRoom }] = useDeleteRoomMutation();

  const [createDestination, { isLoading: isCreatingDestination }] =
    useCreateDestinationMutation();
  const [updateDestination, { isLoading: isUpdatingDestination }] =
    useUpdateDestinationMutation();

  const rooms = roomsResponse?.data || [];
  const destinations = destinationsResponse?.data || [];

  // Tab state
  const [activeTab, setActiveTab] = useState<"rooms" | "destinations">("rooms");

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDestinationFilter, setSelectedDestinationFilter] =
    useState<string>("all");

  // Room modal states
  const [isRoomFormModalOpen, setIsRoomFormModalOpen] = useState(false);
  const [isRoomDetailModalOpen, setIsRoomDetailModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null);

  // Destination modal states
  const [isDestinationFormModalOpen, setIsDestinationFormModalOpen] =
    useState(false);
  const [isDestinationDetailModalOpen, setIsDestinationDetailModalOpen] =
    useState(false);
  const [editingDestination, setEditingDestination] =
    useState<Destination | null>(null);
  const [viewingDestination, setViewingDestination] =
    useState<Destination | null>(null);

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
    const matchesDestination =
      selectedDestinationFilter === "all" ||
      room.destinationId === selectedDestinationFilter;
    return matchesSearch && matchesStatus && matchesDestination;
  });

  const filteredDestinations = destinations.filter(
    (destination: Destination) => {
      const matchesSearch =
        destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        // destination.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        destination.district.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    },
  );

  // Room handlers
  const handleCreateRoom = () => {
    setEditingRoom(null);
    setIsRoomFormModalOpen(true);
  };

  const handleViewRoom = (room: Room) => {
    setViewingRoom(room);
    setIsRoomDetailModalOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setIsRoomFormModalOpen(true);
  };

  // Destination handlers
  const handleCreateDestination = () => {
    setEditingDestination(null);
    setIsDestinationFormModalOpen(true);
  };

  const handleViewDestination = (destination: Destination) => {
    setViewingDestination(destination);
    setIsDestinationDetailModalOpen(true);
  };

  const handleEditDestination = (destination: Destination) => {
    setEditingDestination(destination);
    setIsDestinationFormModalOpen(true);
  };

  const handleSaveRoom = async (data: RoomFormData) => {
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

      setIsRoomFormModalOpen(false);
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

  const handleSaveDestination = async (data: DestinationFormData) => {
    try {
      if (editingDestination) {
        const result = await updateDestination({
          id: editingDestination.destinationId,
          data,
        }).unwrap();

        toast.success(
          result.message || "Cập nhật thông tin địa điểm thành công!",
        );
      } else {
        const result = await createDestination(data).unwrap();
        toast.success(result.message || "Thêm địa điểm mới thành công!");
      }

      setIsDestinationFormModalOpen(false);
      setEditingDestination(null);
      refetchDestinations();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra, vui lòng thử lại!";
      toast.error(message);
    }
  };

  const handleDeleteRoom = (id: string) => {
    setDeleteRoomId(id);
  };

  const confirmDeleteRoom = async () => {
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
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý Phòng & Địa điểm
            </h1>
            <div className="flex gap-3">
              {activeTab === "rooms" ? (
                <Button
                  onClick={handleCreateRoom}
                  className="flex items-center gap-2 whitespace-nowrap"
                  disabled={isCreatingRoom || isUpdatingRoom}
                >
                  <Plus className="w-5 h-5" />
                  Thêm phòng mới
                </Button>
              ) : (
                <Button
                  onClick={handleCreateDestination}
                  className="flex items-center gap-2 whitespace-nowrap bg-green-600 hover:bg-green-700"
                  disabled={isCreatingDestination || isUpdatingDestination}
                >
                  <Plus className="w-5 h-5" />
                  Thêm địa điểm
                </Button>
              )}
            </div>
          </div>
          <p className="text-gray-600 mt-2">
            Quản lý thông tin các phòng và địa điểm trong hệ thống
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("rooms")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "rooms"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Phòng ({rooms.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab("destinations")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "destinations"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Địa điểm ({destinations.length})
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mb-6">
          <SearchFilter
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={
              activeTab === "rooms"
                ? "Tìm kiếm phòng..."
                : "Tìm kiếm địa điểm..."
            }
            filters={
              activeTab === "rooms"
                ? [
                    {
                      value: filterStatus,
                      onValueChange: setFilterStatus,
                      options: statusOptions,
                    },
                  ]
                : []
            }
          />

          {/* Additional filter for rooms */}
          {activeTab === "rooms" && (
            <div className="mt-4">
              <Select
                value={selectedDestinationFilter}
                onValueChange={setSelectedDestinationFilter}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Lọc theo địa điểm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả địa điểm</SelectItem>
                  {destinations.map((destination) => (
                    <SelectItem
                      key={destination.destinationId}
                      value={destination.destinationId}
                    >
                      {destination.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {activeTab === "rooms" ? "Tổng số phòng" : "Tổng số địa điểm"}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {activeTab === "rooms"
                    ? roomsLoading
                      ? "..."
                      : rooms.length
                    : destinationsLoading
                      ? "..."
                      : destinations.length}
                </p>
              </div>
              {activeTab === "rooms" ? (
                <Home className="w-10 h-10 text-blue-500" />
              ) : (
                <MapPin className="w-10 h-10 text-green-500" />
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {activeTab === "rooms" ? (
            roomsLoading ? (
              <div className="p-8 text-center text-gray-500">
                Đang tải dữ liệu phòng...
              </div>
            ) : (
              <RoomTable
                rooms={filteredRooms}
                onView={handleViewRoom}
                onEdit={handleEditRoom}
                onDelete={handleDeleteRoom}
              />
            )
          ) : destinationsLoading ? (
            <div className="p-8 text-center text-gray-500">
              Đang tải dữ liệu địa điểm...
            </div>
          ) : (
            <DestinationTable
              destinations={filteredDestinations}
              loading={destinationsLoading}
              onViewDetail={handleViewDestination}
              onEdit={handleEditDestination}
            />
          )}
        </div>
      </div>

      {/* Room Form Modal */}
      <Modal
        isOpen={isRoomFormModalOpen}
        onClose={() => {
          setIsRoomFormModalOpen(false);
          setEditingRoom(null);
        }}
        title={editingRoom ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
      >
        <RoomForm
          room={editingRoom}
          destinations={destinations}
          isLoading={isCreatingRoom || isUpdatingRoom}
          onSave={handleSaveRoom}
          onCancel={() => {
            setIsRoomFormModalOpen(false);
            setEditingRoom(null);
          }}
        />
      </Modal>

      {/* Room Detail Modal */}
      <Modal
        isOpen={isRoomDetailModalOpen}
        onClose={() => {
          setIsRoomDetailModalOpen(false);
          setViewingRoom(null);
        }}
        title="Chi tiết phòng"
      >
        {viewingRoom && (
          <RoomDetail
            room={viewingRoom}
            onClose={() => {
              setIsRoomDetailModalOpen(false);
              setViewingRoom(null);
            }}
          />
        )}
      </Modal>

      {/* Destination Form Modal */}
      <Modal
        isOpen={isDestinationFormModalOpen}
        onClose={() => {
          setIsDestinationFormModalOpen(false);
          setEditingDestination(null);
        }}
        title={editingDestination ? "Chỉnh sửa địa điểm" : "Thêm địa điểm mới"}
      >
        <DestinationForm
          destination={editingDestination}
          onSave={handleSaveDestination}
          onCancel={() => {
            setIsDestinationFormModalOpen(false);
            setEditingDestination(null);
          }}
        />
      </Modal>

      {/* Destination Detail Modal */}
      <Modal
        isOpen={isDestinationDetailModalOpen}
        onClose={() => {
          setIsDestinationDetailModalOpen(false);
          setViewingDestination(null);
        }}
        title="Chi tiết địa điểm"
      >
        {viewingDestination && (
          <DestinationDetail
            destination={viewingDestination}
            onClose={() => {
              setIsDestinationDetailModalOpen(false);
              setViewingDestination(null);
            }}
          />
        )}
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
            <AlertDialogCancel disabled={isDeletingRoom}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRoom}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeletingRoom}
            >
              {isDeletingRoom ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
