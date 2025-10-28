"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'sonner'
import { X, MapPin, Clock, Calendar, Star } from 'lucide-react';
import { Dialog, DialogPanel, DialogTitle, Button } from "@headlessui/react";
import { useConference } from '@/redux/hooks/conference/useConference';
import { ConferencePriceResponse, ConferenceResponse, TechnicalConferenceDetailResponse, ResearchConferenceDetailResponse } from '@/types/conference.type';
import { useParams, useRouter } from 'next/navigation';
import { useTransaction } from '@/redux/hooks/transaction/useTransaction';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import ConferenceHeader from './ConferenceHeader';
import InformationTab from './InformationTab';
import SessionsTab from './SessionsTab';
import FeedbackTab from './FeedbackTab';
import ResearchPaperInformationTab from './ResearchPaperInformationTab';

interface ImageModalProps {
  image: string;
  onClose: () => void;
}

const ConferenceDetail = () => {
  const params = useParams();
  const conferenceId = params?.id as string;
  const type = params?.type as string;

  const isResearch = type === 'research';

  const router = useRouter()

  const { accessToken } = useSelector((state: RootState) => state.auth)

  const {
    technicalConference,
    technicalConferenceLoading,
    technicalConferenceError,
    refetchTechnicalConference,
    researchConference,
    researchConferenceLoading,
    researchConferenceError,
    refetchResearchConference
  } = useConference({ id: conferenceId });
  const { purchaseTicket, loading: paymentLoading, paymentError, paymentResponse } = useTransaction();

  const [activeTab, setActiveTab] = useState('info');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // const [newFeedback, setNewFeedback] = useState({ name: '', rating: 5, comment: '' });
  // const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<ConferencePriceResponse | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  // const [conference, setConference] = useState<TechnicalConferenceDetailResponse | null>(null);

  // Use the appropriate conference data based on type
  const conference = isResearch ? researchConference : technicalConference;
  const loading = isResearch ? researchConferenceLoading : technicalConferenceLoading;
  const error = isResearch ? researchConferenceError : technicalConferenceError;

  useEffect(() => {
    if (paymentError) {
      const message = typeof paymentError === 'string' ? paymentError : 'Có lỗi xảy ra khi thanh toán.';
      toast.error(message);
    }
  }, [paymentError]);

  // const { fetchConference, loading, error } = useConference();

  // useEffect(() => {
  //   const loadConference = async () => {
  //     try {
  //       const response = await fetchConference(conferenceId);
  //       setConference(response.data);
  //       // setFeedbacks([]);
  //     } catch (err) {
  //       console.error('Failed to load conference:', err);
  //     }
  //   };
  //   if (conferenceId) {
  //     loadConference();
  //   }
  // }, [conferenceId]);

  const handlePurchaseTickt = async () => {
    if (!accessToken) {
      router.push('/auth/login');
      return;
    }

    if (!selectedTicket) return;

    try {
      const response = await purchaseTicket({ conferencePriceId: selectedTicket.conferencePriceId });
      if (response?.data) {
        window.location.href = response.data;
      } else {
        alert("Không nhận được đường dẫn thanh toán.");
      }
    }
    // catch (error: unknown) {
    //   const message =
    //     error instanceof Error
    //       ? error.message
    //       : "Có lỗi xảy ra, vui lòng thử lại!"
    //   toast.error(message)
    // }
    finally {
      setIsDialogOpen(false);
    }
  }

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

  const ImageModal: React.FC<ImageModalProps> = ({ image, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300">
        <X className="w-8 h-8" />
      </button>
      <div className="relative max-w-5xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <Image src={image} alt="Full size" width={1200} height={800} className="object-contain max-h-[90vh]" />
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Đang tải thông tin hội nghị...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-red-400 mb-4">Có lỗi xảy ra khi tải thông tin hội nghị</p>
          <p className="text-sm">{error.data?.message}</p>
        </div>
      </div>
    );
  }

  if (!conference) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <p>Không tìm thấy thông tin hội nghị</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return new Date(timeString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative min-h-screen">

      <div className="absolute inset-0">
        {/* Top hero image */}
        <div
          className="h-[50vh] bg-cover bg-center"
          style={{ backgroundImage: `url(${conference.bannerImageUrl || '/images/customer_route/confbannerbg1.jpg'})` }}
        />
        {/* Bottom white part */}
        <div className="h-[calc(100vh-15rem)] bg-gradient-to-br from-gray-900 via-blue-900 to-black overflow-hidden" />
      </div>

      <div className="relative z-10 h-screen overflow-auto">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">
          {/* Hero Background Section */}
          <div>
            {/* <div className="relative w-full min-h-[60vh] bg-cover bg-center" style={{ backgroundImage: `url(${conference.heroImage})` }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-transparent" /> */}

            {/* Floating Content Cards */}
            <ConferenceHeader
              conference={conference}
              isFavorite={isFavorite}
              setIsFavorite={setIsFavorite}
              isDialogOpen={isDialogOpen}
              setIsDialogOpen={setIsDialogOpen}
              selectedTicket={selectedTicket}
              setSelectedTicket={setSelectedTicket}
              paymentLoading={paymentLoading}
              handlePurchaseTickt={handlePurchaseTickt}
              accessToken={accessToken}
              formatDate={formatDate}
            />
            {/* <div className="relative max-w-6xl mx-auto px-4 py-8 md:py-16">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-32 md:mt-48">
                <div className="lg:col-span-2 bg-white/30 backdrop-blur-md rounded-2xl shadow-lg p-6 md:p-8 text-white">
                  <div className="flex items-start gap-3 mb-4">
                    <h1 className="text-2xl md:text-3xl font-bold flex-1
               bg-gradient-to-r from-black to-blue-950
               bg-clip-text text-transparent drop-shadow-lg">
                      {conference.conferenceName}
                    </h1>

                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
                      title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-white"}`}
                      />
                    </button>

                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                      {conference.isResearchConference ? 'Nghiên cứu' : 'Công nghệ'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-white" />
                      <span>{formatDate(conference.startDate)}</span>
                    </div>
                    <div className="flex items-start gap-2 md:col-span-2">
                      <MapPin className="w-5 h-5 text-white" />
                      <span>{conference.address}</span>
                    </div>
                    {conference.capacity && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Sức chứa: {conference.capacity} người</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white/30 backdrop-blur-md rounded-2xl shadow-lg p-6 text-white">
                  <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-black to-blue-950
    bg-clip-text text-transparent drop-shadow-lg">Đăng ký ngay</h3>
                  <p className="text-white text-sm mb-4">
                    Nhấn để chọn khung giá vé và thanh toán
                  </p>
                  <button
                    onClick={() => setIsDialogOpen(true)}
                    className="w-full bg-black hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Mở chọn vé
                  </button>
                </div>

                <Dialog
                  open={isDialogOpen}
                  as="div"
                  className="relative z-50 focus:outline-none"
                  onClose={setIsDialogOpen}
                >
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

                  <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel
                      transition
                      className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-2xl p-6
        text-white duration-300 ease-out data-[closed]:opacity-0 data-[closed]:scale-95"
                    >
                      <DialogTitle as="h3" className="text-lg font-semibold mb-4">
                        Chọn loại vé
                      </DialogTitle>

                      <div className="space-y-3">
                        {(conference.prices || []).map((ticket) => (
                          <label
                            key={ticket.priceId}
                            className={`block rounded-xl p-4 border cursor-pointer transition-all ${selectedTicket?.priceId === ticket.priceId
                              ? "bg-coral-500/30 border-coral-400"
                              : "bg-white/10 border-white/20 hover:bg-white/20"
                              }`}
                          >
                            <input
                              type="radio"
                              name="ticket"
                              value={ticket.priceId}
                              className="hidden"
                              onChange={() => setSelectedTicket(ticket)}
                            />
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">{ticket.ticketName}</span>
                              <span className="text-coral-300 font-medium">
                                {(ticket.actualPrice || ticket.ticketPrice || 0).toLocaleString("vi-VN")}₫
                              </span>
                            </div>
                            <p className="text-sm text-white/70 mt-1">{ticket.ticketDescription}</p>
                          </label>
                        ))}
                      </div>

                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          onClick={() => setIsDialogOpen(false)}
                          className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handlePurchaseTickt}
                          // onClick={() => {
                          //   alert(`Thanh toán ${selectedTicket?.name || "?"}`);
                          //   setIsDialogOpen(false);
                          // }}
                          // disabled={!selectedTicket}
                          disabled={!selectedTicket || paymentLoading}
                          className="px-5 py-2 rounded-lg bg-coral-500 hover:bg-coral-600 disabled:opacity-50 transition"
                        >
                          {paymentLoading ? (
                            <div className="flex items-center gap-2">
                              <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                                ></path>
                              </svg>
                              <span>Đang xử lý...</span>
                            </div>
                          ) : accessToken ? (
                            "Thanh toán"
                          ) : (
                            "Đăng nhập để thanh toán"
                          )
                          }
                        </button>
                      </div>
                    </DialogPanel>
                  </div>
                </Dialog>
              </div>

              <div className="mt-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg p-6 md:p-8 text-white">
                <p className="text-white leading-relaxed mb-3">{conference.description}</p>
                {conference.policies && conference.policies.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Chính sách:</h4>
                    <div className="space-y-2">
                      {conference.policies.map((policy) => (
                        <div key={policy.policyId} className="text-sm">
                          <span className="font-medium">{policy.policyName}:</span> {policy.description}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div> */}
          </div>

          {/* Tabs Section */}
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="bg-black rounded-2xl shadow-lg overflow-hidden"> {/* Container tabs background đen */}
              {/* Tab Headers */}
              <div className="flex border-b border-gray-700 overflow-x-auto"> {/* border hơi nhạt trên bg đen */}
                <button
                  onClick={() => setActiveTab('info')}
                  className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${activeTab === 'info'
                    ? 'text-blue-500 border-b-2 border-coral-500'
                    : 'text-white/70 hover:text-white'
                    }`}
                >
                  Thông tin & Hình ảnh
                </button>
                <button
                  onClick={() => setActiveTab('sessions')}
                  className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${activeTab === 'sessions'
                    ? 'text-blue-500 border-b-2 border-coral-500'
                    : 'text-white/70 hover:text-white'
                    }`}
                >
                  Lịch trình Sessions
                </button>
                {isResearch && (
                  <button
                    onClick={() => setActiveTab('research')}
                    className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${activeTab === 'research'
                      ? 'text-blue-500 border-b-2 border-coral-500'
                      : 'text-white/70 hover:text-white'
                      }`}
                  >
                    Research Paper Information
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${activeTab === 'feedback'
                    ? 'text-blue-500 border-b-2 border-coral-500'
                    : 'text-white/70 hover:text-white'
                    }`}
                >
                  Đánh giá
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6 md:p-8">
                {/* Info Tab */}
                {activeTab === 'info' && (
                  <InformationTab
                    conference={conference}
                    setSelectedImage={setSelectedImage}
                  />
                )}
                {/* {activeTab === 'info' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Thông tin chi tiết</h2>

                    {conference.media && conference.media.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-xl font-semibold text-white mb-4">Hình ảnh & Media</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {conference.media.map((media) => (
                            <div
                              key={media.mediaId}
                              className="relative cursor-pointer group"
                              onClick={() => setSelectedImage(media.mediaUrl || '')}
                            >
                              <div className="relative w-full aspect-video bg-white/10 rounded-lg overflow-hidden">
                                <Image
                                  src={media.mediaUrl || '/images/customer_route/confbannerbg2.jpg'}
                                  alt="Conference media"
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {conference.sponsors && conference.sponsors.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-xl font-semibold text-white mb-4">Nhà tài trợ</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {conference.sponsors.map((sponsor) => (
                            <div
                              key={sponsor.sponsorId}
                              className="bg-white/20 backdrop-blur-md rounded-lg p-4 flex flex-col items-center"
                            >
                              <div className="relative w-16 h-16 mb-2">
                                <Image
                                  src={sponsor.imageUrl || '/images/LandingPage/logo_sponser/tech_logo/logo_microsoft.png'}
                                  alt={sponsor.name || 'Sponsor'}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <span className="text-white text-sm text-center">{sponsor.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {conference.policies && conference.policies.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-4">Chính sách & Quy định</h3>
                        <div className="space-y-4">
                          {conference.policies.map((policy) => (
                            <div key={policy.policyId} className="bg-white/20 backdrop-blur-md rounded-lg p-4">
                              <h4 className="font-semibold text-white mb-2">{policy.policyName}</h4>
                              <p className="text-white/80 text-sm">{policy.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )} */}

                {/* Sessions Tab */}
                {activeTab === 'sessions' && (
                  <SessionsTab
                    conference={conference}
                    formatDate={formatDate}
                    formatTime={formatTime}
                  />
                )}

                {/* Research Paper Information Tab */}
                {activeTab === 'research' && isResearch && researchConference && (
                  <ResearchPaperInformationTab
                    conference={researchConference}
                    formatDate={formatDate}
                    formatTime={formatTime}
                  />
                )}
                {/* {activeTab === 'sessions' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Lịch trình Sessions</h2>

                    <div className="space-y-4">
                      {(conference.sessions || []).map((session) => (
                        <div key={session.sessionId} className="bg-white/20 backdrop-blur-md rounded-xl p-6 hover:shadow-lg transition-shadow text-white">
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative w-full md:w-48 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={conference.bannerImageUrl || '/images/customer_route/confbannerbg2.jpg'}
                                alt={session.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold mb-2">{session.title}</h3>
                              <div className="space-y-2 mb-3">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-white" />
                                  <span className="text-sm text-white">
                                    {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-white" />
                                  <span className="text-sm text-white">{formatDate(session.date)}</span>
                                </div>
                                {session.room && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-white" />
                                    <span className="text-sm text-white">
                                      {session.room.displayName || session.room.number || 'Phòng chưa xác định'}
                                    </span>
                                  </div>
                                )}
                                {session.speaker && (
                                  <p className="text-sm text-white">
                                    <span className="font-medium">Diễn giả:</span> {session.speaker.name}
                                  </p>
                                )}
                              </div>
                              <p className="text-white text-sm">{session.description}</p>
                              {session.speaker?.description && (
                                <p className="text-white/80 text-xs mt-2">
                                  <span className="font-medium">Về diễn giả:</span> {session.speaker.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {(!conference.sessions || conference.sessions.length === 0) && (
                        <div className="text-center text-white/70 py-8">
                          <p>Chưa có thông tin về sessions</p>
                        </div>
                      )}
                    </div>
                  </div>
                )} */}

                {/* Feedback Tab */}
                {/* {activeTab === 'feedback' && (
  <FeedbackTab
    conference={conference}
    newFeedback={newFeedback}
    setNewFeedback={setNewFeedback}
    feedbacks={feedbacks}
    handleAddFeedback={handleAddFeedback}
  />
)} */}
                {/* {activeTab === 'feedback' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Đánh giá từ khách hàng</h2>

                    <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 mb-6 text-white">
                      <h3 className="text-lg font-semibold mb-4">Thêm đánh giá của bạn</h3>
                      <form onSubmit={handleAddFeedback} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Tên của bạn</label>
                          <input
                            type="text"
                            value={newFeedback.name}
                            onChange={(e) => setNewFeedback({ ...newFeedback, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-black text-white"
                            placeholder="Nhập tên của bạn"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Đánh giá</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewFeedback({ ...newFeedback, rating: star })}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`w-8 h-8 ${star <= newFeedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/40'}`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Nhận xét</label>
                          <textarea
                            value={newFeedback.comment}
                            onChange={(e) => setNewFeedback({ ...newFeedback, comment: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-black text-white"
                            rows={4}
                            placeholder="Chia sẻ trải nghiệm của bạn..."
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="bg-coral-500 hover:bg-coral-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                          Gửi đánh giá
                        </button>
                      </form>
                    </div>

                    <div className="space-y-4">
                      {feedbacks.map((feedback) => (
                        <div key={feedback.id} className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl p-6 text-white">
                          <div className="flex items-start gap-4">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                              <Image
                                src={feedback.avatar}
                                alt={feedback.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-white">{feedback.name}</h4>
                                <span className="text-sm text-white/70">{feedback.date}</span>
                              </div>
                              <div className="flex gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/40'}`}
                                  />
                                ))}
                              </div>
                              <p className="text-white">{feedback.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )} */}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </div>
  );
};

