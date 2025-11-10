"use client";

import { useState } from "react";
import { Plus, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
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
import { RequestDetail } from "@/components/(user)/workspace/organizer/ManageRequest/RequestDetail/index";
import { RequestForm } from "@/components/(user)/workspace/organizer/ManageRequest/RequestForm/index";
import { RequestTable } from "@/components/(user)/workspace/organizer/ManageRequest/RequestTable/index";

import { mockRequests } from "@/data/mockRequest.data";
import {
  Request,
  CreateRequestDto,
  UpdateRequestStatusDto,
} from "@/types/request.type";

export default function ManageRequest() {
  const [requests, setRequests] = useState<Request[]>(mockRequests);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingRequest, setViewingRequest] = useState<Request | null>(null);
  const [deleteRequestId, setDeleteRequestId] = useState<string | null>(null);

  const typeOptions = [
    { value: "all", label: "Tất cả loại yêu cầu" },
    { value: "refund", label: "Hoàn tiền" },
    { value: "change_presenter", label: "Đổi diễn giả" },
    { value: "change_session", label: "Đổi phiên" },
  ];

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "pending", label: "Chờ xử lý" },
    { value: "approved", label: "Đã phê duyệt" },
    { value: "rejected", label: "Đã từ chối" },
    { value: "more_info", label: "Cần thêm thông tin" },
  ];

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.conferenceName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || request.type === filterType;
    const matchesStatus =
      filterStatus === "all" || request.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreate = () => {
    setIsFormModalOpen(true);
  };

  const handleView = (request: Request) => {
    setViewingRequest(request);
    setIsDetailModalOpen(true);
  };

  const handleSave = (data: CreateRequestDto) => {
    const newRequest: Request = {
      ...data,
      id: `req-${Date.now()}`,
      userId: "current-user-id", // Get from auth context
      userName: "Current User Name",
      userEmail: "currentuser@email.com",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setRequests((prev) => [newRequest, ...prev]);
    toast.success("Gửi yêu cầu thành công!");
    setIsFormModalOpen(false);
  };

  const handleUpdateStatus = (id: string, data: UpdateRequestStatusDto) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: data.status,
              reviewNote: data.reviewNote,
              reviewedBy: "Organizer Name", // Get from auth context
              updatedAt: new Date(),
            }
          : r,
      ),
    );
    toast.success("Cập nhật trạng thái yêu cầu thành công!");
    setIsDetailModalOpen(false);
    setViewingRequest(null);
  };

  const handleDelete = (id: string) => {
    setDeleteRequestId(id);
  };

  const confirmDelete = () => {
    if (deleteRequestId) {
      setRequests((prev) => prev.filter((r) => r.id !== deleteRequestId));
      toast.success("Xóa yêu cầu thành công!");
      setDeleteRequestId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý Yêu cầu
            </h1>
            <Button
              onClick={handleCreate}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Tạo yêu cầu mới
            </Button>
          </div>
          <p className="text-gray-600 mt-2">
            Quản lý các yêu cầu từ người dùng về hoàn tiền, thay đổi diễn giả và
            phiên
          </p>
        </div>

        {/* Search & Filter */}
        <SearchFilter
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Tìm kiếm yêu cầu..."
          filters={[
            {
              value: filterType,
              onValueChange: setFilterType,
              options: typeOptions,
            },
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
                <p className="text-sm text-gray-600 mb-1">Chờ xử lý</p>
                <p className="text-3xl font-bold text-orange-600">
                  {requests.filter((r) => r.status === "pending").length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đã phê duyệt</p>
                <p className="text-3xl font-bold text-green-600">
                  {requests.filter((r) => r.status === "approved").length}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đã từ chối</p>
                <p className="text-3xl font-bold text-red-600">
                  {requests.filter((r) => r.status === "rejected").length}
                </p>
              </div>
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Cần thông tin</p>
                <p className="text-3xl font-bold text-blue-600">
                  {requests.filter((r) => r.status === "more_info").length}
                </p>
              </div>
              <AlertCircle className="w-10 h-10 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <RequestTable
            requests={filteredRequests}
            onView={handleView}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title="Tạo yêu cầu mới"
      >
        <RequestForm
          onSave={handleSave}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setViewingRequest(null);
        }}
        title="Chi tiết yêu cầu"
      >
        {viewingRequest && (
          <RequestDetail
            request={viewingRequest}
            onUpdateStatus={handleUpdateStatus}
            onClose={() => {
              setIsDetailModalOpen(false);
              setViewingRequest(null);
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteRequestId}
        onOpenChange={() => setDeleteRequestId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa yêu cầu này? Hành động này không thể
              hoàn tác.
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
