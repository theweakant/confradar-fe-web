"use client";

import { X, FileText, User, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Abstract1, DecisionType } from "@/types/paper.type";

interface AbstractListProps {
  abstracts: Abstract1[];
  isLoading: boolean;
  isDeciding: boolean;
  showDecisionDialog: boolean;
  showConfirmDialog: boolean;
  pendingDecision: DecisionType | null;
  onClose: () => void;
  onOpenDecision: (abstract: Abstract1) => void;
  onDecisionClick: (decision: DecisionType) => void;
  onConfirmDecision: () => void;
  onCancelConfirm: () => void;
  setShowDecisionDialog: (show: boolean) => void;
  setShowConfirmDialog: (show: boolean) => void;
}

export function AbstractList({
  abstracts,
  isLoading,
  isDeciding,
  showDecisionDialog,
  showConfirmDialog,
  pendingDecision,
  onClose,
  onOpenDecision,
  onDecisionClick,
  onConfirmDecision,
  onCancelConfirm,
  setShowDecisionDialog,
  setShowConfirmDialog,
}: AbstractListProps) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Danh sách abstract chờ duyệt
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {abstracts.length} abstract đang chờ quyết định
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-600">Đang tải...</p>
              </div>
            ) : abstracts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Không có bài báo nào
                </h3>
                <p className="text-gray-600">
                  Hiện tại không có abstract nào đang chờ duyệt
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {abstracts.map((abstract) => (
                  <div
                    key={abstract.abstractId}
                    className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Abstract ID: {abstract.abstractId.substring(0, 8)}...
                        </h3>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">
                              Diễn giả: {abstract.presenterName}
                            </span>
                          </div>

                          <div className="flex items-center text-sm text-gray-600">
                            <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{abstract.conferenceName}</span>
                          </div>

                          <div className="flex items-center text-sm text-gray-600">
                            <Tag className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>Trạng thái: {abstract.globalStatusName}</span>
                          </div>

                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>
                              Ngày nộp:{" "}
                              {new Date(abstract.createdAt).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            {abstract.globalStatusName}
                          </span>
                          <a
                            href={abstract.abstractUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Xem file
                          </a>
                        </div>
                      </div>

                      <Button
                        className="ml-4 flex-shrink-0"
                        onClick={() => onOpenDecision(abstract)}
                        disabled={isDeciding}
                      >
                        Quyết định
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decision Dialog */}
      <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quyết định bài báo</DialogTitle>
            <DialogDescription>
              Vui lòng chọn quyết định cho bài báo này
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => onDecisionClick("Accepted")}
            >
              Chấp nhận
            </Button>
            <Button variant="destructive" onClick={() => onDecisionClick("Rejected")}>
              Từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận quyết định</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ không thể hoàn tác. Bạn có chắc chắn muốn{" "}
              {pendingDecision === "Accepted" ? "chấp nhận" : "từ chối"} bài báo này?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCancelConfirm}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmDecision}
              disabled={isDeciding}
              className={
                pendingDecision === "Accepted"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {isDeciding ? "Đang xử lý..." : "Xác nhận"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}