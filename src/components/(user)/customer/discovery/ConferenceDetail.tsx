"use client";

import React, { useState } from 'react';
// import { useParams } from 'next/navigation';
import Image from 'next/image';
import { X, MapPin, Clock, Calendar, Star } from 'lucide-react';

interface ImageModalProps {
  image: string;
  onClose: () => void;
}

// Mock data
const mockConferenceDetail = {
  id: 1,
  title: "Hội nghị Công nghệ AI & Machine Learning 2024",
  status: "Bán chạy nhất",
  date: "Thứ Bảy, 23 tháng 2 2024",
  timeRange: "14:00 - 20:00",
  location: "Trung tâm Hội nghị Quốc gia, Hà Nội",
  heroImage: "/images/customer_route/confbannerbg1.jpg",
  description: "Chúng tôi đang tổ chức một hội nghị công nghệ dành riêng cho các khách hàng thân thiết nhất. Rất mong được gặp các bạn tại đây.",
  detailedDescription: "Sự kiện sẽ được tổ chức vào tối thứ bảy dưới bầu trời đầy sao tuyệt đẹp tại trung tâm Hà Nội.",
  photos: [
    "/images/LandingPage/conf_img/speaker_img.png",
    "/images/customer_route/confbannerbg2.jpg",
    "/images/customer_route/confbannerbg1.jpg",
    "/images/LandingPage/conf_img/speaker_img.png",
  ],
  videos: [
    {
      thumbnail: "/images/LandingPage/conf_img/speaker_img.png",
      url: "#"
    }
  ],
  sessions: [
    {
      id: 1,
      title: "Keynote: Tương lai của AI",
      time: "14:00 - 15:30",
      location: "Phòng hội nghị A",
      speaker: "Nguyễn Văn A",
      description: "Khám phá những xu hướng mới nhất trong AI và Machine Learning",
      image: "/images/LandingPage/conf_img/speaker_img.png"
    },
    {
      id: 2,
      title: "Workshop: Thực hành Deep Learning",
      time: "16:00 - 18:00",
      location: "Phòng Lab B",
      speaker: "Trần Thị B",
      description: "Thực hành xây dựng mô hình Deep Learning từ đầu",
      image: "/images/customer_route/confbannerbg2.jpg"
    },
    {
      id: 3,
      title: "Panel Discussion: AI Ethics",
      time: "18:30 - 20:00",
      location: "Phòng hội nghị A",
      speaker: "Panel chuyên gia",
      description: "Thảo luận về đạo đức và trách nhiệm trong phát triển AI",
      image: "/images/customer_route/confbannerbg1.jpg"
    }
  ],
  feedbacks: [
    {
      id: 1,
      name: "Lê Văn C",
      rating: 5,
      comment: "Sự kiện rất bổ ích, tôi đã học được rất nhiều điều mới!",
      date: "20/02/2024",
      avatar: "/images/LandingPage/conf_img/speaker_img.png"
    },
    {
      id: 2,
      name: "Phạm Thị D",
      rating: 4,
      comment: "Nội dung tuyệt vời, tuy nhiên thời gian hơi gấp gáp.",
      date: "19/02/2024",
      avatar: "/images/customer_route/confbannerbg2.jpg"
    }
  ]
};

