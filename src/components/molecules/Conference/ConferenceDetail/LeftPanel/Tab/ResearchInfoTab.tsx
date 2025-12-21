"use client";

import type { ResearchConferenceDetailResponse, RevisionRoundDeadlineResponse } from "@/types/conference.type";

interface ResearchInfoTabProps {
  conference: ResearchConferenceDetailResponse;
}

export function ResearchInfoTab({ conference }: ResearchInfoTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-2">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Thông tin nghiên cứu
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                conference.allowListener
                  ? "bg-green-50 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {conference.allowListener ? "Có thính giả" : "Không có thính giả"}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField label="Định dạng bài báo" value={conference.paperFormat} />
          <InfoField
            label="Số bài chấp nhận"
            value={conference.numberPaperAccept}
          />
          <InfoField
            label="Số lần chỉnh sửa"
            value={conference.revisionAttemptAllowed}
          />
          <InfoField
            label="Phí đánh giá bài báo"
            value={`${(conference.reviewFee || 0).toLocaleString("vi-VN")}₫`}
          />
          <InfoField label="Xếp hạng" value={`${conference.rankValue} (${conference.rankYear})`} />
          <InfoField 
            label="Mô tả xếp hạng" 
            value={
              conference.rankingDescription && conference.rankingDescription.length > 20 
                ? `${conference.rankingDescription.substring(0, 20)}...` 
                : conference.rankingDescription
            } 
          />
        </div>
      </div>    
    </div>
  );
}

interface InfoFieldProps {
  label: string;
  value: string | number | boolean | null | undefined;
}

function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1.5">{label}</p>
      <p className="text-sm text-gray-900 font-medium break-words">
        {value != null && value !== "" ? String(value) : "Chưa có"}
      </p>
    </div>
  );
}

