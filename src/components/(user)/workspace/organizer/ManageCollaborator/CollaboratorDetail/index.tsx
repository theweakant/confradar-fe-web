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
    XCircle,
    Eye,
    Download,
    X,
    User
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

// Contract Card Component
interface ContractCardProps {
    contract: CollaboratorContractResponse;
    onViewDetail: (contract: CollaboratorContractResponse) => void;
}

function ContractCard({ contract, onViewDetail }: ContractCardProps) {
    const formatDateSafe = (date: string | null | undefined) => {
        if (!date) return 'N/A';
        try {
            return format(new Date(date), 'dd/MM/yyyy', { locale: vi });
        } catch {
            return 'N/A';
        }
    };

    const getContractStatusBadge = () => {
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
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            {/* HEADER with Image + Status */}
            <div className="flex items-start gap-3 mb-4">
                {contract.conferenceBannerImageUrl && (
                    <img
                        src={contract.conferenceBannerImageUrl}
                        alt={contract.conferenceName || 'Conference'}
                        className="w-16 h-16 rounded object-cover flex-shrink-0"
                    />
                )}

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-base line-clamp-1">
                            {contract.conferenceName || 'N/A'}
                        </h3>
                        {getContractStatusBadge()}
                    </div>

                    {contract.conferenceCategoryName && (
                        <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                            {contract.conferenceCategoryName}
                        </span>
                    )}
                </div>
            </div>

            {/* INFO */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{contract.collaboratorContractFullName}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDateSafe(contract.conferenceStartDate)} - {formatDateSafe(contract.conferenceEndDate)}</span>
                </div>

                {/* <div className="text-sm font-semibold text-gray-900">
                    Hoa hồng: {contract.commission}
                </div> */}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>
                        Chỗ trống: {contract.conferenceAvailableSlot || 0} / {contract.conferenceTotalSlot || 0}
                    </span>
                </div>

                {contract.commission && (
                    <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-600">Hoa hồng: {contract.commission}%</span>
                    </div>
                )}
            </div>

            {/* BUTTON */}
            <button
                onClick={() => onViewDetail(contract)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                <Eye className="w-4 h-4" />
                Xem chi tiết
            </button>
        </div>
    );

    // return (
    //     <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
    //         {/* Header with Image */}
    //         <div className="flex items-start gap-3 mb-3">
    //             {contract.conferenceBannerImageUrl && (
    //                 <img
    //                     src={contract.conferenceBannerImageUrl}
    //                     alt={contract.conferenceName || 'Conference'}
    //                     className="w-16 h-16 rounded object-cover flex-shrink-0"
    //                 />
    //             )}
    //             <div className="flex-1 min-w-0">
    //                 <div className="flex items-start justify-between gap-2 mb-1">
    //                     <h4 className="font-semibold text-gray-900 text-base line-clamp-1">
    //                         {contract.conferenceName || 'N/A'}
    //                     </h4>
    //                     {getContractStatusBadge()}
    //                 </div>
    //                 {contract.conferenceCategoryName && (
    //                     <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
    //                         {contract.conferenceCategoryName}
    //                     </span>
    //                 )}
    //             </div>
    //         </div>

    //         {/* Key Info */}
    //         <div className="space-y-2 mb-3">
    //             <div className="flex items-center gap-2 text-sm text-gray-600">
    //                 <DollarSign className="w-4 h-4 text-green-600" />
    //                 <span className="font-semibold text-green-600">
    //                     Hoa hồng: {contract.commission ? `${contract.commission}%` : 'N/A'}
    //                 </span>
    //             </div>
    //             <div className="flex items-center gap-2 text-sm text-gray-600">
    //                 <Calendar className="w-4 h-4" />
    //                 <span>
    //                     {formatDateSafe(contract.conferenceStartDate)} - {formatDateSafe(contract.conferenceEndDate)}
    //                 </span>
    //             </div>
    //             <div className="flex items-center gap-2 text-sm text-gray-600">
    //                 <Users className="w-4 h-4" />
    //                 <span>
    //                     Chỗ trống: {contract.conferenceAvailableSlot || 0} / {contract.conferenceTotalSlot || 0}
    //                 </span>
    //             </div>
    //         </div>

    //         {/* View Detail Button */}
    //         <button
    //             onClick={() => onViewDetail(contract)}
    //             className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    //         >
    //             <Eye className="w-4 h-4" />
    //             Xem chi tiết
    //         </button>
    //     </div>
    // );
}

// Contract Detail Dialog
interface ContractDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    contract: CollaboratorContractResponse | null;
}

