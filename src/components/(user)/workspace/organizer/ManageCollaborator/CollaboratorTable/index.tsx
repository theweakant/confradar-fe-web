import React from "react";
import {
    Eye,
    MoreVertical,
    Ban,
    CheckCircle
} from "lucide-react";

import { DataTable, Column } from "@/components/molecules/DataTable";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { CollaboratorAccountResponse, UserDetailForAdminAndOrganizerResponse, UserProfileResponse } from "@/types/user.type";
import { getStatusLabel, getStatusVariant } from "@/helper/user";

interface CollaboratorTableProps {
    collaborators: CollaboratorAccountResponse[];
    onView: (collaborator: CollaboratorAccountResponse) => void;
    onSuspend: (collaboratorId: string) => void;
    onActivate: (collaboratorId: string) => void;
}

export function CollaboratorTable({
    collaborators,
    onView,
    onSuspend,
    onActivate
}: CollaboratorTableProps) {
    const columns: Column<CollaboratorAccountResponse>[] = [
        {
            key: "fullName",
            header: "Đối tác",
            render: (collaborator) => (
                <div className="flex items-center gap-3 max-w-xs">
                    <img
                        src={collaborator.avatarUrl || "/images/default-avatar.jpg"}
                        alt="avatar"
                        className="w-8 h-8 rounded-full object-cover border"
                    />
                    <div>
                        <p className="font-medium text-gray-900 truncate">{collaborator.fullName}</p>
                        <p className="text-sm text-gray-500 truncate">{collaborator.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "role",
            header: "Vai trò",
            render: (collaborator) => (
                <StatusBadge
                    status={"Đối tác"}
                    variant={"success"}
                />
            ),
        },
        // {
        //     key: "status",
        //     header: "Trạng thái",
        //     render: (collaborator) => (
        //         <StatusBadge
        //             status={getStatusLabel(collaborator.isActive ?? false)}
        //             variant={getStatusVariant(collaborator.isActive ?? false)}
        //         />
        //     ),
        // },
        {
            key: "organizationName",
            header: "Tổ chức công tác",
            render: (collaborator) => (
                <span className="text-gray-900 font-medium">
                    {collaborator.organizationName || 0}
                </span>
            ),
        },
        {
            key: "actions",
            header: "Thao tác",
            className: "text-right",
            render: (collaborator) => (
                <div className="flex items-center justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                                <MoreVertical className="w-4 h-4 text-gray-600" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => onView(collaborator)}
                                className="cursor-pointer"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                Xem chi tiết
                            </DropdownMenuItem>
                            {/* {collaborator.isActive ? (
                                <DropdownMenuItem
                                    onClick={() => onSuspend(collaborator.userId)}
                                    className="cursor-pointer text-orange-600 focus:text-orange-600"
                                >
                                    <Ban className="w-4 h-4 mr-2" />
                                    Tạm ngưng
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem
                                    onClick={() => onActivate(collaborator.userId)}
                                    className="cursor-pointer text-green-600 focus:text-green-600"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Kích hoạt
                                </DropdownMenuItem>
                            )} */}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={collaborators}
            keyExtractor={(collaborator) => collaborator.userId}
            emptyMessage="Không tìm thấy đối tác nào"
        />
    );
}