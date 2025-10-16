import Link from "next/link";

export default function NotFoundUI() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-800">404 - Page Not Found</h2>
        <p className="mt-2 text-gray-600">Xin lỗi, trang bạn tìm không tồn tại.</p>
        <Link
          href="/"
          className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Quay lại Trang chủ
        </Link>
      </div>
    </div>
  );
}