"use client";

import { Heart, MapPin, Calendar, Users, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useConference } from "@/redux/hooks/conference/useConference";
import { useEffect, useState } from "react";
import { FavouriteConferenceDetailResponse } from "@/types/conference.type";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
// import { Loading } from "@/components/utility/Loading";

export default function FavoriteConferences() {
  const router = useRouter();
  // const {
  //   favouriteConferences,
  //   favouriteConferencesLoading,
  //   favouriteConferencesError,
  //   removeFavourite,
  //   deletingFromFavourite,
  //   refetchFavouriteConferences
  // } = useConference();

  const {
    lazyFavouriteConferences,
    fetchFavouriteConferences,
    favouriteConferencesLoading,
    favouriteConferencesError,
    removeFavourite,
    deletingFromFavourite,
  } = useConference();

  const [sortedConferences, setSortedConferences] = useState<
    FavouriteConferenceDetailResponse[]
  >([]);
  const [activeFilter, setActiveFilter] = useState("most-popular");

  const filterOptions = [
    {
      id: "most-popular",
      label: "Phổ biến nhất",
      active: activeFilter === "most-popular",
    },
    {
      id: "start-date-desc",
      label: "Ngày bắt đầu (Mới nhất)",
      active: activeFilter === "start-date-desc",
    },
    {
      id: "start-date-asc",
      label: "Ngày bắt đầu (Cũ nhất)",
      active: activeFilter === "start-date-asc",
    },
    {
      id: "alphabetical",
      label: "Theo bảng chữ cái",
      active: activeFilter === "alphabetical",
    },
    {
      id: "favorite-date",
      label: "Thêm yêu thích gần đây",
      active: activeFilter === "favorite-date",
    },
  ];

  useEffect(() => {
    fetchFavouriteConferences();
  }, [fetchFavouriteConferences]);

  // Sort conferences based on active filter
  useEffect(() => {
    if (!lazyFavouriteConferences) {
      setSortedConferences([]);
      return;
    }

    const sorted = [...lazyFavouriteConferences].sort((a, b) => {
      switch (activeFilter) {
        case "start-date-desc":
          return (
            new Date(b.conferenceStartDate || "").getTime() -
            new Date(a.conferenceStartDate || "").getTime()
          );
        case "start-date-asc":
          return (
            new Date(a.conferenceStartDate || "").getTime() -
            new Date(b.conferenceStartDate || "").getTime()
          );
        case "alphabetical":
          return (a.conferenceName || "").localeCompare(b.conferenceName || "");
        case "favorite-date":
          return (
            new Date(b.favouriteCreatedAt || "").getTime() -
            new Date(a.favouriteCreatedAt || "").getTime()
          );
        default: // most-popular
          return (b.availableSlot || 0) - (a.availableSlot || 0);
      }
    });

    setSortedConferences(sorted);
  }, [lazyFavouriteConferences, activeFilter]);

  // Format date function
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Chưa xác định";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Chưa xác định";

    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Handle remove from favorites
  const handleRemoveFavorite = async (conferenceId: string) => {
    try {
      await removeFavourite(conferenceId);
      toast.success("Đã bỏ khỏi danh sách yêu thích");
      fetchFavouriteConferences();
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
      console.error("Remove favorite error:", error);
    }
  };

  // Handle view conference detail
  const handleViewDetail = (
    conferenceId: string,
    isResearchConference?: boolean,
  ) => {
    const conferenceType = isResearchConference ? "research" : "tech";
    router.push(`/customer/discovery/${conferenceType}/${conferenceId}`);
  };

  // Loading state
  if (favouriteConferencesLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Đang tải lịch sử giao dịch...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (favouriteConferencesError) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto text-center py-16">
          <Heart className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Có lỗi xảy ra
          </h3>
          <p className="text-gray-400 mb-4">
            {favouriteConferencesError.data?.Message}
          </p>
          <Button
            onClick={() => fetchFavouriteConferences()}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-red-400 fill-current" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Hội nghị yêu thích
            </h1>
          </div>
          <p className="text-gray-400 text-sm sm:text-base">
            Danh sách các hội nghị bạn đã đánh dấu yêu thích
          </p>
        </div>

        {/* Filter/Sort Options */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-3 min-w-max pb-2">
            {filterOptions.map((option) => (
              <Button
                key={option.id}
                variant={option.active ? "default" : "outline"}
                onClick={() => setActiveFilter(option.id)}
                className={`whitespace-nowrap ${
                  option.active
                    ? "bg-red-600 text-white hover:bg-red-700 border-red-600"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600"
                }`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Conference List */}
        {sortedConferences.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Chưa có hội thảo yêu thích
            </h3>
            <p className="text-gray-400 mb-6">
              Thêm những hội thảo bạn quan tâm vào danh sách yêu thích để dễ
              dàng theo dõi
            </p>
            <Button
              onClick={() => router.push("/customer/discovery")}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Khám phá hội thảo
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedConferences.map((conference) => (
              <Card
                key={conference.conferenceId}
                className="overflow-hidden hover:shadow-lg transition-shadow bg-gray-800 border-gray-700"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Content */}
                  <CardContent className="flex-1 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Date & Category */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar className="h-4 w-4" />
                            {formatDate(conference.conferenceStartDate)} -{" "}
                            {formatDate(conference.conferenceEndDate)}
                          </div>
                          <Badge
                            variant="secondary"
                            className="w-fit bg-gray-700 text-gray-300"
                          >
                            {conference.isResearchConference
                              ? "Nghiên cứu"
                              : "Công nghệ"}
                          </Badge>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                          {conference.conferenceName}
                        </h2>

                        {/* Description */}
                        {conference.conferenceDescription && (
                          <p className="text-gray-400 text-sm line-clamp-2">
                            {conference.conferenceDescription}
                          </p>
                        )}

                        {/* Slot availability */}
                        {conference.availableSlot !== undefined && (
                          <div className="text-sm text-gray-400">
                            Còn lại: {conference.availableSlot} chỗ
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>
                              Yêu thích từ:{" "}
                              {formatDate(conference.favouriteCreatedAt)}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRemoveFavorite(conference.conferenceId)
                              }
                              disabled={deletingFromFavourite}
                              className="text-red-400 hover:text-red-300 hover:bg-gray-700 disabled:opacity-50"
                              title="Bỏ yêu thích"
                            >
                              <Heart className="h-4 w-4 fill-current" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleViewDetail(
                                  conference.conferenceId,
                                  conference.isResearchConference,
                                )
                              }
                              className="flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              Xem chi tiết
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  {/* Image or Banner */}
                  <div className="lg:w-80 lg:flex-shrink-0">
                    {conference.bannerImageUrl ? (
                      <div
                        className="h-48 lg:h-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${conference.bannerImageUrl})`,
                        }}
                      />
                    ) : (
                      <div className="h-48 lg:h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <Calendar className="h-16 w-16 text-white/70" />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