function ContractDetailDialog({ isOpen, onClose, contract }: ContractDetailDialogProps) {
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldLoadDoc, setShouldLoadDoc] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            setShouldLoadDoc(false); // Reset doc loading state
        }
    }, [isOpen]);

    if (!isOpen && !isAnimating) return null;
    if (!contract) return null;

    const formatDateSafe = (date: string | null | undefined) => {
        if (!date) return 'N/A';
        try {
            return format(new Date(date), 'dd/MM/yyyy', { locale: vi });
        } catch {
            return 'N/A';
        }
    };

    const handleClose = () => {
        setIsAnimating(false);
        setShouldLoadDoc(false);
        setTimeout(onClose, 200);
    };

    const handleDownload = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (contract.contractUrl) {
            const link = document.createElement('a');
            link.href = contract.contractUrl;
            link.download = `contract-${contract.collaboratorContractId}.pdf`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleViewDocument = () => {
        setShouldLoadDoc(true);
    };

    return (
        <div
            className={`fixed inset-0 z-[60] flex items-center justify-center transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'
                }`}
            onClick={handleClose}
        >
            <div className="absolute inset-0 bg-black bg-opacity-50" />

            <div
                className={`relative w-full max-w-5xl transform transition-all duration-300 ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden m-4 max-h-[90vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Chi tiết hợp đồng
                        </h2>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-white rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto flex-1">
                        {/* Conference Info */}
                        <div className="flex items-start gap-4 mb-6">
                            {contract.conferenceBannerImageUrl && (
                                <img
                                    src={contract.conferenceBannerImageUrl}
                                    alt={contract.conferenceName || 'Conference'}
                                    className="w-32 h-32 rounded-lg object-cover flex-shrink-0"
                                />
                            )}
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {contract.conferenceName || 'N/A'}
                                </h3>
                                <p className="text-gray-600 mb-3">
                                    {contract.conferenceDescription || 'Không có mô tả'}
                                </p>
                                {contract.conferenceCategoryName && (
                                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                                        {contract.conferenceCategoryName}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Hoa hồng</label>
                                    <p className="text-xl font-bold text-green-600 mt-1">
                                        {contract.commission ? `${contract.commission}%` : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Ngày ký hợp đồng</label>
                                    <p className="text-lg text-gray-900 mt-1">{formatDateSafe(contract.signDay)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Thanh toán cuối cùng</label>
                                    <p className="text-lg text-gray-900 mt-1">{formatDateSafe(contract.finalizePaymentDate)}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Thời gian hội nghị</label>
                                    <p className="text-lg text-gray-900 mt-1">
                                        {formatDateSafe(contract.conferenceStartDate)} - {formatDateSafe(contract.conferenceEndDate)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Bán vé</label>
                                    <p className="text-lg text-gray-900 mt-1">
                                        {formatDateSafe(contract.conferenceTicketSaleStart)} - {formatDateSafe(contract.conferenceTicketSaleEnd)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Số chỗ</label>
                                    <p className="text-lg text-gray-900 mt-1">
                                        {contract.conferenceAvailableSlot || 0} / {contract.conferenceTotalSlot || 0} chỗ trống
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        {contract.conferenceAddress && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Địa điểm</label>
                                        <p className="text-gray-900 mt-1">{contract.conferenceAddress}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Progress Steps */}
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-3">Thông tin chia sẻ với Confradar:</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div className="flex items-center gap-2 text-sm">
                                    {contract.isSponsorStep ?
                                        <CheckCircle2 className="w-5 h-5 text-green-600" /> :
                                        <XCircle className="w-5 h-5 text-gray-400" />
                                    }
                                    <span>Nhà tài trợ</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    {contract.isMediaStep ?
                                        <CheckCircle2 className="w-5 h-5 text-green-600" /> :
                                        <XCircle className="w-5 h-5 text-gray-400" />
                                    }
                                    <span>Truyền thông</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    {contract.isPolicyStep ?
                                        <CheckCircle2 className="w-5 h-5 text-green-600" /> :
                                        <XCircle className="w-5 h-5 text-gray-400" />
                                    }
                                    <span>Chính sách</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    {contract.isSessionStep ?
                                        <CheckCircle2 className="w-5 h-5 text-green-600" /> :
                                        <XCircle className="w-5 h-5 text-gray-400" />
                                    }
                                    <span>Phiên</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    {contract.isPriceStep ?
                                        <CheckCircle2 className="w-5 h-5 text-green-600" /> :
                                        <XCircle className="w-5 h-5 text-gray-400" />
                                    }
                                    <span>Giá</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    {contract.isTicketSelling ?
                                        <CheckCircle2 className="w-5 h-5 text-green-600" /> :
                                        <XCircle className="w-5 h-5 text-gray-400" />
                                    }
                                    <span>Bán vé</span>
                                </div>
                            </div>
                        </div>

                        {/* Contract Document */}
                        {contract.contractUrl && (
                            <div className="border-t pt-6">
                                <label className="text-sm font-medium text-gray-500 mb-3 block">Tài liệu hợp đồng</label>

                                {!shouldLoadDoc ? (
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-red-100 rounded">
                                                <FileText className="w-5 h-5 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Hợp đồng.pdf</p>
                                                <p className="text-sm text-gray-500">Tài liệu hợp đồng</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleViewDocument}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Xem
                                            </button>
                                            <button
                                                onClick={handleDownload}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                <Download className="w-4 h-4" />
                                                Tải
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                                        {/* <div className="max-h-[400px] overflow-auto rounded-lg border border-gray-200">
                                            <ReusableDocViewer
                                                fileUrl={contract.contractUrl}
                                                minHeight={300}
                                                checkUrlBeforeRender={true}
                                            />
                                        </div> */}
                                        <div className="max-h-[700px] overflow-auto">
                                            <ReusableDocViewer
                                                fileUrl={contract.contractUrl}
                                                minHeight={400}
                                                checkUrlBeforeRender={true}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                        <button
                            onClick={handleClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Main Component
export function CollaboratorDetail({ collaborator, onClose }: CollaboratorDetailProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'contracts'>('info');
    const [selectedContract, setSelectedContract] = useState<CollaboratorContractResponse | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const contracts = collaborator.contractDetail || [];

    const handleViewDetail = (contract: CollaboratorContractResponse) => {
        setSelectedContract(contract);
        setIsDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setIsDetailOpen(false);
        setSelectedContract(null);
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
                        // <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">

                            {contracts.map((contract, index) => (
                                <ContractCard
                                    key={contract.collaboratorContractId || index}
                                    contract={contract}
                                    onViewDetail={handleViewDetail}
                                />
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

            {/* Contract Detail Dialog */}
            <ContractDetailDialog
                isOpen={isDetailOpen}
                onClose={handleCloseDetail}
                contract={selectedContract}
            />
        </div>
    );
}

// "use client";

// import React, { useState } from 'react';
// import {
//     User as UserIcon,
//     Mail,
//     Shield,
//     Activity,
//     Calendar,
//     FileText,
//     Building2,
//     Briefcase,
//     DollarSign,
//     MapPin,
//     Users,
//     Clock,
//     CheckCircle2,
//     XCircle
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { StatusBadge } from "@/components/atoms/StatusBadge";
// import { formatDate } from "@/helper/format";
// import { CollaboratorAccountResponse } from "@/types/user.type";
// import { getStatusLabel, getStatusVariant } from "@/helper/user";
// import { format } from 'date-fns';
// import { vi } from 'date-fns/locale';
// import ReusableDocViewer from '@/components/molecules/ReusableDocViewer ';
// import { CollaboratorContractResponse } from '@/types/contract.type';

// interface CollaboratorDetailProps {
//     collaborator: CollaboratorAccountResponse;
//     onClose: () => void;
// }

// export function CollaboratorDetail({ collaborator, onClose }: CollaboratorDetailProps) {
//     const [activeTab, setActiveTab] = useState<'info' | 'contracts'>('info');

//     const contracts = collaborator.contractDetail || [];

//     const formatCurrency = (amount: number | undefined | null) => {
//         if (!amount) return 'N/A';
//         return new Intl.NumberFormat('vi-VN', {
//             style: 'currency',
//             currency: 'VND'
//         }).format(amount);
//     };

//     const formatDateSafe = (date: string | null | undefined) => {
//         if (!date) return 'N/A';
//         try {
//             return format(new Date(date), 'dd/MM/yyyy', { locale: vi });
//         } catch {
//             return 'N/A';
//         }
//     };

//     const getContractStatusBadge = (contract: CollaboratorContractResponse) => {
//         if (contract.isClosed) {
//             return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Đã đóng</span>;
//         }
//         const steps = [
//             contract.isSponsorStep,
//             contract.isMediaStep,
//             contract.isPolicyStep,
//             contract.isSessionStep,
//             contract.isPriceStep
//         ];
//         const completedSteps = steps.filter(Boolean).length;
//         const totalSteps = 5;

//         if (completedSteps === totalSteps) {
//             return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Hoàn thành</span>;
//         }
//         return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Đang thực hiện ({completedSteps}/{totalSteps})</span>;
//     };

//     return (
//         <div className="space-y-6">
//             {/* Header */}
//             <div className="flex items-start justify-between">
//                 <div className="flex-1">
//                     <h3 className="text-2xl font-bold text-gray-900 mb-2">{collaborator.fullName}</h3>
//                     <div className="flex items-center gap-3 mb-4">
//                         <StatusBadge status="Đối tác" variant="success" />
//                         <StatusBadge
//                             status={getStatusLabel(collaborator.isActive ?? false)}
//                             variant={getStatusVariant(collaborator.isActive ?? false)}
//                         />
//                     </div>
//                 </div>
//             </div>

//             {/* Tabs */}
//             <div className="border-b border-gray-200">
//                 <div className="flex space-x-8">
//                     <button
//                         onClick={() => setActiveTab('info')}
//                         className={`pb-3 border-b-2 transition-colors ${activeTab === 'info'
//                             ? 'border-blue-600 text-blue-600'
//                             : 'border-transparent text-gray-500 hover:text-gray-700'
//                             }`}
//                     >
//                         <div className="flex items-center space-x-2">
//                             <UserIcon className="w-4 h-4" />
//                             <span className="font-medium">Thông tin</span>
//                         </div>
//                     </button>
//                     <button
//                         onClick={() => setActiveTab('contracts')}
//                         className={`pb-3 border-b-2 transition-colors ${activeTab === 'contracts'
//                             ? 'border-blue-600 text-blue-600'
//                             : 'border-transparent text-gray-500 hover:text-gray-700'
//                             }`}
//                     >
//                         <div className="flex items-center space-x-2">
//                             <FileText className="w-4 h-4" />
//                             <span className="font-medium">Hợp đồng ({contracts.length})</span>
//                         </div>
//                     </button>
//                 </div>
//             </div>

//             {/* Tab Content */}
//             {activeTab === 'info' ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {/* Personal Information */}
//                     <div className="space-y-4">
//                         <h4 className="font-medium text-gray-900 flex items-center mb-3">
//                             <UserIcon className="w-4 h-4 mr-2" />
//                             Thông tin cá nhân
//                         </h4>
//                         <div className="space-y-3 pl-6">
//                             <div className="flex items-start gap-3">
//                                 <UserIcon className="w-5 h-5 text-blue-600 mt-0.5" />
//                                 <div>
//                                     <p className="text-sm font-medium text-gray-700">Họ tên</p>
//                                     <p className="text-gray-900">{collaborator.fullName}</p>
//                                 </div>
//                             </div>

//                             <div className="flex items-start gap-3">
//                                 <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
//                                 <div>
//                                     <p className="text-sm font-medium text-gray-700">Email</p>
//                                     <p className="text-gray-900">{collaborator.email}</p>
//                                 </div>
//                             </div>

//                             <div className="flex items-start gap-3">
//                                 <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
//                                 <div>
//                                     <p className="text-sm font-medium text-gray-700">Vai trò</p>
//                                     <p className="text-gray-900">Đối tác</p>
//                                 </div>
//                             </div>

//                             <div className="flex items-start gap-3">
//                                 <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
//                                 <div>
//                                     <p className="text-sm font-medium text-gray-700">Trạng thái</p>
//                                     <p className="text-gray-900">{getStatusLabel(collaborator.isActive ?? false)}</p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Organization Information */}
//                     <div className="space-y-4">
//                         <h4 className="font-medium text-gray-900 flex items-center mb-3">
//                             <Building2 className="w-4 h-4 mr-2" />
//                             Thông tin tổ chức
//                         </h4>
//                         <div className="space-y-3 pl-6">
//                             <div className="flex items-start gap-3">
//                                 <Building2 className="w-5 h-5 text-blue-600 mt-0.5" />
//                                 <div>
//                                     <p className="text-sm font-medium text-gray-700">Tên tổ chức</p>
//                                     <p className="text-gray-900">{collaborator.organizationName || 'Chưa có thông tin'}</p>
//                                 </div>
//                             </div>

//                             {collaborator.organizationDescription && (
//                                 <div className="flex items-start gap-3">
//                                     <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
//                                     <div>
//                                         <p className="text-sm font-medium text-gray-700">Mô tả</p>
//                                         <p className="text-gray-900 text-sm">{collaborator.organizationDescription}</p>
//                                     </div>
//                                 </div>
//                             )}

//                             {collaborator.bioDescription && (
//                                 <div className="flex items-start gap-3">
//                                     <UserIcon className="w-5 h-5 text-blue-600 mt-0.5" />
//                                     <div>
//                                         <p className="text-sm font-medium text-gray-700">Tiểu sử</p>
//                                         <p className="text-gray-900 text-sm">{collaborator.bioDescription}</p>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             ) : (
//                 <div className="space-y-4">
//                     {contracts.length > 0 ? (
//                         <div className="space-y-3 max-h-[600px] overflow-y-auto">
//                             {contracts.map((contract, index) => (
//                                 <div key={contract.collaboratorContractId || index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
//                                     {/* Contract Header */}
//                                     <div className="flex items-start gap-3 mb-3">
//                                         {contract.conferenceBannerImageUrl && (
//                                             <img
//                                                 src={contract.conferenceBannerImageUrl}
//                                                 alt={contract.conferenceName || 'Conference'}
//                                                 className="w-20 h-20 rounded object-cover flex-shrink-0"
//                                             />
//                                         )}
//                                         <div className="flex-1 min-w-0">
//                                             <div className="flex items-start justify-between gap-2 mb-2">
//                                                 <h4 className="font-semibold text-gray-900 text-lg">
//                                                     {contract.conferenceName || 'N/A'}
//                                                 </h4>
//                                                 {/* {getContractStatusBadge(contract)} */}
//                                             </div>
//                                             <p className="text-sm text-gray-600 mb-2 line-clamp-2">
//                                                 {contract.conferenceDescription || 'Không có mô tả'}
//                                             </p>
//                                             {contract.conferenceCategoryName && (
//                                                 <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
//                                                     {contract.conferenceCategoryName}
//                                                 </span>
//                                             )}
//                                         </div>
//                                     </div>

//                                     {/* Contract Details Grid */}
//                                     <div className="grid grid-cols-2 gap-3 text-sm mb-3">
//                                         <div className="flex items-center gap-2">
//                                             <DollarSign className="w-4 h-4 text-green-600" />
//                                             <div>
//                                                 <p className="text-gray-500">Hoa hồng:</p>
//                                                 <p className="font-semibold text-green-600">
//                                                     {contract.commission ? `${contract.commission}%` : 'N/A'}
//                                                 </p>
//                                             </div>
//                                         </div>

//                                         <div className="flex items-center gap-2">
//                                             <Calendar className="w-4 h-4 text-blue-600" />
//                                             <div>
//                                                 <p className="text-gray-500">Ngày ký:</p>
//                                                 <p className="font-medium">{formatDateSafe(contract.signDay)}</p>
//                                             </div>
//                                         </div>

//                                         <div className="flex items-center gap-2">
//                                             <Clock className="w-4 h-4 text-orange-600" />
//                                             <div>
//                                                 <p className="text-gray-500">Thanh toán cuối:</p>
//                                                 <p className="font-medium">{formatDateSafe(contract.finalizePaymentDate)}</p>
//                                             </div>
//                                         </div>

//                                         <div className="flex items-center gap-2">
//                                             <Users className="w-4 h-4 text-purple-600" />
//                                             <div>
//                                                 <p className="text-gray-500">Chỗ trống:</p>
//                                                 <p className="font-medium">
//                                                     {contract.conferenceAvailableSlot || 0} / {contract.conferenceTotalSlot || 0}
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Conference Dates */}
//                                     {(contract.conferenceStartDate || contract.conferenceEndDate) && (
//                                         <div className="flex items-center gap-2 text-sm mb-3 p-2 bg-gray-50 rounded">
//                                             <Calendar className="w-4 h-4 text-gray-600" />
//                                             <span className="text-gray-700">
//                                                 Hội nghị: {formatDateSafe(contract.conferenceStartDate)} - {formatDateSafe(contract.conferenceEndDate)}
//                                             </span>
//                                         </div>
//                                     )}

//                                     {/* Ticket Sale Period */}
//                                     {(contract.conferenceTicketSaleStart || contract.conferenceTicketSaleEnd) && (
//                                         <div className="flex items-center gap-2 text-sm mb-3 p-2 bg-blue-50 rounded">
//                                             <Briefcase className="w-4 h-4 text-blue-600" />
//                                             <span className="text-gray-700">
//                                                 Bán vé: {formatDateSafe(contract.conferenceTicketSaleStart)} - {formatDateSafe(contract.conferenceTicketSaleEnd)}
//                                             </span>
//                                         </div>
//                                     )}

//                                     {/* Address */}
//                                     {contract.conferenceAddress && (
//                                         <div className="flex items-center gap-2 text-sm mb-3">
//                                             <MapPin className="w-4 h-4 text-red-600" />
//                                             <span className="text-gray-700">{contract.conferenceAddress}</span>
//                                         </div>
//                                     )}

//                                     {/* Progress Steps */}
//                                     <div className="border-t pt-3 mb-3">
//                                         <p className="text-sm font-medium text-gray-700 mb-2">Thông tin chia sẻ với Confradar:</p>
//                                         <div className="grid grid-cols-3 gap-2">
//                                             <div className="flex items-center gap-1 text-xs">
//                                                 {contract.isSponsorStep ?
//                                                     <CheckCircle2 className="w-4 h-4 text-green-600" /> :
//                                                     <XCircle className="w-4 h-4 text-gray-400" />
//                                                 }
//                                                 <span>Nhà tài trợ</span>
//                                             </div>
//                                             <div className="flex items-center gap-1 text-xs">
//                                                 {contract.isMediaStep ?
//                                                     <CheckCircle2 className="w-4 h-4 text-green-600" /> :
//                                                     <XCircle className="w-4 h-4 text-gray-400" />
//                                                 }
//                                                 <span>Truyền thông</span>
//                                             </div>
//                                             <div className="flex items-center gap-1 text-xs">
//                                                 {contract.isPolicyStep ?
//                                                     <CheckCircle2 className="w-4 h-4 text-green-600" /> :
//                                                     <XCircle className="w-4 h-4 text-gray-400" />
//                                                 }
//                                                 <span>Chính sách</span>
//                                             </div>
//                                             <div className="flex items-center gap-1 text-xs">
//                                                 {contract.isSessionStep ?
//                                                     <CheckCircle2 className="w-4 h-4 text-green-600" /> :
//                                                     <XCircle className="w-4 h-4 text-gray-400" />
//                                                 }
//                                                 <span>Phiên</span>
//                                             </div>
//                                             <div className="flex items-center gap-1 text-xs">
//                                                 {contract.isPriceStep ?
//                                                     <CheckCircle2 className="w-4 h-4 text-green-600" /> :
//                                                     <XCircle className="w-4 h-4 text-gray-400" />
//                                                 }
//                                                 <span>Giá</span>
//                                             </div>
//                                             <div className="flex items-center gap-1 text-xs">
//                                                 {contract.isTicketSelling ?
//                                                     <CheckCircle2 className="w-4 h-4 text-green-600" /> :
//                                                     <XCircle className="w-4 h-4 text-gray-400" />
//                                                 }
//                                                 <span>Bán vé</span>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Contract Document */}
//                                     {contract.contractUrl && (
//                                         <div className="border-t pt-3">
//                                             <a
//                                                 href={contract.contractUrl}
//                                                 target="_blank"
//                                                 rel="noopener noreferrer"
//                                                 className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-3"
//                                             >
//                                                 <FileText className="w-4 h-4 mr-1" />
//                                                 Xem hợp đồng
//                                             </a>
//                                             <div className="max-h-[400px] overflow-auto rounded-lg border border-gray-200">
//                                                 <ReusableDocViewer
//                                                     fileUrl={contract.contractUrl}
//                                                     minHeight={300}
//                                                     checkUrlBeforeRender={true}
//                                                 />
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>
//                             ))}
//                         </div>
//                     ) : (
//                         <div className="text-center py-12 text-gray-500">
//                             <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
//                             <p>Chưa có hợp đồng nào</p>
//                         </div>
//                     )}
//                 </div>
//             )}

//             {/* Footer */}
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

// // "use client";

// // import {
// //     User as UserIcon,
// //     Mail,
// //     Shield,
// //     Activity,
// //     Calendar,
// //     FileText
// // } from "lucide-react";
// // import { Button } from "@/components/ui/button";
// // import { StatusBadge } from "@/components/atoms/StatusBadge";
// // import { formatDate } from "@/helper/format";
// // import { UserDetailForAdminAndOrganizerResponse, UserProfileResponse } from "@/types/user.type";
// // import { getStatusLabel, getStatusVariant } from "@/helper/user";

// // interface CollaboratorDetailProps {
// //     collaborator: UserDetailForAdminAndOrganizerResponse;
// //     onClose: () => void;
// // }

// // export function CollaboratorDetail({ collaborator, onClose }: CollaboratorDetailProps) {
// //     // const getRoleLabel = (role: string) => {
// //     //     const labels: Record<string, string> = {
// //     //         customer: "Khách hàng",
// //     //         conferenceorganizer: "Người tổ chức hội nghị",
// //     //         collaborator: "Đối tác",
// //     //         localreviewer: "Phản biện nội bộ",
// //     //         externalreviewer: "Phản biện bên ngoài",
// //     //         admin: "Quản trị viên"
// //     //     };
// //     //     return labels[role] || role;
// //     // };

// //     // const getRoleVariant = (role: string): "success" | "danger" | "warning" | "info" => {
// //     //     const variants: Record<string, "success" | "danger" | "warning" | "info"> = {
// //     //         customer: "info",
// //     //         conferenceorganizer: "warning",
// //     //         collaborator: "success",
// //     //         localreviewer: "info",
// //     //         externalreviewer: "warning",
// //     //         admin: "danger"
// //     //     };
// //     //     return variants[role] || "info";
// //     // };

// //     return (
// //         <div className="space-y-6">
// //             <div className="flex items-start justify-between">
// //                 <div className="flex-1">
// //                     <h3 className="text-2xl font-bold text-gray-900 mb-2">{collaborator.fullName}</h3>
// //                     <div className="flex items-center gap-3 mb-4">
// //                         <StatusBadge
// //                             status={"Đối tác"}
// //                             variant={"success"}
// //                         />
// //                         <StatusBadge
// //                             status={getStatusLabel(collaborator.isActive ?? false)}
// //                             variant={getStatusVariant(collaborator.isActive ?? false)}
// //                         />
// //                     </div>
// //                 </div>
// //             </div>

// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                 <div className="space-y-4">
// //                     <div className="flex items-start gap-3">
// //                         <UserIcon className="w-5 h-5 text-blue-600 mt-0.5" />
// //                         <div>
// //                             <p className="text-sm font-medium text-gray-700">Tên Đối tác</p>
// //                             <p className="text-gray-900">{collaborator.fullName}</p>
// //                         </div>
// //                     </div>

// //                     <div className="flex items-start gap-3">
// //                         <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
// //                         <div>
// //                             <p className="text-sm font-medium text-gray-700">Email</p>
// //                             <p className="text-gray-900">{collaborator.email}</p>
// //                         </div>
// //                     </div>

// //                     <div className="flex items-start gap-3">
// //                         <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
// //                         <div>
// //                             <p className="text-sm font-medium text-gray-700">Vai trò</p>
// //                             <p className="text-gray-900">Đối tác</p>
// //                         </div>
// //                     </div>
// //                 </div>

// //                 <div className="space-y-4">
// //                     <div className="flex items-start gap-3">
// //                         <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
// //                         <div>
// //                             <p className="text-sm font-medium text-gray-700">Trạng thái</p>
// //                             <p className="text-gray-900">{getStatusLabel(collaborator.isActive ?? false)}</p>
// //                         </div>
// //                     </div>

// //                     {/* <div className="flex items-start gap-3">
// //                         <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
// //                         <div>
// //                             <p className="text-sm font-medium text-gray-700">Số hội nghị được giao</p>
// //                             <p className="text-gray-900 font-semibold">{collaborator.registeredConferences || 0} hội nghị</p>
// //                         </div>
// //                     </div> */}

// //                     <div className="flex items-start gap-3">
// //                         <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
// //                         <div>
// //                             <p className="text-sm font-medium text-gray-700">Ngày tham gia</p>
// //                             <p className="text-gray-900">{formatDate(collaborator.createdAt)}</p>
// //                         </div>
// //                     </div>
// //                 </div>
// //             </div>

// //             <div className="flex justify-end pt-4 border-t">
// //                 <Button
// //                     onClick={onClose}
// //                     className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
// //                 >
// //                     Đóng
// //                 </Button>
// //             </div>
// //         </div>
// //     );
// // }