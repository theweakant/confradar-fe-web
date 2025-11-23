// components/OtherRequestTab/CameraReadyCard.tsx
import { Clock } from "lucide-react";
import { formatDate } from "@/helper/format";
import { renderStatusBadge } from "../utils/utils";

interface CameraReadyRequest {
  id: string;
  title: string;
  authorName: string;
  version: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

interface CameraReadyCardProps {
  request: CameraReadyRequest;
}

export function CameraReadyCard({ request }: CameraReadyCardProps) {
  return (
    <div className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-medium text-gray-900">{request.title}</p>
          <p className="text-sm text-gray-600">
            {request.authorName} • Phiên bản: <span className="font-medium">{request.version}</span>
          </p>
        </div>
        {renderStatusBadge(request.status)}
      </div>

      <div className="flex items-center gap-1 text-xs text-gray-500 pt-3 border-t">
        <Clock className="w-3 h-3" />
        <span>{formatDate(request.submittedAt)}</span>
      </div>
    </div>
  );
}