// components/OtherRequestTab/CameraReadyList.tsx
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "../EmptyState";
import { CameraReadyCard } from "./CameraReadyCard";

interface CameraReadyRequest {
  id: string;
  title: string;
  authorName: string;
  version: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

interface CameraReadyListProps {
  requests: CameraReadyRequest[];
}

export function CameraReadyList({ requests }: CameraReadyListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Yêu cầu bản in camera-ready
        </CardTitle>
        <span className="text-sm text-gray-500">{requests.length} yêu cầu</span>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <CameraReadyCard key={req.id} request={req} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}