"use client";

import { useState, useEffect } from "react";
import {
    FileText,
    User,
    Calendar,
    Activity,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchFilter } from "@/components/molecules/SearchFilter";
import {
    useLazyGetAuditLogsQuery,
    useLazyGetAuditLogCategoriesQuery,
} from "@/redux/services/auditlog.service";
import { AuditLogItem, AuditLogCategory } from "@/types/auditlog.type";

// Category badge component
const CategoryBadge = ({ categoryName }: { categoryName: string }) => {
    const categoryColors: Record<string, string> = {
        USER: "bg-blue-100 text-blue-800",
        CONFERENCE: "bg-green-100 text-green-800",
        REPORT: "bg-orange-100 text-orange-800",
        SYSTEM: "bg-purple-100 text-purple-800",
        SECURITY: "bg-red-100 text-red-800",
    };

    const color =
        categoryColors[categoryName.toUpperCase()] ||
        "bg-gray-100 text-gray-800";

    return <Badge className={`${color} border-0`}>{categoryName}</Badge>;
};

export default function ManageSystemLogs() {
    const [getAuditLogs, { isLoading: logsLoading }] = useLazyGetAuditLogsQuery();
    const [getCategories, { isLoading: categoriesLoading }] =
        useLazyGetAuditLogCategoriesQuery();

    const [allLogs, setAllLogs] = useState<AuditLogItem[]>([]);
    const [categories, setCategories] = useState<AuditLogCategory[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [activeTab, setActiveTab] = useState("all");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const loadData = async () => {
        try {
            const [logsResponse, categoriesResponse] = await Promise.all([
                getAuditLogs(),
                getCategories(),
            ]);

            const logsResponsePrint = await getAuditLogs().unwrap().catch((e) => console.log("ERR LOGS", e));
            const catResponse = await getCategories().unwrap().catch((e) => console.log("ERR CAT", e));

            console.log("LOGS", logsResponsePrint);
            console.log("CATEGORIES", catResponse);

            if (logsResponse?.data?.data) {
                setAllLogs(logsResponse.data.data);
            }

            if (categoriesResponse?.data?.data) {
                setCategories(categoriesResponse.data.data);
            }
        } catch (error) {
            console.error("Error loading audit logs:", error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filter logs
    const filteredLogs = allLogs.filter((log) => {
        const matchesSearch =
            log.actionDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.userFullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.auditLogId?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
            selectedCategory === "all" || log.categoryId === selectedCategory;

        const matchesTab =
            activeTab === "all" || log.categoryId === activeTab;

        return matchesSearch && matchesCategory && matchesTab;
    });

    // Pagination calculation
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategory, activeTab]);

    // Category options for filter
    const categoryOptions = [
        { value: "all", label: "Tất cả danh mục" },
        ...categories.map((cat) => ({
            value: cat.categoryId,
            label: cat.name,
        })),
    ];

    // Stats calculation
    const stats = {
        total: allLogs.length,
        byCategory: categories.reduce(
            (acc, cat) => {
                acc[cat.categoryId] = allLogs.filter(
                    (log) => log.categoryId === cat.categoryId
                ).length;
                return acc;
            },
            {} as Record<string, number>
        ),
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Quản lý System Logs
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Theo dõi và kiểm tra các hoạt động hệ thống
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Tổng logs</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats.total}
                                </p>
                            </div>
                            <Activity className="w-10 h-10 text-blue-500" />
                        </div>
                    </div>

                    {categories.slice(0, 3).map((cat) => (
                        <div key={cat.categoryId} className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">{cat.name}</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {stats.byCategory[cat.categoryId] || 0}
                                    </p>
                                </div>
                                <FileText className="w-10 h-10 text-green-500" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search and Filters */}
                <SearchFilter
                    searchValue={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="Tìm theo ID, user, hoạt động..."
                    filters={[
                        {
                            value: selectedCategory,
                            onValueChange: setSelectedCategory,
                            options: categoryOptions,
                        },
                    ]}
                />

                {/* Tabs by Category */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-6">
                            <TabsTrigger value="all">Tất cả</TabsTrigger>
                            {categories.map((cat) => (
                                <TabsTrigger key={cat.categoryId} value={cat.categoryId}>
                                    {cat.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value={activeTab}>
                            {/* Logs List */}
                            <div className="space-y-3">
                                {logsLoading || categoriesLoading ? (
                                    <Alert>
                                        <AlertDescription>Đang tải dữ liệu...</AlertDescription>
                                    </Alert>
                                ) : paginatedLogs.length === 0 ? (
                                    <Alert>
                                        <AlertDescription>
                                            Không tìm thấy log nào phù hợp với điều kiện lọc.
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    paginatedLogs.map((log) => (
                                        <div
                                            key={log.auditLogId}
                                            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-mono text-xs text-gray-500">
                                                            {log.auditLogId}
                                                        </span>
                                                        <CategoryBadge categoryName={log.categoryName} />
                                                    </div>

                                                    <p className="text-sm font-medium text-gray-900">
                                                        {log.actionDescription}
                                                    </p>

                                                    <div className="flex items-center gap-4 text-xs text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                            <User className="w-3 h-3" />
                                                            <span>{log.userFullName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>{formatDate(log.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {log.userAvatarUrl && (
                                                    <img
                                                        src={log.userAvatarUrl}
                                                        alt={log.userFullName}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Pagination */}
                            {!logsLoading && !categoriesLoading && paginatedLogs.length > 0 && (
                                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                                    <div className="text-sm text-gray-600">
                                        Hiển thị {startIndex + 1} - {Math.min(endIndex, filteredLogs.length)} / {filteredLogs.length} logs
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>

                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                .filter((page) => {
                                                    // Show first page, last page, current page, and adjacent pages
                                                    return (
                                                        page === 1 ||
                                                        page === totalPages ||
                                                        Math.abs(page - currentPage) <= 1
                                                    );
                                                })
                                                .map((page, idx, arr) => (
                                                    <div key={page} className="flex items-center">
                                                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                                                            <span className="px-2 text-gray-400">...</span>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant={currentPage === page ? "default" : "outline"}
                                                            onClick={() => setCurrentPage(page)}
                                                            className={
                                                                currentPage === page
                                                                    ? "bg-blue-600 hover:bg-blue-700"
                                                                    : ""
                                                            }
                                                        >
                                                            {page}
                                                        </Button>
                                                    </div>
                                                ))}
                                        </div>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                                            }
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}