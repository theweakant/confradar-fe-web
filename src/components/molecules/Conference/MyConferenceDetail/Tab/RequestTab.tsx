// components/pages/ConferenceDetailPage/Tab/RequestTab.tsx
"use client";

import { Info, Clock, Calendar, User, FileText, ArrowRightLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatCurrency } from "@/helper/format";

// === Interfaces nội bộ ===
interface RefundRequest {
  id: string;
  userId: string;
  userName: string;
  email: string;
  ticketId: string;
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
}

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

// ✅ MỚI: Change Session Request
interface ChangeSessionRequest {
  id: string;
  paperId: string;
  title: string;
  authorName: string;
  currentSession: string; // e.g., "Session A - 10:00"
  requestedSession: string; // e.g., "Session B - 14:00"
  reason: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
}

interface RequestTabProps {
  conferenceType: "technical" | "research" | null;
}

export function RequestTab({ conferenceType }: RequestTabProps) {
  // === Mock Data ===
  const refundRequests = [
    {
      id: "ref-001",
      userId: "user-123",
      userName: "Nguyễn Văn A",
      email: "vana@example.com",
      ticketId: "tkt-88882bbb-1",
      amount: 1500000,
      reason: "Không thể tham dự do bận đột xuất",
      status: "pending",
      requestedAt: "2025-11-05",
    },
  ];

  const sessionRequests = [
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

  const cameraReadyRequests = [
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

  const changePresenterRequests = [
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

  // ✅ MỚI: Mock data cho Change Session
  const changeSessionRequests = [
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
    refundRequests.length === 0 &&
    (conferenceType !== "research" ||
      (sessionRequests.length === 0 &&
        cameraReadyRequests.length === 0 &&
        changePresenterRequests.length === 0 &&
        changeSessionRequests.length === 0));

  if (isEmpty) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Info className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Chưa có yêu cầu nào
        </h3>
        <p className="text-gray-500">Chưa có khách hàng hoặc tác giả gửi yêu cầu</p>
      </div>
    );
  }

  const renderStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "pending": return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Đang chờ</span>;
      case "approved": return <span className={`${baseClasses} bg-green-100 text-green-800`}>Đã duyệt</span>;
      case "rejected": return <span className={`${baseClasses} bg-red-100 text-red-800`}>Từ chối</span>;
      default: return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Không xác định</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Refund Requests - always shown */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Yêu cầu hoàn vé
          </CardTitle>
          <span className="text-sm text-gray-500">{refundRequests.length} yêu cầu</span>
        </CardHeader>
        <CardContent>
          {refundRequests.length > 0 ? (
            <div className="space-y-3">
              {refundRequests.map((req) => (
                <div key={req.id} className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{req.userName}</p>
                      <p className="text-sm text-gray-600">{req.email}</p>
                      <p className="text-sm mt-1"><span className="font-semibold">Vé:</span> {req.ticketId}</p>
                      <p className="text-sm"><span className="font-semibold">Số tiền:</span> {formatCurrency(req.amount)}</p>
                    </div>
                    {renderStatusBadge(req.status)}
                  </div>
                  <p className="text-sm text-gray-700 mt-2"><span className="font-semibold">Lý do:</span> {req.reason}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                    <Clock className="w-3 h-3" />
                    {formatDate(req.requestedAt)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Không có yêu cầu hoàn vé</p>
          )}
        </CardContent>
      </Card>

      {/* Research-only requests */}
      {conferenceType === "research" && (
        <>
          {/* Change Session Request - MỚI */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4" />
                Yêu cầu đổi phiên trình bày
              </CardTitle>
              <span className="text-sm text-gray-500">{changeSessionRequests.length} yêu cầu</span>
            </CardHeader>
            <CardContent>
              {changeSessionRequests.length > 0 ? (
                <div className="space-y-3">
                  {changeSessionRequests.map((req) => (
                    <div key={req.id} className="p-4 border rounded-lg bg-gray-50">
                      <p className="font-medium">{req.title}</p>
                      <p className="text-sm text-gray-600">Tác giả: {req.authorName}</p>
                      <p className="text-sm mt-1">
                        <span className="font-semibold">Hiện tại:</span> {req.currentSession}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Mong muốn:</span> {req.requestedSession}
                      </p>
                      <p className="text-sm mt-1">
                        <span className="font-semibold">Lý do:</span> {req.reason}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        {renderStatusBadge(req.status)}
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatDate(req.requestedAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Chưa có yêu cầu đổi phiên</p>
              )}
            </CardContent>
          </Card>

          {/* Session Request */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Yêu cầu phân phiên
              </CardTitle>
              <span className="text-sm text-gray-500">{sessionRequests.length} yêu cầu</span>
            </CardHeader>
            <CardContent>
              {sessionRequests.length > 0 ? (
                <div className="space-y-3">
                  {sessionRequests.map((req) => (
                    <div key={req.id} className="p-4 border rounded-lg bg-gray-50">
                      <p className="font-medium">{req.title}</p>
                      <p className="text-sm text-gray-600">Tác giả: {req.authorName}</p>
                      <p className="text-sm mt-1">
                        <span className="font-semibold">Mong muốn:</span> {req.requestedTimeSlot}
                      </p>
                      {req.currentAssignment && (
                        <p className="text-sm">
                          <span className="font-semibold">Hiện tại:</span> {req.currentAssignment}
                        </p>
                      )}
                      <div className="flex justify-between items-center mt-2">
                        {renderStatusBadge(req.status)}
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatDate(req.requestedAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Chưa có yêu cầu</p>
              )}
            </CardContent>
          </Card>

          {/* Camera Ready */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Yêu cầu bản in camera-ready
              </CardTitle>
              <span className="text-sm text-gray-500">{cameraReadyRequests.length} yêu cầu</span>
            </CardHeader>
            <CardContent>
              {cameraReadyRequests.length > 0 ? (
                <div className="space-y-3">
                  {cameraReadyRequests.map((req) => (
                    <div key={req.id} className="p-4 border rounded-lg bg-gray-50">
                      <p className="font-medium">{req.title}</p>
                      <p className="text-sm text-gray-600">
                        {req.authorName} • Phiên bản: {req.version}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        {renderStatusBadge(req.status)}
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatDate(req.submittedAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Chưa có yêu cầu</p>
              )}
            </CardContent>
          </Card>

          {/* Change Presenter */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Yêu cầu đổi người trình bày
              </CardTitle>
              <span className="text-sm text-gray-500">{changePresenterRequests.length} yêu cầu</span>
            </CardHeader>
            <CardContent>
              {changePresenterRequests.length > 0 ? (
                <div className="space-y-3">
                  {changePresenterRequests.map((req) => (
                    <div key={req.id} className="p-4 border rounded-lg bg-gray-50">
                      <p className="font-medium">{req.title}</p>
                      <p className="text-sm"><span className="text-gray-600">Từ:</span> {req.currentPresenter}</p>
                      <p className="text-sm">
                        <span className="text-gray-600">Thành:</span> {req.newPresenter} ({req.newPresenterEmail})
                      </p>
                      <p className="text-sm mt-1"><span className="font-semibold">Lý do:</span> {req.reason}</p>
                      <div className="flex justify-between items-center mt-2">
                        {renderStatusBadge(req.status)}
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatDate(req.requestedAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Chưa có yêu cầu</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}