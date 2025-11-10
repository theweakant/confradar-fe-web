interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({
  message = "Đang xử lý... Vui lòng đợi",
}: LoadingOverlayProps) {
  return (
    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center gap-2">
        <div className="animate-spin h-4 w-4 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
        <p className="text-sm text-yellow-800 font-medium">{message}</p>
      </div>
    </div>
  );
}