export default ConferenceDetail;

//version chụp cho report 3
// "use client";

// import React, { useState } from "react";
// import Image from "next/image";
// import { Star, Clock, MapPin, Calendar } from "lucide-react";

// import { Dialog, DialogPanel } from "@headlessui/react";
// import { X } from "lucide-react";

// const ticketTypes = [
//   { id: 1, name: "Author", price: 60 },      // usually free or subsidized
//   { id: 2, name: "Presenter", price: 60 },
//   { id: 3, name: "Listener", price: 20 },
//   { id: 3, name: "VIP Listener", price: 50 },
//   // { id: 1, name: "Standard", price: 50 },
//   // { id: 2, name: "VIP", price: 120 },
//   // { id: 3, name: "Student", price: 20 },
// ];

// const mockConferenceDetail = {
//   id: 1,
//   title: "AI & Machine Learning Conference 2024",
//   status: "Popular",
//   date: "Saturday, Feb 23 2024",
//   timeRange: "14:00 - 20:00",
//   location: "National Convention Center, Hanoi",
//   description:
//     "This is a technology conference for our loyal attendees. Join us to explore the latest in AI.",
//   detailedDescription:
//     "The event will be held on a beautiful Saturday evening under the stars at the center of Hanoi.",
//   photos: [
//     "https://placehold.co/600x400?text=Photo+1",
//     "https://placehold.co/600x400?text=Photo+2",
//     "https://placehold.co/600x400?text=Photo+3",
//   ],
//   videos: [
//     { thumbnail: "https://placehold.co/600x400?text=Video+Thumbnail", url: "#" },
//   ],
//   sessions: [
//     {
//       id: 1,
//       title: "Keynote: Future of AI",
//       time: "14:00 - 15:30",
//       location: "Room A",
//       speaker: "Nguyen Van A",
//       description: "Explore the latest trends in AI and Machine Learning",
//       image: "https://placehold.co/600x400?text=Session+1",
//     },
//     {
//       id: 2,
//       title: "Workshop: Deep Learning",
//       time: "16:00 - 18:00",
//       location: "Lab B",
//       speaker: "Tran Thi B",
//       description: "Hands-on building deep learning models from scratch",
//       image: "https://placehold.co/600x400?text=Session+2",
//     },
//   ],
//   feedbacks: [
//     {
//       id: 1,
//       name: "Le Van C",
//       rating: 5,
//       comment: "Very insightful event, learned a lot!",
//       date: "20/02/2024",
//       avatar: "https://placehold.co/100x100?text=Avatar",
//     },
//   ],
// };

