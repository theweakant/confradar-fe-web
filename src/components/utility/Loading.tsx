export default function LoadingUI() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent mx-auto" />
        <p className="mt-4 text-gray-600">Đang tải, vui lòng chờ...</p>
      </div>
    </div>
  );
}
