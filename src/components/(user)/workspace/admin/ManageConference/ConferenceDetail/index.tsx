import { 
  Calendar,
  MapPin,
  Users,
  Clock,
  DollarSign,
  FileText,
  Link as LinkIcon,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { formatCurrency, formatDate } from "@/helper/format";
import { ConferenceDetailProps } from "@/types/conference.type";

export function ConferenceDetail({ conference, onClose }: ConferenceDetailProps) {
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      technology: "Công nghệ",
      research: "Nghiên cứu",
      business: "Kinh doanh",
      education: "Giáo dục"
    };
    return labels[category] || category;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      upcoming: "Sắp diễn ra",
      ongoing: "Đang diễn ra",
      completed: "Đã kết thúc",
      cancelled: "Đã hủy"
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: string): "success" | "danger" | "warning" | "info" => {
    const variants: Record<string, "success" | "danger" | "warning" | "info"> = {
      upcoming: "info",
      ongoing: "success",
      completed: "warning",
      cancelled: "danger"
    };
    return variants[status] || "info";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{conference.title}</h3>
          <div className="flex items-center gap-3 mb-4">
            <StatusBadge
              status={getStatusLabel(conference.status)}
              variant={getStatusVariant(conference.status)}
            />
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              {getCategoryLabel(conference.category)}
            </span>
          </div>
        </div>
      </div>

      <div className="prose max-w-none">
        <p className="text-gray-700 leading-relaxed">{conference.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Thời gian</p>
              <p className="text-gray-900">{formatDate(conference.startDate)}</p>
              <p className="text-gray-600 text-sm">đến {formatDate(conference.endDate)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Địa điểm</p>
              <p className="text-gray-900">{conference.location}</p>
              <p className="text-gray-600 text-sm">{conference.venue}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Hạn đăng ký</p>
              <p className="text-gray-900">{formatDate(conference.registrationDeadline)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Số lượng</p>
              <p className="text-gray-900">
                {conference.currentAttendees} / {conference.maxAttendees} người
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(conference.currentAttendees / conference.maxAttendees) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Phí đăng ký</p>
              <p className="text-gray-900 font-semibold">
                {conference.registrationFee === 0 ? "Miễn phí" : formatCurrency(conference.registrationFee)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Người tổ chức</p>
              <p className="text-gray-900">{conference.organizerName}</p>
              <p className="text-gray-600 text-sm">{conference.organizerEmail}</p>
            </div>
          </div>

          {conference.website && (
            <div className="flex items-start gap-3">
              <LinkIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Website</p>
                <a
                  href={conference.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  {conference.website}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {conference.tags.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-5 h-5 text-gray-600" />
            <p className="text-sm font-medium text-gray-700">Tags</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {conference.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={onClose}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Đóng
        </Button>
      </div>
    </div>
  );
}