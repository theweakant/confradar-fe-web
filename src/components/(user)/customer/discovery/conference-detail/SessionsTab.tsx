import Image from 'next/image';
import { X, MapPin, Clock, Calendar, Star } from 'lucide-react';
import { ConferenceResponse } from "@/types/conference.type";

// Sessions Tab Component
interface SessionsTabProps {
  conference: ConferenceResponse;
  formatDate: (dateString?: string) => string;
  formatTime: (timeString?: string) => string;
}

const SessionsTab: React.FC<SessionsTabProps> = ({
  conference,
  formatDate,
  formatTime
}) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Lịch trình Sessions</h2>
      <div className="space-y-4">
        {(conference.sessions || []).map((session) => (
          <div key={session.sessionId} className="bg-white/20 backdrop-blur-md rounded-xl p-6 hover:shadow-lg transition-shadow text-white">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative w-full md:w-48 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={conference.bannerImageUrl || '/images/customer_route/confbannerbg2.jpg'}
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
                    <span className="text-sm text-white">
                      {formatTime(session.startTime)} - {formatTime(session.endTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-white" />
                    <span className="text-sm text-white">{formatDate(session.date)}</span>
                  </div>
                  {session.room && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-white" />
                      <span className="text-sm text-white">
                        {session.room.displayName || session.room.number || 'Phòng chưa xác định'}
                      </span>
                    </div>
                  )}
                  {session.speaker && (
                    <p className="text-sm text-white">
                      <span className="font-medium">Diễn giả:</span> {session.speaker.name}
                    </p>
                  )}
                </div>
                <p className="text-white text-sm">{session.description}</p>
                {session.speaker?.description && (
                  <p className="text-white/80 text-xs mt-2">
                    <span className="font-medium">Về diễn giả:</span> {session.speaker.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
        {(!conference.sessions || conference.sessions.length === 0) && (
          <div className="text-center text-white/70 py-8">
            <p>Chưa có thông tin về sessions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsTab;