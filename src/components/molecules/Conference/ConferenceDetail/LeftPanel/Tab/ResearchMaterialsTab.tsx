"use client";

import {
  FileText,
  BookOpen,
  ImageIcon,
  ArrowLeft,
} from "lucide-react";
import type {
  CommonConference,
  ResearchConferenceDetailResponse,
} from "@/types/conference.type";

interface ResearchMaterialsTabProps {
  conference: CommonConference;
}

export function ResearchMaterialsTab({ conference }: ResearchMaterialsTabProps) {
  // Type guard để đảm bảo conference là research
  const isResearchConference = (
    conf: CommonConference
  ): conf is ResearchConferenceDetailResponse => {
    return "rankingCategoryId" in conf;
  };

  if (!isResearchConference(conference)) {
    return (
      <div className="p-6">
        <p className="text-gray-500 text-center py-8">
          Research materials are only available for research conferences.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Research Materials & Resources
      </h2>

      {/* Ranking Category */}
      <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ranking Category
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="Category ID" value={conference.rankingCategoryId} />
          <InfoField
            label="Category Name"
            value={conference.rankingCategoryName}
          />
        </div>
      </div>

      {/* Ranking Files */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-green-600" />
          Ranking Files
        </h3>
        {conference.rankingFileUrls && conference.rankingFileUrls.length > 0 ? (
          <div className="space-y-3">
            {conference.rankingFileUrls.map((file) => (
              <div
                key={file.rankingFileUrlId}
                className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <InfoField label="File ID" value={file.rankingFileUrlId} />
                  <p className="text-sm text-gray-600 mt-2 break-all">
                    {file.fileUrl}
                  </p>
                </div>
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  View File
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
            No ranking files available
          </p>
        )}
      </div>

      {/* Material Downloads */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-600" />
          Material Downloads
        </h3>
        {conference.materialDownloads && conference.materialDownloads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conference.materialDownloads.map((material) => (
              <div
                key={material.materialDownloadId}
                className="bg-purple-50 border border-purple-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">
                      {material.fileName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {material.fileDescription}
                    </p>
                  </div>
                </div>
                <InfoField
                  label="Material ID"
                  value={material.materialDownloadId}
                  className="mb-3"
                />
                <a
                  href={`https://minio-api.confradar.io.vn/${material.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium w-full justify-center"
                >
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                  Download
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
            No materials available for download
          </p>
        )}
      </div>

      {/* Ranking Reference URLs */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-orange-600" />
          Ranking Reference URLs
        </h3>
        {conference.rankingReferenceUrls &&
        conference.rankingReferenceUrls.length > 0 ? (
          <div className="space-y-3">
            {conference.rankingReferenceUrls.map((reference) => (
              <div
                key={reference.referenceUrlId}
                className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <InfoField
                    label="Reference ID"
                    value={reference.referenceUrlId}
                  />
                  <p className="text-sm text-blue-600 hover:text-blue-700 mt-2 break-all font-medium">
                    {reference.referenceUrl}
                  </p>
                </div>
                <a
                  href={reference.referenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                  Visit
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
            No reference URLs available
          </p>
        )}
      </div>
    </div>
  );
}

// --- Reusable Helper ---
interface InfoFieldProps {
  label: string;
  value: string | number | boolean | null | undefined;
  className?: string;
}

function InfoField({ label, value, className = "" }: InfoFieldProps) {
  return (
    <div className={className}>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-sm text-gray-900 font-semibold break-words">
        {value != null && value !== "" ? String(value) : "N/A"}
      </p>
    </div>
  );
}