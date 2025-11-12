"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Users } from "lucide-react";
import { Modal } from "@/components/molecules/Modal";
import { SearchBar } from "@/components/molecules/SearchBar";
import { StatCard } from "@/components/molecules/StatCard";
import { ExternalReviewerTable } from "./ExternalReviewerTable";
import { ExternalReviewerDetail } from "./ExternalReviewerDetail";
import { ExternalReviewerForm } from "./ExternalReviewerForm";
import {
    useGetAllUsersQuery,
    useSuspendUserMutation,
    useActivateUserMutation,
    useCreateCollaboratorMutation
} from "@/redux/services/user.service";
import { UserProfileResponse } from "@/types/user.type";
import { CollaboratorRequest } from "@/types/user.type";

export default function ManageExternalReviewer() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedReviewer, setSelectedReviewer] = useState<UserProfileResponse | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    // API hooks
    const {
        data: allUsers = [],
        isLoading,
        error,
        refetch
    } = useGetAllUsersQuery();

    const [suspendUser, { isLoading: isSuspending }] = useSuspendUserMutation();
    const [activateUser, { isLoading: isActivating }] = useActivateUserMutation();
    const [createCollaborator, { isLoading: isCreating }] = useCreateCollaboratorMutation();

    // Filter users to only show external reviewers
    const externalReviewers = allUsers.filter(
        user => user.role === "externalreviewer"
    );

    // Search functionality
    const filteredReviewers = externalReviewers.filter(reviewer =>
        reviewer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reviewer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewReviewer = (reviewer: UserProfileResponse) => {
        setSelectedReviewer(reviewer);
        setIsDetailModalOpen(true);
    };

    const handleSuspendReviewer = async (userId: string) => {
        try {
            await suspendUser(userId).unwrap();
            refetch();
            console.log("External reviewer suspended successfully");
        } catch (error) {
            console.error("Failed to suspend external reviewer:", error);
        }
    };

    const handleActivateReviewer = async (userId: string) => {
        try {
            await activateUser(userId).unwrap();
            refetch();
            console.log("External reviewer activated successfully");
        } catch (error) {
            console.error("Failed to activate external reviewer:", error);
        }
    };

    const handleCreateReviewer = async (data: CollaboratorRequest) => {
        try {
            await createCollaborator(data).unwrap();
            setIsFormModalOpen(false);
            refetch();
            console.log("External reviewer created successfully");
        } catch (error) {
            console.error("Failed to create external reviewer:", error);
        }
    };

    const stats = [
        {
            title: "Tổng số Phản biện bên ngoài",
            value: externalReviewers.length.toString(),
            icon: Users,
            variant: "info" as const
        },
        {
            title: "Đang hoạt động",
            value: externalReviewers.filter(r => r.status === "active").length.toString(),
            icon: Users,
            variant: "success" as const
        },
        {
            title: "Tạm ngưng",
            value: externalReviewers.filter(r => r.status === "inactive").length.toString(),
            icon: Users,
            variant: "danger" as const
        }
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-600">Đã xảy ra lỗi khi tải dữ liệu</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Phản biện bên ngoài</h1>
                    <p className="text-gray-600">Quản lý tài khoản phản biện bên ngoài trong hệ thống</p>
                </div>
                <button
                    onClick={() => setIsFormModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Thêm Phản biện bên ngoài
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <StatCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        variant={stat.variant}
                    />
                ))}
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <SearchBar
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Tìm kiếm phản biện bên ngoài..."
                        className="w-full"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <ExternalReviewerTable
                    reviewers={filteredReviewers}
                    onView={handleViewReviewer}
                    onSuspend={handleSuspendReviewer}
                    onActivate={handleActivateReviewer}
                />
            </div>

            {/* External Reviewer Detail Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title="Chi tiết Phản biện bên ngoài"
                size="lg"
            >
                {selectedReviewer && (
                    <ExternalReviewerDetail
                        reviewer={selectedReviewer}
                        onClose={() => setIsDetailModalOpen(false)}
                    />
                )}
            </Modal>

            {/* External Reviewer Form Modal */}
            <Modal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                title="Thêm Phản biện bên ngoài mới"
                size="md"
            >
                <ExternalReviewerForm
                    onSave={handleCreateReviewer}
                    onCancel={() => setIsFormModalOpen(false)}
                />
            </Modal>
        </div>
    );
}