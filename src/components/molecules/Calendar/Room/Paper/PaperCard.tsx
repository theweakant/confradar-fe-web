// // src/components/molecules/Paper/PaperCard.tsx (cập nhật)
// import React from "react";
// import { FileText, CheckCircle } from "lucide-react";
// import type { AcceptedPaper } from "@/types/paper.type";

// interface PaperCardProps {
//   paper: AcceptedPaper;
//   onClick?: () => void;
//   onAssign?: () => void; // ✅ mới
// }

// const PaperCard: React.FC<PaperCardProps> = ({ paper, onClick, onAssign }) => {
//   return (
//     <div
//       className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer border border-gray-600"
//       onClick={onClick}
//     >
//       <div className="flex items-start gap-3">
//         <FileText className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
//         <div className="flex-1 min-w-0">
//           <h3 className="font-medium text-white truncate">{paper.title}</h3>
//           <p className="text-sm text-gray-300 mt-1 line-clamp-2">
//             {paper.authors?.join(", ") || "Không có tác giả"}
//           </p>
//           <div className="mt-2 flex items-center gap-2">
//             {paper.sessionId ? (
//               <span className="inline-flex items-center gap-1 text-xs bg-green-800 text-green-200 px-2 py-1 rounded">
//                 <CheckCircle className="w-3 h-3" />
//                 Đã gán
//               </span>
//             ) : onAssign ? (
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation(); 
//                   onAssign();
//                 }}
//                 className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded transition-colors"
//               >
//                 Gán vào phiên
//               </button>
//             ) : null}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaperCard;

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
      className="group bg-gray-700 hover:bg-gray-600 cursor-pointer p-3 rounded-lg transition-colors border border-transparent hover:border-green-500 flex items-start gap-3"
    >
      <FileText className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <h4 className="font-medium text-white text-sm leading-tight truncate">
          {paper.title}
        </h4>
        {paper.authorName && (
          <p className="text-xs text-gray-400 truncate mt-1">
            {paper.authorName}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">ID: {paper.paperId}</p>
      </div>
    </div>
  );
};

export default PaperCard;