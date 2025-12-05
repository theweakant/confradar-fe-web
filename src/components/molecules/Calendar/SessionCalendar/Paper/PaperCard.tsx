// components/molecules/Calendar/SessionCalendar/Paper/PaperCard.tsx
import React from "react";
import { FileText, CheckCircle } from "lucide-react";
import type { AcceptedPaper } from "@/types/paper.type";

interface PaperCardProps {
  paper: AcceptedPaper;
  onClick: () => void;
  isSelected?: boolean;
}

const PaperCard: React.FC<PaperCardProps> = ({ paper, onClick, isSelected = false }) => {
  return (
    <div
      onClick={onClick}
      className={`
        group cursor-pointer p-3 rounded-lg transition-all border flex items-start gap-3
        ${isSelected 
          ? 'bg-blue-50 border-blue-500 shadow-md ring-2 ring-blue-200' 
          : 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-400 hover:shadow-sm'
        }
      `}
    >
      <div className="mt-0.5">
        {isSelected ? (
          <CheckCircle className="w-4 h-4 text-blue-600" />
        ) : (
          <FileText className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className={`
          font-medium text-sm leading-tight line-clamp-2
          ${isSelected ? 'text-blue-900' : 'text-gray-900 group-hover:text-blue-900'}
        `}>
          {paper.title}
        </h4>
        {paper.authorName && (
          <p className={`
            text-xs truncate mt-1.5
            ${isSelected ? 'text-blue-700' : 'text-gray-600'}
          `}>
            {paper.authorName}
          </p>
        )}
        <p className={`
          text-xs mt-1 font-mono
          ${isSelected ? 'text-blue-500' : 'text-gray-400'}
        `}>
          {paper.paperId}
        </p>
      </div>
      {isSelected && (
        <div className="flex-shrink-0">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
            Đã chọn
          </span>
        </div>
      )}
    </div>
  );
};

export default PaperCard;