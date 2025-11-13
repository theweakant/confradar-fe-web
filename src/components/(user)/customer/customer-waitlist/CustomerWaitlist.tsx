"use client";

import { Clock, MapPin, Calendar, Users, ExternalLink, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePaperCustomer } from "@/redux/hooks/usePaper";
import { CustomerWaitListResponse } from "@/types/waitlist.type";
import React, { useEffect, useState } from "react";

export default function CustomerWaitlist() {
  const {
    waitLists,
    fetchWaitList,
    handleLeaveWaitList,
    waitListLoading,
    leavingWaitListLoading,
    waitListError,
    leaveWaitListError,
  } = usePaperCustomer();
  const [activeFilter, setActiveFilter] = useState("most-recent");
  const [sortedWaitlists, setSortedWaitlists] = useState<
    CustomerWaitListResponse[]
  >([]);

  const filterOptions = [
    {
      id: "most-recent",
      label: "Mới nhất",
      active: activeFilter === "most-recent",
    },
    {
      id: "start-date-desc",
      label: "Ngày bắt đầu (Mới nhất)",
      active: activeFilter === "start-date-desc",
    },
    {
      id: "available-slots",
      label: "Nhiều chỗ trống",
      active: activeFilter === "available-slots",
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
  ];

  // Sort waitlists based on active filter
  useEffect(() => {
    if (!waitLists) return;

    const sorted = [...waitLists];

    switch (activeFilter) {
      case "most-recent":
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        );
        break;
      case "start-date-desc":
        sorted.sort(
          (a, b) =>
            new Date(b.conferenceStartDate || 0).getTime() -
            new Date(a.conferenceStartDate || 0).getTime(),
        );
        break;
      case "start-date-asc":
        sorted.sort(
          (a, b) =>
            new Date(a.conferenceStartDate || 0).getTime() -
            new Date(b.conferenceStartDate || 0).getTime(),
        );
        break;
      case "available-slots":
        sorted.sort(
          (a, b) =>
            (b.conferenceAvailableSlot || 0) - (a.conferenceAvailableSlot || 0),
        );
        break;
      case "alphabetical":
        sorted.sort((a, b) =>
          (a.conferenceName || "").localeCompare(b.conferenceName || "", "vi"),
        );
        break;
      default:
        break;
    }

    setSortedWaitlists(sorted);
  }, [waitLists, activeFilter]);

  useEffect(() => {
    fetchWaitList();
  }, [fetchWaitList]);

  const waitlistConferences = sortedWaitlists;

  const formatDate = (startDate?: string, endDate?: string) => {
    if (!startDate) return "Chưa xác định";
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };

    if (end && start.toDateString() !== end.toDateString()) {
      return `${start.toLocaleDateString("vi-VN", options)} - ${end.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}`;
    }

    return start.toLocaleDateString("vi-VN", options);
  };

  const formatCreatedDate = (date?: string) => {
    if (!date) return "Chưa xác định";
    const d = new Date(date);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleLeaveWaitlist = async (conferenceId?: string) => {
    if (!conferenceId) return;

    try {
      await handleLeaveWaitList(conferenceId);
      await fetchWaitList();
    } catch (error) {
      console.error("Error leaving waitlist:", error);
    }
  };

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
  };

  const getStatusColor = (statusName?: string) => {
    switch (statusName?.toLowerCase()) {
      case "đã thông báo":
        return "bg-green-700 text-green-300";
      case "đang chờ":
        return "bg-yellow-700 text-yellow-300";
      default:
        return "bg-gray-700 text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Danh sách chờ
            </h1>
          </div>
          <p className="text-gray-400 text-sm sm:text-base">
            Các hội nghị bạn đang trong danh sách chờ
          </p>
        </div>

        {/* Filter/Sort Options */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-3 min-w-max pb-2">
            {filterOptions.map((option) => (
              <Button
                key={option.id}
                variant={option.active ? "default" : "outline"}
                onClick={() => handleFilterChange(option.id)}
                disabled={waitListLoading}
                className={`whitespace-nowrap ${option.active
                  ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600"
                  }`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {waitListLoading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <p className="text-gray-400 mt-4">Đang tải danh sách chờ...</p>
          </div>
        )}

        {/* Error State */}
        {waitListError && (
          <div className="text-center py-16">
            <div className="text-red-400 mb-4">
              <X className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Có lỗi xảy ra</h3>
              <p className="text-gray-400">{waitListError.data?.message}</p>
            </div>
          </div>
        )}

        {/* Conference List */}
        {!waitListLoading && !waitListError && (
          <div className="space-y-6">
            {waitlistConferences.map((conference) => (
              <Card
                key={conference.paperWaitListId}
                className="overflow-hidden hover:shadow-lg transition-shadow bg-gray-800 border-gray-700"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Content */}
                  <CardContent className="flex-1 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Date & Category & Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar className="h-4 w-4" />
                            {formatDate(
                              conference.conferenceStartDate,
                              conference.conferenceEndDate,
                            )}
                          </div>
                          <Badge
                            variant="secondary"
                            className="w-fit bg-gray-700 text-gray-300"
                          >
                            {conference.conferenceCategoryName}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className={`w-fit ${getStatusColor(conference.waitListStatusName)}`}
                          >
                            {conference.waitListStatusName}
                          </Badge>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                          {conference.conferenceName}
                        </h2>

                        {/* Description */}
                        {conference.conferenceDescription && (
                          <p className="text-sm text-gray-400 line-clamp-2">
                            {conference.conferenceDescription}
                          </p>
                        )}

                        {/* Location */}
                        <div className="flex items-center gap-2 text-gray-400">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">
                            {conference.conferenceAddress}
                          </span>
                        </div>

                        {/* Available Slots */}
                        <div className="text-lg font-semibold text-blue-400">
                          {conference.conferenceAvailableSlot} chỗ trống
                        </div>

                        {/* Created Date & Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Clock className="h-4 w-4" />
                            <span>
                              Đăng ký: {formatCreatedDate(conference.createdAt)}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={leavingWaitListLoading}
                              className="text-red-400 hover:text-red-300 hover:bg-gray-700 disabled:opacity-50"
                              onClick={() =>
                                handleLeaveWaitlist(conference.conferenceId)
                              }
                            >
                              {leavingWaitListLoading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 mr-2"></div>
                                  Đang xử lý...
                                </>
                              ) : (
                                <>
                                  <X className="h-4 w-4" />
                                  Rời khỏi
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
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

                  {/* Image */}
                  <div className="lg:w-80 lg:flex-shrink-0">
                    <div className="h-48 lg:h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <Calendar className="h-16 w-16 text-white/70" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Empty State */}
            {waitlistConferences.length === 0 && (
              <div className="text-center py-16">
                <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  Chưa có hội nghị trong danh sách chờ
                </h3>
                <p className="text-gray-500">
                  Khám phá và đăng ký vào danh sách chờ các hội nghị bạn quan
                  tâm
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
