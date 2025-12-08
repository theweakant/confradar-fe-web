import React from "react";
import {
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
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

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isResearch ? "Các hình thức tham dự" : "Các loại vé"}
      </h2>

      {pricesList.length > 0 ? (
        <div className="space-y-6">
          {pricesList.map((ticket) => (
            <div
              key={ticket.conferencePriceId}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
            >
              {/* Ticket Header */}
              <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
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
                  <div className="text-right">
                    <div className="text-2xl font-bold text-coral-600 mb-1">
                      {ticket.ticketPrice
                        ? `${ticket.ticketPrice.toLocaleString("vi-VN")}₫`
                        : (isResearch ? "Phí chưa xác định" : "Giá chưa xác định")}
                    </div>
                    {ticket.isAuthor && (
                      <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        Dành cho tác giả
                      </span>
                    )}
                  </div>
                </div>

                {/* Ticket Availability */}
                <div className="flex items-center gap-4 mt-4 text-sm">
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
                            className={`p-4 rounded-lg border transition-all ${statusDisplay.bgClass} ${status === 'current' ? 'transform scale-[1.02] shadow-lg' : ''
                              }`}
                          >
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

                                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  {phase.startDate && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <Calendar className="w-4 h-4" />
                                      <span>Bắt đầu: {formatDate(phase.startDate)}</span>
                                    </div>
                                  )}
                                  {phase.endDate && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <Calendar className="w-4 h-4" />
                                      <span>Kết thúc: {formatDate(phase.endDate)}</span>
                                    </div>
                                  )}
                                  <div className="text-gray-600">
                                    <span className="font-medium">
                                      {isResearch ? "Chỗ còn lại:" : "Vé còn lại:"}
                                    </span>{" "}
                                    {phase.availableSlot !== undefined ? phase.availableSlot : "Chưa xác định"}
                                  </div>

                                  <div className="text-gray-600">
                                    <span className="font-medium">
                                      {isResearch ? "Tổng số lượt đăng ký:" : "Tổng số vé bán ra:"}
                                    </span>{" "}
                                    {phase.totalSlot !== undefined ? phase.totalSlot : "Chưa xác định"}
                                  </div>
                                </div> */}
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

                              {/* Refund Policy */}
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
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600 py-12 bg-gray-50 rounded-xl border border-gray-200">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg">Chưa có thông tin về giá vé</p>
          <p className="text-sm mt-2">
            Vui lòng quay lại sau hoặc liên hệ ban tổ chức để biết thêm chi tiết
          </p>
        </div>
      )}
    </div>
  );
};

export default ConferencePriceTab;

// import React from "react";
// import {
//   Clock,
//   Calendar,
//   CheckCircle,
//   AlertCircle,
//   XCircle,
// } from "lucide-react";
// import {
//   TechnicalConferenceDetailResponse,
//   ResearchConferenceDetailResponse,
//   ConferencePriceResponse,
//   ConferencePricePhaseResponse,
// } from "@/types/conference.type";

// interface ConferencePriceTabProps {
//   conference:
//   | TechnicalConferenceDetailResponse
//   | ResearchConferenceDetailResponse;
//   formatDate: (dateString?: string) => string;
//   formatTime: (timeString?: string) => string;
// }

// const ConferencePriceTab: React.FC<ConferencePriceTabProps> = ({
//   conference,
//   formatDate,
//   formatTime,
// }) => {
//   const pricesList = conference.conferencePrices || [];
//   const isResearch = conference.isResearchConference;

//   const getPhaseStatus = (phase: ConferencePricePhaseResponse) => {
//     if (!phase.startDate || !phase.endDate) return "unknown";

//     const now = new Date();
//     const startDate = new Date(phase.startDate);
//     const endDate = new Date(phase.endDate);

//     if (now < startDate) return "upcoming";
//     if (now > endDate) return "ended";
//     return "current";
//   };