// const ConferenceDetail = () => {
//   const [feedbacks] = useState(mockConferenceDetail.feedbacks);
//   const [selectedImage, setSelectedImage] = useState<string | null>(null);
//   const [isFavorite, setIsFavorite] = useState(false);

//   const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
//   const [selectedTicket, setSelectedTicket] = useState<number | null>(null);

//   return (
//     <div className="min-h-screen bg-gray-50 p-6 text-gray-900">
//       {/* Title Card */}
//       <div className="bg-white rounded-2xl p-6 mb-6 shadow">
//         <div className="flex justify-between items-start mb-4">
//           <h1 className="text-2xl font-bold">{mockConferenceDetail.title}</h1>
//           <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
//             {mockConferenceDetail.status}
//           </span>
//         </div>
//         <div className="flex flex-col md:flex-row gap-4 mb-2">
//           <div className="flex items-center gap-2">
//             <Calendar className="w-5 h-5" /> {mockConferenceDetail.date}
//           </div>
//           <div className="flex items-center gap-2">
//             <Clock className="w-5 h-5" /> {mockConferenceDetail.timeRange}
//           </div>
//           <div className="flex items-center gap-2">
//             <MapPin className="w-5 h-5" /> {mockConferenceDetail.location}
//           </div>
//         </div>
//         <div className="mt-4 flex gap-2">
//           <button
//             onClick={() => setIsFavorite(!isFavorite)}
//             className={`px-4 py-2 rounded-lg font-medium transition ${isFavorite ? "bg-red-500 text-white" : "bg-gray-200 text-gray-900"
//               }`}
//           >
//             {isFavorite ? "★ Favorited" : "☆ Favorite"}
//           </button>
//           <button onClick={() => setIsTicketDialogOpen(true)} className="bg-blue-600 px-4 py-2 rounded-lg text-white font-medium">
//             Register
//           </button>
//         </div>
//       </div>

