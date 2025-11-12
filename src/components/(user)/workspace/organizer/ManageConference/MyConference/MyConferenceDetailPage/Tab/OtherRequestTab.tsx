// components/pages/ConferenceDetailPage/Tab/OtherRequestTab.tsx
"use client";

import { Info, Clock, Calendar, User, FileText, ArrowRightLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/helper/format";

interface SessionRequest {
  id: string;
  paperId: string;
  title: string;
  authorName: string;
  requestedTimeSlot: string;
  currentAssignment: string | null;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
}

interface CameraReadyRequest {
  id: string;
  paperId: string;
  title: string;
  authorName: string;
  version: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

interface ChangePresenterRequest {
  id: string;
  paperId: string;
  title: string;
  currentPresenter: string;
  newPresenter: string;
  newPresenterEmail: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
}

interface ChangeSessionRequest {
  id: string;
  paperId: string;
  title: string;
  authorName: string;
  currentSession: string;
  requestedSession: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
}

interface OtherRequestTabProps {
  conferenceId: string;
}

export function OtherRequestTab({ conferenceId }: OtherRequestTabProps) {
  // === Mock Data ===
  const sessionRequests: SessionRequest[] = [
    {
      id: "sess-001",
      paperId: "paper-01",
      title: "A Novel Approach to Federated Learning",
      authorName: "Lê Minh C",
      requestedTimeSlot: "2025-12-10 14:00–15:30",
      currentAssignment: "2025-12-11 09:00–10:30",
      status: "pending",
      requestedAt: "2025-11-07",
    },
  ];

  const cameraReadyRequests: CameraReadyRequest[] = [
    {
      id: "cr-001",
      paperId: "paper-01",
      title: "A Novel Approach to Federated Learning",
      authorName: "Lê Minh C",
      version: "v3.2",
      status: "approved",
      submittedAt: "2025-11-08",
    },
  ];

  const changePresenterRequests: ChangePresenterRequest[] = [
    {
      id: "cp-001",
      paperId: "paper-02",
      title: "Blockchain for Secure Voting",
      currentPresenter: "Phạm Quang D",
      newPresenter: "Nguyễn Thị E",
      newPresenterEmail: "nguyenthe@example.com",
      reason: "Tác giả chính bị ốm",
      status: "pending",
      requestedAt: "2025-11-09",
    },
  ];

  const changeSessionRequests: ChangeSessionRequest[] = [
    {
      id: "cs-001",
      paperId: "paper-01",
      title: "A Novel Approach to Federated Learning",
      authorName: "Lê Minh C",
      currentSession: "Session A - 09:00–10:30, 12 Dec",
      requestedSession: "Session C - 14:00–15:30, 12 Dec",
      reason: "Xung đột lịch với hội thảo khác",
      status: "pending",
      requestedAt: "2025-11-08",
    },
    {
      id: "cs-002",
      paperId: "paper-03",
      title: "AI in Healthcare Diagnostics",
      authorName: "Trần Anh F",
      currentSession: "Session B - 11:00–12:30, 12 Dec",
      requestedSession: "Session A - 09:00–10:30, 12 Dec",
      reason: "Muốn trình bày sớm hơn để kịp chuyến bay",
      status: "approved",
      requestedAt: "2025-11-06",
    },
  ];

  const isEmpty =
    sessionRequests.length === 0 &&
    cameraReadyRequests.length === 0 &&
    changePresenterRequests.length === 0 &&
    changeSessionRequests.length === 0;

  const renderStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "pending":
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Đang chờ</span>;
      case "approved":
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Đã duyệt</span>;
      case "rejected":
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Từ chối</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Không xác định</span>;
    }
  };

  if (isEmpty) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Info className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có yêu cầu nào</h3>
        <p className="text-gray-500">Chưa có tác giả gửi yêu cầu liên quan đến bài báo</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Change Session Request */}
      {changeSessionRequests.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5" />
              Yêu cầu đổi phiên trình bày
            </CardTitle>
            <span className="text-sm text-gray-500">{changeSessionRequests.length} yêu cầu</span>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {changeSessionRequests.map((req) => (
                <div key={req.id} className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-gray-900">{req.title}</p>
                      <p className="text-sm text-gray-600">Tác giả: {req.authorName}</p>
                    </div>
                    {renderStatusBadge(req.status)}
                  </div>

                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-semibold text-gray-700">Phiên hiện tại:</span>{" "}
                      <span className="text-gray-600">{req.currentSession}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-gray-700">Phiên mong muốn:</span>{" "}
                      <span className="text-blue-600">{req.requestedSession}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-gray-700">Lý do:</span>{" "}
                      <span className="text-gray-600">{req.reason}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-3 pt-3 border-t">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(req.requestedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Request */}
      {sessionRequests.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Yêu cầu phân phiên
            </CardTitle>
            <span className="text-sm text-gray-500">{sessionRequests.length} yêu cầu</span>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessionRequests.map((req) => (
                <div key={req.id} className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-gray-900">{req.title}</p>
                      <p className="text-sm text-gray-600">Tác giả: {req.authorName}</p>
                    </div>
                    {renderStatusBadge(req.status)}
                  </div>

                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-semibold text-gray-700">Khung giờ mong muốn:</span>{" "}
                      <span className="text-blue-600">{req.requestedTimeSlot}</span>
                    </p>
                    {req.currentAssignment && (
                      <p>
                        <span className="font-semibold text-gray-700">Phân công hiện tại:</span>{" "}
                        <span className="text-gray-600">{req.currentAssignment}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-3 pt-3 border-t">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(req.requestedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Camera Ready */}
      {cameraReadyRequests.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Yêu cầu bản in camera-ready
            </CardTitle>
            <span className="text-sm text-gray-500">{cameraReadyRequests.length} yêu cầu</span>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cameraReadyRequests.map((req) => (
                <div key={req.id} className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-gray-900">{req.title}</p>
                      <p className="text-sm text-gray-600">
                        {req.authorName} • Phiên bản: <span className="font-medium">{req.version}</span>
                      </p>
                    </div>
                    {renderStatusBadge(req.status)}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-500 pt-3 border-t">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(req.submittedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Change Presenter */}
      {changePresenterRequests.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Yêu cầu đổi người trình bày
            </CardTitle>
            <span className="text-sm text-gray-500">{changePresenterRequests.length} yêu cầu</span>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {changePresenterRequests.map((req) => (
                <div key={req.id} className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <p className="font-medium text-gray-900">{req.title}</p>
                    {renderStatusBadge(req.status)}
                  </div>

                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-semibold text-gray-700">Người trình bày cũ:</span>{" "}
                      <span className="text-gray-600">{req.currentPresenter}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-gray-700">Người trình bày mới:</span>{" "}
                      <span className="text-blue-600">{req.newPresenter}</span>
                      <span className="text-gray-500"> ({req.newPresenterEmail})</span>
                    </p>
                    <p>
                      <span className="font-semibold text-gray-700">Lý do:</span>{" "}
                      <span className="text-gray-600">{req.reason}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-3 pt-3 border-t">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(req.requestedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}