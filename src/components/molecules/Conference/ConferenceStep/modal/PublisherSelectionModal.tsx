import React, { useState } from "react";
import { X, ExternalLink, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Publisher } from "@/types/publisher.type";

interface PublisherSelectionModalProps {
  open: boolean;
  publishers: Publisher[];
  selectedPublisherId?: string;
  onClose: () => void;
  onSelect: (publisherId: string) => void;
  isLoading?: boolean;
}

export function PublisherSelectionModal({
  open,
  publishers,
  selectedPublisherId,
  onClose,
  onSelect,
  isLoading = false,
}: PublisherSelectionModalProps) {
  const [detailPublisher, setDetailPublisher] = useState<Publisher | null>(null);

  const handleCardClick = (publisher: Publisher) => {
    setDetailPublisher(publisher);
  };

  const handleSelectPublisher = () => {
    if (detailPublisher) {
      onSelect(detailPublisher.publisherId);
      setDetailPublisher(null);
      onClose();
    }
  };

  const handleBack = () => {
    setDetailPublisher(null);
  };

  const handleCloseModal = () => {
    setDetailPublisher(null);
    onClose();
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Đang tải danh sách nhà xuất bản...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleCloseModal}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{detailPublisher ? "Chi tiết nhà xuất bản" : "Chọn nhà xuất bản"}</span>
          </DialogTitle>
        </DialogHeader>

        {/* List View - Grid Cards */}
        {!detailPublisher && (
          <div className="py-4">
            {publishers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">Không có nhà xuất bản nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publishers.map((publisher) => (
                  <div
                    key={publisher.publisherId}
                    onClick={() => handleCardClick(publisher)}
                    className={`
                      relative p-4 border-2 rounded-lg cursor-pointer transition-all
                      hover:shadow-md hover:border-blue-400
                      ${
                        selectedPublisherId === publisher.publisherId
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 bg-white"
                      }
                    `}
                  >
                    {/* Logo */}
                    {publisher.logoUrl && (
                      <div className="flex justify-center mb-3">
                        <img
                          src={publisher.logoUrl}
                          alt={publisher.name}
                          className="h-12 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    {/* Name */}
                    <h3 className="font-semibold text-sm text-gray-900 mb-2 text-center line-clamp-2">
                      {publisher.name}
                    </h3>

                    {/* Paper Format Badge */}
                    <div className="flex justify-center mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {publisher.paperFormat}
                      </Badge>
                    </div>
                    {/* Selected Indicator */}
                    {selectedPublisherId === publisher.publisherId && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Detail View */}
        {detailPublisher && (
          <div className="py-2 space-y-6">
            {/* Header with Logo */}
            <div className="flex items-start gap-6 pb-6 border-b">
              {detailPublisher.logoUrl && (
                <div className="flex-shrink-0">
                  <img
                    src={detailPublisher.logoUrl}
                    alt={detailPublisher.name}
                    className="h-20 max-w-[200px] object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {detailPublisher.name}
                  </h2>
                  <Badge className="bg-green-100 text-green-800 px-2 py-1 text-sm font-medium whitespace-nowrap">
                    {detailPublisher.paperFormat}
                  </Badge>
                </div>

                {/* Dòng ID — căn trái, nhỏ, mờ */}
                <div className="text-xs text-gray-500 mt-1">
                  #{detailPublisher.publisherId}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mô tả
              </label>
              <p className="text-sm text-gray-600 leading-relaxed">
                {detailPublisher.description || "Không có mô tả"}
              </p>
            </div>

            {/* Website URL */}
            {detailPublisher.websiteUrl && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Website
                </label>
                <a
                  href={detailPublisher.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  {detailPublisher.websiteUrl}
                </a>
              </div>
            )}

            {/* Link Template */}
            {detailPublisher.linkTemplate && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Link Template
                </label>
                <a
                  href={detailPublisher.linkTemplate}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  {detailPublisher.linkTemplate}
                </a>
              </div>
              
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleBack} className="flex-1 min-w-0">
                Quay lại
              </Button>
              <Button onClick={handleSelectPublisher} className="flex-1 min-w-0">
                Chọn nhà xuất bản này
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}