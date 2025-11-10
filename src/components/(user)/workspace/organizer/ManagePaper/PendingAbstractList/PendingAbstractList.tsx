"use client";
import { useParams } from "next/navigation"; 
import { FileText, Calendar, User, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useListPendingAbstractsQuery,
  useDecideAbstractStatusMutation,
} from "@/redux/services/paper.service";
import { toast } from "sonner";

export default function PendingAbstractList() {
  const { confId } = useParams();
  const { data: response, isLoading, isError } = useListPendingAbstractsQuery(confId as string);
  const [decideAbstractStatus, { isLoading: isDeciding }] =
    useDecideAbstractStatusMutation();

  const pendingAbstracts = response?.data || [];

  const handleAccept = async (paperId: string, abstractId: string) => {
    try {
      const result = await decideAbstractStatus({
        paperId,
        abstractId,
        globalStatus: "Accepted",
      }).unwrap();

      toast.success("Đã chấp nhận bài báo thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi chấp nhận bài báo");
      console.error("Error accepting abstract:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Danh sách bài báo đang chờ
            </h1>
          </div>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Danh sách bài báo đang chờ
            </h1>
          </div>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Danh sách abstract chờ duyệt
          </h1>
        </div>

        <div className="grid gap-6">
          {pendingAbstracts.map((abstract) => (
            <div
              key={abstract.abstractId}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    abstractId: {abstract.abstractId.substring(0, 8)}...
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      <span>Diễn giả: {abstract.presenterName}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <FileText className="w-4 h-4 mr-2" />
                      <span>{abstract.conferenceName}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Tag className="w-4 h-4 mr-2" />
                      <span>Trạng thái: {abstract.globalStatusName}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>
                        Ngày nộp:{" "}
                        {new Date(abstract.createdAt).toLocaleDateString(
                          "vi-VN",
                        )}
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
                    >
                      Xem file
                    </a>
                  </div>
                </div>

                <Button
                  className="ml-4"
                  onClick={() =>
                    handleAccept(abstract.paperId, abstract.abstractId)
                  }
                  disabled={isDeciding}
                >
                  {isDeciding ? "Đang xử lý..." : "Chấp nhận"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {pendingAbstracts.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không có bài báo nào
            </h3>
            <p className="text-gray-600">
              Hiện tại bạn chưa được phân công đánh giá bài báo nào
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
