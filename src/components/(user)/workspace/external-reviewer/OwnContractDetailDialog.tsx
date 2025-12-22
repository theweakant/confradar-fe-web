import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
    X,
    FileText,
    Calendar,
    DollarSign,
    Building,
    ExternalLink,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { OwnContractDetailResponse } from "@/types/contract.type";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface OwnContractDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    contract: OwnContractDetailResponse | null;
}

export const OwnContractDetailDialog: React.FC<OwnContractDetailDialogProps> = ({
    isOpen,
    onClose,
    contract,
}) => {
    if (!contract) return null;

    const formatCurrency = (amount: number | undefined) => {
        if (!amount) return "N/A";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                                {/* Header */}
                                <div className="relative">
                                    {contract.conferenceBannerImageUrl ? (
                                        <img
                                            src={contract.conferenceBannerImageUrl}
                                            alt={contract.conferenceName}
                                            className="w-full h-64 object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                            <Building className="w-24 h-24 text-gray-400" />
                                        </div>
                                    )}

                                    {/* Close Button */}
                                    <button
                                        onClick={onClose}
                                        className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-600" />
                                    </button>

                                    {/* Status Badge */}
                                    <div className="absolute bottom-4 left-4">
                                        <span
                                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium shadow-lg ${contract.isActive
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {contract.isActive ? (
                                                <>
                                                    <CheckCircle className="w-4 h-4 mr-1.5" />
                                                    Đang hoạt động
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-4 h-4 mr-1.5" />
                                                    Không hoạt động
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    {/* Title */}
                                    <Dialog.Title
                                        as="h3"
                                        className="text-2xl font-bold text-gray-900 mb-2"
                                    >
                                        {contract.conferenceName || "N/A"}
                                    </Dialog.Title>

                                    {/* Contract ID */}
                                    <p className="text-sm text-gray-500 mb-4">
                                        ID Hợp đồng: {contract.reviewerContractId}
                                    </p>

                                    {/* Description */}
                                    {contract.conferenceDescription && (
                                        <div className="mb-6">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Mô tả hội nghị</h4>
                                            <p className="text-gray-600 text-sm leading-relaxed">
                                                {contract.conferenceDescription}
                                            </p>
                                        </div>
                                    )}

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        {/* Financial Information */}
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-gray-900 flex items-center">
                                                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                                                Thông tin tài chính
                                            </h4>
                                            <div className="pl-7 space-y-3">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">
                                                        Tiền công
                                                    </label>
                                                    <p className="text-lg font-bold text-green-600">
                                                        {formatCurrency(contract.wage)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Date Information */}
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-gray-900 flex items-center">
                                                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                                                Thông tin thời gian
                                            </h4>
                                            <div className="pl-7 space-y-3">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Ngày ký</label>
                                                    <p className="text-gray-900">
                                                        {contract.signDay
                                                            ? format(new Date(contract.signDay), "dd/MM/yyyy", {
                                                                locale: vi,
                                                            })
                                                            : "N/A"}
                                                    </p>
                                                </div>
                                                {contract.expireDay && (
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">
                                                            Ngày hết hạn
                                                        </label>
                                                        <p className="text-gray-900">
                                                            {format(new Date(contract.expireDay), "dd/MM/yyyy", {
                                                                locale: vi,
                                                            })}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Conference Information */}
                                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                            <Building className="w-5 h-5 mr-2 text-purple-600" />
                                            Thông tin hội nghị
                                        </h4>
                                        <div className="space-y-2 pl-7">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">
                                                    ID Hội nghị
                                                </label>
                                                <p className="text-gray-900">{contract.conferenceId || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contract File */}
                                    {contract.contractUrl && (
                                        <div className="border-t pt-6">
                                            <a
                                                href={contract.contractUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                            >
                                                <FileText className="w-5 h-5" />
                                                Xem file hợp đồng
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="bg-gray-50 px-6 py-4 flex justify-end">
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition >
    );
};