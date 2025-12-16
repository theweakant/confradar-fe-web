import Image from "next/image";
import {
  ResearchConferenceDetailResponse,
  TechnicalConferenceDetailResponse,
} from "@/types/conference.type";

// Information Tab Component
interface InformationTabProps {
  conference:
  | TechnicalConferenceDetailResponse
  | ResearchConferenceDetailResponse;
  setSelectedImage: (image: string | null) => void;
}

const InformationTab: React.FC<InformationTabProps> = ({
  conference,
  setSelectedImage,
}) => {
  const isResearch = conference.isResearchConference === true;

  // const mediaList = isResearch ? (conference as ResearchConferenceDetailResponse).conferenceMedia || [] : (conference as TechnicalConferenceDetailResponse).conferenceMedia || [];
  const mediaList = conference.conferenceMedia || [];
  const sponsorsList = conference.sponsors || [];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin chi tiết</h2>

      {/* Basic Conference Information */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Thông tin cơ bản
        </h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* <div>
            <span className="text-gray-600 text-sm">Conference ID:</span>
            <p className="text-gray-900 font-medium">
              {conference.conferenceId || "Chưa có ID"}
            </p>
          </div> */}
          <div>
            <span className="text-gray-600 text-sm">Tên hội {conference.isResearchConference ? 'nghị' : 'thảo'}:</span>
            <p className="text-gray-900 font-medium">
              {conference.conferenceName || "Chưa có tên hội nghị"}
            </p>
          </div>
          <div className="col-span-full">
            <span className="text-gray-600 text-sm">Description:</span>
            <p className="text-gray-900 mt-1">
              {conference.description || "Chưa có mô tả"}
            </p>
          </div>
          <div>
            <span className="text-gray-600 text-sm">Ngày diễn ra:</span>
            <p className="text-gray-900 font-medium">
              {conference.startDate
                ? new Date(conference.startDate).toLocaleDateString("vi-VN")
                : "Chưa xác định"}
            </p>
          </div>
          <div>
            <span className="text-gray-600 text-sm">Ngày kết thúc:</span>
            <p className="text-gray-900 font-medium">
              {conference.endDate
                ? new Date(conference.endDate).toLocaleDateString("vi-VN")
                : "Chưa xác định"}
            </p>
          </div>
          <div>
            <span className="text-gray-600 text-sm">Tổng số người tham dự tối đa:</span>
            <p className="text-gray-900 font-medium">
              {conference.totalSlot !== undefined
                ? conference.totalSlot
                : "Chưa xác định"}
            </p>
          </div>
          <div>
            <span className="text-gray-600 text-sm">Số lượng chỗ còn lại:</span>
            <p className="text-gray-900 font-medium">
              {conference.availableSlot !== undefined
                ? conference.availableSlot
                : "Chưa xác định"}
            </p>
          </div>
          <div>
            <span className="text-gray-600 text-sm">Địa chỉ:</span>
            <p className="text-gray-900 font-medium">
              {conference.address || "Chưa có địa chỉ"}
            </p>
          </div>
          <div>
            <span className="text-gray-600 text-sm">Ngày tạo hội nghị:</span>
            <p className="text-gray-900 font-medium">
              {conference.createdAt
                ? new Date(conference.createdAt).toLocaleDateString("vi-VN")
                : "Chưa xác định"}
            </p>
          </div>
          <div>
            <span className="text-gray-600 text-sm">
              {isResearch
                ? "Ngày mở đăng ký tham dự (dành cho thính giả):"
                : "Ngày bắt đầu bán vé:"}
            </span>
            <p className="text-gray-900 font-medium">
              {conference.ticketSaleStart
                ? new Date(conference.ticketSaleStart).toLocaleDateString("vi-VN")
                : "Chưa xác định"}
            </p>
          </div>
          <div>
            <span className="text-gray-600 text-sm">
              {isResearch
                ? "Ngày kết thúc thời hạn đăng ký tham dự (dành cho thính giả):"
                : "Ngày kết thúc bán vé:"}
            </span>
            <p className="text-gray-900 font-medium">
              {conference.ticketSaleEnd
                ? new Date(conference.ticketSaleEnd).toLocaleDateString("vi-VN")
                : "Chưa xác định"}
            </p>
          </div>
          <div>
            <span className="text-gray-600 text-sm">Hội {conference.isResearchConference ? 'nghị' : 'thảo'} được tổ chức bởi nội bộ Confradar?</span>
            <p className="text-gray-900 font-medium">
              {conference.isInternalHosted !== undefined
                ? conference.isInternalHosted
                  ? `Có, đây là hội ${conference.isResearchConference ? 'nghị' : 'thảo'} được tổ chức bỏi Confradar`
                  : "Không, đây là hội thảo được tổ chức bởi đối tác liên kết với Confradar"
                : "Chưa xác định"}
            </p>
          </div>
          <div>
            <span className="text-gray-600 text-sm">Loại:</span>
            <p className="text-gray-900 font-medium">
              {conference.isResearchConference !== undefined
                ? conference.isResearchConference
                  ? "Hội Nghị Nghiên cứu"
                  : "Hội Thảo Công nghệ"
                : "Chưa xác định"}
            </p>
          </div>
          <div>
            <span className="text-gray-600 text-sm">City ID:</span>
            <p className="text-gray-900 font-medium">
              {conference.cityName || "Chưa có thông tin thành phố"}
            </p>
          </div>
          <div>
            <span className="text-gray-600 text-sm">
              Conference Category ID:
            </span>
            <p className="text-gray-900 font-medium">
              {conference.categoryName || "Chưa có thông tin danh mục"}
            </p>
          </div>
          <div>
            <span className="text-gray-600 text-sm">Conference Status ID:</span>
            <p className="text-gray-900 font-medium">
              {conference.statusName || "Chưa có thông tin trạng thái"}
            </p>
          </div>
        </div>
      </div>

      {/* Technical Conference */}
      {!isResearch && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Thông tin chi tiết về hội thảo
          </h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <span className="text-gray-600 text-sm">Đối tượng hội thảo muốn hướng tới:</span>
            <p className="text-gray-900 font-medium">
              {(conference as TechnicalConferenceDetailResponse)
                .targetAudience || "Chưa có thông tin về đối tượng mục tiêu"}
            </p>
          </div>
        </div>
      )}

      {/* Media Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Hình ảnh về hội {conference.isResearchConference ? 'nghị' : 'thảo'}
        </h3>
        {mediaList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mediaList.map((media) => (
              <div
                key={media.mediaId}
                className="relative cursor-pointer group"
                onClick={() => setSelectedImage(media.mediaUrl || "")}
              >
                <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={
                      media.mediaUrl ||
                      "/images/customer_route/confbannerbg2.jpg"
                    }
                    alt="Conference media"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600 py-6 bg-gray-50 border border-gray-200 rounded-lg">
            <p>Chưa có hình ảnh hoặc media cho hội nghị này</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InformationTab;