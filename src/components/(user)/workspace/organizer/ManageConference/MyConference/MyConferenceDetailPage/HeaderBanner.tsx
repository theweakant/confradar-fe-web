// components/organisms/conference-detail/HeaderBanner.tsx
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Calendar } from "lucide-react";
import Image from "next/image";
import { UpdateConferenceStatus } from "@/components/molecules/Status/UpdateStatus";
import { CommonConference } from "./index1";

export default function HeaderBanner({
  conference,
  conferenceType,
  getCategoryName,
  getStatusName,
  updateRoute,
  statusDialogOpen,
  setStatusDialogOpen,
  getCurrentStatusName,
}: {
  conference: CommonConference;
  conferenceType: "technical" | "research" | null;
  getCategoryName: (id: string) => string;
  getStatusName: (id: string) => string;
  updateRoute: string;
  statusDialogOpen: boolean;
  setStatusDialogOpen: (open: boolean) => void;
  getCurrentStatusName: () => string;
}) {
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

          <div className="absolute top-4 right-4 flex gap-2">
            {(conference.conferenceStatusId === "Preparing" ||
              conference.conferenceStatusId === "Pending" ||
              getCurrentStatusName() === "Preparing" ||
              getCurrentStatusName() === "Pending") && (
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

            <UpdateConferenceStatus
              open={statusDialogOpen}
              onClose={() => setStatusDialogOpen(false)}
              conference={{
                ...conference,
                conferenceStatusId: conference.conferenceStatusId,
              }}
            />
          </div>

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