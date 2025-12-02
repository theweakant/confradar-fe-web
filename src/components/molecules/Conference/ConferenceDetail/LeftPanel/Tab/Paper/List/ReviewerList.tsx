"use client";

import { Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Reviewer } from "@/types/paper.type";

interface ReviewerListProps {
  reviewers: Reviewer[];
}

export function ReviewerList({ reviewers }: ReviewerListProps) {
  return (
    <section className="bg-white rounded-xl p-2">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 inline">
            Danh sách Reviewer
          </h2>
          <span className="text-sm text-gray-500 ml-2">
            ({reviewers.length} người)
          </span>
        </div>
      </div>

      {reviewers.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có reviewer nào được phân công</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviewers.map((reviewer) => (
            <div
              key={reviewer.reviewerId}
              className="relative p-5 border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all duration-200 bg-white"
            >
              <div className="absolute top-3 right-3">
                <div className="bg-transparent border border-gray-500 text-black text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                  {reviewer.assignedPaperCount} bài
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 pr-20">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-lg font-semibold">
                      {reviewer.reviewerName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 text-base">
                      {reviewer.reviewerName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="truncate">#{reviewer.reviewerId}</span>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-3 right-3 flex items-center">
                  <div className="flex -space-x-2">
                    {Array.from(
                      { length: Math.min(reviewer.assignedPaperCount, 5) },
                      (_, i) => {
                        const colors = [
                          "bg-gradient-to-br from-cyan-400 to-cyan-600",
                          "bg-gradient-to-br from-indigo-400 to-indigo-600",
                          "bg-gradient-to-br from-violet-400 to-violet-600",
                          "bg-gradient-to-br from-fuchsia-400 to-fuchsia-600",
                          "bg-gradient-to-br from-amber-400 to-amber-600",
                        ];
                        return (
                          <Avatar key={i} className="w-6 h-6 ring-1 ring-white">
                            <AvatarFallback
                              className={`${colors[i % colors.length]} text-white text-xs font-semibold`}
                            >
                              {i + 1}
                            </AvatarFallback>
                          </Avatar>
                        );
                      }
                    )}
                    {reviewer.assignedPaperCount > 5 && (
                      <Avatar className="w-8 h-8 ring-2 ring-white">
                        <AvatarFallback className="bg-gray-300 text-gray-700 text-xs font-semibold">
                          +{reviewer.assignedPaperCount - 5}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}