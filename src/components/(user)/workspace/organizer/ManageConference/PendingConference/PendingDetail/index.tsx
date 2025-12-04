"use client";

import React from 'react';
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Users, Clock, Briefcase, Loader2, Info } from 'lucide-react';
import { useGetTechnicalConferenceDetailInternalQuery } from "@/redux/services/conference.service";
import { Button } from "@/components/ui/button";
import { formatDate, formatDateTime, formatCurrency } from '@/helper/format';
import { ConferenceMediaResponse, ConferencePolicyResponse, ConferencePricePhaseResponse, ConferencePriceResponse, SpeakerResponse, SponsorResponse, TechnicalConferenceSessionResponse } from '@/types/conference.type';

export default function PendingConferenceDetail() {
  const { id } = useParams();
  const router = useRouter();
  const conferenceId = id as string;

  const { data, isLoading, error } = useGetTechnicalConferenceDetailInternalQuery(conferenceId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <span className="text-gray-600 font-medium">Đang tải thông tin...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Không thể tải thông tin</h3>
            <Button onClick={() => router.back()} className="w-full bg-blue-600 hover:bg-blue-700">
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const conferenceData = data.data || data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/workspace/organizer/manage-conference/external-conference")}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{conferenceData.conferenceName}</h1>
              {conferenceData.userNameCreator && (
                <p className="text-sm text-gray-500 mt-1">Người tạo: {conferenceData.userNameCreator}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {conferenceData.bannerImageUrl && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <img 
              src={conferenceData.bannerImageUrl} 
              alt="Conference Banner"
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            Thông tin cơ bản
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {(conferenceData.startDate || conferenceData.endDate) && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Thời gian diễn ra</p>
                    <p className="font-medium">{formatDate(conferenceData.startDate)} - {formatDate(conferenceData.endDate)}</p>
                  </div>
                </div>
              )}
              {conferenceData.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Địa điểm</p>
                    <p className="font-medium">{conferenceData.address}</p>
                  </div>
                </div>
              )}
              {conferenceData.createdAt && (
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Ngày tạo</p>
                    <p className="font-medium">{formatDateTime(conferenceData.createdAt)}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {(conferenceData.ticketSaleStart || conferenceData.ticketSaleEnd) && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Thời gian bán vé</p>
                    <p className="font-medium">{formatDate(conferenceData.ticketSaleStart)} - {formatDate(conferenceData.ticketSaleEnd)}</p>
                  </div>
                </div>
              )}
              {(conferenceData.totalSlot || conferenceData.availableSlot) && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Số lượng tham dự</p>
                    <p className="font-medium">{conferenceData.availableSlot || 0} / {conferenceData.totalSlot || 0} chỗ</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          {conferenceData.description && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500 mb-2">Mô tả</p>
              <p className="text-gray-700">{conferenceData.description}</p>
            </div>
          )}
        </div>

        {conferenceData.contract && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              Thông tin hợp đồng
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Hoa hồng</p>
                <p className="text-lg font-bold text-purple-600">{conferenceData.contract.commission}%</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Ngày ký</p>
                <p className="font-medium">{formatDate(conferenceData.contract.signDay)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Ngày thanh toán</p>
                <p className="font-medium">{formatDate(conferenceData.contract.finalizePaymentDate)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Liên kết bán vé</p>
                <p className="font-medium">{conferenceData.contract.isTicketSelling ? 'Có' : 'Không'}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${conferenceData.contract.isSponsorStep ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {conferenceData.contract.isSponsorStep ? '✓' : '✗'} Nhà tài trợ
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${conferenceData.contract.isMediaStep ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {conferenceData.contract.isMediaStep ? '✓' : '✗'} Media
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${conferenceData.contract.isPolicyStep ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {conferenceData.contract.isPolicyStep ? '✓' : '✗'} Chính sách
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${conferenceData.contract.isSessionStep ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {conferenceData.contract.isSessionStep ? '✓' : '✗'} Phiên
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${conferenceData.contract.isPriceStep ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {conferenceData.contract.isPriceStep ? '✓' : '✗'} Giá vé
              </span>
            </div>
          </div>
        )}

        {conferenceData.sponsors && conferenceData.sponsors.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Nhà tài trợ ({conferenceData.sponsors.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {conferenceData.sponsors.map((sponsor: SponsorResponse) => (
                <div key={sponsor.sponsorId} className="border rounded-lg p-4 text-center hover:shadow-md transition">
                  <img 
                    src={sponsor.imageUrl} 
                    alt={sponsor.name}
                    className="w-20 h-20 object-contain mx-auto mb-2"
                  />
                  <p className="font-medium text-sm">{sponsor.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {conferenceData.conferenceMedia && conferenceData.conferenceMedia.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              Hình ảnh ({conferenceData.conferenceMedia.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {conferenceData.conferenceMedia.map((media: ConferenceMediaResponse) => (
                <div key={media.mediaId} className="aspect-video rounded-lg overflow-hidden border">
                  <img 
                    src={media.mediaUrl} 
                    alt="Conference media"
                    className="w-full h-full object-cover hover:scale-105 transition"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {conferenceData.policies && conferenceData.policies.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Chính sách ({conferenceData.policies.length})</h2>
            <div className="space-y-3">
              {conferenceData.policies.map((policy: ConferencePolicyResponse) => (
                <div key={policy.policyId} className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="font-semibold text-gray-900">{policy.policyName}</p>
                  <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {conferenceData.sessions && conferenceData.sessions.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Session ({conferenceData.sessions.length})</h2>
            <div className="space-y-4">
              {conferenceData.sessions.map((session: TechnicalConferenceSessionResponse) => (
                <div key={session.conferenceSessionId} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{session.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{session.description}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {formatDate(session.sessionDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {session.startTime 
                        ? new Date(session.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                        : 'N/A'}
                      {' - '}
                      {session.endTime
                        ? new Date(session.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                        : 'N/A'}
                    </span>
                  </div>
                  {session.speakers && session.speakers.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-700">Diễn giả:</span>
                      {session.speakers.map((speaker: SpeakerResponse) => (
                        <div key={speaker.speakerId} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                          <img 
                            src={speaker.image} 
                            alt={speaker.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-sm font-medium">{speaker.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {conferenceData.conferencePrices && conferenceData.conferencePrices.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              Thông tin giá vé ({conferenceData.conferencePrices.length})
            </h2>
            <div className="space-y-4">
              {conferenceData.conferencePrices.map((price: ConferencePriceResponse) => (
                <div key={price.conferencePriceId} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{price.ticketName}</h3>
                      <p className="text-sm text-gray-600 mt-1">{price.ticketDescription}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-green-600">{formatCurrency(price.ticketPrice)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm mb-3">
                    <span className="flex items-center gap-1 text-gray-600">
                      <Users className="w-4 h-4" />
                      {price.availableSlot || 0} / {price.totalSlot || 0} chỗ
                    </span>
                  </div>
                  
                  {price.pricePhases && price.pricePhases.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium text-gray-700 mb-2">Giai đoạn giá:</p>
                      <div className="space-y-2">
                        {price.pricePhases.map((phase: ConferencePricePhaseResponse) => (
                          <div key={phase.pricePhaseId} className="bg-gray-50 rounded p-3">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{phase.phaseName}</span>
                              <span className="text-sm text-purple-600 font-semibold">
                                {phase.applyPercent}% giá gốc
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                              <span>{formatDate(phase.startDate)} - {formatDate(phase.endDate)}</span>
                              <span>•</span>
                              <span>{phase.availableSlot || 0}/{phase.totalSlot || 0} chỗ</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}