"use client";

import {
  Calendar,
  MapPin,
  Users,
  Clock,
  FileText,
  Loader2,
  ShieldCheck,
  Handshake,
  DollarSign,
  ArrowLeft,
  Info,
} from "lucide-react";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/helper/format";
import { useRouter, useParams } from "next/navigation"; 

import { useGetTechnicalConferenceDetailQuery } from "@/redux/services/conference.service";
import { useGetAllConferenceStatusesQuery } from "@/redux/services/status.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";
import { useGetAllCategoriesQuery } from "@/redux/services/category.service";


export default function ConferenceDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const conferenceId = id as string;


  const { data, isLoading, error } = useGetTechnicalConferenceDetailQuery(conferenceId);
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: statusesData } = useGetAllConferenceStatusesQuery();
  const { data: citiesData } = useGetAllCitiesQuery();

  const conference = data?.data;
  const categories = categoriesData?.data || [];
  const statuses = statusesData?.data || [];
  const cities = citiesData?.data || [];

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.conferenceCategoryId === categoryId);
    return category?.conferenceCategoryName || categoryId;
  };

  const getStatusName = (statusId: string) => {
    const status = statuses.find(s => s.conferenceStatusId === statusId);
    return status?.conferenceStatusName || statusId;
  };

  const getCityName = (cityId: string) => {
    const city = cities.find(c => c.cityId === cityId);
    return city?.cityName || cityId;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <span className="text-gray-600 font-medium">Đang tải thông tin hội thảo...</span>
        </div>
      </div>
    );
  }

  if (error || !conference) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Không thể tải thông tin</h3>
            <p className="text-gray-600 mb-6">Hội thảo không tồn tại hoặc đã bị xóa</p>
            <Button 
              onClick={() => router.back()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header với Banner */}
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


            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  {conference.conferenceName}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
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
                  <span className="px-3 py-1 bg-blue-500/90 text-white rounded-full text-sm font-medium backdrop-blur-sm">
                    {conference.targetAudience}
                  </span>
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
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {conference.targetAudience}
                </span>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {conference.description && (
              <section className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  Giới thiệu
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {conference.description}
                </p>
              </section>
            )}

            {/* Ticket Prices */}
            {conference.conferencePrices && conference.conferencePrices.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Giá vé
                </h2>
                <div className="space-y-4">
                  {conference.conferencePrices.map((price) => (
                    <div key={price.conferencePriceId} className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-gray-900 text-lg">{price.ticketName}</h3>
                            {price.isAuthor && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold">
                                TÁC GIẢ
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{price.ticketDescription}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">
                              Còn <span className="font-bold text-blue-600">{price.availableSlot}</span> / {price.totalSlot} vé
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-3xl font-bold text-blue-600">
                            {(price.ticketPrice ?? 0).toLocaleString('vi-VN')}₫
                          </p>
                        </div>
                      </div>

                      {/* Price Phases */}
                      {price.pricePhases && price.pricePhases.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-blue-200">
                          <p className="text-sm font-bold text-gray-700 mb-3">🎯 Giai đoạn giảm giá:</p>
                          <div className="space-y-2">
                            {price.pricePhases.map((phase) => (
                              <div key={phase.pricePhaseId} className="bg-white border border-gray-200 rounded-lg p-3 hover:border-green-300 transition-colors">
                                <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">{phase.phaseName}</span>
                                    <span className="px-2 py-1 bg-green-500 text-white rounded-lg text-xs font-bold">
                                      -{phase.applyPercent}%
                                    </span>
                                  </div>
                                  <p className="text-xl font-bold text-green-600">
                                    {(((price.ticketPrice ?? 0) * (100 - (phase.applyPercent ?? 0))) / 100).toLocaleString('vi-VN')}₫
                                  </p>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-600">
                                  <span>
                                    {formatDate(phase.startDate)} - {formatDate(phase.endDate)}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    <span>{phase.availableSlot}/{phase.totalSlot} vé</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Sessions */}
            {conference.sessions && conference.sessions.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Phiên họp
                </h2>
                <div className="space-y-3">
                  {conference.sessions.map((session, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <p className="text-gray-800 font-medium">{session.title}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Policies */}
            {conference.policies && conference.policies.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  Chính sách
                </h2>
                <div className="space-y-3">
                  {conference.policies.map((policy) => (
                    <div key={policy.policyId} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-bold text-gray-900 mb-2">{policy.policyName}</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{policy.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Refund Policies */}
            {conference.refundPolicies && conference.refundPolicies.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Chính sách hoàn tiền
                </h2>
                <div className="space-y-3">
                  {conference.refundPolicies.map((policy, index) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-gray-800 font-medium">{policy.percentRefund}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Conference Media */}
            {conference.conferenceMedia && conference.conferenceMedia.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Hình ảnh</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {conference.conferenceMedia.map((media, index) => (
                    <div key={index} className="relative h-40 rounded-lg overflow-hidden group">
                      <Image
                        src={media.mediaUrl ?? "/placeholder.png"}
                        alt={`Media ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Thông tin chi tiết</h2>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Thời gian tổ chức</p>
                    <p className="text-gray-900 font-semibold">{formatDate(conference.startDate)}</p>
                    <p className="text-gray-600 text-sm">đến {formatDate(conference.endDate)}</p>
                  </div>
                </div>

                <div className="border-t pt-4 flex gap-3">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Thời gian bán vé</p>
                    <p className="text-gray-900 font-semibold">{formatDate(conference.ticketSaleStart)}</p>
                    <p className="text-gray-600 text-sm">đến {formatDate(conference.ticketSaleEnd)}</p>
                  </div>
                </div>

                <div className="border-t pt-4 flex gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Địa điểm</p>
                    <p className="text-gray-900 font-medium">{conference.address}</p>
                    <p className="text-gray-600 text-sm mt-1">{getCityName(conference.cityId ?? "")}</p>
                  </div>
                </div>

                <div className="border-t pt-4 flex gap-3">
                  <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Sức chứa</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {conference.availableSlot}
                    </p>
                    <p className="text-sm text-gray-600">còn trống / {conference.totalSlot} tổng</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sponsors */}
            {conference.sponsors && conference.sponsors.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-blue-600" />
                  Nhà tài trợ
                </h2>
                <div className="space-y-2">
                  {conference.sponsors.map((sponsor, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center hover:border-blue-300 transition-colors">
                      <p className="text-sm text-gray-800 font-semibold">{sponsor.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-gray-50 rounded-xl p-5 text-xs text-gray-600 space-y-2">
              <p className="font-semibold text-gray-700 mb-3">Thông tin kỹ thuật</p>
              <p><span className="font-medium">ID:</span> {conference.conferenceId}</p>
              <p><span className="font-medium">Ngày tạo:</span> {formatDate(conference.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}