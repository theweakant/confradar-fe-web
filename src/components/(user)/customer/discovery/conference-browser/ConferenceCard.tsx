import React from 'react';
import Image from 'next/image';
import { Calendar as CalendarIcon, MapPin, Users } from 'lucide-react';
import { ConferenceResponse } from '@/types/conference.type';

interface ConferenceCardProps {
    conference: ConferenceResponse;
    getMinPrice: (conf: ConferenceResponse) => number | null;
    getMaxPrice: (conf: ConferenceResponse) => number | null;
    formatDate: (dateString: string) => string;
    onCardClick: (conference: ConferenceResponse) => void;
}

const ConferenceCard: React.FC<ConferenceCardProps> = ({
    conference,
    getMinPrice,
    getMaxPrice,
    formatDate,
    onCardClick
}) => {
    const minPrice = getMinPrice(conference);
    const maxPrice = getMaxPrice(conference);

    const displayPrice =
        minPrice !== null && maxPrice !== null
            ? minPrice === maxPrice
                ? `${minPrice.toLocaleString()}đ`
                : `${minPrice.toLocaleString()}đ - ${maxPrice.toLocaleString()}đ`
            : 'Chưa cập nhật';

    return (
        <div
            onClick={() => onCardClick(conference)}
            className="group relative bg-gray-800/80 rounded-xl border border-gray-700 overflow-hidden
        cursor-pointer transition-all duration-500
        hover:scale-[1.03] hover:border-blue-500 hover:shadow-[0_12px_30px_rgba(59,130,246,0.4)]"
        >
            <div className="relative aspect-video overflow-hidden">
                <Image
                    src={conference.bannerImageUrl || '/images/customer_route/confbannerbg2.jpg'}
                    alt={conference.conferenceName || 'Conference'}
                    fill
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
            </div>

            <div className="p-4">
                <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors duration-300">
                    {conference.conferenceName || 'Chưa có tên'}
                </h3>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                    {conference.description || 'Chưa có mô tả'}
                </p>

                <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                    <CalendarIcon size={12} />
                    <span>
                        {conference.startDate ? formatDate(conference.startDate) : '...'} →{' '}
                        {conference.endDate ? formatDate(conference.endDate) : '...'}
                    </span>
                </div>

                <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                    <MapPin size={12} />
                    <span>{conference.address || 'Địa điểm chưa xác định'}</span>
                </div>

                <div className="text-xs text-gray-400 mb-2">Giá: {displayPrice}</div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                        <Users size={12} />
                        <span>{conference.totalSlot || 0}</span>
                    </div>
                    <div className="text-xs text-blue-400">
                        {conference.isResearchConference !== undefined
                            ? conference.isResearchConference
                                ? 'Nghiên cứu'
                                : 'Công nghệ'
                            : 'Chưa xác định'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConferenceCard;