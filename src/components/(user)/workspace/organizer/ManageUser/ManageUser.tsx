"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  UserCheck,
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
import { ApiError } from "@/types/api.type";

import { SearchFilter } from "@/components/molecules/SearchFilter";
import { Modal } from "@/components/molecules/Modal";
import { UserDetail } from "@/components/(user)/workspace/organizer/ManageUser/UserDetail/index";
import { UserForm } from "@/components/(user)/workspace/organizer/ManageUser/UserForm/index";
import { UserTable } from "@/components/(user)/workspace/organizer/ManageUser/UserTable/index";
import { UserProfileResponse, CollaboratorRequest } from "@/types/user.type";
import {
  useGetUsersListQuery,
  useGetProfileByIdQuery,
  useCreateCollaboratorMutation,
  useSuspendAccountMutation,
  useActivateAccountMutation,
} from "@/redux/services/user.service";
import { parseApiError } from "@/helper/api";

export default function ManageUser() {
  // API: Lấy danh sách users
  const {
    data: usersListData,
    isLoading: isLoadingList,
    error: errorList,
    refetch
  } = useGetUsersListQuery();

  const users: UserProfileResponse[] = usersListData?.data?.users || [];

  // API: Mutation tạo collaborator
  const [createCollaborator, { isLoading: isCreating, error: createRawError }] = useCreateCollaboratorMutation();

  // API: Mutation suspend và activate
  const [suspendAccount, { isLoading: isSuspending }] =
    useSuspendAccountMutation();
  const [activateAccount, { isLoading: isActivating }] =
    useActivateAccountMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [suspendUserId, setSuspendUserId] = useState<string | null>(null);
  const [activateUserId, setActivateUserId] = useState<string | null>(null);

  const createError = parseApiError<string>(createRawError);

  // API: Lấy chi tiết user
  const {
    data: userProfileData,
    isLoading: isLoadingProfile
  } = useGetProfileByIdQuery(
    viewingUserId || "",
    { skip: !viewingUserId }
  );

  const viewingUserProfile: UserProfileResponse | undefined =
    userProfileData?.data;

  const roleOptions = [
    { value: "all", label: "Tất cả danh mục" },
    { value: "Customer", label: "Khách hàng" },
    { value: "Collaborator", label: "Cộng tác viên" },
    { value: "Local Reviewer", label: "Người đánh giá địa phương" },
  ];

  const filteredUsers = users.filter((user: UserProfileResponse) => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || user.roles?.includes(filterRole);
    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    if (createError) toast.error(createError.data?.Message);
  }, [createError])

  const handleCreate = () => {
    setIsFormModalOpen(true);
  };

  const handleView = (user: UserProfileResponse) => {
    setViewingUserId(user.userId);
    setIsDetailModalOpen(true);
  };

  const handleSave = async (data: CollaboratorRequest) => {
    try {
      const response = await createCollaborator(data).unwrap();
      toast.success(response.message || "Thêm collaborator thành công!");

      setIsFormModalOpen(false);
      refetch();
    } catch (error: unknown) {
      // const err = error as ApiError;
      // const errorMessage = err?.Message || "Them đối tác thất bại!";
      // toast.error(errorMessage);
    }
  };

  const handleSuspend = (userId: string) => {
    setSuspendUserId(userId);
  };

  const confirmSuspend = async () => {
    if (suspendUserId) {
      try {
        const response = await suspendAccount(suspendUserId).unwrap();
        toast.success(response.message || "Tạm ngưng tài khoản thành công!");
        setSuspendUserId(null);
        refetch();
      } catch (error: unknown) {
        const err = error as ApiError;
        const errorMessage = err?.Message || "Tạm ngưng tài khoản thất bại";
        toast.error(errorMessage);
      }
    }
  };

  const handleActivate = (userId: string) => {
    setActivateUserId(userId);
  };

  const confirmActivate = async () => {
    if (activateUserId) {
      try {
        const response = await activateAccount(activateUserId).unwrap();
        toast.success(response.message || "Kích hoạt tài khoản thành công!");
        setActivateUserId(null);
        refetch();
      } catch (error: unknown) {
        const err = error as ApiError;
        const errorMessage = err?.Message || "Kích hoạt tài khoản thât bại";
        toast.error(errorMessage);
      }
    }
  };

  const countByRole = (role: string): number => {
    return users.filter((u: UserProfileResponse) => u.roles?.includes(role))
      .length;
  };

  if (isLoadingList) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách người dùng...</p>
        </div>
      </div>
    );
  }

  if (errorList) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Không thể tải danh sách người dùng
          </p>
          <Button onClick={() => refetch()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý Người dùng
            </h1>
            <Button
              onClick={handleCreate}
              className="flex items-center gap-2 whitespace-nowrap mt-6"
              disabled={isCreating}
            >
              <Plus className="w-5 h-5" />
              {isCreating ? "Đang thêm..." : "Thêm đối tác"}
            </Button>
          </div>
          <p className="text-gray-600 mt-2">
            Quản lý thông tin người dùng trên ConfRadar
          </p>
        </div>

        <SearchFilter
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Tìm kiếm theo tên, email..."
          filters={[
            {
              value: filterRole,
              onValueChange: setFilterRole,
              options: roleOptions,
            },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng người dùng</p>
                <p className="text-3xl font-bold text-gray-900">
                  {users.length}
                </p>
              </div>
              <UserCheck className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Cộng tác viên</p>
                <p className="text-3xl font-bold text-purple-600">
                  {countByRole("Collaborator")}
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
            onSuspend={handleSuspend}
            onActivate={handleActivate}
          />
        </div>
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title="Thêm người dùng mới"
      >
        <UserForm
          user={null}
          onSave={handleSave}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setViewingUserId(null);
        }}
        title="Chi tiết người dùng"
      >
        {isLoadingProfile ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 ml-3">Đang tải thông tin chi tiết...</p>
          </div>
        ) : viewingUserProfile ? (
          <UserDetail
            user={viewingUserProfile}
            onClose={() => {
              setIsDetailModalOpen(false);
              setViewingUserId(null);
            }}
          />
        ) : (
          <p className="text-center text-gray-600 py-8">
            Không tìm thấy thông tin người dùng
          </p>
        )}
      </Modal>

      {/* Suspend Confirmation Dialog */}
      <AlertDialog
        open={!!suspendUserId}
        onOpenChange={() => setSuspendUserId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận tạm ngưng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn tạm ngưng tài khoản này? Người dùng sẽ không
              thể đăng nhập cho đến khi được kích hoạt lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSuspend}
              className="bg-orange-600 hover:bg-orange-700"
              disabled={isSuspending}
            >
              {isSuspending ? "Đang xử lý..." : "Tạm ngưng"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activate Confirmation Dialog */}
      <AlertDialog
        open={!!activateUserId}
        onOpenChange={() => setActivateUserId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận kích hoạt</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn kích hoạt lại tài khoản này? Người dùng sẽ
              có thể đăng nhập và sử dụng hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmActivate}
              className="bg-green-600 hover:bg-green-700"
              disabled={isActivating}
            >
              {isActivating ? "Đang xử lý..." : "Kích hoạt"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
