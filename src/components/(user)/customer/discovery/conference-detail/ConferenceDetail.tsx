"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'sonner'
import { X, Ticket } from 'lucide-react';
import { useConference } from '@/redux/hooks/conference/useConference';
import { ConferencePriceResponse, SponsorResponse, } from '@/types/conference.type';
import { useParams, useRouter } from 'next/navigation';
import { useTransaction } from '@/redux/hooks/transaction/useTransaction';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import ConferenceHeader from './ConferenceHeader';
import InformationTab from './InformationTab';
import SessionsTab from './SessionsTab';
import FeedbackTab from './FeedbackTab';
import ResearchPaperInformationTab from './ResearchPaperInformationTab';
import ConferencePriceTab from './ConferencePriceTab';
import SponsorCarousel from './SponsorCarousel';
import PolicyTab from './PolicyTab';

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

  const {
    purchaseTechTicket,
    purchaseResearchPaper,
    loading: paymentLoading,
    techPaymentError,
    researchPaymentError,
    techPaymentResponse,
    researchPaymentResponse,
  } = useTransaction();

  const [activeTab, setActiveTab] = useState('info');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // const [newFeedback, setNewFeedback] = useState({ name: '', rating: 5, comment: '' });
  // const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<ConferencePriceResponse | null>(null);
  const [authorInfo, setAuthorInfo] = useState<{ title: string; description: string }>({
    title: '',
    description: ''
  });
  const [showAuthorForm, setShowAuthorForm] = React.useState(false);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  // const [conference, setConference] = useState<TechnicalConferenceDetailResponse | null>(null);

  // Use the appropriate conference data based on type
  const conference = isResearch ? researchConference : technicalConference;
  const loading = isResearch ? researchConferenceLoading : technicalConferenceLoading;
  const error = isResearch ? researchConferenceError : technicalConferenceError;

  useEffect(() => {
    if (techPaymentError) toast.error(techPaymentError.data?.Message);
    if (researchPaymentError) toast.error(researchPaymentError.data?.Message);
    console.log(techPaymentError)
    console.log(researchPaymentError)
  }, [techPaymentError, researchPaymentError]);

  const handlePurchaseTicket = async () => {
    if (!accessToken) {
      router.push('/auth/login');
      return;
    }

    if (!selectedTicket) return;

    if (!selectedPaymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán!");
      return;
    }

    if (selectedTicket.isAuthor && (!authorInfo.title.trim() || !authorInfo.description.trim())) {
      toast.error("Vui lòng nhập tiêu đề và mô tả bài báo!");
      return;
    }

    try {
      let response;

      if (selectedTicket.isAuthor) {
        response = await purchaseResearchPaper({ conferencePriceId: selectedTicket.conferencePriceId, title: authorInfo.title, description: authorInfo.description, paymentMethodId: selectedPaymentMethod });
      } else {
        response = await purchaseTechTicket({ conferencePriceId: selectedTicket.conferencePriceId, paymentMethodId: selectedPaymentMethod });
      }

      if (response?.data.checkOutUrl) {
        window.location.href = response.data.checkOutUrl;
      } else {
        alert("Không nhận được đường dẫn thanh toán.");
      }
    }
    finally {
      setIsDialogOpen(false);
      setAuthorInfo({ title: '', description: '' });
      setSelectedPaymentMethod(null);
      setShowPaymentMethods(false);
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
          <p className="text-sm">{error.data?.Message}</p>
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
        <div
          className="h-[50vh] bg-cover bg-center"
          style={{ backgroundImage: `url(${conference.bannerImageUrl || '/images/customer_route/confbannerbg1.jpg'})` }}
        />
        <div className="h-[calc(100vh-15rem)] bg-gradient-to-br from-gray-900 via-blue-900 to-black overflow-hidden" />
      </div>

      <div className="relative z-10 h-screen overflow-auto">
        <div className="max-w-6xl mx-auto px-4">
          <div>
            <ConferenceHeader
              conference={conference}
              isDialogOpen={isDialogOpen}
              setIsDialogOpen={setIsDialogOpen}
              selectedTicket={selectedTicket}
              setSelectedTicket={setSelectedTicket}
              paymentLoading={paymentLoading}
              handlePurchaseTicket={handlePurchaseTicket}
              accessToken={accessToken}
              formatDate={formatDate}
              authorInfo={authorInfo}
              setAuthorInfo={setAuthorInfo}
              showAuthorForm={showAuthorForm}
              setShowAuthorForm={setShowAuthorForm}
              selectedPaymentMethod={selectedPaymentMethod}
              setSelectedPaymentMethod={setSelectedPaymentMethod}
              showPaymentMethods={showPaymentMethods}
              setShowPaymentMethods={setShowPaymentMethods}
            />
          </div>

          <div className="max-w-6xl mx-auto px-4 py-8">
            <SponsorCarousel sponsors={conference.sponsors ?? []} />
          </div>

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
                <button
                  onClick={() => setActiveTab('prices')}
                  className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${activeTab === 'prices'
                    ? 'text-blue-500 border-b-2 border-coral-400'
                    : 'text-white/70 hover:text-white'
                    }`}
                >
                  Các loại vé
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
                  onClick={() => setActiveTab('policy')}
                  className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${activeTab === 'policy'
                    ? 'text-blue-500 border-b-2 border-coral-500'
                    : 'text-white/70 hover:text-white'
                    }`}
                >
                  Chính sách & Hoàn tiền
                </button>
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

                {/* Sessions Tab */}
                {activeTab === 'sessions' && (
                  <SessionsTab
                    conference={conference}
                    formatDate={formatDate}
                    formatTime={formatTime}
                  />
                )}

                {activeTab === 'prices' && (
                  <ConferencePriceTab
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

                {/* Policy Tab */}
                {activeTab === 'policy' && (
                  <PolicyTab
                    conference={conference}
                  />
                )}

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