//   const getStatusDisplay = (status: string) => {
//     switch (status) {
//       case "current":
//         return {
//           icon: <CheckCircle className="w-5 h-5 text-green-400" />,
//           text: "Đang diễn ra",
//           bgClass: "bg-green-500/20 border-green-400 ring-2 ring-green-400/50",
//           textClass: "text-green-400",
//         };
//       case "upcoming":
//         return {
//           icon: <AlertCircle className="w-5 h-5 text-yellow-400" />,
//           text: "Chưa diễn ra",
//           bgClass: "bg-yellow-500/20 border-yellow-400",
//           textClass: "text-yellow-400",
//         };
//       case "ended":
//         return {
//           icon: <XCircle className="w-5 h-5 text-gray-400" />,
//           text: "Đã kết thúc",
//           bgClass: "bg-gray-500/20 border-gray-400",
//           textClass: "text-gray-400",
//         };
//       default:
//         return {
//           icon: <AlertCircle className="w-5 h-5 text-gray-400" />,
//           text: "Chưa xác định",
//           bgClass: "bg-gray-500/20 border-gray-400",
//           textClass: "text-gray-400",
//         };
//     }
//   };

//   return (
//     <div>
//       <h2 className="text-2xl font-bold text-white mb-6">
//         {isResearch ? "Các hình thức tham dự" : "Các loại vé"}
//       </h2>

//       {pricesList.length > 0 ? (
//         <div className="space-y-6">
//           {pricesList.map((ticket) => (
//             <div
//               key={ticket.conferencePriceId}
//               className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/20"
//             >
//               {/* Ticket Header */}
//               <div className="mb-6">
//                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                   <div>
//                     <h3 className="text-xl font-bold text-white mb-2">
//                       {ticket.ticketName || (isResearch ? "Chưa đặt tên" : "Vé chưa đặt tên")}
//                     </h3>
//                     <p className="text-white/70 text-sm">
//                       {ticket.ticketDescription ||
//                         (isResearch
//                           ? "Chưa có mô tả cho hình thức tham dự này"
//                           : "Chưa có mô tả cho loại vé này")}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <div className="text-2xl font-bold text-coral-400 mb-1">
//                       {ticket.ticketPrice
//                         ? `${ticket.ticketPrice.toLocaleString("vi-VN")}₫`
//                         : (isResearch ? "Phí chưa xác định" : "Giá chưa xác định")}
//                     </div>
//                     {ticket.isAuthor && (
//                       <span className="inline-block bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
//                         Dành cho tác giả
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 {/* Ticket Availability */}
//                 <div className="flex items-center gap-4 mt-4 text-sm">
//                   <div className="text-white/70">
//                     <span className="font-medium">
//                       {isResearch ? "Tổng số chỗ:" : "Tổng số vé:"}
//                     </span>{" "}
//                     {ticket.totalSlot || "Chưa xác định"}
//                   </div>
//                   <div className="text-white/70">
//                     <span className="font-medium">Còn lại:</span>{" "}
//                     {ticket.availableSlot !== undefined
//                       ? ticket.availableSlot
//                       : "Chưa xác định"}
//                   </div>
//                 </div>
//               </div>

//               {/* Price Phases */}
//               <div>
//                 <h4 className="text-lg font-semibold text-white mb-4">
//                   {isResearch ? "Các giai đoạn phí đăng ký" : "Các giai đoạn giá vé"}
//                 </h4>
//                 {ticket.pricePhases && ticket.pricePhases.length > 0 ? (
//                   <div className="space-y-3">
//                     {Array.from(ticket.pricePhases || [])
//                       .sort((a, b) => {
//                         const startA = new Date(a.startDate || '').getTime();
//                         const startB = new Date(b.startDate || '').getTime();
//                         return startA - startB;
//                       })
//                       .map((phase, index) => {
//                         const status = getPhaseStatus(phase);
//                         const statusDisplay = getStatusDisplay(status);
//                         const actualPrice = ticket.ticketPrice && phase.applyPercent
//                           ? Math.round(ticket.ticketPrice * (phase.applyPercent / 100))
//                           : ticket.ticketPrice;

//                         return (
//                           <div
//                             key={phase.pricePhaseId}
//                             className={`p-4 rounded-lg border transition-all ${statusDisplay.bgClass} ${status === 'current' ? 'transform scale-[1.02] shadow-lg' : ''
//                               }`}
//                           >
//                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
//                               <div className="flex-1">
//                                 <div className="flex items-center gap-3 mb-2">
//                                   <h5 className="font-semibold text-white">
//                                     {phase.phaseName || `Giai đoạn ${index + 1}`}
//                                   </h5>
//                                   <div className={`flex items-center gap-2 ${statusDisplay.textClass}`}>
//                                     {statusDisplay.icon}
//                                     <span className="text-sm font-medium">
//                                       {statusDisplay.text}
//                                     </span>
//                                   </div>
//                                 </div>

