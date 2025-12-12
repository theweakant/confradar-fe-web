"use client";

import { Building, LinkIcon, Globe, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { Publisher } from "@/types/publisher.type";
import Image from "next/image";

interface PublisherDetailProps {
  publisher: Publisher;
  onClose: () => void;
}

export function PublisherDetail({ publisher, onClose }: PublisherDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{publisher.name}</h3>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status="Nhà xuất bản" variant="info" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {publisher.description && (
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-1">Mô tả</p>
              <p className="text-gray-900 leading-relaxed">{publisher.description}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 mb-1">Định dạng bài báo</p>
            <p className="text-gray-900">{publisher.paperFormat || "—"}</p>
          </div>
        </div>

        {publisher.websiteUrl && (
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-1">Website</p>
              <a
                href={publisher.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {publisher.websiteUrl}
              </a>
            </div>
          </div>
        )}

        {publisher.linkTemplate && (
          <div className="flex items-start gap-3">
            <LinkIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-1">Link mẫu</p>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded break-all">
                {publisher.linkTemplate}
              </code>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <ImageIcon className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 mb-1">Logo</p>
            {publisher.logoUrl ? (
              <div className="mt-2 w-24 h-24 rounded border bg-white flex items-center justify-center">
                <Image
                  src={publisher.logoUrl}
                  alt={publisher.name}
                  width={96}
                  height={96}
                  className="object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <p className="text-gray-500 italic">Không có logo</p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 mb-1">ID</p>
            <p className="text-gray-600 text-sm font-mono">{publisher.publisherId}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={onClose}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Đóng
        </Button>
      </div>
    </div>
  );
}