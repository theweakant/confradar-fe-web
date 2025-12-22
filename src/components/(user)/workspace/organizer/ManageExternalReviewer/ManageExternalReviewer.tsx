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
    useCreateCollaboratorMutation,
    useSuspendExternalReviewerMutation,
    useActivateExternalReviewerMutation
} from "@/redux/services/user.service";
import {
    useCreateReviewContractForNewUserMutation,
    useCreateReviewContractMutation,
    useGetUsersForReviewerContractQuery
} from "@/redux/services/contract.service";
import { useGetResearchConferencesForOrganizerQuery } from "@/redux/services/conference.service";
import {
    ListUserDetailForAdminAndOrganizerResponse,
    UserDetailForAdminAndOrganizerResponse,
    CollaboratorRequest
} from "@/types/user.type";
import { CreateNewReviewerContractRequest, CreateReviewerContractRequest } from "@/types/contract.type";
import { toast } from "sonner";
import { ApiError } from "@/types/api.type";
import { parseApiError } from "@/helper/api";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";
import { Conference } from "@/types/conference.type";
import { useGetAllConferenceStatusesQuery } from "@/redux/services/status.service";
import { ConferenceSelectionDialog } from "./ConferenceSelectionDialog";

export default function ManageExternalReviewer() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isContractModalOpen, setIsContractModalOpen] = useState(false);
    const [viewingUserId, setViewingUserId] = useState<string | null>(null);
    const [suspendUserId, setSuspendUserId] = useState<string | null>(null);
    const [activateUserId, setActivateUserId] = useState<string | null>(null);

    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Contract form state
    const [contractForm, setContractForm] = useState({
        reviewerId: "",
        wage: "",
        conferenceId: "",
        signDay: "",
        contractFile: null as File | null
    });


    const [isSelectConferenceForContractOpen, setIsSelectConferenceForContractOpen] = useState(false);
    const [isSelectConferenceForFormOpen, setIsSelectConferenceForFormOpen] = useState(false);
    const [selectedConferenceForContract, setSelectedConferenceForContract] = useState<Conference | null>(null);
    const [selectedConferenceForForm, setSelectedConferenceForForm] = useState<Conference | null>(null);

    const [conferenceFilters, setConferenceFilters] = useState({
        page: 1,
        pageSize: 9,
        searchKeyword: "",
        cityId: "",
        conferenceStatusId: "",
        startDate: "",
        endDate: ""
    });

    // API hooks
    const {
        data: allUsers,
        isLoading: isLoadingList,
        error: errorList,
        refetch
    } = useGetUsersListQuery();

    const [suspendAccount, { isLoading: isSuspending }] = useSuspendExternalReviewerMutation();
    const [activateAccount, { isLoading: isActivating }] = useActivateExternalReviewerMutation();
    const [createReviewerWithContract, { isLoading: isCreatingReviewerWithContract, error: createRawError }] =
        useCreateReviewContractForNewUserMutation();


    // Contract API hooks
    const [createReviewContract, { isLoading: isCreatingContract, error: contractRawError }] = useCreateReviewContractMutation();
    const { data: conferencesData, isLoading: isLoadingConferences } = useGetResearchConferencesForOrganizerQuery({
        page: conferenceFilters.page,
        pageSize: conferenceFilters.pageSize,
        conferenceStatusId: conferenceFilters.conferenceStatusId,
        searchKeyword: conferenceFilters.searchKeyword,
        cityId: conferenceFilters.cityId,
        startDate: conferenceFilters.startDate,
        endDate: conferenceFilters.endDate
    }, {
        skip: !isSelectConferenceForContractOpen && !isSelectConferenceForFormOpen
    });
    const { data: reviewersData } = useGetUsersForReviewerContractQuery(
        { conferenceId: contractForm.conferenceId },
        { skip: !contractForm.conferenceId }
    );
    const { data: citiesData } = useGetAllCitiesQuery();
    const { data: conferenceStatusesData } = useGetAllConferenceStatusesQuery();

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
    const filteredExternalReviewers = externalReviewers.filter(reviewer => {
        const matchesSearch =
            reviewer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reviewer.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            filterStatus === 'all' ? true :
                filterStatus === 'active' ? reviewer.isActive === true :
                    reviewer.isActive === false;

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredExternalReviewers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedReviewers = filteredExternalReviewers.slice(startIndex, endIndex);

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // const formatVND = (value?: string) => {
    //     if (value === undefined || value === null || value === "") return "";

    //     const numberValue =
    //         typeof value === "string" ? Number(value) : value;

    //     if (isNaN(numberValue)) return "";

    //     return numberValue.toLocaleString("vi-VN");
    // };

    const formatVND = (value: string) => {
        if (!value) return "";
        return Number(value).toLocaleString("vi-VN");
    };

    const unformatVND = (value: string) => {
        return value.replace(/\D/g, "");
    };

    // Show toast when errors occur
    useEffect(() => {
        if (createError) toast.error(createError.data?.message);
    }, [createError]);

    useEffect(() => {
        if (contractError) toast.error(contractError.data?.message);
    }, [contractError]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    // const handleSelectConference = (conference: Conference) => {
    //     setSelectedConference(conference);
    //     setContractForm({ ...contractForm, conferenceId: conference.conferenceId });
    //     setIsSelectConferenceOpen(false);
    //     // Reset filters về default
    //     setConferenceFilters({
    //         page: 1,
    //         pageSize: 9,
    //         searchKeyword: "",
    //         cityId: "",
    //         conferenceStatusId: "",
    //         startDate: "",
    //         endDate: ""
    //     });
    // };

    // const handleChangeConference = () => {
    //     setIsSelectConferenceOpen(true);
    // };

    // const handleBackToForm = () => {
    //     setIsSelectConferenceOpen(false);
    //     // Reset filters về default
    //     setConferenceFilters({
    //         page: 1,
    //         pageSize: 9,
    //         searchKeyword: "",
    //         cityId: "",
    //         conferenceStatusId: "",
    //         startDate: "",
    //         endDate: ""
    //     });
    // };

    const handleFilterChange = (key: string, value: string | number | Date) => {
        setConferenceFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1
        }));
    };

    const handlePageChange = (newPage: number) => {
        setConferenceFilters(prev => ({
            ...prev,
            page: newPage
        }));
    };

    const handleClearFilters = () => {
        setConferenceFilters({
            page: 1,
            pageSize: 9,
            searchKeyword: "",
            cityId: "",
            conferenceStatusId: "",
            startDate: "",
            endDate: ""
        });
    };

    const handleSelectConferenceForContract = (conference: Conference) => {
        setSelectedConferenceForContract(conference);
        setContractForm({ ...contractForm, conferenceId: conference.conferenceId });
        setIsSelectConferenceForContractOpen(false);
        handleClearFilters();
    };

    const handleChangeConferenceForContract = () => {
        setIsSelectConferenceForContractOpen(true);
    };

    const handleCloseConferenceDialogForContract = () => {
        setIsSelectConferenceForContractOpen(false);
        handleClearFilters();
    };

    // Handlers cho Form Dialog
    const handleSelectConferenceForForm = (conference: Conference) => {
        setSelectedConferenceForForm(conference);
        setIsSelectConferenceForFormOpen(false);
        handleClearFilters();
    };

    const handleOpenConferenceDialogForForm = () => {
        setIsSelectConferenceForFormOpen(true);
    };

    const handleChangeConferenceForForm = () => {
        setIsSelectConferenceForFormOpen(true);
    };

    const handleCloseConferenceDialogForForm = () => {
        setIsSelectConferenceForFormOpen(false);
        handleClearFilters();
    };

    // const getSortedConferences = (conferences: any[]) => {
    //     if (!conferences) return [];

    //     const sorted = [...conferences];
    //     if (conferenceSortBy === "name") {
    //         return sorted.sort((a, b) =>
    //             (a.conferenceName || "").localeCompare(b.conferenceName || "")
    //         );
    //     } else {
    //         return sorted.sort((a, b) =>
    //             new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime()
    //         );
    //     }
    // };

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

    const handleSave = async (data: CreateNewReviewerContractRequest) => {
        try {
            const response = await createReviewerWithContract(data).unwrap();
            toast.success(response.message || "Tạo người đánh giá và hợp đồng thành công!");
            setIsFormModalOpen(false);
            // setFormModalConferenceId("");
            setSelectedConferenceForForm(null);
            refetch();
        } catch (error: unknown) {
            // Error already handled by useEffect
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
                                disabled={isCreatingReviewerWithContract}
                            >
                                <Plus className="w-5 h-5" />
                                {isCreatingReviewerWithContract ? "Đang thêm..." : "Thêm người đánh giá theo hợp đồng"}
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

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        Tất cả ({externalReviewers.length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('active')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'active'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        Đang hoạt động ({externalReviewers.filter(r => r.isActive === true).length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('inactive')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'inactive'
                            ? 'bg-red-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        Tạm ngưng ({externalReviewers.filter(r => r.isActive === false).length})
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
                    <ExternalReviewerTable
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
                            <span className="font-medium">{Math.min(endIndex, filteredExternalReviewers.length)}</span> trong tổng số{' '}
                            <span className="font-medium">{filteredExternalReviewers.length}</span> kết quả
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
                onClose={() => {
                    setIsFormModalOpen(false);
                    setSelectedConferenceForForm(null);
                }}
                title="Thêm người đánh giá theo hợp đồng mới"
            >
                <ExternalReviewerForm
                    onSave={handleSave}
                    onCancel={() => {
                        setIsFormModalOpen(false);
                        setSelectedConferenceForForm(null);
                    }}
                    isLoading={isCreatingReviewerWithContract}
                    selectedConference={selectedConferenceForForm}
                    onSelectConference={handleOpenConferenceDialogForForm}
                    onChangeConference={handleChangeConferenceForForm}
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
                                            {selectedConferenceForContract ? (
                                                <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
                                                    <div className="flex items-start gap-3">
                                                        {selectedConferenceForContract.bannerImageUrl && (
                                                            <img
                                                                src={selectedConferenceForContract.bannerImageUrl}
                                                                alt={selectedConferenceForContract.conferenceName}
                                                                className="w-16 h-16 rounded object-cover flex-shrink-0"
                                                            />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-gray-900 truncate">
                                                                {selectedConferenceForContract.conferenceName}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                ID: {selectedConferenceForContract.conferenceId}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={handleChangeConferenceForContract}
                                                            className="text-sm text-blue-600 hover:text-blue-700 whitespace-nowrap"
                                                        >
                                                            Đổi
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsSelectConferenceForContractOpen(true)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-left text-gray-500 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    Chọn hội nghị nghiên cứu
                                                </button>
                                            )}
                                        </div>
                                        {/* <div>
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
                                        </div> */}

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
                                                Tiền công (VND) *
                                            </label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                // value={contractForm.wage}
                                                // onChange={(e) => setContractForm({ ...contractForm, wage: e.target.value })}
                                                value={formatVND(contractForm.wage)}
                                                onChange={(e) => {
                                                    const rawValue = unformatVND(e.target.value);

                                                    setContractForm({
                                                        ...contractForm,
                                                        wage: rawValue,
                                                    });
                                                }}
                                                placeholder="5.000.000"
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

            <ConferenceSelectionDialog
                isOpen={isSelectConferenceForContractOpen}
                onClose={handleCloseConferenceDialogForContract}
                onSelectConference={handleSelectConferenceForContract}
                conferencesData={conferencesData}
                isLoadingConferences={isLoadingConferences}
                citiesData={citiesData}
                conferenceStatusesData={conferenceStatusesData}
                conferenceFilters={conferenceFilters}
                onFilterChange={handleFilterChange}
                onPageChange={handlePageChange}
                onClearFilters={handleClearFilters}
            />

            <ConferenceSelectionDialog
                isOpen={isSelectConferenceForFormOpen}
                onClose={handleCloseConferenceDialogForForm}
                onSelectConference={handleSelectConferenceForForm}
                conferencesData={conferencesData}
                isLoadingConferences={isLoadingConferences}
                citiesData={citiesData}
                conferenceStatusesData={conferenceStatusesData}
                conferenceFilters={conferenceFilters}
                onFilterChange={handleFilterChange}
                onPageChange={handlePageChange}
                onClearFilters={handleClearFilters}
            />

            {/* Select Conference Dialog */}
            {/* <Transition appear show={isSelectConferenceOpen} as={Fragment}>
                <Dialog as="div" className="relative z-20" onClose={handleBackToForm}>
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
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    
                                    <div className="flex items-center justify-between mb-4">
                                        <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                                            Chọn hội nghị nghiên cứu
                                        </Dialog.Title>
                                        <button
                                            onClick={handleBackToForm}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    
                                    <div className="space-y-3 mb-4">
                                       
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Tìm kiếm theo tên hội nghị..."
                                                value={conferenceFilters.searchKeyword}
                                                onChange={(e) => handleFilterChange('searchKeyword', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <select
                                                value={conferenceFilters.cityId}
                                                onChange={(e) => handleFilterChange('cityId', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Tất cả thành phố</option>
                                                {citiesData?.data?.map((city) => (
                                                    <option key={city.cityId} value={city.cityId}>
                                                        {city.cityName}
                                                    </option>
                                                ))}
                                            </select>

                                            <select
                                                value={conferenceFilters.conferenceStatusId}
                                                onChange={(e) => handleFilterChange('conferenceStatusId', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Tất cả trạng thái</option>
                                               
                                                {conferenceStatusesData?.data?.map((status: any) => (
                                                    <option key={status.statusId} value={status.statusId}>
                                                        {status.statusName}
                                                    </option>
                                                ))}
                                              
                                            </select>

                                            <select
                                                value={conferenceFilters.pageSize}
                                                onChange={(e) => handleFilterChange('pageSize', parseInt(e.target.value))}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="6">6 / trang</option>
                                                <option value="9">9 / trang</option>
                                                <option value="12">12 / trang</option>
                                                <option value="18">18 / trang</option>
                                            </select>
                                        </div>

                                   
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">Từ ngày</label>
                                                <input
                                                    type="date"
                                                    value={conferenceFilters.startDate}
                                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">Đến ngày</label>
                                                <input
                                                    type="date"
                                                    value={conferenceFilters.endDate}
                                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>

                                        
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => setConferenceFilters({
                                                    page: 1,
                                                    pageSize: 9,
                                                    searchKeyword: "",
                                                    cityId: "",
                                                    conferenceStatusId: "",
                                                    startDate: "",
                                                    endDate: ""
                                                })}
                                                className="text-sm text-blue-600 hover:text-blue-700"
                                            >
                                                Xóa tất cả bộ lọc
                                            </button>
                                        </div>
                                    </div>

                                 
                                    {isLoadingConferences ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            <p className="text-gray-600 ml-3">Đang tải danh sách hội nghị...</p>
                                        </div>
                                    ) : (conferencesData?.data?.items?.length ?? 0) > 0 ? (
                                        <>
                                         
                                            <div className="text-sm text-gray-600 mb-3">
                                                Tìm thấy {conferencesData?.data.totalItems || conferencesData?.data.totalCount} hội nghị
                                            </div>

                                            
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto mb-4">
                                                {conferencesData?.data.items.map((conference) => (
                                                    <div
                                                        key={conference.conferenceId}
                                                        onClick={() => handleSelectConference(conference)}
                                                        className="border border-gray-200 rounded-lg p-3 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all"
                                                    >
                                                        {conference.bannerImageUrl ? (
                                                            <img
                                                                src={conference.bannerImageUrl}
                                                                alt={conference.conferenceName}
                                                                className="w-full h-32 object-cover rounded-md mb-2"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-32 bg-gray-200 rounded-md mb-2 flex items-center justify-center">
                                                                <span className="text-gray-400 text-sm">Không có ảnh</span>
                                                            </div>
                                                        )}
                                                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                                                            {conference.conferenceName}
                                                        </h4>
                                                        <p className="text-xs text-gray-500 mb-1">
                                                            ID: {conference.conferenceId}
                                                        </p>
                                                        {conference.startDate && (
                                                            <p className="text-xs text-gray-500">
                                                                📅 {formatDate(conference.startDate)}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                          
                                            {(conferencesData?.data?.totalPages ?? 0) > 1 && (
                                                <div className="flex items-center justify-between border-t pt-4">
                                                    <div className="text-sm text-gray-600">
                                                        Trang {conferenceFilters.page} / {conferencesData?.data.totalPages}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handlePageChange(1)}
                                                            disabled={conferenceFilters.page === 1}
                                                            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                                        >
                                                            Đầu
                                                        </button>
                                                        <button
                                                            onClick={() => handlePageChange(conferenceFilters.page - 1)}
                                                            disabled={conferenceFilters.page === 1}
                                                            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                                        >
                                                            Trước
                                                        </button>
                                                        <span className="px-3 py-1 text-sm text-gray-700">
                                                            {conferenceFilters.page}
                                                        </span>
                                                        <button
                                                            onClick={() => handlePageChange(conferenceFilters.page + 1)}
                                                            disabled={conferenceFilters.page === conferencesData?.data.totalPages}
                                                            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                                        >
                                                            Sau
                                                        </button>
                                                        <button
                                                            onClick={() => handlePageChange(conferencesData?.data?.totalPages ?? 1)}
                                                            disabled={conferenceFilters.page === (conferencesData?.data?.totalPages ?? 1)}
                                                            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                                        >
                                                            Cuối
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            Không tìm thấy hội nghị nào
                                        </div>
                                    )}

                                 
                                    <div className="flex justify-start mt-4 pt-4 border-t">
                                        <button
                                            onClick={handleBackToForm}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                        >
                                            ← Quay lại form
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition> */}

            {/* <Transition appear show={isSelectConferenceOpen} as={Fragment}>
                <Dialog as="div" className="relative z-20" onClose={handleBackToForm}>
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
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <div className="flex items-center justify-between mb-4">
                                        <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                                            Chọn hội nghị nghiên cứu
                                        </Dialog.Title>
                                        <button
                                            onClick={handleBackToForm}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="flex gap-3 mb-4">
                                        <input
                                            type="text"
                                            placeholder="Tìm kiếm theo tên..."
                                            value={conferenceSearchTerm}
                                            onChange={(e) => {
                                                setConferenceSearchTerm(e.target.value);
                                                setConferencePage(1);
                                            }}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <select
                                            value={selectedCityFilter}
                                            onChange={(e) => {
                                                setSelectedCityFilter(e.target.value);
                                                setConferencePage(1);
                                            }}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Tất cả thành phố</option>
                                            {citiesData?.data?.map((city) => (
                                                <option key={city.cityId} value={city.cityId}>
                                                    {city.cityName}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            value={conferenceSortBy}
                                            onChange={(e) => setConferenceSortBy(e.target.value as "name" | "date")}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="name">Sắp xếp theo tên</option>
                                            <option value="date">Sắp xếp theo ngày</option>
                                        </select>
                                    </div>

                                    {isLoadingConferences ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto mb-4">
                                                {getSortedConferences(conferencesData?.data?.items || []).map((conference) => (
                                                    <div
                                                        key={conference.conferenceId}
                                                        onClick={() => handleSelectConference(conference)}
                                                        className="border border-gray-200 rounded-lg p-3 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all"
                                                    >
                                                        {conference.bannerImageUrl && (
                                                            <img
                                                                src={conference.bannerImageUrl}
                                                                alt={conference.conferenceName}
                                                                className="w-full h-32 object-cover rounded-md mb-2"
                                                            />
                                                        )}
                                                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                                                            {conference.conferenceName}
                                                        </h4>
                                                        <p className="text-xs text-gray-500">
                                                            ID: {conference.conferenceId}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>

                                            {conferencesData?.data && conferencesData.data.totalPages > 1 && (
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => setConferencePage(prev => Math.max(1, prev - 1))}
                                                        disabled={conferencePage === 1}
                                                        className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                                    >
                                                        Trước
                                                    </button>
                                                    <span className="text-sm text-gray-600">
                                                        Trang {conferencePage} / {conferencesData.data.totalPages}
                                                    </span>
                                                    <button
                                                        onClick={() => setConferencePage(prev => Math.min(conferencesData.data.totalPages, prev + 1))}
                                                        disabled={conferencePage === conferencesData.data.totalPages}
                                                        className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                                    >
                                                        Sau
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    <div className="flex justify-start mt-4 pt-4 border-t">
                                        <button
                                            onClick={handleBackToForm}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                        >
                                            ← Quay lại form
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition> */}
        </div>
    );
}