//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                                   {phase.startDate && (
//                                     <div className="flex items-center gap-2 text-white/70">
//                                       <Calendar className="w-4 h-4" />
//                                       <span>Bắt đầu: {formatDate(phase.startDate)}</span>
//                                     </div>
//                                   )}
//                                   {phase.endDate && (
//                                     <div className="flex items-center gap-2 text-white/70">
//                                       <Calendar className="w-4 h-4" />
//                                       <span>Kết thúc: {formatDate(phase.endDate)}</span>
//                                     </div>
//                                   )}
//                                   {phase.startDate && phase.endDate && (
//                                     <div className="flex items-center gap-2 text-white/70">
//                                       <Clock className="w-4 h-4" />
//                                       <span>
//                                         {formatTime(phase.startDate)} - {formatTime(phase.endDate)}
//                                       </span>
//                                     </div>
//                                   )}
//                                   <div className="text-white/70">
//                                     <span className="font-medium">Vé còn lại:</span> {phase.availableSlot !== undefined ? phase.availableSlot : 'Chưa xác định'}
//                                   </div>
//                                 </div>
//                               </div>

//                               <div className="text-right md:order-2">
//                                 <div className="text-xl font-bold text-coral-400 mb-1">
//                                   {actualPrice ? `${actualPrice.toLocaleString('vi-VN')}₫` : 'Giá chưa xác định'}
//                                 </div>
//                                 {phase.applyPercent && (
//                                   <div className="text-sm text-white/70">
//                                     Giảm {100 - phase.applyPercent}% ({phase.applyPercent}% giá gốc)
//                                   </div>
//                                 )}
//                               </div>

//                               {/* Refund Policy */}
//                               <div className="w-full md:max-w-xs md:order-1 md:border-l md:border-white/20 md:pl-4">
//                                 <h6 className="font-semibold text-white mb-2 text-sm flex items-center gap-1">
//                                   <Clock className="w-4 h-4 text-white/70" /> Chính sách hoàn vé
//                                 </h6>

//                                 {phase.refundPolicies?.length ? (
//                                   <div className="space-y-2">
//                                     {Array.from(phase.refundPolicies)
//                                       .sort((a, b) => {
//                                         const deadlineA = new Date(a.refundDeadline || '').getTime();
//                                         const deadlineB = new Date(b.refundDeadline || '').getTime();
//                                         return deadlineA - deadlineB;
//                                       })
//                                       .map((policy) => (
//                                         <div
//                                           key={policy.refundPolicyId}
//                                           className="flex gap-2 text-sm text-white/70 bg-white/5 p-2 rounded"
//                                         >
//                                           <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
//                                           <span>
//                                             Hoàn <span className="font-semibold text-green-400">{policy.percentRefund}%</span> nếu hủy trước
//                                             <br />
//                                             {formatDate(policy.refundDeadline)} – {formatTime(policy.refundDeadline)}
//                                           </span>
//                                         </div>
//                                       ))}

//                                     <div className="text-xs text-yellow-400 bg-yellow-500/10 p-2 rounded flex gap-2">
//                                       <AlertCircle className="w-4 h-4 mt-0.5" />
//                                       <span>Vui lòng đọc kỹ chính sách trước khi mua vé.</span>
//                                     </div>
//                                   </div>
//                                 ) : (
//                                   <div className="flex gap-2 text-sm text-red-400 bg-red-500/10 p-3 rounded">
//                                     <XCircle className="w-4 h-4 mt-0.5" />
//                                     <span className="font-medium">Không hỗ trợ hoàn vé ở giai đoạn này</span>
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                           </div>
//                         );
//                       })}
//                   </div>
//                 ) : (
//                   <div className="text-center text-white/70 py-6 bg-white/10 rounded-lg">
//                     <p>{isResearch ? "Chưa có thông tin về các giai đoạn phí đăng ký" : "Chưa có thông tin về các giai đoạn giá vé"}</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="text-center text-white/70 py-12 bg-white/10 rounded-xl">
//           <AlertCircle className="w-12 h-12 text-white/50 mx-auto mb-4" />
//           <p className="text-lg">Chưa có thông tin về giá vé</p>
//           <p className="text-sm mt-2">
//             Vui lòng quay lại sau hoặc liên hệ ban tổ chức để biết thêm chi tiết
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ConferencePriceTab;
