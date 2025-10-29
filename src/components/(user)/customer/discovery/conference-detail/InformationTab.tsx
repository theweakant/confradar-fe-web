import Image from 'next/image';
import { ResearchConferenceDetailResponse, TechnicalConferenceDetailResponse } from "@/types/conference.type";

// Information Tab Component
interface InformationTabProps {
    conference: TechnicalConferenceDetailResponse | ResearchConferenceDetailResponse;
    setSelectedImage: (image: string | null) => void;
}

const InformationTab: React.FC<InformationTabProps> = ({
    conference,
    setSelectedImage
}) => {
    const isResearch = conference.isResearchConference === true;

    // const mediaList = isResearch ? (conference as ResearchConferenceDetailResponse).conferenceMedia || [] : (conference as TechnicalConferenceDetailResponse).conferenceMedia || [];
    const mediaList = conference.conferenceMedia || [];
    const sponsorsList = conference.sponsors || [];
    const policiesList = conference.policies || [];
    const refundPolicies = isResearch ? (conference as ResearchConferenceDetailResponse).refundPolicies || [] : [];


    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Thông tin chi tiết</h2>

            {/* Research Conference */}
            {isResearch && (
                <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white mb-4">Research Conference Details</h3>
                    <div className="bg-white/20 backdrop-blur-md rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(conference as ResearchConferenceDetailResponse).paperFormat && (
                            <div>
                                <span className="text-white/70 text-sm">Paper Format:</span>
                                <p className="text-white font-medium">{(conference as ResearchConferenceDetailResponse).paperFormat}</p>
                            </div>
                        )}
                        {(conference as ResearchConferenceDetailResponse).numberPaperAccept !== undefined && (
                            <div>
                                <span className="text-white/70 text-sm">Papers Accepted:</span>
                                <p className="text-white font-medium">{(conference as ResearchConferenceDetailResponse).numberPaperAccept}</p>
                            </div>
                        )}
                        {(conference as ResearchConferenceDetailResponse).revisionAttemptAllowed !== undefined && (
                            <div>
                                <span className="text-white/70 text-sm">Revision Attempts Allowed:</span>
                                <p className="text-white font-medium">{(conference as ResearchConferenceDetailResponse).revisionAttemptAllowed}</p>
                            </div>
                        )}
                        {(conference as ResearchConferenceDetailResponse).allowListener !== undefined && (
                            <div>
                                <span className="text-white/70 text-sm">Allow Listeners:</span>
                                <p className="text-white font-medium">{(conference as ResearchConferenceDetailResponse).allowListener ? 'Yes' : 'No'}</p>
                            </div>
                        )}
                        {(conference as ResearchConferenceDetailResponse).rankValue && (
                            <div>
                                <span className="text-white/70 text-sm">Rank Value:</span>
                                <p className="text-white font-medium">{(conference as ResearchConferenceDetailResponse).rankValue}</p>
                            </div>
                        )}
                        {(conference as ResearchConferenceDetailResponse).rankYear && (
                            <div>
                                <span className="text-white/70 text-sm">Rank Year:</span>
                                <p className="text-white font-medium">{(conference as ResearchConferenceDetailResponse).rankYear}</p>
                            </div>
                        )}
                        {(conference as ResearchConferenceDetailResponse).reviewFee !== undefined && (
                            <div>
                                <span className="text-white/70 text-sm">Review Fee:</span>
                                <p className="text-white font-medium">{(conference as ResearchConferenceDetailResponse).reviewFee ?? 'Phí đánh giá bài báo chưa xác định'}₫</p>
                            </div>
                        )}
                        {(conference as ResearchConferenceDetailResponse).rankingCategoryName && (
                            <div>
                                <span className="text-white/70 text-sm">Ranking Category:</span>
                                <p className="text-white font-medium">{(conference as ResearchConferenceDetailResponse).rankingCategoryName}</p>
                            </div>
                        )}
                        {(conference as ResearchConferenceDetailResponse).rankingDescription && (
                            <div className="col-span-full">
                                <span className="text-white/70 text-sm">Ranking Description:</span>
                                <p className="text-white mt-1">{(conference as ResearchConferenceDetailResponse).rankingDescription}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Technical Conference */}
            {!isResearch && (conference as TechnicalConferenceDetailResponse).targetAudience && (
                <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white mb-4">Technical Conference Details</h3>
                    <div className="bg-white/20 backdrop-blur-md rounded-lg p-6">
                        <span className="text-white/70 text-sm">Target Audience:</span>
                        <p className="text-white font-medium">{(conference as TechnicalConferenceDetailResponse).targetAudience}</p>
                    </div>
                </div>
            )}

            {/* Media Section */}
            {mediaList.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white mb-4">Hình ảnh & Media</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mediaList.map((media) => (
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

            {/* Sponsors */}
            {sponsorsList.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white mb-4">Nhà tài trợ</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {sponsorsList.map((sponsor) => (
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

            {/* Policies */}
            {policiesList.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white mb-4">Chính sách & Quy định</h3>
                    <div className="space-y-4">
                        {policiesList.map((policy) => (
                            <div key={policy.policyId} className="bg-white/20 backdrop-blur-md rounded-lg p-4">
                                <h4 className="font-semibold text-white mb-2">{policy.policyName}</h4>
                                <p className="text-white/80 text-sm">{policy.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Refund Policies */}
            {refundPolicies.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white mb-4">Chính sách hoàn tiền</h3>
                    <div className="space-y-4">
                        {refundPolicies.map((refund) => (
                            <div key={refund.refundPolicyId} className="bg-white/20 backdrop-blur-md rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold text-white mb-1">
                                            Hoàn {refund.percentRefund}% phí tham gia
                                        </h4>
                                        {refund.refundDeadline && (
                                            <p className="text-white/80 text-sm">
                                                Hạn chót: {new Date(refund.refundDeadline).toLocaleDateString('vi-VN')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-coral-400 font-medium">Thứ tự: {refund.refundOrder}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InformationTab;

//      const researchConf = isResearch ? (conference as ResearchConferenceDetailResponse) : null;
//   const technicalConf = !isResearch ? (conference as TechnicalConferenceDetailResponse) : null;

// const researchConference = isResearchConference ? conference as ResearchConferenceDetailResponse : null;
// const technicalConference = !isResearchConference && 'targetAudience' in conference ? conference as TechnicalConferenceDetailResponse : null;

//     return (
//         <div>
//             <h2 className="text-2xl font-bold text-white mb-6">Thông tin chi tiết</h2>

//             {/* Research Conference Specific Information */}
//             {researchConference && (
//                 <div className="mb-8">
//                     <h3 className="text-xl font-semibold text-white mb-4">Research Conference Details</h3>
//                     <div className="bg-white/20 backdrop-blur-md rounded-lg p-6">
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             {researchConference.paperFormat && (
//                                 <div>
//                                     <span className="text-white/70 text-sm">Paper Format:</span>
//                                     <p className="text-white font-medium">{researchConference.paperFormat}</p>
//                                 </div>
//                             )}
//                             {researchConference.numberPaperAccept !== undefined && (
//                                 <div>
//                                     <span className="text-white/70 text-sm">Papers Accepted:</span>
//                                     <p className="text-white font-medium">{researchConference.numberPaperAccept}</p>
//                                 </div>
//                             )}
//                             {researchConference.revisionAttemptAllowed !== undefined && (
//                                 <div>
//                                     <span className="text-white/70 text-sm">Revision Attempts Allowed:</span>
//                                     <p className="text-white font-medium">{researchConference.revisionAttemptAllowed}</p>
//                                 </div>
//                             )}
//                             {researchConference.allowListener !== undefined && (
//                                 <div>
//                                     <span className="text-white/70 text-sm">Allow Listeners:</span>
//                                     <p className="text-white font-medium">{researchConference.allowListener ? 'Yes' : 'No'}</p>
//                                 </div>
//                             )}
//                             {researchConference.rankValue && (
//                                 <div>
//                                     <span className="text-white/70 text-sm">Rank Value:</span>
//                                     <p className="text-white font-medium">{researchConference.rankValue}</p>
//                                 </div>
//                             )}
//                             {researchConference.rankYear && (
//                                 <div>
//                                     <span className="text-white/70 text-sm">Rank Year:</span>
//                                     <p className="text-white font-medium">{researchConference.rankYear}</p>
//                                 </div>
//                             )}
//                             {researchConference.reviewFee !== undefined && (
//                                 <div>
//                                     <span className="text-white/70 text-sm">Review Fee:</span>
//                                     <p className="text-white font-medium">{researchConference.reviewFee.toLocaleString('vi-VN')}₫</p>
//                                 </div>
//                             )}
//                             {researchConference.rankingCategoryName && (
//                                 <div>
//                                     <span className="text-white/70 text-sm">Ranking Category:</span>
//                                     <p className="text-white font-medium">{researchConference.rankingCategoryName}</p>
//                                 </div>
//                             )}
//                         </div>
//                         {researchConference.rankingDescription && (
//                             <div className="mt-4">
//                                 <span className="text-white/70 text-sm">Ranking Description:</span>
//                                 <p className="text-white mt-1">{researchConference.rankingDescription}</p>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}

//             {/* Technical Conference Specific Information */}
//             {technicalConference && technicalConference.targetAudience && (
//                 <div className="mb-8">
//                     <h3 className="text-xl font-semibold text-white mb-4">Technical Conference Details</h3>
//                     <div className="bg-white/20 backdrop-blur-md rounded-lg p-6">
//                         <div>
//                             <span className="text-white/70 text-sm">Target Audience:</span>
//                             <p className="text-white font-medium">{technicalConference.targetAudience}</p>
//                         </div>
//                     </div>
//                 </div>
//             )}
//             {/* Media Section */}
//             {((conference.media && conference.media.length > 0) ||
//                 (researchConference?.conferenceMedia && researchConference.conferenceMedia.length > 0)) && (
//                     <div className="mb-8">
//                         <h3 className="text-xl font-semibold text-white mb-4">Hình ảnh & Media</h3>
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                             {(researchConference?.conferenceMedia || conference.media || []).map((media) => (
//                                 <div
//                                     key={media.mediaId}
//                                     className="relative cursor-pointer group"
//                                     onClick={() => setSelectedImage(media.mediaUrl || '')}
//                                 >
//                                     <div className="relative w-full aspect-video bg-white/10 rounded-lg overflow-hidden">
//                                         <Image
//                                             src={media.mediaUrl || '/images/customer_route/confbannerbg2.jpg'}
//                                             alt="Conference media"
//                                             fill
//                                             className="object-cover group-hover:scale-110 transition-transform duration-300"
//                                         />
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 )}
//             {/* Sponsors Section */}
//             {conference.sponsors && conference.sponsors.length > 0 && (
//                 <div className="mb-8">
//                     <h3 className="text-xl font-semibold text-white mb-4">Nhà tài trợ</h3>
//                     <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
//                         {conference.sponsors.map((sponsor) => (
//                             <div
//                                 key={sponsor.sponsorId}
//                                 className="bg-white/20 backdrop-blur-md rounded-lg p-4 flex flex-col items-center"
//                             >
//                                 <div className="relative w-16 h-16 mb-2">
//                                     <Image
//                                         src={sponsor.imageUrl || '/images/LandingPage/logo_sponser/tech_logo/logo_microsoft.png'}
//                                         alt={sponsor.name || 'Sponsor'}
//                                         fill
//                                         className="object-contain"
//                                     />
//                                 </div>
//                                 <span className="text-white text-sm text-center">{sponsor.name}</span>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             )}
//             {/* Policies Section */}
//             {conference.policies && conference.policies.length > 0 && (
//                 <div className="mb-8">
//                     <h3 className="text-xl font-semibold text-white mb-4">Chính sách & Quy định</h3>
//                     <div className="space-y-4">
//                         {conference.policies.map((policy) => (
//                             <div key={policy.policyId} className="bg-white/20 backdrop-blur-md rounded-lg p-4">
//                                 <h4 className="font-semibold text-white mb-2">{policy.policyName}</h4>
//                                 <p className="text-white/80 text-sm">{policy.description}</p>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             )}

//             {/* Refund Policies Section (Research Conference) */}
//             {researchConference?.refundPolicies && researchConference.refundPolicies.length > 0 && (
//                 <div>
//                     <h3 className="text-xl font-semibold text-white mb-4">Chính sách hoàn tiền</h3>
//                     <div className="space-y-4">
//                         {researchConference.refundPolicies.map((refundPolicy) => (
//                             <div key={refundPolicy.refundPolicyId} className="bg-white/20 backdrop-blur-md rounded-lg p-4">
//                                 <div className="flex justify-between items-center">
//                                     <div>
//                                         <h4 className="font-semibold text-white mb-1">
//                                             Hoàn {refundPolicy.percentRefund}% phí tham gia
//                                         </h4>
//                                         {refundPolicy.refundDeadline && (
//                                             <p className="text-white/80 text-sm">
//                                                 Hạn chót: {new Date(refundPolicy.refundDeadline).toLocaleDateString('vi-VN')}
//                                             </p>
//                                         )}
//                                     </div>
//                                     <div className="text-coral-400 font-medium">
//                                         Thứ tự: {refundPolicy.refundOrder}
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default InformationTab;