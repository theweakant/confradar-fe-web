import { 
  Calendar,
  MapPin,
  Users,
  Clock,
  FileText,
  Building2,
  Tag,
  DollarSign,
  Image as ImageIcon,
  Shield,
  Handshake,
  Ticket
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { formatDate } from "@/helper/format";
import { ConferenceDetailProps } from "@/types/conference.type";
import { useViewRegisteredUsersForConferenceQuery } from "@/redux/services/conference.service";

export function ConferenceDetail({ conference, onClose, conferenceId }: ConferenceDetailProps) {
  // Fetch registered users
  const { data: registeredUsersData, isLoading: isLoadingUsers } = useViewRegisteredUsersForConferenceQuery(conferenceId);
  const registeredUsers = registeredUsersData?.data || [];

  const getConferenceStatus = () => {
    if (!conference.isActive) return { label: "Ngưng hoạt động", variant: "danger" as const };
    
    if (!conference.startDate || !conference.endDate) {
      return { label: "Chưa xác định", variant: "info" as const };
    }
    
    const now = new Date();
    const start = new Date(conference.startDate);
    const end = new Date(conference.endDate);
    
    if (now < start) return { label: "Sắp diễn ra", variant: "info" as const };
    if (now >= start && now <= end) return { label: "Đang diễn ra", variant: "success" as const };
    if (now > end) return { label: "Đã kết thúc", variant: "warning" as const };
    
    return { label: "Chưa xác định", variant: "info" as const };
  };

  const status = getConferenceStatus();

  return (
    <div className="space-y-6 max-h-[85vh] overflow-y-auto">
      {/* Header Section */}
      <div className="flex items-start justify-between sticky top-0 bg-white z-10 pb-4">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {conference.conferenceName}
          </h3>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <StatusBadge
              status={status.label}
              variant={status.variant}
            />
            {conference.isInternalHosted && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                Tổ chức nội bộ
              </span>
            )}
            {conference.isResearchConference && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                Hội thảo nghiên cứu
              </span>
            )}
            {!conference.isActive && (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                Ngưng hoạt động
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Banner Image */}
      {conference.bannerImageUrl && (
        <div className="rounded-lg overflow-hidden relative h-64 w-full">
          <Image 
            src={conference.bannerImageUrl} 
            alt={conference.conferenceName}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Description */}
      {conference.description && (
        <div className="prose max-w-none">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Mô tả</h4>
          <p className="text-gray-700 leading-relaxed">{conference.description}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="border-t pt-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {conference.startDate && conference.endDate && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Thời gian</p>
                  <p className="text-gray-900">{formatDate(conference.startDate)}</p>
                  <p className="text-gray-600 text-sm">đến {formatDate(conference.endDate)}</p>
                </div>
              </div>
            )}

            {conference.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Địa điểm</p>
                  <p className="text-gray-900">{conference.address}</p>
                  {conference.locationId && (
                    <p className="text-gray-600 text-sm">Location ID: {conference.locationId}</p>
                  )}
                </div>
              </div>
            )}

            {conference.capacity !== undefined && (
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Sức chứa</p>
                  <p className="text-gray-900">{conference.capacity} người</p>
                </div>
              </div>
            )}

            {conference.createdAt && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Ngày tạo</p>
                  <p className="text-gray-900">{formatDate(conference.createdAt)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {conference.categoryId && (
              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">ID Danh mục</p>
                  <p className="text-gray-900 text-sm break-all">{conference.categoryId}</p>
                </div>
              </div>
            )}

            {conference.userId && (
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">ID Người tổ chức</p>
                  <p className="text-gray-900 text-sm break-all">{conference.userId}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">ID Hội thảo</p>
                <p className="text-gray-900 text-sm break-all">{conference.conferenceId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registered Users Section */}
      <div className="border-t pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Ticket className="w-5 h-5 text-blue-600" />
          <h4 className="text-lg font-semibold text-gray-900">
            Người tham gia ({registeredUsers.length})
          </h4>
        </div>
        
        {isLoadingUsers ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Đang tải danh sách...</p>
            </div>
          </div>
        ) : registeredUsers.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Chưa có người đăng ký tham gia</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {registeredUsers.map((user) => (
              <div 
                key={user.ticketId} 
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="relative h-12 w-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                  {user.avatarUrl ? (
                    <Image 
                      src={user.avatarUrl} 
                      alt={user.userName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-blue-100 text-blue-600 font-semibold text-lg">
                      {user.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{user.userName}</p>
                  <p className="text-sm text-gray-600 truncate">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Đăng ký: {formatDate(user.registeredDate)}
                  </p>
                </div>
                <div className="text-xs text-gray-400 flex-shrink-0 font-mono">
                  #{user.ticketId.slice(0, 8)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sponsors Section */}
      {conference.sponsors && conference.sponsors.length > 0 && (
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Handshake className="w-5 h-5 text-blue-600" />
            <h4 className="text-lg font-semibold text-gray-900">Nhà tài trợ</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {conference.sponsors.map((sponsor) => (
              <div key={sponsor.sponsorId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                {sponsor.imageUrl && (
                  <div className="relative h-24 w-full mb-2">
                    <Image 
                      src={sponsor.imageUrl} 
                      alt={sponsor.name || 'Sponsor'}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                {sponsor.name && (
                  <p className="text-sm font-medium text-gray-900 text-center">{sponsor.name}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prices Section */}
      {conference.prices && conference.prices.length > 0 && (
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h4 className="text-lg font-semibold text-gray-900">Bảng giá</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conference.prices.map((price) => (
              <div key={price.priceId} className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
                {price.ticketName && (
                  <h5 className="font-semibold text-gray-900 mb-2">{price.ticketName}</h5>
                )}
                <div className="space-y-1 mb-2">
                  {price.actualPrice !== undefined && (
                    <p className="text-2xl font-bold text-blue-600">
                      {price.actualPrice.toLocaleString('vi-VN')} VNĐ
                    </p>
                  )}
                  {price.ticketPrice !== undefined && 
                   price.actualPrice !== undefined && 
                   price.ticketPrice !== price.actualPrice && (
                    <p className="text-sm text-gray-500 line-through">
                      {price.ticketPrice.toLocaleString('vi-VN')} VNĐ
                    </p>
                  )}
                </div>
                {price.ticketDescription && (
                  <p className="text-sm text-gray-600">{price.ticketDescription}</p>
                )}
                {price.currentPhase && (
                  <p className="text-xs text-green-600 mt-2">
                    Giai đoạn: {price.currentPhase}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Policies Section */}
      {conference.policies && conference.policies.length > 0 && (
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-blue-600" />
            <h4 className="text-lg font-semibold text-gray-900">Chính sách</h4>
          </div>
          <div className="space-y-3">
            {conference.policies.map((policy) => (
              <div key={policy.policyId} className="bg-gray-50 rounded-lg p-4">
                {policy.policyName && (
                  <h5 className="font-semibold text-gray-900 mb-1">{policy.policyName}</h5>
                )}
                {policy.description && (
                  <p className="text-sm text-gray-700">{policy.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media Section */}
      {conference.media && conference.media.length > 0 && (
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            <h4 className="text-lg font-semibold text-gray-900">Media</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {conference.media.map((item, index) => (
              item.mediaUrl && (
                <div key={item.mediaId} className="relative h-48 rounded-lg overflow-hidden border hover:shadow-lg transition-shadow">
                  <Image 
                    src={item.mediaUrl} 
                    alt={`Media ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Sessions Section */}
      {conference.sessions && conference.sessions.length > 0 && (
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h4 className="text-lg font-semibold text-gray-900">Phiên họp</h4>
          </div>
          <div className="space-y-4">
            {conference.sessions.map((session) => (
              <div key={session.sessionId} className="border rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                  <h5 className="font-semibold text-gray-900 text-lg mb-2">
                    {session.title}
                  </h5>
                  {session.description && (
                    <p className="text-sm text-gray-600 mb-3">{session.description}</p>
                  )}
                  {session.startTime && session.endTime && (
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(session.startTime)} - {formatDate(session.endTime)}
                      </span>
                      {session.room?.displayName && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {session.room.displayName}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Speaker Info */}
                  {session.speaker && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-xs text-gray-500 mb-1">Diễn giả</p>
                      <p className="font-medium text-gray-900">{session.speaker.name}</p>
                      {session.speaker.description && (
                        <p className="text-sm text-gray-600 mt-1">{session.speaker.description}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end pt-4 border-t sticky bottom-0 bg-white">
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