//       {/* Description Card */}
//       <div className="bg-white rounded-2xl p-6 mb-6 shadow">
//         <p className="mb-3">{mockConferenceDetail.description}</p>
//         <p>{mockConferenceDetail.detailedDescription}</p>
//       </div>

//       {/* Photos & Video Card */}
//       <div className="bg-white rounded-2xl p-6 mb-6 shadow">
//         <h2 className="text-xl font-bold mb-4">Photos & Video</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {mockConferenceDetail.videos.map((video, idx) => (
//             <div key={idx} className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden">
//               <Image src={video.thumbnail} alt="Video" fill className="object-cover" />
//             </div>
//           ))}
//           {mockConferenceDetail.photos.map((photo, idx) => (
//             <div
//               key={idx}
//               className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden cursor-pointer"
//               onClick={() => setSelectedImage(photo)}
//             >
//               <Image src={photo} alt={`Photo ${idx}`} fill className="object-cover" />
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Sessions Card */}
//       <div className="bg-white rounded-2xl p-6 mb-6 shadow">
//         <h2 className="text-xl font-bold mb-4">Sessions</h2>
//         <div className="space-y-4">
//           {mockConferenceDetail.sessions.map((session) => (
//             <div key={session.id} className="bg-gray-50 rounded-xl p-4 flex flex-col md:flex-row gap-4 shadow-sm">
//               <div className="relative w-full md:w-48 aspect-video rounded-lg overflow-hidden">
//                 <Image src={session.image} alt={session.title} fill className="object-cover" />
//               </div>
//               <div className="flex-1">
//                 <h3 className="font-semibold mb-2">{session.title}</h3>
//                 <p className="text-sm mb-1"><Clock className="inline w-4 h-4" /> {session.time}</p>
//                 <p className="text-sm mb-1"><MapPin className="inline w-4 h-4" /> {session.location}</p>
//                 <p className="text-sm mb-1"><span className="font-medium">Speaker:</span> {session.speaker}</p>
//                 <p className="text-sm">{session.description}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Feedback Card */}
//       <div className="bg-white rounded-2xl p-6 mb-6 shadow">
//         <h2 className="text-xl font-bold mb-4">Feedback</h2>

