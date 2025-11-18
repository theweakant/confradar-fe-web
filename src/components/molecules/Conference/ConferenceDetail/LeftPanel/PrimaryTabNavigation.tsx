// components/LeftPanel/PrimaryTabNavigation.tsx
import { TAB_GROUPS } from "../constants/tab";

interface PrimaryTabNavigationProps {
  activeTab: "detail" | "action";
  onTabChange: (tab: "detail" | "action") => void;
}

export function PrimaryTabNavigation({ 
  activeTab, 
  onTabChange 
}: PrimaryTabNavigationProps) {
  return (
    <div className="bg-white rounded-t-xl border-b border-gray-200">
      <div className="flex">
        {TAB_GROUPS.map((group) => {
          const Icon = group.icon;
          const isActive = activeTab === group.id;
          
          return (
            <button
              key={group.id}
              onClick={() => onTabChange(group.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-all border-b-2 ${
                isActive
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{group.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}