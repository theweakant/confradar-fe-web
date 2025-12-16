import React, { useState } from "react";
import {
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Users,
} from "lucide-react";
import {
  TechnicalConferenceDetailResponse,
  ResearchConferenceDetailResponse,
  ConferencePriceResponse,
  ConferencePricePhaseResponse,
} from "@/types/conference.type";

interface ConferencePriceTabProps {
  conference:
  | TechnicalConferenceDetailResponse
  | ResearchConferenceDetailResponse;
  formatDate: (dateString?: string) => string;
  formatTime: (timeString?: string) => string;
}

const ConferencePriceTab: React.FC<ConferencePriceTabProps> = ({
  conference,
  formatDate,
  formatTime,
}) => {
  const pricesList = conference.conferencePrices || [];
  const isResearch = conference.isResearchConference;
  const [participantType, setParticipantType] = useState<"author" | "listener">("author");

  const getPhaseStatus = (phase: ConferencePricePhaseResponse) => {
    if (!phase.startDate || !phase.endDate) return "unknown";

    const now = new Date();
    const startDate = new Date(phase.startDate);
    const endDate = new Date(phase.endDate);

    if (now < startDate) return "upcoming";
    if (now > endDate) return "ended";
    return "current";
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "current":
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          text: "Đang diễn ra",
          bgClass: "bg-green-50 border-green-300 ring-2 ring-green-200",
          textClass: "text-green-700",
        };
      case "upcoming":
        return {
          icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
          text: "Chưa diễn ra",
          bgClass: "bg-yellow-50 border-yellow-300",
          textClass: "text-yellow-700",
        };
      case "ended":
        return {
          icon: <XCircle className="w-5 h-5 text-gray-500" />,
          text: "Đã kết thúc",
          bgClass: "bg-gray-50 border-gray-300",
          textClass: "text-gray-600",
        };
      default:
        return {
          icon: <AlertCircle className="w-5 h-5 text-gray-500" />,
          text: "Chưa xác định",
          bgClass: "bg-gray-50 border-gray-300",
          textClass: "text-gray-600",
        };
    }
  };

  // Filter tickets based on participant type for research conferences
  const filteredPrices = isResearch
    ? pricesList.filter((ticket) =>
      participantType === "author" ? ticket.isAuthor : !ticket.isAuthor
    )
    : pricesList;

  const allowListener = isResearch
    ? (conference as ResearchConferenceDetailResponse).allowListener
    : false;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isResearch ? "Các hình thức tham dự" : "Các loại vé"}
      </h2>

      {/* Participant Type Tabs - Only for Research Conference */}
      {isResearch && allowListener && (
        <div className="mb-6 bg-white rounded-xl border-2 border-gray-200 p-2 inline-flex gap-2">
          <button
            onClick={() => setParticipantType("author")}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${participantType === "author"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            <User className="w-5 h-5" />
            <span>Tham dự với vai trò Tác giả</span>
          </button>
          <button
            onClick={() => setParticipantType("listener")}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${participantType === "listener"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            <Users className="w-5 h-5" />
            <span>Tham dự với vai trò Thính giả</span>
          </button>
        </div>
      )}

      {filteredPrices.length > 0 ? (
        <div className="space-y-6">
          {filteredPrices.map((ticket) => (
            <div
              key={ticket.conferencePriceId}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
            >
              {/* Ticket Header */}
              <div className="mb-6">
                <div className={`flex ${isResearch ? 'flex-col' : 'flex-col md:flex-row md:items-center'} justify-between gap-4`}>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {ticket.ticketName || (isResearch ? "Chưa đặt tên" : "Vé chưa đặt tên")}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {ticket.ticketDescription ||
                        (isResearch
                          ? "Chưa có mô tả cho hình thức tham dự này"
                          : "Chưa có mô tả cho loại vé này")}
                    </p>
                  </div>
                  <div className={`${isResearch ? 'flex items-center justify-between gap-4 mt-2' : 'text-right'}`}>
                    <div className={isResearch ? 'order-1' : ''}>
                      <div className="text-2xl font-bold text-coral-600 mb-1">
                        {ticket.ticketPrice
                          ? `${ticket.ticketPrice.toLocaleString("vi-VN")}₫`
                          : (isResearch ? "Phí chưa xác định" : "Giá chưa xác định")}
                      </div>
                    </div>
                    {ticket.isAuthor && isResearch && (
                      <>
                        <span className={`inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm ${isResearch ? 'order-2' : ''}`}>
                          Dành cho tác giả
                        </span>

                        {/* <div className="mt-2 flex items-center gap-2 text-sm">
                          <span className="font-medium">Xuất bản bài báo:</span>
                          {ticket.isPublish ? (
                            <span className="text-green-600 font-semibold">Có xuất bản</span>
                          ) : (
                            <span className="text-gray-600">Không bao gồm xuất bản bài báo</span>
                          )}
                        </div> */}
                      </>

                    )}
                  </div>

                  {isResearch && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span className="font-medium">Xuất bản bài báo:</span>
                      {ticket.isPublish ? (
                        <span className="text-green-600 font-semibold">Có xuất bản</span>
                      ) : (
                        <span className="text-gray-600">Không bao gồm xuất bản</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Ticket Availability */}
                <div className={`flex ${isResearch ? 'flex-col sm:flex-row' : 'flex-row'} items-start sm:items-center gap-4 mt-4 text-sm`}>
                  <div className="text-gray-600">
                    <span className="font-medium">
                      {isResearch ? "Tổng số chỗ:" : "Tổng số vé:"}
                    </span>{" "}
                    {ticket.totalSlot || "Chưa xác định"}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">Còn lại:</span>{" "}
                    {ticket.availableSlot !== undefined
                      ? ticket.availableSlot
                      : "Chưa xác định"}
                  </div>
                </div>
              </div>

              {/* Price Phases */}
              {!isResearch && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    {isResearch ? "Các giai đoạn phí đăng ký" : "Các giai đoạn giá vé"}
                  </h4>
                  {ticket.pricePhases && ticket.pricePhases.length > 0 ? (
                    <div className="space-y-3">
                      {Array.from(ticket.pricePhases || [])
                        .sort((a, b) => {
                          const startA = new Date(a.startDate || '').getTime();
                          const startB = new Date(b.startDate || '').getTime();
                          return startA - startB;
                        })
                        .map((phase, index) => {
                          const status = getPhaseStatus(phase);
                          const statusDisplay = getStatusDisplay(status);
                          const actualPrice = ticket.ticketPrice && phase.applyPercent
                            ? Math.round(ticket.ticketPrice * (phase.applyPercent / 100))
                            : ticket.ticketPrice;

                          return (
                            <div
                              key={phase.pricePhaseId}
                              className={`p-4 rounded-lg border transition-all ${statusDisplay.bgClass} ${status === 'current' ? 'transform scale-[1.02] shadow-lg' : ''}`}
                            >
                              {isResearch ? (
                                // Layout cho Research Conference
                                <div className="space-y-4">
                                  {/* Header Section */}
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
                                    <div className="flex items-center gap-3">
                                      <h5 className="font-semibold text-gray-900">
                                        {phase.phaseName || `Giai đoạn ${index + 1}`}
                                      </h5>
                                      <div className={`flex items-center gap-2 ${statusDisplay.textClass}`}>
                                        {statusDisplay.icon}
                                        <span className="text-sm font-medium">
                                          {statusDisplay.text}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xl font-bold text-coral-600 mb-1">
                                        {actualPrice ? `${actualPrice.toLocaleString('vi-VN')}₫` : 'Giá chưa xác định'}
                                      </div>
                                      {phase.applyPercent && (
                                        <div className="text-sm text-gray-600">
                                          {phase.applyPercent < 100 ? (
                                            <>Giảm {100 - phase.applyPercent}% ({phase.applyPercent}% giá gốc)</>
                                          ) : phase.applyPercent > 100 ? (
                                            <>Tăng {phase.applyPercent - 100}% ({phase.applyPercent}% giá gốc)</>
                                          ) : (
                                            <>Giá giữ nguyên (100% giá gốc)</>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Phase Info Grid */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    {phase.startDate && (
                                      <div className="text-gray-600">
                                        <span className="font-medium">Bắt đầu:</span> {formatDate(phase.startDate)}
                                      </div>
                                    )}
                                    {phase.endDate && (
                                      <div className="text-gray-600">
                                        <span className="font-medium">Kết thúc:</span> {formatDate(phase.endDate)}
                                      </div>
                                    )}
                                    <div className="text-gray-600">
                                      <span className="font-medium">{isResearch ? "Chỗ còn lại:" : "Vé còn lại:"}</span>{" "}
                                      {phase.availableSlot ?? "Chưa xác định"}
                                    </div>
                                    <div className="text-gray-600">
                                      <span className="font-medium">{isResearch ? "Tổng số lượt đăng ký:" : "Tổng số vé bán ra:"}</span>{" "}
                                      {phase.totalSlot ?? "Chưa xác định"}
                                    </div>
                                  </div>

                                  {/* Refund Policy Section */}
                                  <div className="pt-3 border-t border-gray-200">
                                    <h6 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-1">
                                      <Clock className="w-4 h-4 text-gray-600" /> Chính sách hoàn vé
                                    </h6>

                                    {phase.refundPolicies?.length ? (
                                      <div className="space-y-2">
                                        {Array.from(phase.refundPolicies)
                                          .sort((a, b) => {
                                            const deadlineA = new Date(a.refundDeadline || '').getTime();
                                            const deadlineB = new Date(b.refundDeadline || '').getTime();
                                            return deadlineA - deadlineB;
                                          })
                                          .map((policy) => (
                                            <div
                                              key={policy.refundPolicyId}
                                              className="flex gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded"
                                            >
                                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                              <span>
                                                Hoàn <span className="font-semibold text-green-600">{policy.percentRefund}%</span> nếu hủy trước
                                                <br />
                                                {formatDate(policy.refundDeadline)} – {formatTime(policy.refundDeadline)}
                                              </span>
                                            </div>
                                          ))}

                                        <div className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded flex gap-2">
                                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                          <span>Vui lòng đọc kỹ chính sách trước khi mua vé.</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex gap-2 text-sm text-red-700 bg-red-50 p-3 rounded">
                                        <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span className="font-medium">Không hỗ trợ hoàn vé ở giai đoạn này</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                // Layout cho Technical Conference (giữ nguyên)
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h5 className="font-semibold text-gray-900">
                                        {phase.phaseName || `Giai đoạn ${index + 1}`}
                                      </h5>
                                      <div className={`flex items-center gap-2 ${statusDisplay.textClass}`}>
                                        {statusDisplay.icon}
                                        <span className="text-sm font-medium">
                                          {statusDisplay.text}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 text-gray-600 text-sm">
                                      {phase.startDate && (
                                        <div className="flex-1 min-w-[140px] break-words">
                                          <span className="font-medium">Bắt đầu:</span> {formatDate(phase.startDate)}
                                        </div>
                                      )}
                                      {phase.endDate && (
                                        <div className="flex-1 min-w-[140px] break-words">
                                          <span className="font-medium">Kết thúc:</span> {formatDate(phase.endDate)}
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-[140px] break-words">
                                        <span className="font-medium">{isResearch ? "Chỗ còn lại:" : "Vé còn lại:"}</span>{" "}
                                        {phase.availableSlot ?? "Chưa xác định"}
                                      </div>
                                      <div className="flex-1 min-w-[140px] break-words">
                                        <span className="font-medium">{isResearch ? "Tổng số lượt đăng ký:" : "Tổng số vé bán ra:"}</span>{" "}
                                        {phase.totalSlot ?? "Chưa xác định"}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-right md:order-2">
                                    <div className="text-xl font-bold text-coral-600 mb-1">
                                      {actualPrice ? `${actualPrice.toLocaleString('vi-VN')}₫` : 'Giá chưa xác định'}
                                    </div>
                                    {phase.applyPercent && (
                                      <div className="text-sm text-gray-600">
                                        {phase.applyPercent < 100 ? (
                                          <>Giảm {100 - phase.applyPercent}% ({phase.applyPercent}% giá gốc)</>
                                        ) : phase.applyPercent > 100 ? (
                                          <>Tăng {phase.applyPercent - 100}% ({phase.applyPercent}% giá gốc)</>
                                        ) : (
                                          <>Giá giữ nguyên (100% giá gốc)</>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  <div className="w-full md:max-w-xs md:order-1 md:border-l md:border-gray-200 md:pl-4">
                                    <h6 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-1">
                                      <Clock className="w-4 h-4 text-gray-600" /> Chính sách hoàn vé
                                    </h6>

                                    {phase.refundPolicies?.length ? (
                                      <div className="space-y-2">
                                        {Array.from(phase.refundPolicies)
                                          .sort((a, b) => {
                                            const deadlineA = new Date(a.refundDeadline || '').getTime();
                                            const deadlineB = new Date(b.refundDeadline || '').getTime();
                                            return deadlineA - deadlineB;
                                          })
                                          .map((policy) => (
                                            <div
                                              key={policy.refundPolicyId}
                                              className="flex gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded"
                                            >
                                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                                              <span>
                                                Hoàn <span className="font-semibold text-green-600">{policy.percentRefund}%</span> nếu hủy trước
                                                <br />
                                                {formatDate(policy.refundDeadline)} – {formatTime(policy.refundDeadline)}
                                              </span>
                                            </div>
                                          ))}

                                        <div className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded flex gap-2">
                                          <AlertCircle className="w-4 h-4 mt-0.5" />
                                          <span>Vui lòng đọc kỹ chính sách trước khi mua vé.</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex gap-2 text-sm text-red-700 bg-red-50 p-3 rounded">
                                        <XCircle className="w-4 h-4 mt-0.5" />
                                        <span className="font-medium">Không hỗ trợ hoàn vé ở giai đoạn này</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center text-gray-600 py-6 bg-gray-50 rounded-lg border border-gray-200">
                      <p>{isResearch ? "Chưa có thông tin về các giai đoạn phí đăng ký" : "Chưa có thông tin về các giai đoạn giá vé"}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600 py-12 bg-gray-50 rounded-xl border border-gray-200">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg">
            {isResearch && participantType === "listener"
              ? "Chưa có thông tin về phí tham dự cho thính giả"
              : "Chưa có thông tin về giá vé"}
          </p>
          <p className="text-sm mt-2">
            Vui lòng quay lại sau hoặc liên hệ ban tổ chức để biết thêm chi tiết
          </p>
        </div>
      )}
    </div>
  );
};

export default ConferencePriceTab;