// // components/pages/ConferenceDetailPage/Tab/CreatePricePhaseForm.tsx

// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { formatCurrency } from "@/helper/format";
// import type {
//   ResearchConferencePhaseResponse,
//   ConferencePriceResponse,
//   Phase,
// } from "@/types/conference.type";

// interface CreatePricePhaseFormProps {
//   nextPhase: ResearchConferencePhaseResponse;
//   authorPrices: ConferencePriceResponse[];
//   onSubmit: (payload: { conferencePriceId: string; phases: Phase[] }[]) => Promise<void>;
// }

// export function CreatePricePhaseForm({
//   nextPhase,
//   authorPrices,
//   onSubmit,
// }: CreatePricePhaseFormProps) {
//   const [selectedPriceIds, setSelectedPriceIds] = useState<string[]>(
//     authorPrices.map((p) => p.conferencePriceId)
//   );

//   const handleSubmit = async () => {
//     if (selectedPriceIds.length === 0) {
//       alert("Vui lòng chọn ít nhất một loại vé tác giả.");
//       return;
//     }

//     // ⚠️ Kiểm tra bắt buộc: phase phải có authorPaymentStart/End
//     if (!nextPhase.authorPaymentStart || !nextPhase.authorPaymentEnd) {
//       alert("Phase tiếp theo thiếu ngày thanh toán. Vui lòng kiểm tra lại.");
//       return;
//     }

//     const payload = selectedPriceIds.map((priceId) => {
//       const price = authorPrices.find((p) => p.conferencePriceId === priceId)!;
//       return {
//         conferencePriceId: priceId,
//         phases: [
//           {
//             phaseName: `Default Phase - ${price.ticketName}`,
//             applyPercent: 100,
//             startDate: nextPhase.authorPaymentStart!, // ✅ non-null assertion (đã kiểm tra ở trên)
//             endDate: nextPhase.authorPaymentEnd!,     // ✅
//             totalslot: price.availableSlot || price.totalSlot || 0,
//             refundInPhase: [],
//           },
//         ],
//       };
//     });

//     await onSubmit(payload);
//   };

//   const formatDate = (dateStr: string): string => {
//     return new Date(dateStr).toLocaleDateString("vi-VN", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     });
//   };

//   return (
//     <div className="space-y-5">
//       {/* Info: payment window */}
//       <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
//         <p className="text-sm text-orange-800">
//           <strong>Khoảng thanh toán của Phase {nextPhase.phaseOrder}:</strong>
//           <br />
//           {nextPhase.authorPaymentStart
//             ? formatDate(nextPhase.authorPaymentStart)
//             : "—"}{" "}
//           →{" "}
//           {nextPhase.authorPaymentEnd
//             ? formatDate(nextPhase.authorPaymentEnd)
//             : "—"}
//         </p>
//         <p className="text-xs text-orange-600 mt-2">
//           Price Phase sẽ được tạo tự động trong khoảng thời gian này.
//         </p>
//       </div>

//       {/* Author Prices Selection */}
//       <div>
//         <h4 className="font-medium text-gray-900 mb-3">
//           Chọn loại vé tác giả cần tạo Price Phase:
//         </h4>
//         <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
//           {authorPrices.map((price) => (
//             <label
//               key={price.conferencePriceId}
//               className="flex items-center gap-3 p-2 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
//             >
//               <input
//                 type="checkbox"
//                 checked={selectedPriceIds.includes(price.conferencePriceId)}
//                 onChange={(e) => {
//                   if (e.target.checked) {
//                     setSelectedPriceIds([...selectedPriceIds, price.conferencePriceId]);
//                   } else {
//                     setSelectedPriceIds(
//                       selectedPriceIds.filter((id) => id !== price.conferencePriceId)
//                     );
//                   }
//                 }}
//                 className="w-4 h-4"
//               />
//               <div className="flex-1">
//                 <div className="font-medium">{price.ticketName}</div>
//                 <div className="text-sm text-gray-600">
//                   {formatCurrency(price.ticketPrice)} • Slot: {price.availableSlot}
//                 </div>
//               </div>
//             </label>
//           ))}
//         </div>
//       </div>

//       {/* Submit Button */}
//       <div className="pt-2">
//         <Button onClick={handleSubmit} className="w-full bg-orange-600 hover:bg-orange-700">
//           Tạo Price Phase
//         </Button>
//       </div>
//     </div>
//   );
// }

// components/pages/ConferenceDetailPage/Tab/CreatePricePhaseForm.tsx

"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/helper/format";
import type {
  ResearchConferencePhaseResponse,
  ConferencePriceResponse,
  Phase,
} from "@/types/conference.type";

interface CreatePricePhaseFormProps {
  nextPhase: ResearchConferencePhaseResponse;
  authorPrices: ConferencePriceResponse[];
  onSubmit: (payload: { conferencePriceId: string; phases: Phase[] }[]) => Promise<void>;
}

export function CreatePricePhaseForm({
  nextPhase,
  authorPrices,
  onSubmit,
}: CreatePricePhaseFormProps) {

  const handleSubmit = async () => {
    if (authorPrices.length === 0) {
      alert("Không có loại chi phí tác giả nào để tạo Price Phase.");
      return;
    }

    if (!nextPhase.authorPaymentStart || !nextPhase.authorPaymentEnd) {
      alert("Phase tiếp theo thiếu ngày thanh toán. Vui lòng kiểm tra lại.");
      return;
    }

    const payload = authorPrices.map((price) => {
      return {
        conferencePriceId: price.conferencePriceId,
        phases: [
          {
            phaseName: `Default Phase - ${price.ticketName}`,
            applyPercent: 100,
            startDate: nextPhase.authorPaymentStart!,
            endDate: nextPhase.authorPaymentEnd!,
            totalslot: price.availableSlot || price.totalSlot || 0,
            refundInPhase: [],
          },
        ],
      };
    });

    await onSubmit(payload);
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-5">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <p className="text-sm text-orange-800">
          <strong>Khoảng thanh toán của Phase {nextPhase.phaseOrder}:</strong>
          <br />
          {nextPhase.authorPaymentStart
            ? formatDate(nextPhase.authorPaymentStart)
            : "—"}{" "}
          →{" "}
          {nextPhase.authorPaymentEnd
            ? formatDate(nextPhase.authorPaymentEnd)
            : "—"}
        </p>
        <p className="text-xs text-orange-600 mt-2">
          Price Phase sẽ được tạo tự động cho tất cả loại chi phí tác giả trong khoảng thời gian này.
        </p>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">
          Các loại chi phí tác giả sẽ được tạo Price Phase:
        </h4>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {authorPrices.map((price) => (
            <div
              key={price.conferencePriceId}
              className="flex items-center gap-3 p-3 rounded border border-gray-200 bg-gray-50"
            >
              <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              <div className="flex-1">
                <div className="font-medium">{price.ticketName}</div>
                <div className="text-sm text-gray-600">
                  {formatCurrency(price.ticketPrice)} • Slot: {price.availableSlot || price.totalSlot || 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <Button onClick={handleSubmit} className="w-full bg-orange-600 hover:bg-orange-700">
          Tạo Price Phase cho {authorPrices.length} loại chi phí
        </Button>
      </div>
    </div>
  );
}