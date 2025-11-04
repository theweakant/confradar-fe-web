"use client";

import {
  Calendar,
  Loader2,
  ShieldCheck,
  Handshake,
  DollarSign,
  ArrowLeft,
  Info,
  Image as ImageIcon,
} from "lucide-react";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/helper/format";
import { useRouter, useParams } from "next/navigation"; 

import { useGetTechnicalConferenceDetailInternalQuery } from "@/redux/services/conference.service";
import { useGetAllConferenceStatusesQuery } from "@/redux/services/status.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";
import { useGetAllCategoriesQuery } from "@/redux/services/category.service";


export default function ConferenceDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const conferenceId = id as string;
  const [activeTab, setActiveTab] = useState("information");

  const { data, isLoading, error } = useGetTechnicalConferenceDetailInternalQuery(conferenceId);
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: statusesData } = useGetAllConferenceStatusesQuery();
  const { data: citiesData } = useGetAllCitiesQuery();

  const conference = data?.data;
  const categories = categoriesData?.data || [];
  const statuses = statusesData?.data || [];
  const cities = citiesData?.data || [];

  const tabs = [
    { id: "information", label: "Thông tin cơ bản", icon: Info },
    { id: "price", label: "Giá vé", icon: DollarSign },
    { id: "refund-policy", label: "Hoàn trả & Chính sách", icon: ShieldCheck },
    { id: "session", label: "Session", icon: Calendar },
    { id: "sponsors-media", label: "Sponsors & Media", icon: ImageIcon },
  ];

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

        <div className="absolute top-4 right-4">
          <Button
            onClick={() => router.push(`/workspace/collaborator/manage-conference/update-tech-conference/${conference.conferenceId}`)}
            className="bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm shadow-lg"
          >
            Chỉnh sửa
          </Button>
        </div>
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
        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? "border-blue-600 text-blue-600 bg-blue-50"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {activeTab === "information" && (
            <InformationTab 
              conference={conference} 
              getCategoryName={getCategoryName}
              getStatusName={getStatusName}
              getCityName={getCityName}
            />
          )}
          {activeTab === "price" && <PriceTab conference={conference} />}
          {activeTab === "refund-policy" && <RefundPolicyTab conference={conference} />}
          {activeTab === "session" && <SessionTab conference={conference} />}
          {activeTab === "sponsors-media" && <SponsorsMediaTab conference={conference} />}
        </div>
      </div>
    </div>
  );
}

