"use client";

import React, { useState } from 'react';
import {
    User as UserIcon,
    Mail,
    Shield,
    Activity,
    Calendar,
    FileText,
    Building2,
    Briefcase,
    DollarSign,
    MapPin,
    Users,
    Clock,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { formatDate } from "@/helper/format";
import { CollaboratorAccountResponse } from "@/types/user.type";
import { getStatusLabel, getStatusVariant } from "@/helper/user";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import ReusableDocViewer from '@/components/molecules/ReusableDocViewer ';
import { CollaboratorContractResponse } from '@/types/contract.type';

interface CollaboratorDetailProps {
    collaborator: CollaboratorAccountResponse;
    onClose: () => void;
}

export function CollaboratorDetail({ collaborator, onClose }: CollaboratorDetailProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'contracts'>('info');

    const contracts = collaborator.contractDetail || [];

    const formatCurrency = (amount: number | undefined | null) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDateSafe = (date: string | null | undefined) => {
        if (!date) return 'N/A';
        try {
            return format(new Date(date), 'dd/MM/yyyy', { locale: vi });
        } catch {
            return 'N/A';
        }
    };

    const getContractStatusBadge = (contract: CollaboratorContractResponse) => {
        if (contract.isClosed) {
            return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Đã đóng</span>;
        }
        const steps = [
            contract.isSponsorStep,
            contract.isMediaStep,
            contract.isPolicyStep,
            contract.isSessionStep,
            contract.isPriceStep
        ];
        const completedSteps = steps.filter(Boolean).length;
        const totalSteps = 5;

        if (completedSteps === totalSteps) {
            return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Hoàn thành</span>;
        }
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Đang thực hiện ({completedSteps}/{totalSteps})</span>;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{collaborator.fullName}</h3>
                    <div className="flex items-center gap-3 mb-4">
                        <StatusBadge status="Đối tác" variant="success" />
                        <StatusBadge
                            status={getStatusLabel(collaborator.isActive ?? false)}
                            variant={getStatusVariant(collaborator.isActive ?? false)}
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`pb-3 border-b-2 transition-colors ${activeTab === 'info'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <div className="flex items-center space-x-2">
                            <UserIcon className="w-4 h-4" />
                            <span className="font-medium">Thông tin</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('contracts')}
                        className={`pb-3 border-b-2 transition-colors ${activeTab === 'contracts'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4" />
                            <span className="font-medium">Hợp đồng ({contracts.length})</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'info' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-900 flex items-center mb-3">
                            <UserIcon className="w-4 h-4 mr-2" />
                            Thông tin cá nhân
                        </h4>
                        <div className="space-y-3 pl-6">
                            <div className="flex items-start gap-3">
                                <UserIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Họ tên</p>
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

                            <div className="flex items-start gap-3">
                                <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Trạng thái</p>
                                    <p className="text-gray-900">{getStatusLabel(collaborator.isActive ?? false)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Organization Information */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-900 flex items-center mb-3">
                            <Building2 className="w-4 h-4 mr-2" />
                            Thông tin tổ chức
                        </h4>
                        <div className="space-y-3 pl-6">
                            <div className="flex items-start gap-3">
                                <Building2 className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Tên tổ chức</p>
                                    <p className="text-gray-900">{collaborator.organizationName || 'Chưa có thông tin'}</p>
                                </div>
                            </div>

                            {collaborator.organizationDescription && (
                                <div className="flex items-start gap-3">
                                    <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Mô tả</p>
                                        <p className="text-gray-900 text-sm">{collaborator.organizationDescription}</p>
                                    </div>
                                </div>
                            )}

                            {collaborator.bioDescription && (
                                <div className="flex items-start gap-3">
                                    <UserIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Tiểu sử</p>
                                        <p className="text-gray-900 text-sm">{collaborator.bioDescription}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {contracts.length > 0 ? (
                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
                            {contracts.map((contract, index) => (
                                <div key={contract.collaboratorContractId || index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                                    {/* Contract Header */}
                                    <div className="flex items-start gap-3 mb-3">
                                        {contract.conferenceBannerImageUrl && (
                                            <img
                                                src={contract.conferenceBannerImageUrl}
                                                alt={contract.conferenceName || 'Conference'}
                                                className="w-20 h-20 rounded object-cover flex-shrink-0"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h4 className="font-semibold text-gray-900 text-lg">
                                                    {contract.conferenceName || 'N/A'}
                                                </h4>
                                                {/* {getContractStatusBadge(contract)} */}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                                {contract.conferenceDescription || 'Không có mô tả'}
                                            </p>
                                            {contract.conferenceCategoryName && (
                                                <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                                    {contract.conferenceCategoryName}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Contract Details Grid */}
                                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-green-600" />
                                            <div>
                                                <p className="text-gray-500">Hoa hồng:</p>
                                                <p className="font-semibold text-green-600">
                                                    {contract.commission ? `${contract.commission}%` : 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-blue-600" />
                                            <div>
                                                <p className="text-gray-500">Ngày ký:</p>
                                                <p className="font-medium">{formatDateSafe(contract.signDay)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-orange-600" />
                                            <div>
                                                <p className="text-gray-500">Thanh toán cuối:</p>
                                                <p className="font-medium">{formatDateSafe(contract.finalizePaymentDate)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-purple-600" />
                                            <div>
                                                <p className="text-gray-500">Chỗ trống:</p>
                                                <p className="font-medium">
                                                    {contract.conferenceAvailableSlot || 0} / {contract.conferenceTotalSlot || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Conference Dates */}
                                    {(contract.conferenceStartDate || contract.conferenceEndDate) && (
                                        <div className="flex items-center gap-2 text-sm mb-3 p-2 bg-gray-50 rounded">
                                            <Calendar className="w-4 h-4 text-gray-600" />
                                            <span className="text-gray-700">
                                                Hội nghị: {formatDateSafe(contract.conferenceStartDate)} - {formatDateSafe(contract.conferenceEndDate)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Ticket Sale Period */}
                                    {(contract.conferenceTicketSaleStart || contract.conferenceTicketSaleEnd) && (
                                        <div className="flex items-center gap-2 text-sm mb-3 p-2 bg-blue-50 rounded">
                                            <Briefcase className="w-4 h-4 text-blue-600" />
                                            <span className="text-gray-700">
                                                Bán vé: {formatDateSafe(contract.conferenceTicketSaleStart)} - {formatDateSafe(contract.conferenceTicketSaleEnd)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Address */}
                                    {contract.conferenceAddress && (
                                        <div className="flex items-center gap-2 text-sm mb-3">
                                            <MapPin className="w-4 h-4 text-red-600" />
                                            <span className="text-gray-700">{contract.conferenceAddress}</span>
                                        </div>
                                    )}

                                    {/* Progress Steps */}
                                    <div className="border-t pt-3 mb-3">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Thông tin chia sẻ với Confradar:</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="flex items-center gap-1 text-xs">
                                                {contract.isSponsorStep ?
                                                    <CheckCircle2 className="w-4 h-4 text-green-600" /> :
                                                    <XCircle className="w-4 h-4 text-gray-400" />
                                                }
                                                <span>Nhà tài trợ</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs">
                                                {contract.isMediaStep ?
                                                    <CheckCircle2 className="w-4 h-4 text-green-600" /> :
                                                    <XCircle className="w-4 h-4 text-gray-400" />
                                                }
                                                <span>Truyền thông</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs">
                                                {contract.isPolicyStep ?
                                                    <CheckCircle2 className="w-4 h-4 text-green-600" /> :
                                                    <XCircle className="w-4 h-4 text-gray-400" />
                                                }
                                                <span>Chính sách</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs">
                                                {contract.isSessionStep ?
                                                    <CheckCircle2 className="w-4 h-4 text-green-600" /> :
                                                    <XCircle className="w-4 h-4 text-gray-400" />
                                                }
                                                <span>Phiên</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs">
                                                {contract.isPriceStep ?
                                                    <CheckCircle2 className="w-4 h-4 text-green-600" /> :
                                                    <XCircle className="w-4 h-4 text-gray-400" />
                                                }
                                                <span>Giá</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs">
                                                {contract.isTicketSelling ?
                                                    <CheckCircle2 className="w-4 h-4 text-green-600" /> :
                                                    <XCircle className="w-4 h-4 text-gray-400" />
                                                }
                                                <span>Bán vé</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contract Document */}
                                    {contract.contractUrl && (
                                        <div className="border-t pt-3">
                                            <a
                                                href={contract.contractUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-3"
                                            >
                                                <FileText className="w-4 h-4 mr-1" />
                                                Xem hợp đồng
                                            </a>
                                            <div className="max-h-[400px] overflow-auto rounded-lg border border-gray-200">
                                                <ReusableDocViewer
                                                    fileUrl={contract.contractUrl}
                                                    minHeight={300}
                                                    checkUrlBeforeRender={true}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p>Chưa có hợp đồng nào</p>
                        </div>
                    )}
                </div>
            )}

            {/* Footer */}
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

// "use client";

// import {
//     User as UserIcon,
//     Mail,
//     Shield,
//     Activity,
//     Calendar,
//     FileText
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { StatusBadge } from "@/components/atoms/StatusBadge";
// import { formatDate } from "@/helper/format";
// import { UserDetailForAdminAndOrganizerResponse, UserProfileResponse } from "@/types/user.type";
// import { getStatusLabel, getStatusVariant } from "@/helper/user";

// interface CollaboratorDetailProps {
//     collaborator: UserDetailForAdminAndOrganizerResponse;
//     onClose: () => void;
// }

// export function CollaboratorDetail({ collaborator, onClose }: CollaboratorDetailProps) {
//     // const getRoleLabel = (role: string) => {
//     //     const labels: Record<string, string> = {
//     //         customer: "Khách hàng",
//     //         conferenceorganizer: "Người tổ chức hội nghị",
//     //         collaborator: "Đối tác",
//     //         localreviewer: "Phản biện nội bộ",
//     //         externalreviewer: "Phản biện bên ngoài",
//     //         admin: "Quản trị viên"
//     //     };
//     //     return labels[role] || role;
//     // };

//     // const getRoleVariant = (role: string): "success" | "danger" | "warning" | "info" => {
//     //     const variants: Record<string, "success" | "danger" | "warning" | "info"> = {
//     //         customer: "info",
//     //         conferenceorganizer: "warning",
//     //         collaborator: "success",
//     //         localreviewer: "info",
//     //         externalreviewer: "warning",
//     //         admin: "danger"
//     //     };
//     //     return variants[role] || "info";
//     // };

//     return (
//         <div className="space-y-6">
//             <div className="flex items-start justify-between">
//                 <div className="flex-1">
//                     <h3 className="text-2xl font-bold text-gray-900 mb-2">{collaborator.fullName}</h3>
//                     <div className="flex items-center gap-3 mb-4">
//                         <StatusBadge
//                             status={"Đối tác"}
//                             variant={"success"}
//                         />
//                         <StatusBadge
//                             status={getStatusLabel(collaborator.isActive ?? false)}
//                             variant={getStatusVariant(collaborator.isActive ?? false)}
//                         />
//                     </div>
//                 </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-4">
//                     <div className="flex items-start gap-3">
//                         <UserIcon className="w-5 h-5 text-blue-600 mt-0.5" />
//                         <div>
//                             <p className="text-sm font-medium text-gray-700">Tên Đối tác</p>
//                             <p className="text-gray-900">{collaborator.fullName}</p>
//                         </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                         <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
//                         <div>
//                             <p className="text-sm font-medium text-gray-700">Email</p>
//                             <p className="text-gray-900">{collaborator.email}</p>
//                         </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                         <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
//                         <div>
//                             <p className="text-sm font-medium text-gray-700">Vai trò</p>
//                             <p className="text-gray-900">Đối tác</p>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="space-y-4">
//                     <div className="flex items-start gap-3">
//                         <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
//                         <div>
//                             <p className="text-sm font-medium text-gray-700">Trạng thái</p>
//                             <p className="text-gray-900">{getStatusLabel(collaborator.isActive ?? false)}</p>
//                         </div>
//                     </div>

//                     {/* <div className="flex items-start gap-3">
//                         <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
//                         <div>
//                             <p className="text-sm font-medium text-gray-700">Số hội nghị được giao</p>
//                             <p className="text-gray-900 font-semibold">{collaborator.registeredConferences || 0} hội nghị</p>
//                         </div>
//                     </div> */}

//                     <div className="flex items-start gap-3">
//                         <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
//                         <div>
//                             <p className="text-sm font-medium text-gray-700">Ngày tham gia</p>
//                             <p className="text-gray-900">{formatDate(collaborator.createdAt)}</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className="flex justify-end pt-4 border-t">
//                 <Button
//                     onClick={onClose}
//                     className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
//                 >
//                     Đóng
//                 </Button>
//             </div>
//         </div>
//     );
// }