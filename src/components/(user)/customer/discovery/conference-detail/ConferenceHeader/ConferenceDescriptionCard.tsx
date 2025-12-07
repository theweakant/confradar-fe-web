import React from "react";
import {
    ResearchConferenceDetailResponse,
    TechnicalConferenceDetailResponse,
} from "@/types/conference.type";

interface ConferenceDescriptionCardProps {
    conference: TechnicalConferenceDetailResponse | ResearchConferenceDetailResponse;
    isResearch?: boolean;
}

const ConferenceDescriptionCard: React.FC<ConferenceDescriptionCardProps> = ({
    conference,
    isResearch = false
}) => {
    const baseClasses = isResearch
        ? "bg-white rounded-xl shadow-md p-6"
        : "mt-4 bg-white rounded-xl shadow-md p-6 md:p-8";

    const textColor = isResearch ? "text-gray-700" : "text-gray-800";

    return (
        <div className={baseClasses}>
            <p className={`leading-relaxed mb-3 ${textColor}`}>
                {conference.description}
            </p>

            {conference.policies && conference.policies.length > 0 && (
                <div className="mt-4">
                    <h4 className={`font-semibold mb-2 ${textColor}`}>Chính sách:</h4>
                    <div className="space-y-2">
                        {conference.policies.map((policy) => (
                            <div key={policy.policyId} className={`text-sm ${textColor}`}>
                                <span className="font-medium">{policy.policyName}:</span> {policy.description}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// interface ConferenceDescriptionCardProps {
//     conference: TechnicalConferenceDetailResponse | ResearchConferenceDetailResponse;
// }

// const ConferenceDescriptionCard: React.FC<ConferenceDescriptionCardProps> = ({ conference }) => {
//     return (
//         <div className="mt-4 bg-gradient-to-br from-slate-800/90 via-gray-900/80 to-slate-900/70 backdrop-blur-md rounded-2xl shadow-lg p-6 md:p-8 text-white">
//             <p className="text-white leading-relaxed mb-3">{conference.description}</p>

//             {conference.policies && conference.policies.length > 0 && (
//                 <div className="mt-4">
//                     <h4 className="font-semibold mb-2">Chính sách:</h4>
//                     <div className="space-y-2">
//                         {conference.policies.map((policy) => (
//                             <div key={policy.policyId} className="text-sm">
//                                 <span className="font-medium">{policy.policyName}:</span> {policy.description}
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

export default ConferenceDescriptionCard;