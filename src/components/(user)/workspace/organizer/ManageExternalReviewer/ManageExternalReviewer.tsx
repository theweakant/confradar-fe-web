"use client";

import { useState, useEffect } from "react";
import { Plus, Users, FileText } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
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
import { ExternalReviewerTable } from "./ExternalReviewerTable";
import { ExternalReviewerDetail } from "./ExternalReviewerDetail";
import { ExternalReviewerForm } from "./ExternalReviewerForm";
import {
    useGetUsersListQuery,
    useGetProfileByIdQuery,
    useSuspendAccountMutation,
    useActivateAccountMutation,
    useCreateCollaboratorMutation
} from "@/redux/services/user.service";
import {
    useCreateReviewContractMutation,
    useGetUsersForReviewerContractQuery
} from "@/redux/services/contract.service";
import { useGetTechConferencesForCollaboratorAndOrganizerQuery } from "@/redux/services/conference.service";
import {
    ListUserDetailForAdminAndOrganizerResponse,
    UserDetailForAdminAndOrganizerResponse,
    CollaboratorRequest
} from "@/types/user.type";
import { CreateReviewerContractRequest } from "@/types/contract.type";
import { toast } from "sonner";
import { ApiError } from "@/types/api.type";
import { parseApiError } from "@/helper/api";

