import Marquee from "react-fast-marquee";
import { SponsorResponse } from "@/types/conference.type";

const SponsorMarquee = ({ sponsors }: { sponsors: SponsorResponse[] }) => {
  const repeatedSponsors =
    sponsors.length < 6 ? Array(6).fill(sponsors).flat() : sponsors;

  if (!sponsors || sponsors.length === 0) {
    return (
      <div className="p-6 bg-gray-100 rounded-2xl text-center">
        <h3 className="text-gray-900 text-xl font-semibold mb-4">Nhà tài trợ</h3>
        <p className="text-gray-600">Hiện tại chưa có nhà tài trợ nào.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 rounded-2xl">
      <h3 className="text-gray-900 text-xl font-semibold mb-4">Nhà tài trợ</h3>

      <Marquee speed={50} gradient={false} pauseOnHover={true} loop={0}>
        {repeatedSponsors.map((sponsor) => (
          <div
            key={sponsor.sponsorId}
            className="mx-4 flex-shrink-0 w-40 h-32 bg-white rounded-lg flex flex-col items-center justify-center p-2 shadow-sm border border-gray-200"
          >
            {sponsor.imageUrl && (
              <img
                src={sponsor.imageUrl}
                alt={sponsor.name}
                className="object-contain h-full w-full mb-1"
              />
            )}
            <span className="text-gray-900 text-center text-sm font-medium">
              {sponsor.name}
            </span>
          </div>
        ))}
      </Marquee>
    </div>
  );
};

export default SponsorMarquee;


// import Marquee from "react-fast-marquee";
// import { SponsorResponse } from "@/types/conference.type";

// const SponsorMarquee = ({ sponsors }: { sponsors: SponsorResponse[] }) => {
//   const repeatedSponsors =
//     sponsors.length < 6 ? Array(6).fill(sponsors).flat() : sponsors;

//   if (!sponsors || sponsors.length === 0) {
//     return (
//       <div className="p-6 bg-gray-900 rounded-2xl text-center">
//         <h3 className="text-white text-xl font-semibold mb-4">Nhà tài trợ</h3>
//         <p className="text-white/70">Hiện tại chưa có nhà tài trợ nào.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-gray-900 rounded-2xl">
//       <h3 className="text-white text-xl font-semibold mb-4">Nhà tài trợ</h3>

//       <Marquee speed={50} gradient={false} pauseOnHover={true} loop={0}>
//         {repeatedSponsors.map((sponsor) => (
//           <div
//             key={sponsor.sponsorId}
//             className="mx-4 flex-shrink-0 w-40 h-32 bg-white/5 rounded-lg flex flex-col items-center justify-center p-2"
//           >
//             {sponsor.imageUrl && (
//               <img
//                 src={sponsor.imageUrl}
//                 alt={sponsor.name}
//                 className="object-contain h-full w-full mb-1"
//               />
//             )}
//             <span className="text-white text-center text-sm font-medium">
//               {sponsor.name}
//             </span>
//           </div>
//         ))}
//       </Marquee>
//     </div>
//   );
// };

// export default SponsorMarquee;