// Information Tab Component
function InformationTab({ conference, getCategoryName, getStatusName, getCityName }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Conference Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoField label="Conference ID" value={conference.conferenceId} />
        <InfoField label="Conference Name" value={conference.conferenceName} />
        <InfoField label="Start Date" value={formatDate(conference.startDate)} />
        <InfoField label="End Date" value={formatDate(conference.endDate)} />
        <InfoField label="Total Slots" value={conference.totalSlot} />
        <InfoField label="Available Slots" value={conference.availableSlot} />
        <InfoField label="Ticket Sale Start" value={formatDate(conference.ticketSaleStart)} />
        <InfoField label="Ticket Sale End" value={formatDate(conference.ticketSaleEnd)} />
        <InfoField label="Address" value={conference.address} className="md:col-span-2" />
        <InfoField label="City" value={getCityName(conference.cityId ?? "")} />
        <InfoField label="Category" value={getCategoryName(conference.conferenceCategoryId ?? "")} />
        <InfoField label="Status" value={getStatusName(conference.conferenceStatusId ?? "")} />
        <InfoField label="Created At" value={formatDate(conference.createdAt)} />
        
        <div className="md:col-span-2 flex gap-4">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              conference.isInternalHosted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {conference.isInternalHosted ? '✓' : '✗'} Internal Hosted
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              conference.isResearchConference ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {conference.isResearchConference ? '✓' : '✗'} Research Conference
            </span>
          </div>
        </div>
      </div>

      {conference.description && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-lg">
            {conference.description}
          </p>
        </div>
      )}

      {conference.bannerImageUrl && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-2">Banner Image</h3>
          <div className="relative h-64 w-full rounded-lg overflow-hidden">
            <Image
              src={conference.bannerImageUrl}
              alt="Conference Banner"
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Price Tab Component
function PriceTab({ conference }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Ticket Prices</h2>
      
      {conference.conferencePrices && conference.conferencePrices.length > 0 ? (
        <div className="space-y-4">
          {conference.conferencePrices.map((price: any) => (
            <div key={price.conferencePriceId} className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 text-xl">{price.ticketName}</h3>
                    {price.isAuthor && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold">
                        AUTHOR
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{price.ticketDescription}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <InfoField label="Price ID" value={price.conferencePriceId} />
                    <InfoField label="Total Slots" value={price.totalSlot} />
                    <InfoField label="Available Slots" value={price.availableSlot} />
                    <InfoField label="Is Author" value={price.isAuthor ? 'Yes' : 'No'} />
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm text-gray-500 mb-1">Price</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {(price.ticketPrice ?? 0).toLocaleString('vi-VN')}₫
                  </p>
                </div>
              </div>

              {/* Price Phases */}
              {price.pricePhases && price.pricePhases.length > 0 && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-sm font-bold text-gray-700 mb-3">🎯 Price Phases:</p>
                  <div className="space-y-3">
                    {price.pricePhases.map((phase: any) => (
                      <div key={phase.pricePhaseId} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
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
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                          <InfoField label="Phase ID" value={phase.pricePhaseId} />
                          <InfoField label="Start Date" value={formatDate(phase.startDate)} />
                          <InfoField label="End Date" value={formatDate(phase.endDate)} />
                          <InfoField label="Apply Percent" value={`${phase.applyPercent}%`} />
                          <InfoField label="Total Slots" value={phase.totalSlot} />
                          <InfoField label="Available Slots" value={phase.availableSlot} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">No price information available</p>
      )}
    </div>
  );
}

// Refund & Policy Tab Component
function RefundPolicyTab({ conference }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Refund Policies & Conference Policies</h2>
      
      {/* Refund Policies */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Refund Policies
        </h3>
        {conference.refundPolicies && conference.refundPolicies.length > 0 ? (
          <div className="space-y-3">
            {conference.refundPolicies.map((policy: any, index: number) => (
              <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InfoField label="Percent Refund" value={policy.percentRefund} />
                  <InfoField label="Refund Deadline" value={formatDate(policy.refundDeadline)} />
                  <InfoField label="Refund Order" value={policy.refundOrder} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No refund policies available</p>
        )}
      </div>

      {/* Conference Policies */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          Conference Policies
        </h3>
        {conference.policies && conference.policies.length > 0 ? (
          <div className="space-y-3">
            {conference.policies.map((policy: any) => (
              <div key={policy.policyId} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">{policy.policyName}</h4>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">{policy.description}</p>
                <InfoField label="Policy ID" value={policy.policyId} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No conference policies available</p>
        )}
      </div>
    </div>
  );
}

// Session Tab Component
function SessionTab({ conference }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Conference Sessions</h2>
      
      {conference.sessions && conference.sessions.length > 0 ? (
        <div className="space-y-4">
          {conference.sessions.map((session: any, index: number) => (
            <div key={session.conferenceSessionId || index} className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{session.title}</h3>
                  {session.description && (
                    <p className="text-gray-700 text-sm mb-4">{session.description}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <InfoField label="Session ID" value={session.conferenceSessionId} />
                <InfoField label="Date" value={formatDate(session.date)} />
                <InfoField label="Start Time" value={session.startTime} />
                <InfoField label="End Time" value={session.endTime} />
                <InfoField label="Conference ID" value={session.conferenceId} />
                <InfoField label="Room ID" value={session.roomId} />
              </div>

              {/* Room Info */}
              {session.room && (
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Room Information</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-lg p-4">
                    <InfoField label="Room ID" value={session.room.roomId} />
                    <InfoField label="Room Number" value={session.room.number} />
                    <InfoField label="Display Name" value={session.room.displayName} />
                    <InfoField label="Destination ID" value={session.room.destinationId} />
                  </div>
                </div>
              )}

              {/* Session Media */}
              {session.sessionMedia && session.sessionMedia.length > 0 && (
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Session Media</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {session.sessionMedia.map((media: any, idx: number) => (
                      <div key={idx} className="relative h-40 rounded-lg overflow-hidden">
                        <Image
                          src={media.mediaUrl?.startsWith('http') 
                            ? media.mediaUrl 
                            : `https://minio-api.confradar.io.vn/${media.mediaUrl}`
                          }
                          alt={`Session media ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">No sessions available</p>
      )}
    </div>
  );
}

// Sponsors & Media Tab Component
function SponsorsMediaTab({ conference }: any) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Sponsors & Media</h2>
      
      {/* Sponsors */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Handshake className="w-5 h-5 text-blue-600" />
          Sponsors
        </h3>
        {conference.sponsors && conference.sponsors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conference.sponsors.map((sponsor: any, index: number) => (
            <div key={sponsor.sponsorId || index} className="bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              {sponsor.imageUrl && (
                <div className="relative h-32 w-full mb-3 rounded-lg overflow-hidden bg-white">
                  <Image
                    src={sponsor.imageUrl}
                    alt={sponsor.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
              )}
              <h4 className="font-bold text-gray-900 text-center mb-2">{sponsor.name}</h4>
              <InfoField label="Sponsor ID" value={sponsor.sponsorId} />
            </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No sponsors available</p>
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

          {conference.conferenceMedia.map((media: any, index: number) => (
            <div key={media.mediaId || index} className="space-y-2">
              <div className="relative h-48 rounded-lg overflow-hidden group">
                <Image
                  src={`https://minio-api.confradar.io.vn/${media.mediaUrl}`}
                  alt={`Media ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <InfoField label="Media ID" value={media.mediaId} />
            </div>
          ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No media available</p>
        )}
      </div>
    </div>
  );
}

// Reusable Info Field Component
function InfoField({ label, value, className = "" }: { label: string; value: any; className?: string }) {
  return (
    <div className={`${className}`}>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-sm text-gray-900 font-semibold break-words">{value || "N/A"}</p>
    </div>
  );
}