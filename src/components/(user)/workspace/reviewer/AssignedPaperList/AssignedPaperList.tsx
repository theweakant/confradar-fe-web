"use client";

import { useState } from "react";
import {  FileText, Calendar, User, Tag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AssignedPaperList() {
  const [assignedPapers] = useState([
    {
      id: "1",
      title: "Deep Learning Approaches for Natural Language Processing",
      authors: ["John Smith", "Jane Doe"],
      conference: "International Conference on AI 2024",
      track: "Machine Learning",
      submittedDate: "2024-03-15",
      deadline: "2024-04-30",
      status: "pending"
    },
    {
      id: "2",
      title: "Quantum Computing Applications in Cryptography",
      authors: ["Alice Johnson", "Bob Wilson"],
      conference: "Quantum Computing Conference 2024",
      track: "Security",
      submittedDate: "2024-03-20",
      deadline: "2024-05-15",
      status: "pending"
    },
    {
      id: "3",
      title: "Blockchain Technology for Supply Chain Management",
      authors: ["Charlie Brown", "David Lee"],
      conference: "FinTech & AI Conference 2024",
      track: "Blockchain",
      submittedDate: "2024-03-10",
      deadline: "2024-04-20",
      status: "pending"
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          
          <h1 className="text-3xl font-bold text-gray-900">
            Danh sách bài báo đang chờ
          </h1>
        </div>

        <div className="grid gap-6">
          {assignedPapers.map((paper) => (
            <div
              key={paper.id}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {paper.title}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      <span>Tác giả: {paper.authors.join(", ")}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <FileText className="w-4 h-4 mr-2" />
                      <span>{paper.conference}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Tag className="w-4 h-4 mr-2" />
                      <span>Track: {paper.track}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Hạn: {paper.deadline}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      Chờ đánh giá
                    </span>
                    <span className="text-xs text-gray-500">
                      Nộp ngày: {paper.submittedDate}
                    </span>
                  </div>
                </div>
                
                <Link href="/workspace/local-reviewer/manage-paper/assigned-papper-list/review-paper">
                  <Button className="ml-4">
                    Chấp nhận 
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {assignedPapers.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không có bài báo nào
            </h3>
            <p className="text-gray-600">
              Hiện tại bạn chưa được phân công đánh giá bài báo nào
            </p>
          </div>
        )}
      </div>
    </div>
  );
}