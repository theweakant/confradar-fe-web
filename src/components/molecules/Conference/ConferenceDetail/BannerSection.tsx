// components/pages/ConferenceDetailPage/BannerSection.tsx
"use client";

import {
  ArrowLeft,
  MoreVertical,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { UpdateConferenceStatus } from "@/components/molecules/Status/UpdateStatus";
import { DeleteConferenceStatus } from "@/components/molecules/Status/DeleteStatus";
import { RequestConferenceApproval } from "@/components/molecules/Status/RequestStatus";
import type { CommonConference } from "@/types/conference.type";

interface BannerSectionProps {
  conference: CommonConference;
  conferenceType: "technical" | "research" | null;
  getCategoryName: (id: string) => string;
  getStatusName: (id: string) => string;
  getCityName: (id: string) => string;
  isEditingAllowed: boolean;
  updateRoute: string | null;
  statusDialogOpen: boolean;
  setStatusDialogOpen: (open: boolean) => void;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  dropdownActions?: React.ReactNode; 
  onRefetch?: () => void;
}

export function BannerSection({
  conference,
  conferenceType,
  getCategoryName,
  getStatusName,
  getCityName,
  isEditingAllowed,
  updateRoute,
  statusDialogOpen,
  setStatusDialogOpen,
  deleteDialogOpen,
  setDeleteDialogOpen,
  dropdownActions,
  onRefetch,
}: BannerSectionProps) {
  const router = useRouter();

  return (
    <div className="relative bg-white shadow-sm">
      {conference.bannerImageUrl ? (
        <div className="relative h-80 w-full">
          <Image
            src={conference.bannerImageUrl}
            alt={conference.conferenceName ?? "N/A"}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            {/* Nếu không có dropdownActions, dùng nút cũ */}
            {dropdownActions ? (
              dropdownActions
            ) : (
              <>
                {isEditingAllowed && updateRoute && (
                  <Button
                    onClick={() => router.push(updateRoute)}
                    className="bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm shadow-lg border border-white/50"
                  >
                    Chỉnh sửa
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setStatusDialogOpen(true)}
                  className="bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm shadow-lg border border-white/50"
                >
                  Cập nhật trạng thái
                </Button>
              </>
            )}
          </div>

          {/* Dialogs */}
          <UpdateConferenceStatus
            open={statusDialogOpen}
            onClose={() => setStatusDialogOpen(false)}
            conference={{
              conferenceId: conference.conferenceId!,
              conferenceName: conference.conferenceName!,
              conferenceStatusId: conference.conferenceStatusId!,
            }}
            onSuccess={onRefetch}
          />
          <DeleteConferenceStatus
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            conference={{
              conferenceId: conference.conferenceId!,
              conferenceName: conference.conferenceName!,
              conferenceStatusId: conference.conferenceStatusId!,
            }}
            onSuccess={onRefetch}
          />

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {conference.conferenceName}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${
                    conferenceType === "technical"
                      ? "bg-blue-500/90 text-white"
                      : "bg-pink-500/90 text-white"
                  }`}
                >
                  {conferenceType === "technical" ? "Technical" : "Research"}
                </span>
                {conference.isInternalHosted && (
                  <span className="px-3 py-1 bg-green-500/90 text-white rounded-full text-sm font-medium backdrop-blur-sm">
                    Nội bộ
                  </span>
                )}
                {conference.isResearchConference && (
                  <span className="px-3 py-1 bg-purple-500/90 text-white rounded-full text-sm font-medium backdrop-blur-sm">
                    Nghiên cứu
                  </span>
                )}
                <span className="px-3 py-1 bg-orange-500/90 text-white rounded-full text-sm font-medium backdrop-blur-sm">
                  {getCategoryName(conference.conferenceCategoryId ?? "")}
                </span>
                <span className="px-3 py-1 bg-teal-500/90 text-white rounded-full text-sm font-medium backdrop-blur-sm">
                  {getStatusName(conference.conferenceStatusId ?? "")}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-b">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {conference.conferenceName}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  conferenceType === "technical"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-pink-100 text-pink-700"
                }`}
              >
                {conferenceType === "technical" ? "Technical" : "Research"}
              </span>
              {conference.isInternalHosted && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Nội bộ
                </span>
              )}
              {conference.isResearchConference && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  Nghiên cứu
                </span>
              )}
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                {getCategoryName(conference.conferenceCategoryId ?? "")}
              </span>
              <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                {getStatusName(conference.conferenceStatusId ?? "")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}