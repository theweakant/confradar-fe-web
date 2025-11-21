"use client";

import { useState, useMemo } from "react";
import { FileText, Search, Calendar, DollarSign, CheckCircle, XCircle } from "lucide-react";
import { useGetOwnReviewContractsQuery } from "@/redux/services/contract.service";
import { OwnContractDetailResponse } from "@/types/contract.type";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { OwnContractDetailDialog } from "./OwnContractDetailDialog";

type SortOption = "date-asc" | "date-desc" | "wage-asc" | "wage-desc" | "name-asc" | "name-desc";
type FilterStatus = "all" | "active" | "inactive";

export default function OwnContracts() {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("date-desc");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
    const [selectedContract, setSelectedContract] = useState<OwnContractDetailResponse | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const { data: contractsData, isLoading, error, refetch } = useGetOwnReviewContractsQuery();

    const contracts = contractsData?.data || [];

    // Filter and Search
    const filteredContracts = useMemo(() => {
        let result = [...contracts];

        // Search
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(
                (contract) =>
                    contract.conferenceName?.toLowerCase().includes(searchLower) ||
                    contract.conferenceDescription?.toLowerCase().includes(searchLower) ||
                    contract.reviewerContractId?.toLowerCase().includes(searchLower)
            );
        }

        // Filter by status
        if (filterStatus !== "all") {
            result = result.filter((contract) => {
                if (filterStatus === "active") return contract.isActive === true;
                if (filterStatus === "inactive") return contract.isActive === false;
                return true;
            });
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case "date-asc":
                    return new Date(a.signDay || 0).getTime() - new Date(b.signDay || 0).getTime();
                case "date-desc":
                    return new Date(b.signDay || 0).getTime() - new Date(a.signDay || 0).getTime();
                case "wage-asc":
                    return (a.wage || 0) - (b.wage || 0);
                case "wage-desc":
                    return (b.wage || 0) - (a.wage || 0);
                case "name-asc":
                    return (a.conferenceName || "").localeCompare(b.conferenceName || "");
                case "name-desc":
                    return (b.conferenceName || "").localeCompare(a.conferenceName || "");
                default:
                    return 0;
            }
        });

        return result;
    }, [contracts, searchTerm, filterStatus, sortBy]);

    const formatCurrency = (amount: number | undefined) => {
        if (!amount) return "N/A";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const handleViewDetail = (contract: OwnContractDetailResponse) => {
        setSelectedContract(contract);
        setIsDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setIsDetailOpen(false);
        setSelectedContract(null);
    };

    // Statistics
    const stats = {
        total: contracts.length,
        active: contracts.filter((c) => c.isActive === true).length,
        inactive: contracts.filter((c) => c.isActive === false).length,
        totalWage: contracts.reduce((sum, c) => sum + (c.wage || 0), 0),
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải danh sách hợp đồng...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Không thể tải danh sách hợp đồng</p>
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
                    <h1 className="text-3xl font-bold text-gray-900">Hợp đồng của tôi</h1>
                    <p className="text-gray-600 mt-2">Quản lý và xem chi tiết các hợp đồng đánh giá</p>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tổng hợp đồng</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Không hoạt động</p>
                                <p className="text-2xl font-bold text-red-600 mt-1">{stats.inactive}</p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tổng thu nhập</p>
                                <p className="text-xl font-bold text-gray-900 mt-1">
                                    {formatCurrency(stats.totalWage)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên hội nghị, ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="date-desc">Ngày ký: Mới nhất</option>
                            <option value="date-asc">Ngày ký: Cũ nhất</option>
                            <option value="wage-desc">Lương: Cao đến thấp</option>
                            <option value="wage-asc">Lương: Thấp đến cao</option>
                            <option value="name-asc">Tên: A-Z</option>
                            <option value="name-desc">Tên: Z-A</option>
                        </select>

                        {/* Filter Status */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Đang hoạt động</option>
                            <option value="inactive">Không hoạt động</option>
                        </select>
                    </div>

                    {/* Clear filters */}
                    {(searchTerm || sortBy !== "date-desc" || filterStatus !== "all") && (
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setSortBy("date-desc");
                                    setFilterStatus("all");
                                }}
                                className="text-sm text-blue-600 hover:text-blue-700"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    )}
                </div>

                {/* Contracts Grid */}
                {filteredContracts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredContracts.map((contract) => (
                            <div
                                key={contract.reviewerContractId}
                                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => handleViewDetail(contract)}
                            >
                                {/* Banner Image */}
                                {contract.conferenceBannerImageUrl ? (
                                    <img
                                        src={contract.conferenceBannerImageUrl}
                                        alt={contract.conferenceName}
                                        className="w-full h-48 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                        <FileText className="w-16 h-16 text-gray-400" />
                                    </div>
                                )}

                                {/* Content */}
                                <div className="p-6">
                                    {/* Status Badge */}
                                    <div className="mb-3">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${contract.isActive
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {contract.isActive ? "Hoạt động" : "Không hoạt động"}
                                        </span>
                                    </div>

                                    {/* Conference Name */}
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                                        {contract.conferenceName || "N/A"}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                                        {contract.conferenceDescription || "Không có mô tả"}
                                    </p>

                                    {/* Details */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-sm">
                                            <DollarSign className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                                            <span className="font-semibold text-green-600">
                                                {formatCurrency(contract.wage)}
                                            </span>
                                        </div>

                                        <div className="flex items-center text-sm text-gray-600">
                                            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                                            <span>
                                                {contract.signDay
                                                    ? format(new Date(contract.signDay), "dd/MM/yyyy", { locale: vi })
                                                    : "N/A"}
                                            </span>
                                        </div>

                                        {contract.expireDay && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                                                <span>
                                                    Hết hạn:{" "}
                                                    {format(new Date(contract.expireDay), "dd/MM/yyyy", { locale: vi })}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Contract ID */}
                                    <p className="text-xs text-gray-500 mb-3">ID: {contract.reviewerContractId}</p>

                                    {/* View Button */}
                                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                        Xem chi tiết
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy hợp đồng</h3>
                        <p className="text-gray-600">
                            {searchTerm || filterStatus !== "all"
                                ? "Thử điều chỉnh bộ lọc hoặc tìm kiếm"
                                : "Bạn chưa có hợp đồng nào"}
                        </p>
                    </div>
                )}
            </div>

            {/* Detail Dialog */}
            <OwnContractDetailDialog
                isOpen={isDetailOpen}
                onClose={handleCloseDetail}
                contract={selectedContract}
            />
        </div>
    );
}