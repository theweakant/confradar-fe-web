import React from 'react';
import { ConferenceResponse } from '@/types/conference.type';
import ConferenceCard from './ConferenceCard';

interface ConferenceListProps {
    paginatedConferences: ConferenceResponse[];
    getMinPrice: (conf: ConferenceResponse) => number | null;
    getMaxPrice: (conf: ConferenceResponse) => number | null;
    formatDate: (dateString: string) => string;
    onCardClick: (conferenceId: string) => void;
}

const ConferenceList: React.FC<ConferenceListProps> = ({
    paginatedConferences,
    getMinPrice,
    getMaxPrice,
    formatDate,
    onCardClick
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {paginatedConferences.map((conference: ConferenceResponse) => (
                <ConferenceCard
                    key={conference.conferenceId}
                    conference={conference}
                    getMinPrice={getMinPrice}
                    getMaxPrice={getMaxPrice}
                    formatDate={formatDate}
                    onCardClick={onCardClick}
                />
            ))}
        </div>
    );
};

export default ConferenceList;