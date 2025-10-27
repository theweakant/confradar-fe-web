import Image from 'next/image';
import { ConferenceResponse } from "@/types/conference.type";

// Information Tab Component
interface InformationTabProps {
    conference: ConferenceResponse;
    setSelectedImage: (image: string | null) => void;
}

const InformationTab: React.FC<InformationTabProps> = ({
    conference,
    setSelectedImage
}) => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Thông tin chi tiết</h2>
            {/* Media Section */}
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
            {/* Sponsors Section */}
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
            {/* Policies Section */}
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
    );
};

export default InformationTab;