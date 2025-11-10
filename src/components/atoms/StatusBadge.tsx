interface StatusBadgeProps {
  status: string;
  variant?:
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "purple"
    | "orange"
    | "teal"
    | "indigo";
}

export function StatusBadge({ status, variant = "success" }: StatusBadgeProps) {
  const variants = {
    success: "bg-green-100 text-green-700 border-green-200",
    danger: "bg-red-100 text-red-700 border-red-200",
    warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
    info: "bg-blue-100 text-blue-700 border-blue-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    teal: "bg-teal-100 text-teal-700 border-teal-200",
    indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${variants[variant]}`}
    >
      {status}
    </span>
  );
}
