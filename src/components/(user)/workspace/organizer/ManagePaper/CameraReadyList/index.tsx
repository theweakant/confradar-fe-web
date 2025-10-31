"use client";

import { FileText, Tag, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useListPendingCameraReadyQuery,
  useDecideCameraReadyMutation,
} from "@/redux/services/paper.service";

export default function CameraReadyList() {
  // Gọi API lấy danh sách camera ready đang chờ duyệt
  const { data: response, isLoading, isError } = useListPendingCameraReadyQuery();
  const [decideCameraReady, { isLoading: isDeciding }] = useDecideCameraReadyMutation();

  const pendingCameraReady = response?.data || [];

  const handleAccept = async (cameraReadyId: string, rootPaperId: string) => {
    try {
      const result = await decideCameraReady({
        cameraReadyId,
        globalStatus: "Accepted",
        paperid: rootPaperId, 
      }).unwrap();

      toast.success("Đã chấp nhận thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra");
      console.error("Error approving camera ready:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Danh sách Camera Ready chờ duyệt
          </h1>
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Danh sách Camera Ready chờ duyệt
          </h1>
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-red-600">Có lỗi xảy ra khi tải dữ liệu</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Danh sách Camera Ready chờ duyệt
        </h1>

        <div className="grid gap-6">
          {pendingCameraReady.map((item) => (
            <div
              key={item.cameraReadyId}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    CameraReadyID: {item.cameraReadyId.substring(0, 8)}...
                  </h3>

                  <div className="flex flex-col gap-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 mr-2" />
                      <span>Trạng thái: {item.status}</span>
                    </div>

                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      <span>Paper ID: {item.rootPaperId}</span>
                    </div>

                    {item.cameraReadyStartDate && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          Bắt đầu:{" "}
                          {new Date(item.cameraReadyStartDate).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    )}

                    {item.cameraReadyEndDate && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          Kết thúc:{" "}
                          {new Date(item.cameraReadyEndDate).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    )}
                  </div>

                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    📄 Xem file Camera Ready
                  </a>
                </div>

                <Button
                  className="ml-4"
                  onClick={() => handleAccept(item.cameraReadyId, item.rootPaperId)}
                  disabled={isDeciding}
                >
                  {isDeciding ? "Đang xử lý..." : "Chấp nhận"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {pendingCameraReady.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không có camera ready nào
            </h3>
            <p className="text-gray-600">
              Hiện tại không có camera ready nào đang chờ duyệt
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