const ConferenceDetail = () => {
  // const params = useParams();
  const [activeTab, setActiveTab] = useState('info');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newFeedback, setNewFeedback] = useState({ name: '', rating: 5, comment: '' });
  const [feedbacks, setFeedbacks] = useState(mockConferenceDetail.feedbacks);

  const conference = mockConferenceDetail;

  const handleAddFeedback = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newFeedback.name && newFeedback.comment) {
      const feedback = {
        id: feedbacks.length + 1,
        ...newFeedback,
        date: new Date().toLocaleDateString('vi-VN'),
        avatar: "/images/LandingPage/conf_img/speaker_img.png"
      };
      setFeedbacks([feedback, ...feedbacks]);
      setNewFeedback({ name: '', rating: 5, comment: '' });
    }
  };

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

  return (
    // <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-red-50">
    <div className="relative min-h-screen">

      <div className="absolute inset-0">
        {/* Top hero image */}
        <div
          className="h-[50vh] bg-cover bg-center"
          style={{ backgroundImage: `url(${conference.heroImage})` }}
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
            <div className="relative max-w-6xl mx-auto px-4 py-8 md:py-16">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-32 md:mt-48">
                {/* Title Card */}
                {/* <div className="lg:col-span-2 bg-white rounded-2xl shadow-2xl p-6 md:p-8"> */}
                <div className="lg:col-span-2 bg-white/30 backdrop-blur-md rounded-2xl shadow-lg p-6 md:p-8 text-white">
                  <div className="flex items-start gap-3 mb-4">
                    {/* <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex-1"> */}
                    <h1 className="text-2xl md:text-3xl font-bold flex-1
               bg-gradient-to-r from-black to-blue-950
               bg-clip-text text-transparent drop-shadow-lg">
                      {conference.title}
                    </h1>
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                      {conference.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                    <div className="flex items-center gap-2">
                      {/* <Calendar className="w-5 h-5 text-coral-500" /> */}
                      <Calendar className="w-5 h-5 text-white" />
                      <span>{conference.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* <Clock className="w-5 h-5 text-coral-500" /> */}
                      <Clock className="w-5 h-5 text-white" />
                      <span>{conference.timeRange}</span>
                    </div>
                    <div className="flex items-start gap-2 md:col-span-2">
                      {/* <MapPin className="w-5 h-5 text-coral-500 mt-0.5 flex-shrink-0" /> */}
                      <MapPin className="w-5 h-5 text-white" />
                      <span>{conference.location}</span>
                    </div>
                  </div>
                </div>

                {/* Subscribe Card */}
                {/* <div className="bg-white rounded-2xl shadow-2xl p-6"> */}
                <div className="bg-white/30 backdrop-blur-md rounded-2xl shadow-lg p-6 text-white">
                  <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-black to-blue-950
               bg-clip-text text-transparent drop-shadow-lg">Đăng ký ngay</h3>
                  <p className="text-white text-sm mb-4">
                    Nhấn để thêm vào lịch của bạn
                  </p>
                  <button className="w-full bg-coral-500 hover:bg-coral-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Thêm vào lịch
                  </button>
                </div>
              </div>

              {/* Description Card */}
              {/* <div className="mt-4 bg-white rounded-2xl shadow-2xl p-6 md:p-8"> */}
              <div className="mt-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg p-6 md:p-8 text-white">
                <p className="text-white leading-relaxed mb-3">{conference.description}</p>
                <p className="text-white leading-relaxed">{conference.detailedDescription}</p>
              </div>
            </div>
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
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Hình ảnh & Video sự kiện</h2> {/* chữ trắng */}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Video */}
                      <div className="md:col-span-2 lg:col-span-2 relative cursor-pointer group">
                        <div className="relative w-full aspect-video bg-white/10 rounded-lg overflow-hidden"> {/* transparent + blur */}
                          <Image
                            src={conference.videos[0].thumbnail}
                            alt="Video thumbnail"
                            fill
                            className="object-cover"
                          />
                          {/* <div className="absolute inset-0 bg-white bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-40 transition-all" /> */}
                        </div>
                      </div>

                      {/* Photos */}
                      {conference.photos.map((photo, index) => (
                        <div
                          key={index}
                          className="relative cursor-pointer group"
                          onClick={() => setSelectedImage(photo)}
                        >
                          <div className="relative w-full aspect-video bg-white/10 rounded-lg overflow-hidden">
                            <Image
                              src={photo}
                              alt={`Event photo ${index + 1}`}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            {/* <div className="absolute inset-0 bg-white bg-opacity-0 group-hover:bg-opacity-20 transition-all" /> */}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sessions Tab */}
                {activeTab === 'sessions' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Lịch trình Sessions</h2>

                    <div className="space-y-4">
                      {conference.sessions.map((session) => (
                        <div key={session.id} className="bg-white/20 backdrop-blur-md rounded-xl p-6 hover:shadow-lg transition-shadow text-white">
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative w-full md:w-48 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={session.image}
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
                                  <span className="text-sm text-white">{session.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-white" />
                                  <span className="text-sm text-white">{session.location}</span>
                                </div>
                                <p className="text-sm text-white">
                                  <span className="font-medium">Diễn giả:</span> {session.speaker}
                                </p>
                              </div>
                              <p className="text-white text-sm">{session.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback Tab */}
                {activeTab === 'feedback' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Đánh giá từ khách hàng</h2>

                    {/* Add Feedback Form */}
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

                    {/* Feedback List */}
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
                )}
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