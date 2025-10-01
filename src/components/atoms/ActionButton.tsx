interface ActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  variant?: "primary" | "danger" | "secondary" | "success";
  tooltip?: string;
}

export function ActionButton({ onClick, icon, variant = "secondary", tooltip }: ActionButtonProps) {
  const variants = {
    primary: "text-blue-600 hover:bg-blue-50",
    danger: "text-red-600 hover:bg-red-50",
    secondary: "text-gray-600 hover:bg-gray-50",
    success: "text-green-600 hover:bg-green-50"
  };

  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors ${variants[variant]}`}
      title={tooltip}
    >
      {icon}
    </button>
  );
}
