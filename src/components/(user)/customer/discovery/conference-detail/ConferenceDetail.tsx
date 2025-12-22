"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { X, Ticket } from "lucide-react";
import { useConference } from "@/redux/hooks/useConference";
import {
  ConferencePriceResponse,
  ResearchConferenceDetailResponse,
  SponsorResponse,
} from "@/types/conference.type";
import { useParams, useRouter } from "next/navigation";
import { useTransaction } from "@/redux/hooks/useTransaction";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import ConferenceHeader from "./ConferenceHeader";
import InformationTab from "./InformationTab";
import SessionsTab from "./SessionsTab";
import FeedbackTab from "./FeedbackTab";
import ConferencePriceTab from "./ConferencePriceTab";
import SponsorCarousel from "./SponsorCarousel";
import PolicyTab from "./PolicyTab";
import ResearchTimelineTab from "./ResearchTimelineTab";
import ResearchDocumentsTab from "./ResearchDocumentsTab";

interface MediaModalProps {
  url: string; // URL hình ảnh hoặc video
  onClose: () => void;
}

const ConferenceDetail = () => {
  const params = useParams();
  const conferenceId = params?.id as string;
  const type = params?.type as string;

  const isResearch = type === "research";

  const router = useRouter();

  const { accessToken, user } = useSelector((state: RootState) => state.auth);
  const active = user?.active;

  const {
    technicalConference,
    technicalConferenceLoading,
    technicalConferenceError,
    refetchTechnicalConference,
    researchConference,
    researchConferenceLoading,
    researchConferenceError,
    refetchResearchConference,
  } = useConference({ id: conferenceId });

  const {
    purchaseTechTicket,
    purchaseResearchPaper,
    purchaseAttendeeResearch,
    loading: paymentLoading,
    techPaymentError,
    researchPaymentError,
    attendeeResearchPaymentError,
    techPaymentResponse,
    researchPaymentResponse,
    attendeeResearchPaymentResponse,
  } = useTransaction();

  const [activeTab, setActiveTab] = useState("info");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // const [newFeedback, setNewFeedback] = useState({ name: '', rating: 5, comment: '' });
  // const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] =
    useState<ConferencePriceResponse | null>(null);
  const [authorInfo, setAuthorInfo] = useState<{
    title: string;
    description: string;
  }>({
    title: "",
    description: "",
  });
  const [showAuthorForm, setShowAuthorForm] = React.useState(false);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);
  const [selectedPaperId, setSelectedPaperId] = useState<
    string | null
  >(null);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  // const [conference, setConference] = useState<TechnicalConferenceDetailResponse | null>(null);

  // Use the appropriate conference data based on type
  const conference = isResearch ? researchConference : technicalConference;
  const loading = isResearch
    ? researchConferenceLoading
    : technicalConferenceLoading;
  const error = isResearch ? researchConferenceError : technicalConferenceError;

  useEffect(() => {
    if (techPaymentError) toast.error(techPaymentError.data?.message);
    if (researchPaymentError) toast.error(researchPaymentError.data?.message);
    if (attendeeResearchPaymentError) toast.error(attendeeResearchPaymentError.data?.message);
  }, [techPaymentError, researchPaymentError, attendeeResearchPaymentError]);

  const handlePurchaseTicket = async () => {
    if (!accessToken) {
      router.push("/auth/login");
      return;
    }

    if (!selectedTicket) return;

    if (!selectedPaymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán!");
      return;
    }

    // if (
    //   selectedTicket.isAuthor &&
    //   (!authorInfo.title.trim() || !authorInfo.description.trim())
    // ) {
    //   toast.error("Vui lòng nhập tiêu đề và mô tả bài báo!");
    //   return;
    // }

    try {
      let response;

      if (selectedTicket.isAuthor) {
        if (!selectedPaperId) return;

        response = await purchaseResearchPaper({
          conferencePriceId: selectedTicket.conferencePriceId,
          paperId: selectedPaperId,
          // title: authorInfo.title,
          // description: authorInfo.description,
          paymentMethodId: selectedPaymentMethod,
        });
      } else if (isResearch) {
        response = await purchaseAttendeeResearch({
          conferencePriceId: selectedTicket.conferencePriceId,
          paymentMethodId: selectedPaymentMethod,
        });
      } else {
        response = await purchaseTechTicket({
          conferencePriceId: selectedTicket.conferencePriceId,
          paymentMethodId: selectedPaymentMethod,
        });
      }

      if (response?.data.checkOutUrl) {
        window.location.href = response.data.checkOutUrl;
      } else {
        alert("Không nhận được đường dẫn thanh toán.");
      }
    } finally {
      setIsDialogOpen(false);
      setAuthorInfo({ title: "", description: "" });
      setSelectedPaymentMethod(null);
      setShowPaymentMethods(false);
    }
  };

  // const handleAddFeedback = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   if (newFeedback.name && newFeedback.comment) {
  //     const feedback = {
  //       id: feedbacks.length + 1,
  //       ...newFeedback,
  //       date: new Date().toLocaleDateString('vi-VN'),
  //       avatar: "/images/LandingPage/conf_img/speaker_img.png"
  //     };
  //     setFeedbacks([feedback, ...feedbacks]);
  //     setNewFeedback({ name: '', rating: 5, comment: '' });
  //   }
  // };

  const MediaModal: React.FC<MediaModalProps> = ({ url, onClose }) => {
    const isVideo = url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".ogg");

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="relative max-w-5xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
          {isVideo ? (
            <video controls className="object-contain max-h-[90vh] w-full">
              <source src={url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <Image
              src={url}
              alt="Full size"
              width={1200}
              height={800}
              className="object-contain max-h-[90vh]"
            />
          )}
        </div>
      </div>
    );
  };

  // const ImageModal: React.FC<ImageModalProps> = ({ image, onClose }) => (
  //   <div
  //     className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
  //     onClick={onClose}
  //   >
  //     <button
  //       onClick={onClose}
  //       className="absolute top-4 right-4 text-white hover:text-gray-300"
  //     >
  //       <X className="w-8 h-8" />
  //     </button>
  //     <div
  //       className="relative max-w-5xl max-h-[90vh]"
  //       onClick={(e) => e.stopPropagation()}
  //     >
  //       <Image
  //         src={image}
  //         alt="Full size"
  //         width={1200}
  //         height={800}
  //         className="object-contain max-h-[90vh]"
  //       />
  //     </div>
  //   </div>
  // );

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isResearch
        ? 'bg-gray-50'
        : 'bg-gradient-to-br from-sky-800 via-indigo-700 to-cyan-600'
        }`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${isResearch ? 'border-blue-600' : 'border-white'
            }`}></div>
          <p className={isResearch ? 'text-gray-700' : 'text-white'}>
            Đang tải thông tin hội nghị...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isResearch
        ? 'bg-gray-50'
        : 'bg-gradient-to-br from-sky-800 via-indigo-700 to-cyan-600'
        }`}>
        <div className="text-center">
          <p className={`mb-4 ${isResearch ? 'text-red-600' : 'text-red-300'
            }`}>
            Có lỗi xảy ra khi tải thông tin hội nghị
          </p>
          <p className={`text-sm ${isResearch ? 'text-gray-600' : 'text-white/80'
            }`}>
            {error.data?.message}
          </p>
        </div>
      </div>
    );
  }

  if (!conference) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isResearch
        ? 'bg-gray-50'
        : 'bg-gradient-to-br from-sky-800 via-indigo-700 to-cyan-600'
        }`}>
        <div className="text-center">
          <p className={isResearch ? 'text-gray-700' : 'text-white'}>
            Không tìm thấy thông tin hội nghị
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "";

    const [hour, minute] = timeString.split(":");
    if (!hour || !minute) return "";

    return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
  };

  const formatDateTime = (dateTimeString?: string) => {
    if (!dateTimeString) return "";

    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return "";

    const datePart = date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const timePart = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return `${datePart} ${timePart}`;
  };

  return (
    <div className={`${isResearch ? 'bg-gray-50' : ''}`}>
      {!isResearch && (
        <>
          {/* Section 1: Header với Banner Background */}
          <div
            className="w-full min-h-screen bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${conference.bannerImageUrl || "/images/customer_route/confbannerbg1.jpg"})`,
            }}
          >
            <div className="w-full min-h-screen bg-white/10 backdrop-blur-sm">
              <div className="max-w-6xl mx-auto px-4 py-8 flex items-center min-h-screen">
                <div className="w-full">
                  <ConferenceHeader
                    conference={conference}
                    handlePurchaseTicket={handlePurchaseTicket}
                    accessToken={accessToken}
                    formatDate={formatDate}
                    selectedTicket={selectedTicket}
                    onSelectTicket={setSelectedTicket}
                    authorInfo={authorInfo}
                    onAuthorInfoChange={setAuthorInfo}
                    selectedPaymentMethod={selectedPaymentMethod}
                    onSelectPaymentMethod={setSelectedPaymentMethod}
                    active={active ?? false}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Tab + Content với Gradient Background */}
          <div className="w-full bg-gradient-to-br from-sky-800 via-indigo-700 to-cyan-600 text-white">
            <div className="max-w-6xl mx-auto px-4 py-12">
              {/* Sponsors */}
              <div className="mb-8">
                <SponsorCarousel sponsors={conference.sponsors ?? []} />
              </div>

              {/* Tabs Container */}
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 overflow-x-auto bg-gradient-to-r from-blue-50 via-blue-100 to-white shadow-sm">
                  {[
                    { key: "info", label: "Thông tin & Hình ảnh" },
                    { key: "sessions", label: "Lịch trình Sessions" },
                    { key: "prices", label: "Các loại vé" },
                    { key: "policy", label: "Chính sách" },
                    { key: "feedback", label: "Đánh giá" },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-6 py-4 font-medium whitespace-nowrap transition-all ${activeTab === tab.key
                        ? "text-blue-700 font-semibold border-b-2 border-blue-700 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-blue-100 transition-colors duration-200"
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="p-6 md:p-8">
                  {activeTab === "info" && (
                    <InformationTab
                      conference={conference}
                      setSelectedImage={setSelectedImage}
                    />
                  )}
                  {activeTab === "sessions" && (
                    <SessionsTab
                      conference={conference}
                      formatDate={formatDate}
                      formatTime={formatTime}
                      formatDateTime={formatDateTime}
                      setSelectedImage={setSelectedImage}
                    />
                  )}
                  {activeTab === "prices" && (
                    <ConferencePriceTab
                      conference={conference}
                      formatDate={formatDate}
                      formatTime={formatTime}
                    />
                  )}
                  {activeTab === "policy" && <PolicyTab conference={conference} />}
                  {/* {activeTab === "feedback" && <FeedbackTab conference={conference} />} */}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Layout cho Research Conference */}
      {isResearch && (
        <div>
          {/* Banner Image */}
          {conference.bannerImageUrl && (
            <div className="w-full aspect-[3/1] relative overflow-hidden">
              <Image
                src={conference.bannerImageUrl}
                alt="banner"
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* ConferenceHeader Full-Width Section */}
          <div className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <ConferenceHeader
                conference={conference}
                handlePurchaseTicket={handlePurchaseTicket}
                accessToken={accessToken}
                formatDate={formatDate}
                selectedTicket={selectedTicket}
                onSelectTicket={setSelectedTicket}
                authorInfo={authorInfo}
                onAuthorInfoChange={setAuthorInfo}
                selectedPaymentMethod={selectedPaymentMethod}
                onSelectPaymentMethod={setSelectedPaymentMethod}
                onSelectPaper={setSelectedPaperId}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                active={active ?? false}
              />
            </div>
          </div>

          {/* Container chính: Research Detail + Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 py-8">
            {/* Sidebar trái */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* Research Detail */}
              {/* Research Detail */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Thông tin chi tiết về hội nghị nghiên cứu
                </h3>
                <div className="col-span-full my-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-l-4 border-blue-500 shadow-sm">
                  <p className="text-gray-700 text-sm">
                    💡 <b>Lưu ý:</b> Bài báo của bạn sẽ được đánh giá qua <b>4 giai đoạn</b> của timeline đánh giá. Bạn sẽ chỉ thanh toán <b>phí đăng ký tham dự</b> khi bài báo được chấp nhận ở vòng cuối cùng. Nếu bài báo bị từ chối, bạn sẽ không phải trả phí đăng ký.
                  </p>
                </div>
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                    <span className="text-gray-600 text-sm font-medium block mb-1">Định dạng bài báo chấp nhận:</span>
                    <p className="text-gray-900 font-semibold">
                      {(conference as ResearchConferenceDetailResponse).paperFormat ||
                        "Chưa có thông tin về định dạng bài báo"}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                    <span className="text-gray-600 text-sm font-medium block mb-1">Số lượng bài báo tối đa chấp nhận:</span>
                    <p className="text-gray-900 font-semibold">
                      {(conference as ResearchConferenceDetailResponse).numberPaperAccept !== undefined
                        ? (conference as ResearchConferenceDetailResponse).numberPaperAccept
                        : "Chưa xác định số lượng bài báo được chấp nhận"}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                    <span className="text-gray-600 text-sm font-medium block mb-1">Số vòng chỉnh sửa tối đa:</span>
                    <p className="text-gray-900 font-semibold">
                      {(conference as ResearchConferenceDetailResponse).revisionAttemptAllowed !== undefined
                        ? (conference as ResearchConferenceDetailResponse).revisionAttemptAllowed
                        : "Chưa xác định số lần sửa đổi tối đa"}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                    <span className="text-gray-600 text-sm font-medium block mb-1">Cho phép thính giả tham dự?</span>
                    <p className="text-gray-900 font-semibold">
                      {(conference as ResearchConferenceDetailResponse).allowListener !== undefined
                        ? (conference as ResearchConferenceDetailResponse).allowListener
                          ? "Có"
                          : "Không"
                        : "Chưa xác định chính sách người nghe"}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                    <span className="text-gray-600 text-sm font-medium block mb-1">Giá trị xếp hạng:</span>
                    <p className="text-gray-900 font-semibold">
                      {(conference as ResearchConferenceDetailResponse).rankValue ||
                        "Chưa có thông tin về giá trị xếp hạng"}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                    <span className="text-gray-600 text-sm font-medium block mb-1">Năm xếp hạng:</span>
                    <p className="text-gray-900 font-semibold">
                      {(conference as ResearchConferenceDetailResponse).rankYear ||
                        "Chưa có thông tin về năm xếp hạng"}
                    </p>
                  </div>
                  {/* <div className="p-3 bg-gradient-to-br from-amber-50 to-white rounded-lg border border-amber-200">
                    <span className="text-gray-600 text-sm font-medium block mb-1">
                      Phí review bài báo <br />
                      <span className="text-gray-500 text-xs italic">
                        (Khoản phí này đã được tính gộp vào phí đăng ký tham dự nếu bạn đăng ký với tư cách <b>tác giả</b>)
                      </span>
                    </span>
                    <p className="text-amber-700 font-bold text-lg">
                      {(conference as ResearchConferenceDetailResponse).reviewFee !== undefined
                        ? `${(conference as ResearchConferenceDetailResponse).reviewFee?.toLocaleString("vi-VN")}₫`
                        : "Phí đánh giá bài báo chưa xác định"}
                    </p>
                  </div> */}
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                    <span className="text-gray-600 text-sm font-medium block mb-1">Ranking Category Name:</span>
                    <p className="text-gray-900 font-semibold">
                      {(conference as ResearchConferenceDetailResponse).rankingCategoryName ||
                        "Chưa có thông tin về danh mục xếp hạng"}
                    </p>
                  </div>
                  <div className="col-span-full p-4 bg-gradient-to-br from-indigo-50 to-white rounded-lg border border-indigo-100">
                    <span className="text-gray-600 text-sm font-medium block mb-2">Ranking Description:</span>
                    <p className="text-gray-800 leading-relaxed">
                      {(conference as ResearchConferenceDetailResponse).rankingDescription ||
                        "Chưa có mô tả về xếp hạng"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              {/* <div className="bg-white rounded-xl border-2 border-gray-200 shadow-md overflow-hidden">
                {[
                  { key: "info", label: "Thông tin & Hình ảnh", icon: "📋" },
                  { key: "sessions", label: "Lịch trình Sessions", icon: "📅" },
                  { key: "prices", label: "Các mức phí tham dự", icon: "🎫" },
                  { key: "research-timeline", label: "Các deadline quan trọng của nộp bài báo", icon: "⏰" },
                  { key: "research-documents", label: "Tài liệu & Hướng dẫn", icon: "📄" },
                  { key: "policy", label: "Chính sách", icon: "📜" },
                  // { key: "feedback", label: "Đánh giá", icon: "⭐" },
                ].map((tab, index) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full px-4 py-3 text-left font-medium transition-all duration-200 flex items-center gap-3 ${activeTab === tab.key
                      ? "text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                      } ${index !== 0 ? 'border-t border-gray-200' : ''}`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div> */}
            </div>

            {/* Tab Content - bên phải */}
            <div className="lg:col-span-2 flex flex-col h-full max-h-full">
              <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg p-6 overflow-y-auto flex-1">
                {activeTab === "info" && (
                  <InformationTab
                    conference={conference}
                    setSelectedImage={setSelectedImage}
                  />
                )}
                {activeTab === "sessions" && (
                  <SessionsTab
                    conference={conference}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    formatDateTime={formatDateTime}
                    setSelectedImage={setSelectedImage}
                  />
                )}
                {activeTab === "prices" && (
                  <ConferencePriceTab
                    conference={conference}
                    formatDate={formatDate}
                    formatTime={formatTime}
                  />
                )}
                {activeTab === "research-timeline" && researchConference && (
                  <ResearchTimelineTab conference={researchConference} formatDate={formatDate} />
                )}
                {activeTab === "research-documents" && researchConference && (
                  <ResearchDocumentsTab conference={researchConference} />
                )}
                {activeTab === "policy" && <PolicyTab conference={conference} />}
              </div>
            </div>
          </div>

          {/* Sponsors */}
          <div className="max-w-7xl mx-auto px-4 py-8">
            <SponsorCarousel sponsors={conference.sponsors ?? []} />
          </div>
        </div>
      )
      }

      {/* Image Modal */}
      {
        selectedImage && (
          <MediaModal
            url={selectedImage}
            onClose={() => setSelectedImage(null)}
          />
        )
      }
    </div >
  );
};

export default ConferenceDetail;
