"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Star, Clock, MapPin, Calendar } from "lucide-react";

import { Dialog, DialogPanel } from "@headlessui/react";
import { X } from "lucide-react";

const ticketTypes = [
  { id: 1, name: "Author", price: 60 },      // usually free or subsidized
  { id: 2, name: "Presenter", price: 60 },
  { id: 3, name: "Listener", price: 20 },
  { id: 3, name: "VIP Listener", price: 50 },
  // { id: 1, name: "Standard", price: 50 },
  // { id: 2, name: "VIP", price: 120 },
  // { id: 3, name: "Student", price: 20 },
];

const mockConferenceDetail = {
  id: 1,
  title: "AI & Machine Learning Conference 2024",
  status: "Popular",
  date: "Saturday, Feb 23 2024",
  timeRange: "14:00 - 20:00",
  location: "National Convention Center, Hanoi",
  description:
    "This is a technology conference for our loyal attendees. Join us to explore the latest in AI.",
  detailedDescription:
    "The event will be held on a beautiful Saturday evening under the stars at the center of Hanoi.",
  photos: [
    "https://placehold.co/600x400?text=Photo+1",
    "https://placehold.co/600x400?text=Photo+2",
    "https://placehold.co/600x400?text=Photo+3",
  ],
  videos: [
    { thumbnail: "https://placehold.co/600x400?text=Video+Thumbnail", url: "#" },
  ],
  sessions: [
    {
      id: 1,
      title: "Keynote: Future of AI",
      time: "14:00 - 15:30",
      location: "Room A",
      speaker: "Nguyen Van A",
      description: "Explore the latest trends in AI and Machine Learning",
      image: "https://placehold.co/600x400?text=Session+1",
    },
    {
      id: 2,
      title: "Workshop: Deep Learning",
      time: "16:00 - 18:00",
      location: "Lab B",
      speaker: "Tran Thi B",
      description: "Hands-on building deep learning models from scratch",
      image: "https://placehold.co/600x400?text=Session+2",
    },
  ],
  feedbacks: [
    {
      id: 1,
      name: "Le Van C",
      rating: 5,
      comment: "Very insightful event, learned a lot!",
      date: "20/02/2024",
      avatar: "https://placehold.co/100x100?text=Avatar",
    },
  ],
};

