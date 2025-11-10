interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "blue" | "green" | "red" | "purple" | "orange" | "yellow";
}

export function StatCard({ title, value, icon, color }: StatCardProps) {
  const colors = {
    blue: "text-blue-500",
    green: "text-green-500",
    red: "text-red-500",
    purple: "text-purple-500",
    orange: "text-orange-500",
    yellow: "text-yellow-500",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={colors[color]}>{icon}</div>
      </div>
    </div>
  );
}
