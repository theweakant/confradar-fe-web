"use client";

import {
    User as UserIcon,
    Mail,
    Shield,
    Activity,
    Calendar,
    FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { formatDate } from "@/helper/format";
import { UserDetailForAdminAndOrganizerResponse, UserProfileResponse } from "@/types/user.type";
import { getStatusLabel, getStatusVariant } from "@/helper/user";

interface CollaboratorDetailProps {
    collaborator: UserDetailForAdminAndOrganizerResponse;
    onClose: () => void;
}

export function CollaboratorDetail({ collaborator, onClose }: CollaboratorDetailProps) {
    // const getRoleLabel = (role: string) => {
    //     const labels: Record<string, string> = {
    //         customer: "Khách hàng",
    //         conferenceorganizer: "Người tổ chức hội nghị",
    //         collaborator: "Đối tác",
    //         localreviewer: "Phản biện nội bộ",
    //         externalreviewer: "Phản biện bên ngoài",
    //         admin: "Quản trị viên"
    //     };
    //     return labels[role] || role;
    // };

    // const getRoleVariant = (role: string): "success" | "danger" | "warning" | "info" => {
    //     const variants: Record<string, "success" | "danger" | "warning" | "info"> = {
    //         customer: "info",
    //         conferenceorganizer: "warning",
    //         collaborator: "success",
    //         localreviewer: "info",
    //         externalreviewer: "warning",
    //         admin: "danger"
    //     };   
    //     return variants[role] || "info";
    // };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{collaborator.fullName}</h3>
                    <div className="flex items-center gap-3 mb-4">
                        <StatusBadge
                            status={"Đối tác"}
                            variant={"success"}
                        />
                        <StatusBadge
                            status={getStatusLabel(collaborator.isActive ?? false)}
                            variant={getStatusVariant(collaborator.isActive ?? false)}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <UserIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-700">Tên Đối tác</p>
                            <p className="text-gray-900">{collaborator.fullName}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-700">Email</p>
                            <p className="text-gray-900">{collaborator.email}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-700">Vai trò</p>
                            <p className="text-gray-900">Đối tác</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-700">Trạng thái</p>
                            <p className="text-gray-900">{getStatusLabel(collaborator.isActive ?? false)}</p>
                        </div>
                    </div>

                    {/* <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-700">Số hội nghị được giao</p>
                            <p className="text-gray-900 font-semibold">{collaborator.registeredConferences || 0} hội nghị</p>
                        </div>
                    </div> */}

                    <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-700">Ngày tham gia</p>
                            <p className="text-gray-900">{formatDate(collaborator.createdAt)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
                <Button
                    onClick={onClose}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                    Đóng
                </Button>
            </div>
        </div>
    );
}