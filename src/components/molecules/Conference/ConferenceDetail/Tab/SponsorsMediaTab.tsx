"use client";

import { Handshake, ImageIcon } from "lucide-react";
import Image from "next/image";
import type {
  CommonConference,
  SponsorResponse,
  ConferenceMediaResponse,
} from "@/types/conference.type";

interface SponsorsMediaTabProps {
  conference: CommonConference;
}

export function SponsorsMediaTab({ conference }: SponsorsMediaTabProps) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Sponsors & Media
      </h2>

      {/* Sponsors */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Handshake className="w-5 h-5 text-blue-600" />
          Sponsors
        </h3>
        {conference.sponsors && conference.sponsors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conference.sponsors.map(
              (sponsor: SponsorResponse, index: number) => (
                <div
                  key={sponsor.sponsorId || index}
                  className="bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  {sponsor.imageUrl && (
                    <div className="relative h-32 w-full mb-3 rounded-lg overflow-hidden bg-white">
                      <Image
                        src={sponsor.imageUrl}
                        alt={sponsor.name ?? "N/A"}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  )}
                  <h4 className="font-bold text-gray-900 text-center mb-2">
                    {sponsor.name}
                  </h4>
                </div>
              )
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No sponsors available
          </p>
        )}
      </div>

      {/* Conference Media */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-blue-600" />
          Conference Media
        </h3>
        {conference.conferenceMedia && conference.conferenceMedia.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {conference.conferenceMedia.map(
              (media: ConferenceMediaResponse, index: number) => (
                <div key={media.mediaId || index} className="space-y-2">
                  <div className="relative h-48 rounded-lg overflow-hidden group">
                    <Image
                      src={
                        media.mediaUrl?.startsWith("http")
                          ? media.mediaUrl
                          : `https://minio-api.confradar.io.vn/${media.mediaUrl}`
                      }
                      alt={`Media ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No media available</p>
        )}
      </div>
    </div>
  );
}

