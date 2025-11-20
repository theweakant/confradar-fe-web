// components/OtherRequestTab/utils.ts
export const renderStatusBadge = (status: string) => {
  const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
  switch (status.toLowerCase()) {
    case "pending":
      return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Đang chờ</span>;
    case "approved":
      return <span className={`${baseClasses} bg-green-100 text-green-800`}>Đã duyệt</span>;
    case "rejected":
      return <span className={`${baseClasses} bg-red-100 text-red-800`}>Từ chối</span>;
    default:
      return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Không xác định</span>;
  }
};