//         {/* Form */}
//         <div className="mb-6 space-y-3">
//           <div className="flex items-center gap-2">
//             {[...Array(5)].map((_, i) => (
//               <Star
//                 key={i}
//                 className={`w-6 h-6 cursor-pointer ${i < 5 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
//               // onClick={() => setNewRating(i + 1)}
//               />
//             ))}
//           </div>
//           <textarea
//             className="w-full border border-gray-300 rounded-lg p-2"
//             placeholder="Write your feedback..."
//           // value={newComment}
//           // onChange={(e) => setNewComment(e.target.value)}
//           />
//           <button
//             // onClick={handleSubmitFeedback}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg"
//           >
//             Submit Feedback
//           </button>
//         </div>

//         {/* Feedback list */}
//         <div className="space-y-4">
//           {feedbacks.map((fb) => (
//             <div key={fb.id} className="bg-gray-50 rounded-xl p-4 flex gap-4 shadow-sm">
//               <div className="relative w-12 h-12 rounded-full overflow-hidden">
//                 <Image src={fb.avatar} alt={fb.name} fill className="object-cover" />
//               </div>
//               <div className="flex-1">
//                 <div className="flex justify-between mb-1">
//                   <span className="font-semibold">{fb.name}</span>
//                   <span className="text-sm">{fb.date}</span>
//                 </div>
//                 <div className="flex gap-1 mb-1">
//                   {[...Array(5)].map((_, i) => (
//                     <Star
//                       key={i}
//                       className={`w-4 h-4 ${i < fb.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
//                     />
//                   ))}
//                 </div>
//                 <p>{fb.comment}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//       {/* <div className="bg-white rounded-2xl p-6 mb-6 shadow">
//         <h2 className="text-xl font-bold mb-4">Feedback</h2>
//         <div className="space-y-4">
//           {feedbacks.map((fb) => (
//             <div key={fb.id} className="bg-gray-50 rounded-xl p-4 flex gap-4 shadow-sm">
//               <div className="relative w-12 h-12 rounded-full overflow-hidden">
//                 <Image src={fb.avatar} alt={fb.name} fill className="object-cover" />
//               </div>
//               <div>
//                 <div className="flex justify-between mb-1">
//                   <span className="font-semibold">{fb.name}</span>
//                   <span className="text-sm">{fb.date}</span>
//                 </div>
//                 <div className="flex gap-1 mb-1">
//                   {[...Array(5)].map((_, i) => (
//                     <Star key={i} className={`w-4 h-4 ${i < fb.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`} />
//                   ))}
//                 </div>
//                 <p>{fb.comment}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div> */}

