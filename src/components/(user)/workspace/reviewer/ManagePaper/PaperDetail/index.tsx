"use client";

import {  FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/helper/format";

interface PaperDeadline {
  id: string;
  title: string;
  conferenceName: string;
  currentRound?: number;
  reviewDeadline?: string;
  cameraReadyDeadline?: string;
  coauthorSaleDeadline?: string;
}

interface PaperDeadlineDetailProps {
  papers?: PaperDeadline[];
  paper?: PaperDeadline;
  onSelect?: (paperId: string) => void;
  onClose?: () => void;
}

export function PaperDeadlineDetail({
  papers: papersProp,
  paper,
  onSelect,
  onClose,
}: PaperDeadlineDetailProps) {
  const papers = papersProp || (paper ? [paper] : []);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600" />
          Paper Deadlines Tracker
        </h2>
        {onClose && (
          <Button
            onClick={onClose}
            className="border border-gray-300 hover:bg-gray-50"
          >
            Đóng
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Paper Title
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Conference Name
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Review Round
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Review Deadline
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Camera Ready Deadline
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Coauthor Sale Deadline
              </th>
              {onSelect && (
                <th className="px-4 py-2 text-sm font-semibold text-gray-700 text-center">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {papers.map((paper) => (
              <tr
                key={paper.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-2 text-gray-900 font-medium">
                  {paper.title}
                </td>
                <td className="px-4 py-2 text-gray-700">
                  {paper.conferenceName}
                </td>
                <td className="px-4 py-2 text-gray-700">
                  {paper.currentRound ? `Round ${paper.currentRound}` : 'N/A'}
                </td>
                <td className="px-4 py-2 text-gray-700">
                  {paper.reviewDeadline ? formatDate(paper.reviewDeadline) : <span className="text-gray-400">N/A</span>}
                </td>
                <td className="px-4 py-2 text-gray-700">
                  {paper.cameraReadyDeadline ? formatDate(paper.cameraReadyDeadline) : <span className="text-gray-400">N/A</span>}
                </td>
                <td className="px-4 py-2 text-gray-700">
                  {paper.coauthorSaleDeadline ? formatDate(paper.coauthorSaleDeadline) : <span className="text-gray-400">N/A</span>}
                </td>
                {onSelect && (
                  <td className="px-4 py-2 text-center">
                    <Button
                      onClick={() => onSelect(paper.id)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      View
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {papers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          No submissions found.
        </div>
      )}
    </div>
  );
}