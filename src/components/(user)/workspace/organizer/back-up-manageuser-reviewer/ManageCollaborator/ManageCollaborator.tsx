"use client";
import { useEffect, useState } from "react";
import { Plus, Shield } from "lucide-react";
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
    useActivateAccountMutation
} from "@/redux/services/user.service";
import { parseApiError } from "@/helper/api";

export default function ManageCollaborator() {
    // API: Lấy danh sách users
    const {
        data: usersListData,
        isLoading: isLoadingList,
        error: errorList,
        refetch
    } = useGetUsersListQuery();

    const allUsers: UserProfileResponse[] = usersListData?.data?.users || [];

    // Lọc chỉ lấy Collaborator
    const collaborators = allUsers.filter((user: UserProfileResponse) =>
        user.roles?.includes("Collaborator")
    );

    // API: Mutation tạo collaborator
    const [createCollaborator, { isLoading: isCreating, error: createRawError }] =
        useCreateCollaboratorMutation();

    // API: Mutation suspend và activate
    const [suspendAccount, { isLoading: isSuspending }] = useSuspendAccountMutation();
    const [activateAccount, { isLoading: isActivating }] = useActivateAccountMutation();

    // States
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
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

    const viewingUserProfile: UserProfileResponse | undefined = userProfileData?.data;

    const statusOptions = [
        { value: "all", label: "Tất cả trạng thái" },
        { value: "active", label: "Đang hoạt động" },
        { value: "suspended", label: "Tạm ngưng" }
    ];

    // Lọc collaborator theo search và status
    const filteredCollaborators = collaborators.filter((user: UserProfileResponse) => {
        const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());

        // const matchesStatus = filterStatus === "all" ||
        //     (filterStatus === "active" && user. === "Active") ||
        //     (filterStatus === "suspended" && user.status === "Suspended");

        return matchesSearch;
    });

    useEffect(() => {
        if (createError) toast.error(createError.data?.Message);
    }, [createError]);

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
            toast.success(response.message || "Thêm cộng tác viên thành công!");
            setIsFormModalOpen(false);
            refetch();
        } catch (error: unknown) {
            // Error đã được handle ở useEffect
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
                const errorMessage = err?.Message || "Kích hoạt tài khoản thất bại";
                toast.error(errorMessage);
            }
        }
    };

    // Thống kê
    // const activeCount = collaborators.filter(u => u.status === "Active").length;
    // const suspendedCount = collaborators.filter(u => u.status === "Suspended").length;

    if (isLoadingList) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải danh sách cộng tác viên...</p>
                </div>
            </div>
        );
    }

    if (errorList) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Không thể tải danh sách cộng tác viên</p>
                    <Button onClick={() => refetch()}>Thử lại</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">Quản lý Cộng tác viên</h1>
                        <Button
                            onClick={handleCreate}
                            className="flex items-center gap-2 whitespace-nowrap mt-6 bg-purple-600 hover:bg-purple-700"
                            disabled={isCreating}
                        >
                            <Plus className="w-5 h-5" />
                            {isCreating ? "Đang thêm..." : "Thêm cộng tác viên"}
                        </Button>
                    </div>
                    <p className="text-gray-600 mt-2">
                        Quản lý thông tin cộng tác viên trên ConfRadar
                    </p>
                </div>

                {/* Search & Filter */}
                <SearchFilter
                    searchValue={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="Tìm kiếm theo tên, email cộng tác viên..."
                    filters={[
                        {
                            value: filterStatus,
                            onValueChange: setFilterStatus,
                            options: statusOptions,
                        }
                    ]}
                />

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Tổng cộng tác viên</p>
                                <p className="text-3xl font-bold text-purple-600">{collaborators.length}</p>
                            </div>
                            <Shield className="w-10 h-10 text-purple-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Đang hoạt động</p>
                                {/* <p className="text-3xl font-bold text-green-600">{activeCount}</p> */}
                            </div>
                            <Shield className="w-10 h-10 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Tạm ngưng</p>
                                {/* <p className="text-3xl font-bold text-orange-600">{suspendedCount}</p> */}
                            </div>
                            <Shield className="w-10 h-10 text-orange-500" />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <UserTable
                        users={filteredCollaborators}
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
                title="Thêm cộng tác viên mới"
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
                title="Chi tiết cộng tác viên"
            >
                {isLoadingProfile ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
                    <p className="text-center text-gray-600 py-8">Không tìm thấy thông tin cộng tác viên</p>
                )}
            </Modal>

            {/* Suspend Confirmation Dialog */}
            <AlertDialog open={!!suspendUserId} onOpenChange={() => setSuspendUserId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận tạm ngưng</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn tạm ngưng cộng tác viên này? Họ sẽ không thể đăng nhập cho đến khi được kích hoạt lại.
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
            <AlertDialog open={!!activateUserId} onOpenChange={() => setActivateUserId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận kích hoạt</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn kích hoạt lại cộng tác viên này? Họ sẽ có thể đăng nhập và sử dụng hệ thống.
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