const ConferenceDetail = () => {
  const [feedbacks] = useState(mockConferenceDetail.feedbacks);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900">
      {/* Title Card */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">{mockConferenceDetail.title}</h1>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            {mockConferenceDetail.status}
          </span>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" /> {mockConferenceDetail.date}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" /> {mockConferenceDetail.timeRange}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" /> {mockConferenceDetail.location}
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`px-4 py-2 rounded-lg font-medium transition ${isFavorite ? "bg-red-500 text-white" : "bg-gray-200 text-gray-900"
              }`}
          >
            {isFavorite ? "★ Favorited" : "☆ Favorite"}
          </button>
          <button onClick={() => setIsTicketDialogOpen(true)} className="bg-blue-600 px-4 py-2 rounded-lg text-white font-medium">
            Register
          </button>
        </div>
      </div>

      {/* Description Card */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow">
        <p className="mb-3">{mockConferenceDetail.description}</p>
        <p>{mockConferenceDetail.detailedDescription}</p>
      </div>

      {/* Photos & Video Card */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow">
        <h2 className="text-xl font-bold mb-4">Photos & Video</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockConferenceDetail.videos.map((video, idx) => (
            <div key={idx} className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden">
              <Image src={video.thumbnail} alt="Video" fill className="object-cover" />
            </div>
          ))}
          {mockConferenceDetail.photos.map((photo, idx) => (
            <div
              key={idx}
              className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => setSelectedImage(photo)}
            >
              <Image src={photo} alt={`Photo ${idx}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Sessions Card */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow">
        <h2 className="text-xl font-bold mb-4">Sessions</h2>
        <div className="space-y-4">
          {mockConferenceDetail.sessions.map((session) => (
            <div key={session.id} className="bg-gray-50 rounded-xl p-4 flex flex-col md:flex-row gap-4 shadow-sm">
              <div className="relative w-full md:w-48 aspect-video rounded-lg overflow-hidden">
                <Image src={session.image} alt={session.title} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">{session.title}</h3>
                <p className="text-sm mb-1"><Clock className="inline w-4 h-4" /> {session.time}</p>
                <p className="text-sm mb-1"><MapPin className="inline w-4 h-4" /> {session.location}</p>
                <p className="text-sm mb-1"><span className="font-medium">Speaker:</span> {session.speaker}</p>
                <p className="text-sm">{session.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Card */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow">
        <h2 className="text-xl font-bold mb-4">Feedback</h2>

        {/* Form */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-6 h-6 cursor-pointer ${i < 5 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
              // onClick={() => setNewRating(i + 1)}
              />
            ))}
          </div>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="Write your feedback..."
          // value={newComment}
          // onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            // onClick={handleSubmitFeedback}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Submit Feedback
          </button>
        </div>

        {/* Feedback list */}
        <div className="space-y-4">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="bg-gray-50 rounded-xl p-4 flex gap-4 shadow-sm">
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image src={fb.avatar} alt={fb.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold">{fb.name}</span>
                  <span className="text-sm">{fb.date}</span>
                </div>
                <div className="flex gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < fb.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
                    />
                  ))}
                </div>
                <p>{fb.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* <div className="bg-white rounded-2xl p-6 mb-6 shadow">
        <h2 className="text-xl font-bold mb-4">Feedback</h2>
        <div className="space-y-4">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="bg-gray-50 rounded-xl p-4 flex gap-4 shadow-sm">
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image src={fb.avatar} alt={fb.name} fill className="object-cover" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold">{fb.name}</span>
                  <span className="text-sm">{fb.date}</span>
                </div>
                <div className="flex gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < fb.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`} />
                  ))}
                </div>
                <p>{fb.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </div> */}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <Image src={selectedImage} alt="Full size" width={1200} height={800} className="object-contain max-h-[90vh]" />
          </div>
        </div>
      )}

      <Dialog
        open={isTicketDialogOpen}
        onClose={setIsTicketDialogOpen}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/40" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 relative">
            <button
              onClick={() => setIsTicketDialogOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-semibold mb-4">Select Ticket Type</h2>

            <div className="space-y-3">
              {ticketTypes.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition ${selectedTicket === ticket.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{ticket.name}</span>
                    <span className="text-gray-700">${ticket.price}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setIsTicketDialogOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedTicket) {
                    console.log("Selected ticket:", ticketTypes.find(t => t.id === selectedTicket));
                    setIsTicketDialogOpen(false);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
};

export default ConferenceDetail;


// "use client";

// import React, { useState, Fragment } from 'react';
// // import { useParams } from 'next/navigation';
// import Image from 'next/image';
// import { X, MapPin, Clock, Calendar, Star } from 'lucide-react';
// import { Dialog, DialogPanel, DialogTitle, Button } from "@headlessui/react";

// interface ImageModalProps {
//   image: string;
//   onClose: () => void;
// }

// // Mock data
// const mockConferenceDetail = {
//   id: 1,
//   title: "Hội nghị Công nghệ AI & Machine Learning 2024",
//   status: "Bán chạy nhất",
//   date: "Thứ Bảy, 23 tháng 2 2024",
//   timeRange: "14:00 - 20:00",
//   location: "Trung tâm Hội nghị Quốc gia, Hà Nội",
//   heroImage: "/images/customer_route/confbannerbg1.jpg",
//   description: "Chúng tôi đang tổ chức một hội nghị công nghệ dành riêng cho các khách hàng thân thiết nhất. Rất mong được gặp các bạn tại đây.",
//   detailedDescription: "Sự kiện sẽ được tổ chức vào tối thứ bảy dưới bầu trời đầy sao tuyệt đẹp tại trung tâm Hà Nội.",
//   photos: [
//     "/images/LandingPage/conf_img/speaker_img.png",
//     "/images/customer_route/confbannerbg2.jpg",
//     "/images/customer_route/confbannerbg1.jpg",
//     "/images/LandingPage/conf_img/speaker_img.png",
//   ],
//   videos: [
//     {
//       thumbnail: "/images/LandingPage/conf_img/speaker_img.png",
//       url: "#"
//     }
//   ],
//   sessions: [
//     {
//       id: 1,
//       title: "Keynote: Tương lai của AI",
//       time: "14:00 - 15:30",
//       location: "Phòng hội nghị A",
//       speaker: "Nguyễn Văn A",
//       description: "Khám phá những xu hướng mới nhất trong AI và Machine Learning",
//       image: "/images/LandingPage/conf_img/speaker_img.png"
//     },
//     {
//       id: 2,
//       title: "Workshop: Thực hành Deep Learning",
//       time: "16:00 - 18:00",
//       location: "Phòng Lab B",
//       speaker: "Trần Thị B",
//       description: "Thực hành xây dựng mô hình Deep Learning từ đầu",
//       image: "/images/customer_route/confbannerbg2.jpg"
//     },
//     {
//       id: 3,
//       title: "Panel Discussion: AI Ethics",
//       time: "18:30 - 20:00",
//       location: "Phòng hội nghị A",
//       speaker: "Panel chuyên gia",
//       description: "Thảo luận về đạo đức và trách nhiệm trong phát triển AI",
//       image: "/images/customer_route/confbannerbg1.jpg"
//     }
//   ],
//   feedbacks: [
//     {
//       id: 1,
//       name: "Lê Văn C",
//       rating: 5,
//       comment: "Sự kiện rất bổ ích, tôi đã học được rất nhiều điều mới!",
//       date: "20/02/2024",
//       avatar: "/images/LandingPage/conf_img/speaker_img.png"
//     },
//     {
//       id: 2,
//       name: "Phạm Thị D",
//       rating: 4,
//       comment: "Nội dung tuyệt vời, tuy nhiên thời gian hơi gấp gáp.",
//       date: "19/02/2024",
//       avatar: "/images/customer_route/confbannerbg2.jpg"
//     }
//   ]
// };

// const ConferenceDetail = () => {
//   // const params = useParams();
//   const [activeTab, setActiveTab] = useState('info');
//   const [selectedImage, setSelectedImage] = useState<string | null>(null);
//   const [newFeedback, setNewFeedback] = useState({ name: '', rating: 5, comment: '' });
//   const [feedbacks, setFeedbacks] = useState(mockConferenceDetail.feedbacks);

//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [selectedTicket, setSelectedTicket] = useState<any>(null);

//   const [isFavorite, setIsFavorite] = useState(false);

//   const conference = mockConferenceDetail;

//   const handleAddFeedback = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (newFeedback.name && newFeedback.comment) {
//       const feedback = {
//         id: feedbacks.length + 1,
//         ...newFeedback,
//         date: new Date().toLocaleDateString('vi-VN'),
//         avatar: "/images/LandingPage/conf_img/speaker_img.png"
//       };
//       setFeedbacks([feedback, ...feedbacks]);
//       setNewFeedback({ name: '', rating: 5, comment: '' });
//     }
//   };

//   const ImageModal: React.FC<ImageModalProps> = ({ image, onClose }) => (
//     <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={onClose}>
//       <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300">
//         <X className="w-8 h-8" />
//       </button>
//       <div className="relative max-w-5xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
//         <Image src={image} alt="Full size" width={1200} height={800} className="object-contain max-h-[90vh]" />
//       </div>
//     </div>
//   );

//   return (
//     // <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-red-50">
//     <div className="relative min-h-screen">

//       <div className="absolute inset-0">
//         {/* Top hero image */}
//         <div
//           className="h-[50vh] bg-cover bg-center"
//           style={{ backgroundImage: `url(${conference.heroImage})` }}
//         />
//         {/* Bottom white part */}
//         <div className="h-[calc(100vh-15rem)] bg-gradient-to-br from-gray-900 via-blue-900 to-black overflow-hidden" />
//       </div>

//       <div className="relative z-10 h-screen overflow-auto">
//         <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">
//           {/* Hero Background Section */}
//           <div>
//             {/* <div className="relative w-full min-h-[60vh] bg-cover bg-center" style={{ backgroundImage: `url(${conference.heroImage})` }}>
//             <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-transparent" /> */}

//             {/* Floating Content Cards */}
//             <div className="relative max-w-6xl mx-auto px-4 py-8 md:py-16">
//               <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-32 md:mt-48">
//                 {/* Title Card */}
//                 {/* <div className="lg:col-span-2 bg-white rounded-2xl shadow-2xl p-6 md:p-8"> */}
//                 <div className="lg:col-span-2 bg-white/30 backdrop-blur-md rounded-2xl shadow-lg p-6 md:p-8 text-white">
//                   <div className="flex items-start gap-3 mb-4">
//                     {/* <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex-1"> */}
//                     <h1 className="text-2xl md:text-3xl font-bold flex-1
//                bg-gradient-to-r from-black to-blue-950
//                bg-clip-text text-transparent drop-shadow-lg">
//                       {conference.title}
//                     </h1>

//                     <button
//                       onClick={() => setIsFavorite(!isFavorite)}
//                       className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
//                       title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
//                     >
//                       <Star
//                         className={`w-6 h-6 transition-colors ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-white"}`}
//                       />
//                     </button>

//                     <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
//                       {conference.status}
//                     </span>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
//                     <div className="flex items-center gap-2">
//                       {/* <Calendar className="w-5 h-5 text-coral-500" /> */}
//                       <Calendar className="w-5 h-5 text-white" />
//                       <span>{conference.date}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       {/* <Clock className="w-5 h-5 text-coral-500" /> */}
//                       <Clock className="w-5 h-5 text-white" />
//                       <span>{conference.timeRange}</span>
//                     </div>
//                     <div className="flex items-start gap-2 md:col-span-2">
//                       {/* <MapPin className="w-5 h-5 text-coral-500 mt-0.5 flex-shrink-0" /> */}
//                       <MapPin className="w-5 h-5 text-white" />
//                       <span>{conference.location}</span>
//                     </div>
//                   </div>a
//                 </div>

//                 {/* Subscribe Card */}
//                 {/* <div className="bg-white rounded-2xl shadow-2xl p-6"> */}
//                 <div className="bg-white/30 backdrop-blur-md rounded-2xl shadow-lg p-6 text-white">
//                   <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-black to-blue-950
//     bg-clip-text text-transparent drop-shadow-lg">Đăng ký ngay</h3>
//                   <p className="text-white text-sm mb-4">
//                     Nhấn để chọn khung giá vé và thanh toán
//                   </p>
//                   <button
//                     onClick={() => setIsDialogOpen(true)}
//                     className="w-full bg-black hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
//                   >
//                     Mở chọn vé
//                   </button>
//                 </div>

//                 {/* Ticket Selection Dialog */}
//                 <Dialog
//                   open={isDialogOpen}
//                   as="div"
//                   className="relative z-50 focus:outline-none"
//                   onClose={setIsDialogOpen}
//                 >
//                   <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

//                   <div className="fixed inset-0 flex items-center justify-center p-4">
//                     <DialogPanel
//                       transition
//                       className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-2xl p-6
//         text-white duration-300 ease-out data-[closed]:opacity-0 data-[closed]:scale-95"
//                     >
//                       <DialogTitle as="h3" className="text-lg font-semibold mb-4">
//                         Chọn loại vé
//                       </DialogTitle>

//                       <div className="space-y-3">
//                         {[
//                           { id: 1, name: "Vé Thường", price: 500000, desc: "Tham dự tất cả các session" },
//                           { id: 2, name: "Vé VIP", price: 1200000, desc: "Khu VIP + ưu tiên chỗ ngồi + quà lưu niệm" },
//                           { id: 3, name: "Vé Sinh viên", price: 300000, desc: "Giá ưu đãi cho sinh viên" },
//                         ].map((ticket) => (
//                           <label
//                             key={ticket.id}
//                             className={`block rounded-xl p-4 border cursor-pointer transition-all ${selectedTicket?.id === ticket.id
//                               ? "bg-coral-500/30 border-coral-400"
//                               : "bg-white/10 border-white/20 hover:bg-white/20"
//                               }`}
//                           >
//                             <input
//                               type="radio"
//                               name="ticket"
//                               value={ticket.id}
//                               className="hidden"
//                               onChange={() => setSelectedTicket(ticket)}
//                             />
//                             <div className="flex justify-between items-center">
//                               <span className="font-semibold">{ticket.name}</span>
//                               <span className="text-coral-300 font-medium">
//                                 {ticket.price.toLocaleString("vi-VN")}₫
//                               </span>
//                             </div>
//                             <p className="text-sm text-white/70 mt-1">{ticket.desc}</p>
//                           </label>
//                         ))}
//                       </div>

//                       <div className="mt-6 flex justify-end gap-3">
//                         <button
//                           onClick={() => setIsDialogOpen(false)}
//                           className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition"
//                         >
//                           Hủy
//                         </button>
//                         <button
//                           onClick={() => {
//                             alert(`Thanh toán ${selectedTicket?.name || "?"}`);
//                             setIsDialogOpen(false);
//                           }}
//                           disabled={!selectedTicket}
//                           className="px-5 py-2 rounded-lg bg-coral-500 hover:bg-coral-600 disabled:opacity-50 transition"
//                         >
//                           Thanh toán
//                         </button>
//                       </div>
//                     </DialogPanel>
//                   </div>
//                 </Dialog>
//                 {/* <div className="bg-white/30 backdrop-blur-md rounded-2xl shadow-lg p-6 text-white">
//                   <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-black to-blue-950
//                bg-clip-text text-transparent drop-shadow-lg">Đăng ký ngay</h3>
//                   <p className="text-white text-sm mb-4">
//                     Nhấn để thêm vào lịch của bạn
//                   </p>
//                   <button className="w-full bg-coral-500 hover:bg-coral-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
//                     Thêm vào lịch
//                   </button>
//                 </div> */}
//               </div>

//               {/* Description Card */}
//               {/* <div className="mt-4 bg-white rounded-2xl shadow-2xl p-6 md:p-8"> */}
//               <div className="mt-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg p-6 md:p-8 text-white">
//                 <p className="text-white leading-relaxed mb-3">{conference.description}</p>
//                 <p className="text-white leading-relaxed">{conference.detailedDescription}</p>
//               </div>
//             </div>
//           </div>

//           {/* Tabs Section */}
//           <div className="max-w-6xl mx-auto px-4 py-8">
//             <div className="bg-black rounded-2xl shadow-lg overflow-hidden"> {/* Container tabs background đen */}
//               {/* Tab Headers */}
//               <div className="flex border-b border-gray-700 overflow-x-auto"> {/* border hơi nhạt trên bg đen */}
//                 <button
//                   onClick={() => setActiveTab('info')}
//                   className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${activeTab === 'info'
//                     ? 'text-blue-500 border-b-2 border-coral-500'
//                     : 'text-white/70 hover:text-white'
//                     }`}
//                 >
//                   Thông tin & Hình ảnh
//                 </button>
//                 <button
//                   onClick={() => setActiveTab('sessions')}
//                   className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${activeTab === 'sessions'
//                     ? 'text-blue-500 border-b-2 border-coral-500'
//                     : 'text-white/70 hover:text-white'
//                     }`}
//                 >
//                   Lịch trình Sessions
//                 </button>
//                 <button
//                   onClick={() => setActiveTab('feedback')}
//                   className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${activeTab === 'feedback'
//                     ? 'text-blue-500 border-b-2 border-coral-500'
//                     : 'text-white/70 hover:text-white'
//                     }`}
//                 >
//                   Đánh giá
//                 </button>
//               </div>

//               {/* Tab Content */}
//               <div className="p-6 md:p-8">
//                 {/* Info Tab */}
//                 {activeTab === 'info' && (
//                   <div>
//                     <h2 className="text-2xl font-bold text-white mb-6">Hình ảnh & Video sự kiện</h2> {/* chữ trắng */}

//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                       {/* Video */}
//                       <div className="md:col-span-2 lg:col-span-2 relative cursor-pointer group">
//                         <div className="relative w-full aspect-video bg-white/10 rounded-lg overflow-hidden"> {/* transparent + blur */}
//                           <Image
//                             src={conference.videos[0].thumbnail}
//                             alt="Video thumbnail"
//                             fill
//                             className="object-cover"
//                           />
//                           {/* <div className="absolute inset-0 bg-white bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-40 transition-all" /> */}
//                         </div>
//                       </div>

//                       {/* Photos */}
//                       {conference.photos.map((photo, index) => (
//                         <div
//                           key={index}
//                           className="relative cursor-pointer group"
//                           onClick={() => setSelectedImage(photo)}
//                         >
//                           <div className="relative w-full aspect-video bg-white/10 rounded-lg overflow-hidden">
//                             <Image
//                               src={photo}
//                               alt={`Event photo ${index + 1}`}
//                               fill
//                               className="object-cover group-hover:scale-110 transition-transform duration-300"
//                             />
//                             {/* <div className="absolute inset-0 bg-white bg-opacity-0 group-hover:bg-opacity-20 transition-all" /> */}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Sessions Tab */}
//                 {activeTab === 'sessions' && (
//                   <div>
//                     <h2 className="text-2xl font-bold text-white mb-6">Lịch trình Sessions</h2>

//                     <div className="space-y-4">
//                       {conference.sessions.map((session) => (
//                         <div key={session.id} className="bg-white/20 backdrop-blur-md rounded-xl p-6 hover:shadow-lg transition-shadow text-white">
//                           <div className="flex flex-col md:flex-row gap-4">
//                             <div className="relative w-full md:w-48 aspect-video rounded-lg overflow-hidden flex-shrink-0">
//                               <Image
//                                 src={session.image}
//                                 alt={session.title}
//                                 fill
//                                 className="object-cover"
//                               />
//                             </div>
//                             <div className="flex-1">
//                               <h3 className="text-xl font-bold mb-2">{session.title}</h3>
//                               <div className="space-y-2 mb-3">
//                                 <div className="flex items-center gap-2">
//                                   <Clock className="w-4 h-4 text-white" />
//                                   <span className="text-sm text-white">{session.time}</span>
//                                 </div>
//                                 <div className="flex items-center gap-2">
//                                   <MapPin className="w-4 h-4 text-white" />
//                                   <span className="text-sm text-white">{session.location}</span>
//                                 </div>
//                                 <p className="text-sm text-white">
//                                   <span className="font-medium">Diễn giả:</span> {session.speaker}
//                                 </p>
//                               </div>
//                               <p className="text-white text-sm">{session.description}</p>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Feedback Tab */}
//                 {activeTab === 'feedback' && (
//                   <div>
//                     <h2 className="text-2xl font-bold text-white mb-6">Đánh giá từ khách hàng</h2>

//                     {/* Add Feedback Form */}
//                     <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 mb-6 text-white">
//                       <h3 className="text-lg font-semibold mb-4">Thêm đánh giá của bạn</h3>
//                       <form onSubmit={handleAddFeedback} className="space-y-4">
//                         <div>
//                           <label className="block text-sm font-medium mb-2">Tên của bạn</label>
//                           <input
//                             type="text"
//                             value={newFeedback.name}
//                             onChange={(e) => setNewFeedback({ ...newFeedback, name: e.target.value })}
//                             className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-black text-white"
//                             placeholder="Nhập tên của bạn"
//                             required
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium mb-2">Đánh giá</label>
//                           <div className="flex gap-2">
//                             {[1, 2, 3, 4, 5].map((star) => (
//                               <button
//                                 key={star}
//                                 type="button"
//                                 onClick={() => setNewFeedback({ ...newFeedback, rating: star })}
//                                 className="focus:outline-none"
//                               >
//                                 <Star
//                                   className={`w-8 h-8 ${star <= newFeedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/40'}`}
//                                 />
//                               </button>
//                             ))}
//                           </div>
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium mb-2">Nhận xét</label>
//                           <textarea
//                             value={newFeedback.comment}
//                             onChange={(e) => setNewFeedback({ ...newFeedback, comment: e.target.value })}
//                             className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-black text-white"
//                             rows={4}
//                             placeholder="Chia sẻ trải nghiệm của bạn..."
//                             required
//                           />
//                         </div>
//                         <button
//                           type="submit"
//                           className="bg-coral-500 hover:bg-coral-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
//                         >
//                           Gửi đánh giá
//                         </button>
//                       </form>
//                     </div>

//                     {/* Feedback List */}
//                     <div className="space-y-4">
//                       {feedbacks.map((feedback) => (
//                         <div key={feedback.id} className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl p-6 text-white">
//                           <div className="flex items-start gap-4">
//                             <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
//                               <Image
//                                 src={feedback.avatar}
//                                 alt={feedback.name}
//                                 fill
//                                 className="object-cover"
//                               />
//                             </div>
//                             <div className="flex-1">
//                               <div className="flex items-center justify-between mb-2">
//                                 <h4 className="font-semibold text-white">{feedback.name}</h4>
//                                 <span className="text-sm text-white/70">{feedback.date}</span>
//                               </div>
//                               <div className="flex gap-1 mb-2">
//                                 {[...Array(5)].map((_, i) => (
//                                   <Star
//                                     key={i}
//                                     className={`w-4 h-4 ${i < feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/40'}`}
//                                   />
//                                 ))}
//                               </div>
//                               <p className="text-white">{feedback.comment}</p>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//         </div>
//       </div>

//       {/* Image Modal */}
//       {selectedImage && (
//         <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />
//       )}
//     </div>
//   );
// };

// export default ConferenceDetail;