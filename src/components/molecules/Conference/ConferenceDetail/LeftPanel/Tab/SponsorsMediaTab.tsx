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
    <div className="space-y-10">
      <section>
        <div className="flex items-center gap-2 mb-5">
          <Handshake className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Nhà Tài Trợ</h3>
        </div>
        
        {conference.sponsors && conference.sponsors.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {conference.sponsors.map((sponsor: SponsorResponse, index: number) => (
              <div
                key={sponsor.sponsorId || index}
                className="bg-card border border-border rounded-lg p-4 hover:shadow-md hover:border-primary/30 transition-all group"
              >
                {sponsor.imageUrl && (
                  <div className="relative h-24 w-full mb-3 rounded overflow-hidden bg-muted/30">
                    <Image
                      src={sponsor.imageUrl}
                      alt={sponsor.name ?? "Sponsor"}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <p className="text-sm font-medium text-foreground text-center truncate">
                  {sponsor.name}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Chưa có nhà tài trợ</p>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-5">
          <ImageIcon className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Hình Ảnh</h3>
        </div>
        
        {conference.conferenceMedia && conference.conferenceMedia.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {conference.conferenceMedia.map((media: ConferenceMediaResponse, index: number) => (
              <div 
                key={media.mediaId || index} 
                className="relative aspect-video rounded-lg overflow-hidden group cursor-pointer border border-border hover:border-primary/50 transition-all"
              >
                <Image
                  src={
                    media.mediaUrl?.startsWith("http")
                      ? media.mediaUrl
                      : `https://minio-api.confradar.io.vn/${media.mediaUrl}`
                  }
                  alt={`Hình ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Chưa có hình ảnh</p>
          </div>
        )}
      </section>
    </div>
  );
}