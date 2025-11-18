// components/LeftPanel/SecondaryTabNavigation.tsx
import { Check, ChevronRight } from "lucide-react";
import { getFilteredTabs, type TabId } from "../constants/tabConfig";

interface SecondaryTabNavigationProps {
  primaryTab: "detail" | "action";
  activeSubtab: TabId;
  onSubtabChange: (subtab: TabId) => void;
  conferenceType: "technical" | "research" | null;
}

export function SecondaryTabNavigation({
  primaryTab,
  activeSubtab,
  onSubtabChange,
  conferenceType,
}: SecondaryTabNavigationProps) {
  const tabs = getFilteredTabs(primaryTab, conferenceType);
  const completedTabs = 0; // TODO: Track completed tabs in state

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Subtabs{" "}
          <span className="text-gray-500 font-normal">
            {completedTabs}/{tabs.length}
          </span>
        </h3>
      </div>

      {/* Tabs List */}
      <div className="space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubtab === tab.id;
          const isCompleted = false; // TODO: Track completion state

          return (
            <button
              key={tab.id}
              onClick={() => onSubtabChange(tab.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all group ${
                isActive
                  ? "bg-blue-50 border border-blue-200"
                  : "hover:bg-gray-50 border border-transparent"
              }`}
            >
              {/* Checkbox */}
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  isCompleted
                    ? "bg-green-500 border-green-500"
                    : isActive
                    ? "border-blue-500"
                    : "border-gray-300 group-hover:border-blue-400"
                }`}
              >
                {isCompleted && <Check className="w-3 h-3 text-white" />}
              </div>

              {/* Icon */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isActive
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Label */}
              <span
                className={`flex-1 text-left text-sm font-medium ${
                  isActive
                    ? "text-blue-700"
                    : isCompleted
                    ? "text-gray-400 line-through"
                    : "text-gray-900 group-hover:text-blue-600"
                }`}
              >
                {tab.label}
              </span>

              {/* Arrow */}
              {isActive && (
                <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}