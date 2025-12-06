"use client";

import {
    Flag,
    Calendar,
    CheckCircle2,
    X,
    Clock,
    User,
    MessageSquare,
    AlertCircle,
    Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useReport } from "@/redux/hooks/useReport";
import { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import type { OwnReportResponse } from "@/types/report.type";
import { toast } from "sonner";

export default function OwnReports() {
    const {
        ownReports,
        loading,
        ownReportsError,
        getOwnReportsLazy,
        createReport,
        loading: submitLoading
    } = useReport();

    const [selectedFilter, setSelectedFilter] = useState<string>("all");
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
    const [reportForm, setReportForm] = useState({
        reportSubject: '',
        reason: '',
        description: ''
    });

    const filterOptions = [
        { id: "all", label: "Tất cả" },
        { id: "pending", label: "Chờ xử lý" },
        { id: "resolved", label: "Đã xử lý" },
    ];

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            await getOwnReportsLazy();
        } catch (error) {
            toast.error("Không thể tải danh sách báo cáo");
        }
    };

    const handleSubmitReport = async () => {
        if (!reportForm.reportSubject || !reportForm.reason || !reportForm.description) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            await createReport(reportForm);
            toast.success('Gửi báo cáo thành công!');
            setIsReportDialogOpen(false);
            setReportForm({ reportSubject: '', reason: '', description: '' });
            fetchReports();
        } catch (error) {
            toast.error('Có lỗi xảy ra khi gửi báo cáo');
        }
    };

    const handleFilterChange = (id: string) => {
        setSelectedFilter(id);
    };

    const filterReports = (reportList: typeof ownReports) => {
        return reportList.filter((report) => {
            switch (selectedFilter) {
                case "pending":
                    return !report.hasResolve;
                case "resolved":
                    return report.hasResolve;
                default:
                    return true;
            }
        });
    };

    const filteredReports = filterReports(ownReports);

    const getStatusBadge = (hasResolve: boolean) => {
        if (hasResolve) {
            return (
                <Badge className="bg-green-100 text-green-800 border-green-300">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Đã xử lý
                </Badge>
            );
        }
        return (
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                <Clock className="h-3 w-3 mr-1" />
                Chờ xử lý
            </Badge>
        );
    };

    const formatDateTime = (dateString: string) => {
        return new Intl.DateTimeFormat("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(dateString));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải báo cáo của bạn...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (ownReportsError) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-16">
                        <div className="text-red-600 mb-4">
                            Có lỗi xảy ra khi tải dữ liệu
                        </div>
                        <p className="text-gray-600">{ownReportsError.data?.message}</p>
                        <Button
                            onClick={fetchReports}
                            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            Thử lại
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Flag className="h-8 w-8 text-purple-600" />
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                                Báo cáo của tôi
                            </h1>
                        </div>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Quản lý và theo dõi các báo cáo vấn đề bạn đã gửi
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsReportDialogOpen(true)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Báo cáo mới
                    </Button>
                </div>

                {/* Filter Options */}
                <div className="mb-8 overflow-x-auto">
                    <div className="flex gap-3 min-w-max pb-2">
                        {filterOptions.map((option) => (
                            <Button
                                key={option.id}
                                onClick={() => handleFilterChange(option.id)}
                                variant={selectedFilter === option.id ? "default" : "outline"}
                                className={`whitespace-nowrap ${selectedFilter === option.id
                                    ? "bg-purple-600 text-white hover:bg-purple-700 border-purple-600"
                                    : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                                    }`}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Reports List */}
                <div className="space-y-6">
                    {filteredReports.map((report) => (
                        <Card
                            key={report.reportId}
                            className="bg-white border-gray-200 hover:shadow-lg hover:shadow-purple-100 transition-shadow"
                        >
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Left Section - Report Info */}
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                <AlertCircle className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                                                <div className="flex-1 min-w-0">
                                                    <h2 className="text-xl font-bold text-gray-900 leading-tight mb-1">
                                                        {report.reportSubject}
                                                    </h2>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Calendar className="h-4 w-4" />
                                                        {formatDateTime(report.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                            {getStatusBadge(report.hasResolve)}
                                        </div>

                                        {/* Reason */}
                                        <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                                            <div className="text-xs text-gray-500 mb-1">Lý do</div>
                                            <div className="text-sm text-gray-900">{report.reason}</div>
                                        </div>

                                        {/* Description */}
                                        <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                                            <div className="text-xs text-gray-500 mb-1">Mô tả</div>
                                            <div className="text-sm text-gray-700 whitespace-pre-wrap">
                                                {report.description}
                                            </div>
                                        </div>

                                        {/* User Info */}
                                        {report.user && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <User className="h-4 w-4" />
                                                <span>Người gửi: {report.user.fullName || report.user.userName || report.user.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Section - Feedback */}
                                    <div className="flex flex-col">
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                                <MessageSquare className="h-5 w-5 text-green-600" />
                                                Phản hồi
                                            </h3>

                                            {report.reportFeedback ? (
                                                <div className="space-y-3">
                                                    {/* Admin Info */}
                                                    {report.reportFeedback.admin && (
                                                        <div className="bg-white p-3 rounded border border-gray-200">
                                                            <div className="text-xs text-gray-500 mb-1">Quản trị viên</div>
                                                            <div className="text-sm text-gray-900 flex items-center gap-2">
                                                                <User className="h-4 w-4 text-purple-600" />
                                                                {report.reportFeedback.admin.fullName ||
                                                                    report.reportFeedback.admin.userName ||
                                                                    report.reportFeedback.admin.email}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Feedback Subject */}
                                                    {report.reportFeedback.reportSubject && (
                                                        <div className="bg-green-50 border border-green-200 p-3 rounded">
                                                            <div className="text-xs text-gray-500 mb-1">Tiêu đề phản hồi</div>
                                                            <div className="text-sm text-gray-900 font-medium">
                                                                {report.reportFeedback.reportSubject}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Feedback Reason */}
                                                    {report.reportFeedback.reason && (
                                                        <div className="bg-green-50 border border-green-200 p-3 rounded">
                                                            <div className="text-xs text-gray-500 mb-1">Nội dung phản hồi</div>
                                                            <div className="text-sm text-gray-800 whitespace-pre-wrap">
                                                                {report.reportFeedback.reason}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-2 text-sm text-green-600 pt-2">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        <span>Đã được xử lý</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                                                    <Clock className="h-12 w-12 text-gray-300 mb-3" />
                                                    <p className="text-gray-600 text-sm">
                                                        Chưa có phản hồi từ quản trị viên
                                                    </p>
                                                    <p className="text-gray-500 text-xs mt-1">
                                                        Báo cáo của bạn đang được xem xét
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {filteredReports.length === 0 && (
                    <div className="text-center py-16">
                        <Flag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            Chưa có báo cáo nào
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {selectedFilter === "all"
                                ? "Bạn chưa gửi báo cáo nào"
                                : selectedFilter === "pending"
                                    ? "Không có báo cáo đang chờ xử lý"
                                    : "Không có báo cáo đã xử lý"}
                        </p>
                        <Button
                            onClick={() => setIsReportDialogOpen(true)}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Tạo báo cáo mới
                        </Button>
                    </div>
                )}
            </div>

            {/* Create Report Dialog */}
            <Transition appear show={isReportDialogOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsReportDialogOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-50" />
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
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border border-gray-200">
                                    <div className="flex justify-between items-center mb-4">
                                        <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                                            Báo cáo vấn đề
                                        </Dialog.Title>
                                        <button
                                            onClick={() => setIsReportDialogOpen(false)}
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tiêu đề <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={reportForm.reportSubject}
                                                onChange={(e) => setReportForm({ ...reportForm, reportSubject: e.target.value })}
                                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                                placeholder="Nhập tiêu đề báo cáo"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Lý do <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={reportForm.reason}
                                                onChange={(e) => setReportForm({ ...reportForm, reason: e.target.value })}
                                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                                placeholder="Nhập lý do báo cáo"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Mô tả chi tiết <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                rows={4}
                                                value={reportForm.description}
                                                onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
                                                placeholder="Mô tả chi tiết vấn đề của bạn"
                                            />
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsReportDialogOpen(false)}
                                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSubmitReport}
                                                disabled={submitLoading}
                                                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {submitLoading ? 'Đang gửi...' : 'Gửi báo cáo'}
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}

// "use client";

// import {
//     Flag,
//     Calendar,
//     CheckCircle2,
//     X,
//     Clock,
//     User,
//     MessageSquare,
//     AlertCircle,
//     Plus,
// } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { useReport } from "@/redux/hooks/useReport";
// import { useEffect, useState, Fragment } from "react";
// import { Dialog, Transition } from "@headlessui/react";
// import type { OwnReportResponse } from "@/types/report.type";
// import { toast } from "sonner";

// export default function OwnReports() {
//     const {
//         ownReports,
//         loading,
//         ownReportsError,
//         getOwnReportsLazy,
//         createReport,
//         loading: submitLoading
//     } = useReport();

//     const [selectedFilter, setSelectedFilter] = useState<string>("all");
//     const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
//     const [reportForm, setReportForm] = useState({
//         reportSubject: '',
//         reason: '',
//         description: ''
//     });

//     const filterOptions = [
//         { id: "all", label: "Tất cả" },
//         { id: "pending", label: "Chờ xử lý" },
//         { id: "resolved", label: "Đã xử lý" },
//     ];

//     useEffect(() => {
//         fetchReports();
//     }, []);

//     const fetchReports = async () => {
//         try {
//             await getOwnReportsLazy();
//         } catch (error) {
//             toast.error("Không thể tải danh sách báo cáo");
//         }
//     };

//     const handleSubmitReport = async () => {
//         if (!reportForm.reportSubject || !reportForm.reason || !reportForm.description) {
//             toast.error('Vui lòng điền đầy đủ thông tin');
//             return;
//         }

//         try {
//             await createReport(reportForm);
//             toast.success('Gửi báo cáo thành công!');
//             setIsReportDialogOpen(false);
//             setReportForm({ reportSubject: '', reason: '', description: '' });
//             fetchReports();
//         } catch (error) {
//             toast.error('Có lỗi xảy ra khi gửi báo cáo');
//         }
//     };

//     const handleFilterChange = (id: string) => {
//         setSelectedFilter(id);
//     };

//     const filterReports = (reportList: typeof ownReports) => {
//         return reportList.filter((report) => {
//             switch (selectedFilter) {
//                 case "pending":
//                     return !report.hasResolve;
//                 case "resolved":
//                     return report.hasResolve;
//                 default:
//                     return true;
//             }
//         });
//     };

//     const filteredReports = filterReports(ownReports);

//     const getStatusBadge = (hasResolve: boolean) => {
//         if (hasResolve) {
//             return (
//                 <Badge className="bg-green-800 text-green-200 border-green-600">
//                     <CheckCircle2 className="h-3 w-3 mr-1" />
//                     Đã xử lý
//                 </Badge>
//             );
//         }
//         return (
//             <Badge className="bg-yellow-800 text-yellow-200 border-yellow-600">
//                 <Clock className="h-3 w-3 mr-1" />
//                 Chờ xử lý
//             </Badge>
//         );
//     };

//     const formatDateTime = (dateString: string) => {
//         return new Intl.DateTimeFormat("vi-VN", {
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//             hour: "2-digit",
//             minute: "2-digit",
//         }).format(new Date(dateString));
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
//                 <div className="max-w-7xl mx-auto">
//                     <div className="text-center py-16">
//                         <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
//                         <p className="text-gray-400">Đang tải báo cáo của bạn...</p>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     if (ownReportsError) {
//         return (
//             <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
//                 <div className="max-w-7xl mx-auto">
//                     <div className="text-center py-16">
//                         <div className="text-red-400 mb-4">
//                             Có lỗi xảy ra khi tải dữ liệu
//                         </div>
//                         <p className="text-gray-400">{ownReportsError.data?.message}</p>
//                         <Button
//                             onClick={fetchReports}
//                             className="mt-4 bg-purple-600 hover:bg-purple-700"
//                         >
//                             Thử lại
//                         </Button>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
//             <div className="max-w-7xl mx-auto">
//                 {/* Page Header */}
//                 <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                     <div>
//                         <div className="flex items-center gap-3 mb-2">
//                             <Flag className="h-8 w-8 text-purple-400" />
//                             <h1 className="text-3xl sm:text-4xl font-bold text-white">
//                                 Báo cáo của tôi
//                             </h1>
//                         </div>
//                         <p className="text-gray-400 text-sm sm:text-base">
//                             Quản lý và theo dõi các báo cáo vấn đề bạn đã gửi
//                         </p>
//                     </div>
//                     <Button
//                         onClick={() => setIsReportDialogOpen(true)}
//                         className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg"
//                     >
//                         <Plus className="h-5 w-5 mr-2" />
//                         Báo cáo mới
//                     </Button>
//                 </div>

//                 {/* Filter Options */}
//                 <div className="mb-8 overflow-x-auto">
//                     <div className="flex gap-3 min-w-max pb-2">
//                         {filterOptions.map((option) => (
//                             <Button
//                                 key={option.id}
//                                 onClick={() => handleFilterChange(option.id)}
//                                 variant={selectedFilter === option.id ? "default" : "outline"}
//                                 className={`whitespace-nowrap ${selectedFilter === option.id
//                                     ? "bg-purple-600 text-white hover:bg-purple-700 border-purple-600"
//                                     : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600"
//                                     }`}
//                             >
//                                 {option.label}
//                             </Button>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Reports List */}
//                 <div className="space-y-6">
//                     {filteredReports.map((report) => (
//                         <Card
//                             key={report.reportId}
//                             className="bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-purple-500/10 transition-shadow"
//                         >
//                             <CardContent className="p-6">
//                                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                                     {/* Left Section - Report Info */}
//                                     <div className="space-y-4">
//                                         <div className="flex items-start justify-between gap-4">
//                                             <div className="flex items-start gap-3 flex-1">
//                                                 <AlertCircle className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" />
//                                                 <div className="flex-1 min-w-0">
//                                                     <h2 className="text-xl font-bold text-white leading-tight mb-1">
//                                                         {report.reportSubject}
//                                                     </h2>
//                                                     <div className="flex items-center gap-2 text-sm text-gray-400">
//                                                         <Calendar className="h-4 w-4" />
//                                                         {formatDateTime(report.createdAt)}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                             {getStatusBadge(report.hasResolve)}
//                                         </div>

//                                         {/* Reason */}
//                                         <div className="bg-gray-700/50 border border-gray-600 p-3 rounded-lg">
//                                             <div className="text-xs text-gray-400 mb-1">Lý do</div>
//                                             <div className="text-sm text-white">{report.reason}</div>
//                                         </div>

//                                         {/* Description */}
//                                         <div className="bg-gray-700/50 border border-gray-600 p-3 rounded-lg">
//                                             <div className="text-xs text-gray-400 mb-1">Mô tả</div>
//                                             <div className="text-sm text-gray-300 whitespace-pre-wrap">
//                                                 {report.description}
//                                             </div>
//                                         </div>

//                                         {/* User Info */}
//                                         {report.user && (
//                                             <div className="flex items-center gap-2 text-sm text-gray-400">
//                                                 <User className="h-4 w-4" />
//                                                 <span>Người gửi: {report.user.fullName || report.user.userName || report.user.email}</span>
//                                             </div>
//                                         )}
//                                     </div>

//                                     {/* Right Section - Feedback */}
//                                     <div className="flex flex-col">
//                                         <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4 flex-1">
//                                             <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
//                                                 <MessageSquare className="h-5 w-5 text-green-400" />
//                                                 Phản hồi
//                                             </h3>

//                                             {report.reportFeedback ? (
//                                                 <div className="space-y-3">
//                                                     {/* Admin Info */}
//                                                     {report.reportFeedback.admin && (
//                                                         <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
//                                                             <div className="text-xs text-gray-400 mb-1">Quản trị viên</div>
//                                                             <div className="text-sm text-white flex items-center gap-2">
//                                                                 <User className="h-4 w-4 text-purple-400" />
//                                                                 {report.reportFeedback.admin.fullName ||
//                                                                     report.reportFeedback.admin.userName ||
//                                                                     report.reportFeedback.admin.email}
//                                                             </div>
//                                                         </div>
//                                                     )}

//                                                     {/* Feedback Subject */}
//                                                     {report.reportFeedback.reportSubject && (
//                                                         <div className="bg-green-900/20 border border-green-600/50 p-3 rounded">
//                                                             <div className="text-xs text-gray-400 mb-1">Tiêu đề phản hồi</div>
//                                                             <div className="text-sm text-white font-medium">
//                                                                 {report.reportFeedback.reportSubject}
//                                                             </div>
//                                                         </div>
//                                                     )}

//                                                     {/* Feedback Reason */}
//                                                     {report.reportFeedback.reason && (
//                                                         <div className="bg-green-900/20 border border-green-600/50 p-3 rounded">
//                                                             <div className="text-xs text-gray-400 mb-1">Nội dung phản hồi</div>
//                                                             <div className="text-sm text-gray-200 whitespace-pre-wrap">
//                                                                 {report.reportFeedback.reason}
//                                                             </div>
//                                                         </div>
//                                                     )}

//                                                     <div className="flex items-center gap-2 text-sm text-green-400 pt-2">
//                                                         <CheckCircle2 className="h-4 w-4" />
//                                                         <span>Đã được xử lý</span>
//                                                     </div>
//                                                 </div>
//                                             ) : (
//                                                 <div className="flex flex-col items-center justify-center h-full py-8 text-center">
//                                                     <Clock className="h-12 w-12 text-gray-600 mb-3" />
//                                                     <p className="text-gray-400 text-sm">
//                                                         Chưa có phản hồi từ quản trị viên
//                                                     </p>
//                                                     <p className="text-gray-500 text-xs mt-1">
//                                                         Báo cáo của bạn đang được xem xét
//                                                     </p>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </div>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     ))}
//                 </div>

//                 {/* Empty State */}
//                 {filteredReports.length === 0 && (
//                     <div className="text-center py-16">
//                         <Flag className="h-16 w-16 text-gray-600 mx-auto mb-4" />
//                         <h3 className="text-xl font-semibold text-gray-400 mb-2">
//                             Chưa có báo cáo nào
//                         </h3>
//                         <p className="text-gray-500 mb-4">
//                             {selectedFilter === "all"
//                                 ? "Bạn chưa gửi báo cáo nào"
//                                 : selectedFilter === "pending"
//                                     ? "Không có báo cáo đang chờ xử lý"
//                                     : "Không có báo cáo đã xử lý"}
//                         </p>
//                         <Button
//                             onClick={() => setIsReportDialogOpen(true)}
//                             className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
//                         >
//                             <Plus className="h-5 w-5 mr-2" />
//                             Tạo báo cáo mới
//                         </Button>
//                     </div>
//                 )}
//             </div>

//             {/* Create Report Dialog */}
//             <Transition appear show={isReportDialogOpen} as={Fragment}>
//                 <Dialog as="div" className="relative z-50" onClose={() => setIsReportDialogOpen(false)}>
//                     <Transition.Child
//                         as={Fragment}
//                         enter="ease-out duration-300"
//                         enterFrom="opacity-0"
//                         enterTo="opacity-100"
//                         leave="ease-in duration-200"
//                         leaveFrom="opacity-100"
//                         leaveTo="opacity-0"
//                     >
//                         <div className="fixed inset-0 bg-black bg-opacity-75" />
//                     </Transition.Child>

//                     <div className="fixed inset-0 overflow-y-auto">
//                         <div className="flex min-h-full items-center justify-center p-4">
//                             <Transition.Child
//                                 as={Fragment}
//                                 enter="ease-out duration-300"
//                                 enterFrom="opacity-0 scale-95"
//                                 enterTo="opacity-100 scale-100"
//                                 leave="ease-in duration-200"
//                                 leaveFrom="opacity-100 scale-100"
//                                 leaveTo="opacity-0 scale-95"
//                             >
//                                 <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-900 p-6 text-left align-middle shadow-xl transition-all border border-gray-700">
//                                     <div className="flex justify-between items-center mb-4">
//                                         <Dialog.Title as="h3" className="text-lg font-medium text-white">
//                                             Báo cáo vấn đề
//                                         </Dialog.Title>
//                                         <button
//                                             onClick={() => setIsReportDialogOpen(false)}
//                                             className="text-gray-400 hover:text-white transition-colors"
//                                         >
//                                             <X size={20} />
//                                         </button>
//                                     </div>

//                                     <div className="space-y-4">
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-300 mb-2">
//                                                 Tiêu đề <span className="text-red-500">*</span>
//                                             </label>
//                                             <input
//                                                 type="text"
//                                                 value={reportForm.reportSubject}
//                                                 onChange={(e) => setReportForm({ ...reportForm, reportSubject: e.target.value })}
//                                                 className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
//                                                 placeholder="Nhập tiêu đề báo cáo"
//                                             />
//                                         </div>

//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-300 mb-2">
//                                                 Lý do <span className="text-red-500">*</span>
//                                             </label>
//                                             <input
//                                                 type="text"
//                                                 value={reportForm.reason}
//                                                 onChange={(e) => setReportForm({ ...reportForm, reason: e.target.value })}
//                                                 className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
//                                                 placeholder="Nhập lý do báo cáo"
//                                             />
//                                         </div>

//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-300 mb-2">
//                                                 Mô tả chi tiết <span className="text-red-500">*</span>
//                                             </label>
//                                             <textarea
//                                                 rows={4}
//                                                 value={reportForm.description}
//                                                 onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
//                                                 className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
//                                                 placeholder="Mô tả chi tiết vấn đề của bạn"
//                                             />
//                                         </div>

//                                         <div className="flex gap-3 pt-2">
//                                             <button
//                                                 type="button"
//                                                 onClick={() => setIsReportDialogOpen(false)}
//                                                 className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
//                                             >
//                                                 Hủy
//                                             </button>
//                                             <button
//                                                 type="button"
//                                                 onClick={handleSubmitReport}
//                                                 disabled={submitLoading}
//                                                 className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                                             >
//                                                 {submitLoading ? 'Đang gửi...' : 'Gửi báo cáo'}
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </Dialog.Panel>
//                             </Transition.Child>
//                         </div>
//                     </div>
//                 </Dialog>
//             </Transition>
//         </div>
//     );
// }