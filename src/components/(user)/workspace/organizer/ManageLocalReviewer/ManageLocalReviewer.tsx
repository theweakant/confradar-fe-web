"use client";

import { useState, useEffect } from "react";
import { Plus, Users } from "lucide-react";
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
import { Modal } from "@/components/molecules/Modal";
import { SearchBar } from "@/components/molecules/SearchBar";
import { StatCard } from "@/components/molecules/StatCard";
import { LocalReviewerTable } from "./LocalReviewerTable";
import { LocalReviewerDetail } from "./LocalReviewerDetail";
import { LocalReviewerForm } from "./LocalReviewerForm";
import {
    useGetUsersListQuery,
    useGetProfileByIdQuery,
    useSuspendAccountMutation,
    useActivateAccountMutation,
    useCreateCollaboratorMutation,
    useCreateLocalReviewerAccountMutation
} from "@/redux/services/user.service";
import {
    ListUserDetailForAdminAndOrganizerResponse,
    UserDetailForAdminAndOrganizerResponse,
    CreateLocalReviewerRequest
} from "@/types/user.type";
import { toast } from "sonner";
import { ApiError } from "@/types/api.type";
import { parseApiError } from "@/helper/api";

export default function ManageLocalReviewer() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [viewingUserId, setViewingUserId] = useState<string | null>(null);
    const [suspendUserId, setSuspendUserId] = useState<string | null>(null);
    const [suspendReason, setSuspendReason] = useState("");
    const [activateUserId, setActivateUserId] = useState<string | null>(null);

    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // API hooks
    const {
        data: allUsers,
        isLoading: isLoadingList,
        error: errorList,
        refetch
    } = useGetUsersListQuery();

    const [suspendAccount, { isLoading: isSuspending }] = useSuspendAccountMutation();
    const [activateAccount, { isLoading: isActivating }] = useActivateAccountMutation();
    const [createLocalReviewer, { isLoading: isCreating, error: createRawError }] = useCreateLocalReviewerAccountMutation();

    const createError = parseApiError<string>(createRawError);

    // API: Lấy chi tiết user khi view
    const {
        data: userProfileData,
        isLoading: isLoadingProfile
    } = useGetProfileByIdQuery(
        viewingUserId || "",
        { skip: !viewingUserId }
    );

    const allUsersData: ListUserDetailForAdminAndOrganizerResponse[] =
        Array.isArray(allUsers?.data) ? allUsers.data : [];

    // Filter users to only show local reviewers
    const localReviewerRole = allUsersData.find(
        (roleGroup): roleGroup is ListUserDetailForAdminAndOrganizerResponse =>
            roleGroup.roleName.toLowerCase() === "local reviewer"
    );

    const localReviewers: UserDetailForAdminAndOrganizerResponse[] =
        localReviewerRole?.users ?? [];

    const viewingUserProfile = localReviewers.find(
        r => r.userId === viewingUserId
    );

    // Search functionality
    const filteredLocalReviewers = localReviewers.filter(reviewer => {
        const matchesSearch =
            reviewer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reviewer.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            filterStatus === 'all' ? true :
                filterStatus === 'active' ? reviewer.isActive === true :
                    reviewer.isActive === false;

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredLocalReviewers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedReviewers = filteredLocalReviewers.slice(startIndex, endIndex);

    // const filteredLocalReviewers = localReviewers.filter(reviewer =>
    //     reviewer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //     reviewer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    // );

    // Show toast when create error occurs
    useEffect(() => {
        if (createError) toast.error(createError.data?.message);
    }, [createError]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    const handleCreate = () => {
        setIsFormModalOpen(true);
    };

    const handleView = (reviewer: UserDetailForAdminAndOrganizerResponse) => {
        setViewingUserId(reviewer.userId);
        setIsDetailModalOpen(true);
    };

    const handleSave = async (data: CreateLocalReviewerRequest) => {
        try {
            const reviewerData = { ...data, roleName: 'Local Reviewer' };
            const response = await createLocalReviewer(reviewerData).unwrap();
            toast.success(response.message || "Thêm người đánh giá nội bộ thành công!");
            setIsFormModalOpen(false);
            refetch();
        } catch (error: unknown) {
            // Error already handled by useEffect with createError
        }
    };

    const handleSuspend = (userId: string) => {
        setSuspendUserId(userId);
    };

    const confirmSuspend = async () => {
        if (suspendUserId) {
            try {
                const response = await suspendAccount({
                    userId: suspendUserId,
                    reason: suspendReason
                }).unwrap();
                toast.success(response.message || "Tạm ngưng tài khoản thành công!");
                setSuspendUserId(null);
                setSuspendReason("");
                refetch();
            } catch (error: unknown) {
                const err = error as ApiError;
                const errorMessage = err?.message || "Tạm ngưng tài khoản thất bại";
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
                const errorMessage = err?.message || "Kích hoạt tài khoản thất bại";
                toast.error(errorMessage);
            }
        }
    };

    const stats = [
        {
            title: "Tổng số người đánh giá nội bộ",
            value: localReviewers.length.toString(),
            icon: Users,
        },
        {
            title: "Đang hoạt động",
            value: localReviewers.filter(r => r.isActive === true).length.toString(),
            icon: Users,
        },
        {
            title: "Tạm ngưng",
            value: localReviewers.filter(r => r.isActive === false).length.toString(),
            icon: Users,
        }
    ];

    if (isLoadingList) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải danh sách người đánh giá nội bộ...</p>
                </div>
            </div>
        );
    }

    if (errorList) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">
                        Không thể tải danh sách người đánh giá nội bộ
                    </p>
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Thử lại
                    </button>
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
                        <h1 className="text-3xl font-bold text-gray-900">
                            Người đánh giá nội bộ của tổ chức
                        </h1>
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isCreating}
                        >
                            <Plus className="w-5 h-5" />
                            {isCreating ? "Đang thêm..." : "Thêm người đánh giá nội bộ"}
                        </button>
                    </div>
                    <p className="text-gray-600 mt-2">
                        Quản lý tài khoản người đánh giá nội bộ hệ thống
                    </p>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <SearchBar
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Tìm kiếm theo tên, email..."
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        Tất cả ({localReviewers.length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('active')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'active'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        Đang hoạt động ({localReviewers.filter(r => r.isActive === true).length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('inactive')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'inactive'
                            ? 'bg-red-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        Tạm ngưng ({localReviewers.filter(r => r.isActive === false).length})
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {stats.map((stat, index) => (
                        <StatCard
                            key={index}
                            title={stat.title}
                            value={stat.value}
                            icon={<stat.icon className="w-5 h-5" />}
                            color="green"
                        />
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <LocalReviewerTable
                        reviewers={paginatedReviewers}
                        onView={handleView}
                        onSuspend={handleSuspend}
                        onActivate={handleActivate}
                    />
                </div>

                {totalPages > 1 && (
                    <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{' '}
                            <span className="font-medium">{Math.min(endIndex, filteredLocalReviewers.length)}</span> trong tổng số{' '}
                            <span className="font-medium">{filteredLocalReviewers.length}</span> kết quả
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>
                            {[...Array(totalPages)].map((_, index) => {
                                const page = index + 1;
                                if (
                                    page === 1 ||
                                    page === totalPages ||
                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === page
                                                ? 'bg-blue-600 text-white'
                                                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                } else if (
                                    page === currentPage - 2 ||
                                    page === currentPage + 2
                                ) {
                                    return <span key={page} className="px-2 py-1">...</span>;
                                }
                                return null;
                            })}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Form Modal */}
            <Modal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                title="Thêm người đánh giá nội bộ mới"
            >
                <LocalReviewerForm
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
                title="Chi tiết người đánh giá nội bộ"
            >
                {isLoadingProfile ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-gray-600 ml-3">Đang tải thông tin chi tiết...</p>
                    </div>
                ) : viewingUserProfile ? (
                    <LocalReviewerDetail
                        reviewer={viewingUserProfile}
                        onClose={() => {
                            setIsDetailModalOpen(false);
                            setViewingUserId(null);
                        }}
                    />
                ) : (
                    <p className="text-center text-gray-600 py-8">
                        Không tìm thấy thông tin người đánh giá nội bộ
                    </p>
                )}
            </Modal>

            {/* Suspend Confirmation Dialog */}
            <AlertDialog
                open={!!suspendUserId}
                onOpenChange={() => {
                    setSuspendUserId(null);
                    setSuspendReason("");
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận tạm ngưng</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn tạm ngưng tài khoản người đánh giá nội bộ này?
                            Họ sẽ không thể đăng nhập cho đến khi được kích hoạt lại.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="my-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lý do tạm ngưng <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={suspendReason}
                            onChange={(e) => setSuspendReason(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px]"
                            placeholder="Nhập lý do tạm ngưng tài khoản..."
                            required
                        />
                        {suspendReason.trim().length === 0 && (
                            <p className="text-xs text-red-500 mt-1">
                                Vui lòng nhập lý do tạm ngưng
                            </p>
                        )}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmSuspend}
                            className="bg-orange-600 hover:bg-orange-700"
                            disabled={isSuspending || suspendReason.trim().length === 0}

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
                            Bạn có chắc chắn muốn kích hoạt lại tài khoản người đánh giá nội bộ này?
                            Họ sẽ có thể đăng nhập và sử dụng hệ thống.
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