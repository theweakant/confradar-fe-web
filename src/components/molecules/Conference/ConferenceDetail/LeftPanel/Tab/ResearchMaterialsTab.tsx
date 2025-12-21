"use client";

import {
  FileText,
  BookOpen,
  Link2,
  Download,
  ExternalLink,
  Folder,
} from "lucide-react";
import type {
  CommonConference,
  ResearchConferenceDetailResponse,
} from "@/types/conference.type";

interface ResearchMaterialsTabProps {
  conference: CommonConference;
}

export function ResearchMaterialsTab({ conference }: ResearchMaterialsTabProps) {
  const isResearchConference = (
    conf: CommonConference
  ): conf is ResearchConferenceDetailResponse => {
    return "rankingCategoryId" in conf;
  };

  if (!isResearchConference(conference)) {
    return (
      <div className="p-8">
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            Tài liệu nghiên cứu chỉ có sẵn cho hội nghị nghiên cứu.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Tài Liệu & Nguồn Tham Khảo Nghiên Cứu
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Tài liệu học thuật và nguồn tài nguyên tải về
        </p>
      </div>

      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Folder className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-600">
            Danh Mục Xếp Hạng
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="Tên danh mục" value={conference.rankingCategoryName} />
        </div>
      </section>

      {/*  Files */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-green-600">
            Tệp Xếp Hạng
          </h3>
        </div>
        {conference.rankingFileUrls && conference.rankingFileUrls.length > 0 ? (
          <div className="space-y-3">
            {conference.rankingFileUrls.map((file) => (
              <div
                key={file.rankingFileUrlId}
                className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 break-all font-mono">
                      {file.fileUrl}
                    </p>
                  </div>
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Xem
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="Chưa có tệp xếp hạng" />
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-purple-600">
            Tài Liệu Tải Về
          </h3>
        </div>
        {conference.materialDownloads && conference.materialDownloads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conference.materialDownloads.map((material) => (
              <div
                key={material.materialDownloadId}
                className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-gray-100 rounded">
                    <FileText className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {material.fileName}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {material.fileDescription}
                    </p>
                  </div>
                </div>
                <a
                  href={`https://minio-api.confradar.io.vn/${material.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium w-full justify-center"
                >
                  <Download className="w-4 h-4" />
                  Tải xuống
                </a>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="Chưa có tài liệu để tải về" />
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-orange-600">
            Liên Kết Tham Khảo
          </h3>
        </div>
        {conference.rankingReferenceUrls &&
        conference.rankingReferenceUrls.length > 0 ? (
          <div className="space-y-3">
            {conference.rankingReferenceUrls.map((reference) => (
              <div
                key={reference.referenceUrlId}
                className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-blue-700 hover:text-blue-800 break-all font-medium">
                      {reference.referenceUrl}
                    </p>
                  </div>
                  <a
                    href={reference.referenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Truy cập
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="Chưa có liên kết tham khảo" />
        )}
      </section>
    </div>
  );
}

interface InfoFieldProps {
  label: string;
  value: string | number | boolean | null | undefined;
  className?: string;
}

function InfoField({ label, value, className = "" }: InfoFieldProps) {
  return (
    <div className={className}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-base text-gray-900 font-medium">
        {value != null && value !== "" ? String(value) : "N/A"}
      </p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
}