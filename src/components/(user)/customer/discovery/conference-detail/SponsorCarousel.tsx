import Marquee from "react-fast-marquee";
import { SponsorResponse } from "@/types/conference.type";

const SponsorMarquee = ({ sponsors }: { sponsors: SponsorResponse[] }) => {
  const repeatedSponsors =
    sponsors.length < 6 ? Array(6).fill(sponsors).flat() : sponsors;

  if (!sponsors || sponsors.length === 0) {
    return (
      <div className="p-6 bg-gray-900 rounded-2xl text-center">
        <h3 className="text-white text-xl font-semibold mb-4">Nhà tài trợ</h3>
        <p className="text-white/70">Hiện tại chưa có nhà tài trợ nào.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 rounded-2xl">
      <h3 className="text-white text-xl font-semibold mb-4">Nhà tài trợ</h3>

      <Marquee speed={50} gradient={false} pauseOnHover={true} loop={0}>
        {repeatedSponsors.map((sponsor) => (
          <div
            key={sponsor.sponsorId}
            className="mx-4 flex-shrink-0 w-40 h-32 bg-white/5 rounded-lg flex flex-col items-center justify-center p-2"
          >
            {sponsor.imageUrl && (
              <img
                src={sponsor.imageUrl}
                alt={sponsor.name}
                className="object-contain h-full w-full mb-1"
              />
            )}
            <span className="text-white text-center text-sm font-medium">
              {sponsor.name}
            </span>
          </div>
        ))}
      </Marquee>
    </div>
  );
};

export default SponsorMarquee;

// import { Swiper, SwiperSlide } from 'swiper/react';
// import { Autoplay, FreeMode } from 'swiper/modules';
// import 'swiper/css/autoplay';
// import 'swiper/css/free-mode';
// import 'swiper/css';
// import { SponsorResponse } from '@/types/conference.type';

// const SponsorCarousel = ({ sponsors }: { sponsors: SponsorResponse[] }) => {
//     if (!sponsors || sponsors.length === 0) {
//         return (
//             <div className="p-6 bg-gray-900 rounded-2xl text-center">
//                 <h3 className="text-white text-xl font-semibold mb-4">Nhà tài trợ</h3>
//                 <p className="text-white/70">Hiện tại chưa có nhà tài trợ nào.</p>
//             </div>
//         );
//     }

//     return (
//         <div className=" p-6 bg-gray-900 rounded-2xl">
//             <h3 className="text-white text-xl font-semibold mb-4">Nhà tài trợ</h3>
//             <Swiper
//                 modules={[Autoplay, FreeMode]}
//                 spaceBetween={20}
//                 slidesPerView={3}
//                 loop={true}
//                 loopedSlides={sponsors.length}
//                 speed={3000}
//                 freeMode={{
//                     enabled: true,
//                     momentum: false,
//                 }}
//                 autoplay={{
//                     delay: 0,
//                     disableOnInteraction: false,
//                     pauseOnMouseEnter: false,
//                 }}
//                 allowTouchMove={false}
//                 breakpoints={{
//                     640: { slidesPerView: 2 },
//                     768: { slidesPerView: 3 },
//                     1024: { slidesPerView: 4 },
//                 }}
//                 className="sponsor-swiper"
//             >
//                 {sponsors.map((sponsor) => (
//                     <SwiperSlide key={sponsor.sponsorId}>
//                         <div className="bg-white/5 rounded-lg flex items-center justify-center p-2 h-24">
//                             {sponsor.imageUrl ? (
//                                 <img
//                                     src={sponsor.imageUrl}
//                                     alt={sponsor.name}
//                                     className="object-contain h-full w-full"
//                                 />
//                             ) : (
//                                 <span className="text-white text-center">{sponsor.name}</span>
//                             )}
//                         </div>
//                     </SwiperSlide>
//                 ))}
//             </Swiper>
//         </div>
//     );
// };

// export default SponsorCarousel;
