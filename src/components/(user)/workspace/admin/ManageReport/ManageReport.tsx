"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  MoreVertical,
  Clock,
  UserX,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { SearchFilter } from "@/components/molecules/SearchFilter";
import { useReport } from "@/redux/hooks/useReport";
import { UnresolvedReportResponse, ReportResponseRequest } from "@/types/report.type";

// Report status badge component
const ReportStatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    pending: { color: "bg-yellow-100 text-yellow-800", label: "Chờ xử lý" },
    resolved: { color: "bg-green-100 text-green-800", label: "Đã xử lý" },
    rejected: { color: "bg-red-100 text-red-800", label: "Từ chối" },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return <Badge className={`${config.color} border-0`}>{config.label}</Badge>;
};

// Report type badge
const ReportTypeBadge = ({ type }: { type: string }) => {
  const typeConfig = {
    spam: { icon: AlertTriangle, color: "text-orange-600", label: "Spam" },
    inappropriate: {
      icon: XCircle,
      color: "text-red-600",
      label: "Nội dung không phù hợp",
    },
    fake: {
      icon: FileText,
      color: "text-purple-600",
      label: "Thông tin giả mạo",
    },
    other: { icon: MoreVertical, color: "text-gray-600", label: "Khác" },
  };

  const config =
    typeConfig[type as keyof typeof typeConfig] || typeConfig.other;
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1 ${config.color}`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
};

export default function ManageReport() {
  const { getUnresolvedReportsLazy, sendReportResponse, loading } = useReport();
  const [reports, setReports] = useState<UnresolvedReportResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const [selectedReport, setSelectedReport] = useState<UnresolvedReportResponse | null>(null);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState("");

  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [processSubject, setProcessSubject] = useState("");
  const [processReason, setProcessReason] = useState("");

  const loadReports = async () => {
    try {
      const response = await getUnresolvedReportsLazy();
      if (response && response.data) {
        setReports(response.data);
      }
    } catch (error) {
      console.error("Error loading reports:", error);
    }
  };

  // Load reports on component mount
  useEffect(() => {


    loadReports();
  }, [getUnresolvedReportsLazy]);

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "pending", label: "Chờ xử lý" },
    { value: "resolved", label: "Đã xử lý" },
    { value: "rejected", label: "Từ chối" },
  ];

  const typeOptions = [
    { value: "all", label: "Tất cả loại" },
    { value: "spam", label: "Spam" },
    { value: "inappropriate", label: "Không phù hợp" },
    { value: "fake", label: "Giả mạo" },
    { value: "other", label: "Khác" },
  ];

  // Stats calculation - all unresolved reports are pending
  const stats = {
    total: reports.length,
    pending: reports.length, // All unresolved reports are pending
    resolved: 0,
    rejected: 0,
  };

  // Filter reports
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.reportId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportSubject?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "all" || filterStatus === "pending"; // Only pending reports available
    const matchesType = filterType === "all" || report.reason === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleResolveReport = async () => {
    if (!processSubject.trim() || !processReason.trim()) {
      alert("Vui lòng nhập đầy đủ chủ đề và lý do xử lý");
      return;
    }

    if (selectedReport && selectedReport.reportId) {
      try {
        const responseData: ReportResponseRequest = {
          reportSubject: processSubject,
          reason: processReason,
        };

        await sendReportResponse(selectedReport.reportId, responseData);

        setReports(reports.filter((r) => r.reportId !== selectedReport.reportId));
        setShowResolveDialog(false);
        setSelectedReport(null);
        setActionNote("");

        loadReports();
      } catch (error) {
        console.error("Error resolving report:", error);
      }
    }
  };

  const handleRejectReport = async () => {
    if (selectedReport && selectedReport.reportId) {
      try {
        const responseData: ReportResponseRequest = {
          reportSubject: selectedReport.reportSubject || "",
          reason: actionNote || "Báo cáo bị từ chối",
        };

        await sendReportResponse(selectedReport.reportId, responseData);

        // Remove rejected report from the list
        setReports(reports.filter((r) => r.reportId !== selectedReport.reportId));
        setShowRejectDialog(false);
        setSelectedReport(null);
        setActionNote("");
      } catch (error) {
        console.error("Error rejecting report:", error);
      }
    }
  };

  const handleSuspendUser = () => {
    setShowSuspendDialog(false);
    setSelectedReport(null);
    setActionNote("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Báo cáo</h1>
          <p className="text-gray-600 mt-2">
            Xử lý các báo cáo spam và vi phạm từ người dùng
          </p>
        </div>

        {/* SearchFilter Component */}
        <SearchFilter
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Tìm theo ID, user, conference..."
          filters={[
            {
              value: filterStatus,
              onValueChange: setFilterStatus,
              options: statusOptions,
            },
            {
              value: filterType,
              onValueChange: setFilterType,
              options: typeOptions,
            },
          ]}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng báo cáo</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <FileText className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Chờ xử lý</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đã xử lý</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.resolved}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Từ chối</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.rejected}
                </p>
              </div>
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <Alert>
                <AlertDescription>
                  Không tìm thấy báo cáo nào phù hợp với điều kiện lọc.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div
                key={report.reportId}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  {/* Report Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-semibold text-blue-600">
                          {report.reportId}
                        </span>
                        <ReportStatusBadge status="pending" />
                        <ReportTypeBadge type={report.reason || "other"} />
                      </div>

                      <div className="text-sm text-gray-600">
                        <p>
                          <strong>Người báo cáo:</strong> {report.user?.email || "N/A"}
                        </p>
                        <p>
                          <strong>Tên người báo cáo:</strong> {report.user?.fullName || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          setSelectedReport(report);
                          setProcessSubject(report.reportSubject || "");
                          setProcessReason("");
                          setShowProcessDialog(true);
                        }}
                        disabled={loading}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Xử lý báo cáo
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setExpandedReport(
                            expandedReport === report.reportId ? null : report.reportId,
                          )
                        }
                      >
                        {expandedReport === report.reportId ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {/* <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowSuspendDialog(true);
                        }}
                        disabled={loading}
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        Suspend User
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-gray-600 hover:bg-gray-50"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowRejectDialog(true);
                        }}
                        disabled={loading}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Từ chối
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowResolveDialog(true);
                        }}
                        disabled={loading}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Xác nhận xử lý
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setExpandedReport(
                            expandedReport === report.reportId ? null : report.reportId,
                          )
                        }
                      >
                        {expandedReport === report.reportId ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div> */}
                  </div>

                  {/* Expanded Details */}
                  {expandedReport === report.reportId && (
                    <div className="pt-4 border-t space-y-3">
                      <div>
                        <Label className="text-sm font-semibold">
                          Chủ đề báo cáo:
                        </Label>
                        <p className="text-sm text-gray-700 mt-1">
                          {report.reportSubject || "N/A"}
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold">
                          Lý do báo cáo:
                        </Label>
                        <p className="text-sm text-gray-700 mt-1">
                          {report.reason || "N/A"}
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold">
                          Mô tả chi tiết:
                        </Label>
                        <p className="text-sm text-gray-700 mt-1">
                          {report.description || "N/A"}
                        </p>
                      </div>

                      <div>
                        <strong>Ngày tạo:</strong>{" "}
                        {report.createdAt ? formatDate(report.createdAt) : "N/A"}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">

                        <div>
                          <strong>Mã tài khoản:</strong> {report.userId || "N/A"}
                        </div>
                        <div>
                          <strong>Tên tài khoản:</strong> {report.user?.fullName || "N/A"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AlertDialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xử lý báo cáo</AlertDialogTitle>
            <AlertDialogDescription>
              Vui lòng nhập thông tin xử lý cho báo cáo{" "}
              <strong>{selectedReport?.reportId}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="process-subject">
                Chủ đề xử lý <span className="text-red-500">*</span>
              </Label>
              <input
                id="process-subject"
                type="text"
                className="w-full mt-2 p-2 border rounded-md"
                placeholder="Nhập chủ đề xử lý..."
                value={processSubject}
                onChange={(e) => setProcessSubject(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="process-reason">
                Lý do xử lý <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="process-reason"
                className="w-full mt-2 p-2 border rounded-md"
                rows={4}
                placeholder="Nhập lý do xử lý báo cáo..."
                value={processReason}
                onChange={(e) => setProcessReason(e.target.value)}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setProcessSubject("");
                setProcessReason("");
                setSelectedReport(null);
              }}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResolveReport}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading || !processSubject.trim() || !processReason.trim()}
            >
              {loading ? "Đang xử lý..." : "Xác nhận xử lý"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resolve Dialog */}
      {/* <AlertDialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xử lý báo cáo</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn đánh dấu báo cáo{" "}
              <strong>{selectedReport?.reportId}</strong> là đã xử lý? Hành động này
              sẽ xác nhận rằng vấn đề đã được giải quyết.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Label htmlFor="resolve-note">Ghi chú xử lý (tùy chọn)</Label>
            <textarea
              id="resolve-note"
              className="w-full mt-2 p-2 border rounded-md"
              rows={3}
              placeholder="Nhập ghi chú về cách xử lý..."
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setActionNote("");
                setSelectedReport(null);
              }}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResolveReport}
              className="bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}

      {/* Reject Dialog */}
      {/* <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Từ chối báo cáo</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn từ chối báo cáo{" "}
              <strong>{selectedReport?.reportId}</strong>? Hành động này sẽ đánh dấu
              báo cáo là không hợp lệ.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Label htmlFor="reject-note">Lý do từ chối</Label>
            <textarea
              id="reject-note"
              className="w-full mt-2 p-2 border rounded-md"
              rows={3}
              placeholder="Nhập lý do từ chối báo cáo..."
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setActionNote("");
                setSelectedReport(null);
              }}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectReport}
              className="bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Từ chối"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}

      {/* Suspend User Dialog */}
      {/* <AlertDialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Suspend tài khoản người dùng
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn suspend tài khoản{" "}
              <strong>{selectedReport?.user?.email}</strong>? Đây là hành động
              nghiêm trọng và người dùng sẽ không thể truy cập hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="suspend-duration">Thời gian suspend</Label>
              <Select>
                <SelectTrigger id="suspend-duration" className="mt-1">
                  <SelectValue placeholder="Chọn thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">7 ngày</SelectItem>
                  <SelectItem value="30days">30 ngày</SelectItem>
                  <SelectItem value="90days">90 ngày</SelectItem>
                  <SelectItem value="permanent">Vĩnh viễn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="suspend-reason">Lý do suspend</Label>
              <textarea
                id="suspend-reason"
                className="w-full mt-2 p-2 border rounded-md"
                rows={3}
                placeholder="Nhập lý do suspend tài khoản..."
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setActionNote("");
                setSelectedReport(null);
              }}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspendUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Suspend User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </div>
  );
}
