// src/components/molecules/Calendar/SessionCalendar/Modal/PresenterSessionDetail.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Users, FileText, User, CheckCircle } from "lucide-react";
import { useAssignPresenterToSessionMutation } from "@/redux/services/paper.service";
import { toast } from "sonner";
import { ApiError } from "@/types/api.type";

interface PresentSessionData {
  sessionId: string;
  title: string;
  onDate: string;
  presenters: Array<{
    presenterName: string;
    paperTitle: string;
  }>;
}

interface PresenterSessionDetailDialogProps {
  open: boolean;
  onClose: () => void;
  session: PresentSessionData | null;
  onRefetch?: () => void;
  selectedPaperId?: string | null;
  conferenceId?: string;
}

const PresenterSessionDetailDialog: React.FC<PresenterSessionDetailDialogProps> = ({
  open,
  onClose,
  session,
  onRefetch,
  selectedPaperId,
  conferenceId,
}) => {
  const [assignPresenter, { isLoading: isAssigning }] = useAssignPresenterToSessionMutation();

  if (!session) return null;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    } catch {
      return dateString;
    }
  };

  const handleAssignPresenter = async () => {
    if (!selectedPaperId) {
      toast.error("Vui lòng chọn một bài báo trước.");
      return;
    }

    // Show confirmation toast
    toast.custom(
      (t) => (
        <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-lg max-w-md">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Xác nhận gán presenter</h3>
            <p className="text-sm text-gray-600 mb-3">
              Bạn có chắc muốn gán bài báo này vào session{" "}
              <span className="font-semibold text-gray-900">&quot;{session.title}&quot;</span>?
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{new Date(session.onDate).toLocaleDateString('vi-VN')}</span>
              <span className="mx-1">•</span>
              <span>{session.presenters.length} presenter đã gán</span>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              onClick={() => toast.dismiss(t)}
            >
              Hủy
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={async () => {
                toast.dismiss(t);
                try {
                  await assignPresenter({
                    paperId: selectedPaperId,
                    sessionId: session.sessionId,
                  }).unwrap();

                  toast.success("Đã gán presenter vào session thành công!");
                  onRefetch?.();
                  onClose();
                } catch (err) {
                  console.error("Gán presenter thất bại:", err);
                  const apiError = (err as { data?: ApiError })?.data;
                  toast.error(apiError?.message || "Không thể gán presenter. Vui lòng thử lại.");
                }
              }}
              disabled={isAssigning}
            >
              {isAssigning ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const hasSelectedPaper = !!selectedPaperId;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white border-gray-200 max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Chi tiết session trình bày
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-3">
          {/* Session Title */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
          </div>

          {/* Session Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Date */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="mt-0.5">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 mb-0.5">Ngày diễn ra</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(session.onDate)}
                </p>
              </div>
            </div>

            {/* Presenter Count */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="mt-0.5">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 mb-0.5">Số lượng presenter</p>
                <p className="text-sm font-medium text-gray-900">
                  {session.presenters.length} người
                </p>
              </div>
            </div>
          </div>

          {/* Selected Paper Notice */}
          {hasSelectedPaper && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-green-600 mt-0.5">
                <CheckCircle className="w-4 h-4" />
              </div>
              <p className="text-sm text-green-800 leading-relaxed">
                Đã chọn bài báo. Click nút <strong>&quot;Gán presenter&quot;</strong> bên dưới để gán vào session này.
              </p>
            </div>
          )}

          {/* Presenters List */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900">
                Danh sách presenter ({session.presenters.length})
              </h4>
            </div>

            {session.presenters.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <Users className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Chưa có presenter nào được gán</p>
                <p className="text-xs text-gray-400 mt-1">
                  Vui lòng chọn bài báo từ danh sách để gán vào session này
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {session.presenters.map((presenter, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="mt-0.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        {presenter.presenterName}
                      </p>
                      <div className="flex items-start gap-2">
                        <FileText className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {presenter.paperTitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        #{index + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Notice */}
          {!hasSelectedPaper && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-blue-600 mt-0.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xs text-blue-800 leading-relaxed">
                Để gán presenter, vui lòng chọn bài báo từ danh sách bên phải trước.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Đóng
          </Button>
          
          {hasSelectedPaper && (
            <Button
              onClick={handleAssignPresenter}
              disabled={isAssigning}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isAssigning ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang gán...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Gán presenter
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PresenterSessionDetailDialog;


