"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, Calendar, Clock, ExternalLink } from "lucide-react";

/* =========================
   Types
========================= */
type PaperStatus = "Accepted" | "Rejected" | "Under Review" | "Revision Requested";

interface Paper {
    id: string;
    title: string;
    conference: string;
    submissionDate: string;
    status: PaperStatus;
}

/* =========================
   Reusable PaperCard
========================= */
function PaperCard({ paper }: { paper: Paper }) {
    const statusColors: Record<PaperStatus, string> = {
        "Accepted": "bg-green-600/80 text-white",
        "Rejected": "bg-red-700/80 text-white",
        "Under Review": "bg-yellow-600/80 text-white",
        "Revision Requested": "bg-blue-700/80 text-white",
    };

    return (
        <Card className="overflow-hidden bg-gray-900 border border-gray-800 hover:border-gray-700 hover:shadow-md transition-all">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Left */}
                    <div className="space-y-3">
                        <h2 className="text-xl font-semibold text-white leading-tight">{paper.title}</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <BookOpen className="h-4 w-4" />
                            <span>{paper.conference}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar className="h-4 w-4" />
                            <span>Nộp ngày: {paper.submissionDate}</span>
                        </div>
                        <Badge className={`${statusColors[paper.status]} font-medium`}>
                            {paper.status}
                        </Badge>
                    </div>

                    {/* Right actions */}
                    <div className="flex gap-2 md:flex-col lg:flex-row md:items-end">
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                        >
                            Xem chi tiết
                            <Clock className="h-4 w-4 ml-1" />
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                        >
                            Đến hội nghị
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/* =========================
   Main Component
========================= */
function CustomerPaperList() {
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock API
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setPapers([
                {
                    id: "p1",
                    title: "Ứng dụng Machine Learning trong chẩn đoán y học",
                    conference: "Hội nghị AI Việt Nam 2024",
                    submissionDate: "10/09/2024",
                    status: "Accepted",
                },
                {
                    id: "p2",
                    title: "Blockchain và Hệ thống Quản lý Danh tính Phi tập trung",
                    conference: "Vietnam Blockchain Summit 2024",
                    submissionDate: "15/09/2024",
                    status: "Under Review",
                },
                {
                    id: "p3",
                    title: "Tác động của EdTech tới giáo dục đại học tại Việt Nam",
                    conference: "Hội nghị Giáo dục Số 2024",
                    submissionDate: "25/09/2024",
                    status: "Rejected",
                },
                {
                    id: "p4",
                    title: "Phân tích dữ liệu lớn trong ngành tài chính Việt Nam",
                    conference: "Fintech Research Forum 2024",
                    submissionDate: "01/10/2024",
                    status: "Revision Requested",
                },
            ]);
            setLoading(false);
        }, 500);
    }, []);

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <h1 className="text-3xl sm:text-4xl font-bold">Bài báo đã nộp</h1>
                    </div>
                    <p className="text-gray-400 text-sm sm:text-base">
                        Danh sách các bài nghiên cứu bạn đã nộp cho các hội nghị
                    </p>
                </div>

                {/* Loading */}
                {loading && (
                    <p className="text-gray-400 text-center py-10">Đang tải bài báo...</p>
                )}

                {/* Paper list */}
                {!loading && (
                    <div className="space-y-6">
                        {papers.length > 0 ? (
                            papers.map((paper) => <PaperCard key={paper.id} paper={paper} />)
                        ) : (
                            <div className="text-center py-20">
                                <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                                    Bạn chưa nộp bài báo nào
                                </h3>
                                <p className="text-gray-500">
                                    Hãy tham gia một hội nghị và nộp bài của bạn ngay hôm nay
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CustomerPaperList;
