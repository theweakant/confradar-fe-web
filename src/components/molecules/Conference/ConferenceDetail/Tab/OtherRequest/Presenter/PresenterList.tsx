// components/OtherRequestTab/Presenter/PresenterList.tsx
import { useState } from "react";
import { User, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "../EmptyState";
import { PresenterCard } from "./PresenterCard";
import { PresenterDetailModal } from "./PresenterDetailModal";
import type { PendingPresenterChangeResponse } from "@/types/assigningpresentersession.type";

interface PresenterListProps {
  requests: PendingPresenterChangeResponse[];
}

const INITIAL_DISPLAY_COUNT = 2;

export function PresenterList({ requests }: PresenterListProps) {
  const [showAll, setShowAll] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PendingPresenterChangeResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const displayedRequests = showAll 
    ? requests 
    : requests.slice(0, INITIAL_DISPLAY_COUNT);
  
  const hasMore = requests.length > INITIAL_DISPLAY_COUNT;

  const handleCardClick = (request: PendingPresenterChangeResponse) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Yêu cầu đổi người trình bày
          </CardTitle>
          <span className="text-sm text-gray-500">{requests.length} yêu cầu</span>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {displayedRequests.map((req) => (
                  <PresenterCard 
                    key={req.presenterChangeRequestId} 
                    request={req}
                    onClick={() => handleCardClick(req)}
                  />
                ))}
              </div>
              
              {hasMore && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAll(!showAll)}
                    className="gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
                  >
                    {showAll ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Thu gọn
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Xem thêm {requests.length - INITIAL_DISPLAY_COUNT} yêu cầu
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <PresenterDetailModal
        request={selectedRequest}
        open={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}