//       {/* Image Modal */}
//       {selectedImage && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
//           onClick={() => setSelectedImage(null)}
//         >
//           <div className="relative max-w-5xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
//             <Image src={selectedImage} alt="Full size" width={1200} height={800} className="object-contain max-h-[90vh]" />
//           </div>
//         </div>
//       )}

//       <Dialog
//         open={isTicketDialogOpen}
//         onClose={setIsTicketDialogOpen}
//         className="relative z-50"
//       >
//         <div className="fixed inset-0 bg-black/40" />
//         <div className="fixed inset-0 flex items-center justify-center p-4">
//           <DialogPanel className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 relative">
//             <button
//               onClick={() => setIsTicketDialogOpen(false)}
//               className="absolute top-3 right-3 text-gray-500 hover:text-black"
//             >
//               <X className="w-5 h-5" />
//             </button>

//             <h2 className="text-lg font-semibold mb-4">Select Ticket Type</h2>

//             <div className="space-y-3">
//               {ticketTypes.map((ticket) => (
//                 <div
//                   key={ticket.id}
//                   onClick={() => setSelectedTicket(ticket.id)}
//                   className={`p-4 rounded-lg border cursor-pointer transition ${selectedTicket === ticket.id
//                     ? "border-blue-600 bg-blue-50"
//                     : "border-gray-300 hover:bg-gray-50"
//                     }`}
//                 >
//                   <div className="flex justify-between items-center">
//                     <span className="font-medium">{ticket.name}</span>
//                     <span className="text-gray-700">${ticket.price}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="flex justify-end mt-6 gap-3">
//               <button
//                 onClick={() => setIsTicketDialogOpen(false)}
//                 className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => {
//                   if (selectedTicket) {
//                     console.log("Selected ticket:", ticketTypes.find(t => t.id === selectedTicket));
//                     setIsTicketDialogOpen(false);
//                   }
//                 }}
//                 className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
//               >
//                 Confirm
//               </button>
//             </div>
//           </DialogPanel>
//         </div>
//       </Dialog>
//     </div>
//   );
// };

// export default ConferenceDetail;