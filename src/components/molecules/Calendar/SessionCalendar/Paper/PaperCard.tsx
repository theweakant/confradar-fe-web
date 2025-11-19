// components/PaperCard.tsx
import React from "react";
import { FileText } from "lucide-react";
import type { AcceptedPaper } from "@/types/paper.type";

interface PaperCardProps {
  paper: AcceptedPaper;
  onClick: () => void;
}

const PaperCard: React.FC<PaperCardProps> = ({ paper, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group bg-white hover:bg-blue-50 cursor-pointer p-3 rounded-lg transition-all border border-gray-200 hover:border-blue-400 hover:shadow-sm flex items-start gap-3"
    >
      <div className="mt-0.5">
        <FileText className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-blue-900">
          {paper.title}
        </h4>
        {paper.authorName && (
          <p className="text-xs text-gray-600 truncate mt-1.5">
            {paper.authorName}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1 font-mono">
          {paper.paperId}
        </p>
      </div>
    </div>
  );
};

export default PaperCard;