// components/OtherRequestTab/EmptyState.tsx
import { Info } from "lucide-react";

export function EmptyState() {
  return (
    <div className="text-center py-8 text-gray-500">
      <Info className="w-12 h-12 mx-auto mb-2 text-gray-300" />
      <p>Không có dữ liệu</p>
    </div>
  );
}