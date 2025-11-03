"use client";

import { Clock, MapPin, Calendar, Users, ExternalLink, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface CustomerWaitListResponse {
    paperWaitListId: string;
    createdAt?: string;
    notifiedAt?: string;
    waitListStatusId?: string;
    waitListStatusName?: string;

    conferenceId?: string;
    conferenceName?: string;
    conferenceDescription?: string;
    conferenceStartDate?: string;
    conferenceEndDate?: string;
    conferenceAvailableSlot?: number;
    conferenceAddress?: string;
    conferenceBannerImageUrl?: string;
    isInternalHosted?: boolean;
    isResearchConference?: boolean;
    conferenceCategoryId?: string;
    conferenceCategoryName?: string;
    conferenceStatusId?: string;
    conferenceStatusName?: string;
}

export interface LeaveWaitListRequest {
    conferenceId: string;
}

export default function CustomerWaitlist() {
    const filterOptions = [
        { id: "most-recent", label: "Mới nhất", active: true },
        { id: "start-date-desc", label: "Ngày bắt đầu (Mới nhất)", active: false },
        { id: "available-slots", label: "Nhiều chỗ trống", active: false },
        { id: "start-date-asc", label: "Ngày bắt đầu (Cũ nhất)", active: false },
        { id: "alphabetical", label: "Theo bảng chữ cái", active: false },
    ];

    const waitlistConferences: CustomerWaitListResponse[] = [
        {
            paperWaitListId: "1",
            createdAt: "2024-10-01T10:00:00Z",
            notifiedAt: undefined,
            waitListStatusId: "pending",
            waitListStatusName: "Đang chờ",
            conferenceId: "conf-1",
            conferenceName: "Hội thảo Trí tuệ Nhân tạo Việt Nam 2024",
            conferenceDescription: "Khám phá xu hướng AI mới nhất tại Việt Nam",
            conferenceStartDate: "2024-11-15T08:00:00Z",
            conferenceEndDate: "2024-11-17T18:00:00Z",
            conferenceAvailableSlot: 15,
            conferenceAddress: "TP. Hồ Chí Minh, Việt Nam",
            conferenceBannerImageUrl: "/images/ai-conference.jpg",
            isInternalHosted: true,
            isResearchConference: true,
            conferenceCategoryId: "tech",
            conferenceCategoryName: "Công nghệ",
            conferenceStatusId: "open",
            conferenceStatusName: "Đang mở",
        },
        {
            paperWaitListId: "2",
            createdAt: "2024-09-28T14:30:00Z",
            notifiedAt: "2024-10-02T09:00:00Z",
            waitListStatusId: "notified",
            waitListStatusName: "Đã thông báo",
            conferenceId: "conf-2",
            conferenceName: "Vietnam Blockchain Summit 2024",
            conferenceDescription: "Hội nghị blockchain lớn nhất Việt Nam",
            conferenceStartDate: "2024-10-20T09:00:00Z",
            conferenceEndDate: "2024-10-22T17:00:00Z",
            conferenceAvailableSlot: 8,
            conferenceAddress: "Hà Nội, Việt Nam",
            conferenceBannerImageUrl: "/images/blockchain-summit.jpg",
            isInternalHosted: false,
            isResearchConference: false,
            conferenceCategoryId: "fintech",
            conferenceCategoryName: "Fintech",
            conferenceStatusId: "open",
            conferenceStatusName: "Đang mở",
        },
        {
            paperWaitListId: "3",
            createdAt: "2024-10-05T16:45:00Z",
            notifiedAt: undefined,
            waitListStatusId: "pending",
            waitListStatusName: "Đang chờ",
            conferenceId: "conf-3",
            conferenceName: "Hội nghị Đổi mới Giáo dục Số",
            conferenceDescription: "Chuyển đổi số trong giáo dục",
            conferenceStartDate: "2024-12-05T08:30:00Z",
            conferenceEndDate: "2024-12-06T17:30:00Z",
            conferenceAvailableSlot: 25,
            conferenceAddress: "Đà Nẵng, Việt Nam",
            conferenceBannerImageUrl: "/images/education-conference.jpg",
            isInternalHosted: true,
            isResearchConference: true,
            conferenceCategoryId: "education",
            conferenceCategoryName: "Giáo dục",
            conferenceStatusId: "open",
            conferenceStatusName: "Đang mở",
        },
    ];

    const formatDate = (startDate?: string, endDate?: string) => {
        if (!startDate) return "Chưa xác định";
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : null;

        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        };

        if (end && start.toDateString() !== end.toDateString()) {
            return `${start.toLocaleDateString('vi-VN', options)} - ${end.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
        }

        return start.toLocaleDateString('vi-VN', options);
    };

    const formatCreatedDate = (date?: string) => {
        if (!date) return "Chưa xác định";
        const d = new Date(date);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const handleLeaveWaitlist = (conferenceId?: string) => {
        if (!conferenceId) return;
        const request: LeaveWaitListRequest = { conferenceId };
        console.log("Leave waitlist:", request);
        // API call would go here
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

                {/* Conference List */}
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
                                                    {formatDate(conference.conferenceStartDate, conference.conferenceEndDate)}
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
                                                <span className="text-sm">{conference.conferenceAddress}</span>
                                            </div>

                                            {/* Available Slots */}
                                            <div className="text-lg font-semibold text-blue-400">
                                                {conference.conferenceAvailableSlot} chỗ trống
                                            </div>

                                            {/* Created Date & Actions */}
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                                    <Clock className="h-4 w-4" />
                                                    <span>Đăng ký: {formatCreatedDate(conference.createdAt)}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                                                        onClick={() => handleLeaveWaitlist(conference.conferenceId)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                        Rời khỏi
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
                </div>

                {/* Empty State */}
                {waitlistConferences.length === 0 && (
                    <div className="text-center py-16">
                        <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">
                            Chưa có hội nghị trong danh sách chờ
                        </h3>
                        <p className="text-gray-500">
                            Khám phá và đăng ký vào danh sách chờ các hội nghị bạn quan tâm
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}