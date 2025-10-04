"use client";

import { useState } from 'react';
import { 
  Eye,
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  MoreVertical,
  Clock,
  UserX,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SearchFilter } from '@/components/molecules/SearchFilter';

// Report status badge component
const ReportStatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Chờ xử lý' },
    resolved: { color: 'bg-green-100 text-green-800', label: 'Đã xử lý' },
    rejected: { color: 'bg-red-100 text-red-800', label: 'Từ chối' },
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  
  return (
    <Badge className={`${config.color} border-0`}>
      {config.label}
    </Badge>
  );
};

// Report type badge
const ReportTypeBadge = ({ type }: { type: string }) => {
  const typeConfig = {
    spam: { icon: AlertTriangle, color: 'text-orange-600', label: 'Spam' },
    inappropriate: { icon: XCircle, color: 'text-red-600', label: 'Nội dung không phù hợp' },
    fake: { icon: FileText, color: 'text-purple-600', label: 'Thông tin giả mạo' },
    other: { icon: MoreVertical, color: 'text-gray-600', label: 'Khác' },
  };
  
  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.other;
  const Icon = config.icon;
  
  return (
    <div className={`flex items-center gap-1 ${config.color}`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
};

// Mock data
interface Report {
  id: string;
  type: string;
  status: string;
  reportedBy: string;
  reportedUser: string;
  conference: string;
  reason: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const mockReports: Report[] = [
  {
    id: 'RPT001',
    type: 'spam',
    status: 'pending',
    reportedBy: 'user123@email.com',
    reportedUser: 'spammer@email.com',
    conference: 'ICSE 2025 - International Conference on Software Engineering',
    reason: 'Spam nhiều lần',
    description: 'User này đăng cùng một nội dung quảng cáo nhiều lần trong các conference khác nhau',
    createdAt: '2025-09-28T10:30:00',
    updatedAt: '2025-09-28T10:30:00'
  },
  {
    id: 'RPT002',
    type: 'inappropriate',
    status: 'pending',
    reportedBy: 'admin@confradar.com',
    reportedUser: 'baduser@email.com',
    conference: 'ACM CHI 2025 - Conference on Human Factors',
    reason: 'Nội dung không phù hợp',
    description: 'Comment có nội dung xúc phạm và không phù hợp với cộng đồng',
    createdAt: '2025-09-27T15:20:00',
    updatedAt: '2025-09-27T15:20:00'
  },
  {
    id: 'RPT003',
    type: 'fake',
    status: 'resolved',
    reportedBy: 'user456@email.com',
    reportedUser: 'faker@email.com',
    conference: 'NeurIPS 2025 - Neural Information Processing Systems',
    reason: 'Thông tin conference giả mạo',
    description: 'Đăng thông tin conference giả mạo để lừa đảo phí đăng ký',
    createdAt: '2025-09-26T09:15:00',
    updatedAt: '2025-09-28T14:30:00'
  },
  {
    id: 'RPT004',
    type: 'spam',
    status: 'rejected',
    reportedBy: 'user789@email.com',
    reportedUser: 'normal@email.com',
    conference: 'CVPR 2025 - Computer Vision and Pattern Recognition',
    reason: 'Báo cáo sai',
    description: 'Báo cáo không có căn cứ',
    createdAt: '2025-09-25T11:00:00',
    updatedAt: '2025-09-27T16:45:00'
  },
];

export default function ManageReport() {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState('');

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "pending", label: "Chờ xử lý" },
    { value: "resolved", label: "Đã xử lý" },
    { value: "rejected", label: "Từ chối" }
  ];

  const typeOptions = [
    { value: "all", label: "Tất cả loại" },
    { value: "spam", label: "Spam" },
    { value: "inappropriate", label: "Không phù hợp" },
    { value: "fake", label: "Giả mạo" },
    { value: "other", label: "Khác" }
  ];

  // Stats calculation
  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    rejected: reports.filter(r => r.status === 'rejected').length,
  };

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportedUser.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.conference.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || report.status === filterStatus;
    const matchesType = filterType === "all" || report.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleResolveReport = () => {
    if (selectedReport) {
      setReports(reports.map(r => 
        r.id === selectedReport.id 
          ? { ...r, status: 'resolved', updatedAt: new Date().toISOString() }
          : r
      ));
      setShowResolveDialog(false);
      setSelectedReport(null);
      setActionNote('');
    }
  };

  const handleRejectReport = () => {
    if (selectedReport) {
      setReports(reports.map(r => 
        r.id === selectedReport.id 
          ? { ...r, status: 'rejected', updatedAt: new Date().toISOString() }
          : r
      ));
      setShowRejectDialog(false);
      setSelectedReport(null);
      setActionNote('');
    }
  };

  const handleSuspendUser = () => {
    setShowSuspendDialog(false);
    setSelectedReport(null);
    setActionNote('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
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
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
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
              <div key={report.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  {/* Report Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-semibold text-blue-600">
                          {report.id}
                        </span>
                        <ReportStatusBadge status={report.status} />
                        <ReportTypeBadge type={report.type} />
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p><strong>Người báo cáo:</strong> {report.reportedBy}</p>
                        <p><strong>Người bị báo cáo:</strong> {report.reportedUser}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {report.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => {
                              setSelectedReport(report);
                              setShowSuspendDialog(true);
                            }}
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
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Xác nhận xử lý
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpandedReport(
                          expandedReport === report.id ? null : report.id
                        )}
                      >
                        {expandedReport === report.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedReport === report.id && (
                    <div className="pt-4 border-t space-y-3">
                      <div>
                        <Label className="text-sm font-semibold">Conference liên quan:</Label>
                        <p className="text-sm text-gray-700 mt-1">{report.conference}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-semibold">Lý do báo cáo:</Label>
                        <p className="text-sm text-gray-700 mt-1">{report.reason}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-semibold">Mô tả chi tiết:</Label>
                        <p className="text-sm text-gray-700 mt-1">{report.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <strong>Ngày tạo:</strong> {formatDate(report.createdAt)}
                        </div>
                        <div>
                          <strong>Cập nhật:</strong> {formatDate(report.updatedAt)}
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

      {/* Resolve Dialog */}
      <AlertDialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xử lý báo cáo</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn đánh dấu báo cáo <strong>{selectedReport?.id}</strong> là đã xử lý?
              Hành động này sẽ xác nhận rằng vấn đề đã được giải quyết.
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
            <AlertDialogCancel onClick={() => {
              setActionNote('');
              setSelectedReport(null);
            }}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleResolveReport}
              className="bg-green-600 hover:bg-green-700"
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Từ chối báo cáo</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn từ chối báo cáo <strong>{selectedReport?.id}</strong>?
              Hành động này sẽ đánh dấu báo cáo là không hợp lệ.
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
            <AlertDialogCancel onClick={() => {
              setActionNote('');
              setSelectedReport(null);
            }}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRejectReport}
              className="bg-red-600 hover:bg-red-700"
            >
              Từ chối
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend User Dialog */}
      <AlertDialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Suspend tài khoản người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn suspend tài khoản <strong>{selectedReport?.reportedUser}</strong>?
              Đây là hành động nghiêm trọng và người dùng sẽ không thể truy cập hệ thống.
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
            <AlertDialogCancel onClick={() => {
              setActionNote('');
              setSelectedReport(null);
            }}>
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
      </AlertDialog>
    </div>
  );
}