export default function ManageExternalReviewer() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isContractModalOpen, setIsContractModalOpen] = useState(false);
    const [viewingUserId, setViewingUserId] = useState<string | null>(null);
    const [suspendUserId, setSuspendUserId] = useState<string | null>(null);
    const [activateUserId, setActivateUserId] = useState<string | null>(null);

    // Contract form state
    const [contractForm, setContractForm] = useState({
        reviewerId: "",
        wage: "",
        conferenceId: "",
        signDay: "",
        contractFile: null as File | null
    });

    // API hooks
    const {
        data: allUsers,
        isLoading: isLoadingList,
        error: errorList,
        refetch
    } = useGetUsersListQuery();

    const [suspendAccount, { isLoading: isSuspending }] = useSuspendAccountMutation();
    const [activateAccount, { isLoading: isActivating }] = useActivateAccountMutation();
    const [createExternalReviewer, { isLoading: isCreating, error: createRawError }] = useCreateCollaboratorMutation();

    // Contract API hooks
    const [createReviewContract, { isLoading: isCreatingContract, error: contractRawError }] = useCreateReviewContractMutation();
    const { data: conferencesData } = useGetTechConferencesForCollaboratorAndOrganizerQuery({
        page: 1,
        pageSize: 10,
        conferenceStatusId: "Id",   // ví dụ
        searchKeyword: "AI",
        cityId: "Hanoi",
        startDate: "2025-01-01",
        endDate: "2025-12-31"
    });
    const { data: reviewersData } = useGetUsersForReviewerContractQuery(
        { conferenceId: contractForm.conferenceId },
        { skip: !contractForm.conferenceId }
    );

    const createError = parseApiError<string>(createRawError);
    const contractError = parseApiError<string>(contractRawError);

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

    // Filter users to only show external reviewers
    const externalReviewerRole = allUsersData.find(
        (roleGroup): roleGroup is ListUserDetailForAdminAndOrganizerResponse =>
            roleGroup.roleName.toLowerCase() === "external reviewer"
    );

    const externalReviewers: UserDetailForAdminAndOrganizerResponse[] =
        externalReviewerRole?.users ?? [];

    const viewingUserProfile = externalReviewers.find(
        r => r.userId === viewingUserId
    );

    // Search functionality
    const filteredExternalReviewers = externalReviewers.filter(reviewer =>
        reviewer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reviewer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Show toast when errors occur
    useEffect(() => {
        if (createError) toast.error(createError.data?.message);
    }, [createError]);

    useEffect(() => {
        if (contractError) toast.error(contractError.data?.message);
    }, [contractError]);

    const handleCreate = () => {
        setIsFormModalOpen(true);
    };

    const handleCreateContract = () => {
        setIsContractModalOpen(true);
        setContractForm({
            reviewerId: "",
            wage: "",
            conferenceId: "",
            signDay: "",
            contractFile: null
        });
    };

    const handleView = (reviewer: UserDetailForAdminAndOrganizerResponse) => {
        setViewingUserId(reviewer.userId);
        setIsDetailModalOpen(true);
    };

    const handleSave = async (data: CollaboratorRequest) => {
        try {
            const reviewerData = { ...data, roleName: 'External Reviewer' };
            const response = await createExternalReviewer(reviewerData).unwrap();
            toast.success(response.message || "Thêm người đánh giá theo hợp đồng thành công!");
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
                const response = await suspendAccount(suspendUserId).unwrap();
                toast.success(response.message || "Tạm ngưng tài khoản thành công!");
                setSuspendUserId(null);
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

    const handleContractSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!contractForm.reviewerId || !contractForm.wage || !contractForm.conferenceId ||
            !contractForm.signDay || !contractForm.contractFile) {
            toast.error("Vui lòng điền đầy đủ thông tin");
            return;
        }

        try {
            const contractData: CreateReviewerContractRequest = {
                reviewerId: contractForm.reviewerId,
                wage: parseFloat(contractForm.wage),
                conferenceId: contractForm.conferenceId,
                signDay: contractForm.signDay,
                contractFile: contractForm.contractFile
            };

            const response = await createReviewContract(contractData).unwrap();
            toast.success(response.message || "Tạo hợp đồng reviewer thành công!");
            setIsContractModalOpen(false);
            setContractForm({
                reviewerId: "",
                wage: "",
                conferenceId: "",
                signDay: "",
                contractFile: null
            });
        } catch (error: unknown) {
            // Error already handled by useEffect with contractError
        }
    };

    const stats = [
        {
            title: "Tổng số người đánh giá theo hợp đồng",
            value: externalReviewers.length.toString(),
            icon: Users,
        },
        {
            title: "Đang hoạt động",
            value: externalReviewers.filter(r => r.isActive === true).length.toString(),
            icon: Users,
        },
        {
            title: "Tạm ngưng",
            value: externalReviewers.filter(r => r.isActive === false).length.toString(),
            icon: Users,
        }
    ];

    if (isLoadingList) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải danh sách người đánh giá theo hợp đồng...</p>
                </div>
            </div>
        );
    }

    if (errorList) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">
                        Không thể tải danh sách người đánh giá theo hợp đồng
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
                            Quản lý Người đánh giá thuê theo hợp đồng
                        </h1>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleCreate}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isCreating}
                            >
                                <Plus className="w-5 h-5" />
                                {isCreating ? "Đang thêm..." : "Thêm người đánh giá theo hợp đồng"}
                            </button>
                            <button
                                onClick={handleCreateContract}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isCreatingContract}
                            >
                                <FileText className="w-5 h-5" />
                                {isCreatingContract ? "Đang tạo..." : "Tạo hợp đồng"}
                            </button>
                        </div>
                    </div>
                    <p className="text-gray-600 mt-2">
                        Quản lý tài khoản người đánh giá theo hợp đồng trong hệ thống
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
                    <ExternalReviewerTable
                        reviewers={filteredExternalReviewers}
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
                title="Thêm người đánh giá theo hợp đồng mới"
            >
                <ExternalReviewerForm
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
                title="Chi tiết người đánh giá theo hợp đồng"
            >
                {isLoadingProfile ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-gray-600 ml-3">Đang tải thông tin chi tiết...</p>
                    </div>
                ) : viewingUserProfile ? (
                    <ExternalReviewerDetail
                        reviewer={viewingUserProfile}
                        onClose={() => {
                            setIsDetailModalOpen(false);
                            setViewingUserId(null);
                        }}
                    />
                ) : (
                    <p className="text-center text-gray-600 py-8">
                        Không tìm thấy thông tin người đánh giá theo hợp đồng
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
                            Bạn có chắc chắn muốn tạm ngưng tài khoản người đánh giá theo hợp đồng này?
                            Họ sẽ không thể đăng nhập cho đến khi được kích hoạt lại.
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
                            Bạn có chắc chắn muốn kích hoạt lại tài khoản người đánh giá theo hợp đồng này?
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

            {/* Create Contract Dialog */}
            <Transition appear show={isContractModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setIsContractModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900 mb-4"
                                    >
                                        Tạo hợp đồng reviewer
                                    </Dialog.Title>

                                    <form onSubmit={handleContractSubmit} className="space-y-4">
                                        {/* Conference Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Hội nghị *
                                            </label>
                                            <select
                                                value={contractForm.conferenceId}
                                                onChange={(e) => setContractForm({ ...contractForm, conferenceId: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Chọn hội nghị</option>
                                                {conferencesData?.data?.items.map((conf) => (
                                                    <option key={conf.conferenceId} value={conf.conferenceId}>
                                                        {conf.conferenceName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Reviewer Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Reviewer *
                                            </label>
                                            <select
                                                value={contractForm.reviewerId}
                                                onChange={(e) => setContractForm({ ...contractForm, reviewerId: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                                disabled={!contractForm.conferenceId}
                                            >
                                                <option value="">Chọn reviewer</option>
                                                {reviewersData?.data?.map((reviewer) => (
                                                    <option key={reviewer.userId} value={reviewer.userId}>
                                                        {reviewer.fullName} ({reviewer.email})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Wage */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Lương (VND) *
                                            </label>
                                            <input
                                                type="number"
                                                value={contractForm.wage}
                                                onChange={(e) => setContractForm({ ...contractForm, wage: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                                min="0"
                                                step="1000"
                                            />
                                        </div>

                                        {/* Sign Day */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Ngày ký hợp đồng *
                                            </label>
                                            <input
                                                type="date"
                                                value={contractForm.signDay}
                                                onChange={(e) => setContractForm({ ...contractForm, signDay: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        {/* Contract File */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                File hợp đồng *
                                            </label>
                                            <input
                                                type="file"
                                                onChange={(e) => setContractForm({ ...contractForm, contractFile: e.target.files?.[0] || null })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                                accept=".pdf,.doc,.docx"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-3 mt-6">
                                            <button
                                                type="button"
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                                                onClick={() => setIsContractModalOpen(false)}
                                                disabled={isCreatingContract}
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={isCreatingContract}
                                            >
                                                {isCreatingContract ? "Đang tạo..." : "Tạo hợp đồng"}
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}