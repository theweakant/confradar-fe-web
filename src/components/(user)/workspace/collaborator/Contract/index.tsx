"use client";

import { useState } from "react";
import {
  FileText,
  DollarSign,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Download,
  Info,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetOwnCollaboratorContractsQuery } from "@/redux/services/contract.service";
import { useAuth } from "@/redux/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function CustomAvatar({
  src,
  alt,
  fallback,
  size = "md",
}: {
  src?: string;
  alt: string;
  fallback: string;
  size?: "sm" | "md" | "lg";
}) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-xl",
  };

  return (
    <Avatar className={`${sizeClasses[size]} flex-shrink-0`}>
      {src && !imgError ? (
        <AvatarImage
          src={src}
          alt={alt}
          onError={() => setImgError(true)}
          className="object-cover"
        />
      ) : null}
      <AvatarFallback
        className={`bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold flex items-center justify-center ${sizeClasses[size]}`}
      >
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
}

export default function CollaboratorContractsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { user } = useAuth();
  const { data, isLoading, error } = useGetOwnCollaboratorContractsQuery();
  const contracts = data?.data || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getTicketSellingConfig = (isTicketSelling: boolean) => {
    if (isTicketSelling) {
      return {
        label: "Liên kết bán vé",
        color: "bg-green-100 text-green-700 border-green-300",
        icon: CheckCircle2,
      };
    }
    return {
      label: "Không bán vé",
      color: "bg-gray-100 text-gray-700 border-gray-300",
      icon: AlertCircle,
    };
  };

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch = contract.conferenceName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "selling" && contract.isTicketSelling) ||
      (filterStatus === "not-selling" && !contract.isTicketSelling);
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải hợp đồng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Không thể tải dữ liệu</h3>
          <p className="text-gray-600">Vui lòng thử lại sau</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Danh sách hợp đồng của đối tác{" "}
              <span className="text-2xl font-normal text-yellow-900">
                {user?.email || "Đang tải..."}
              </span>
            </h1>              
            <p className="text-gray-600 mt-2">Các hợp đồng đã được kí kết với ConfRadar</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent [&>span]:truncate">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="selling">Bán vé</SelectItem>
                    <SelectItem value="not-selling">Không bán vé</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<FileText className="w-5 h-5" />}
            label="Tổng hợp đồng"
            value={contracts.length}
            color="text-blue-600"
          />
          <StatCard
            icon={<CheckCircle2 className="w-5 h-5" />}
            label="Liên kết bán vé"
            value={contracts.filter((c) => c.isTicketSelling).length}
            color=" text-green-600"
          />
          <StatCard
            icon={<AlertCircle className="w-5 h-5" />}
            label="Không bán vé"
            value={contracts.filter((c) => !c.isTicketSelling).length}
            color=" text-amber-600"
          />
          <StatCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Hoa hồng trung bình"
            value={
              contracts.length > 0
                ? `${Math.round(
                    contracts.reduce((sum, c) => sum + c.commission, 0) /
                      contracts.length
                  )}%`
                : "0%"
            }
            color=" text-purple-600"
          />
        </div>

        {filteredContracts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy hợp đồng</h3>
            <p className="text-gray-500">
              {contracts.length === 0
                ? "Bạn chưa có hợp đồng nào"
                : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContracts.map((contract) => {
              const ticketConfig = getTicketSellingConfig(contract.isTicketSelling);
              const TicketIcon = ticketConfig.icon;

              return (
                <div
                  key={contract.collaboratorContractId}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl font-bold text-gray-900 truncate">
                            {contract.conferenceName}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${ticketConfig.color} flex items-center gap-1`}
                          >
                            <TicketIcon className="w-3 h-3" />
                            {ticketConfig.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <CustomAvatar
                              src={contract.conferenceCreatedByAvatarUrl ?? undefined}                              
                              alt={contract.conferenceCreatedByName}
                              fallback={
                                contract.conferenceCreatedByName?.charAt(0).toUpperCase() || "C"
                              }
                              size="sm"
                            />
                            <span className="text-gray-700 font-medium">
                              {contract.conferenceCreatedByName}
                            </span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">
                            {contract.conferenceCreatedByEmail}
                          </span>
                        </div>
                      </div>

                      {contract.contractUrl && (
                        <a
                          href={contract.contractUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-blue-600 rounded-lg transition-colors duration-200"
                          title="Tải hợp đồng"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                      )}
                    </div>

                    <div className="w-64 h-32 bg-gray-100 flex-shrink-0 rounded-lg overflow-hidden">
                      {contract.bannerImageUrl ? (
                        <img
                          src={contract.bannerImageUrl}
                          alt={contract.conferenceName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-full h-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text text-gray-300"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div>`;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4 mt-4 mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
                        <DetailItem
                          label="Hoa hồng"
                          value={`${contract.commission}%`}
                          highlight
                        />
                        <DetailItem
                          label="Ngày kí hợp đồng"
                          value={formatDate(contract.signDay)}
                        />
                        <DetailItem
                          label="Ngày thanh toán hợp đồng"
                          value={formatDate(contract.finalizePaymentDate)}
                        />
                      </div>
                    </div>

                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        Các thông tin được ConfRadar liên kết
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <StepStatus label="Nhà tài trợ" completed={contract.isSponsorStep} />
                        <StepStatus label="Media" completed={contract.isMediaStep} />
                        <StepStatus label="Chính sách" completed={contract.isPolicyStep} />
                        <StepStatus label="Session" completed={contract.isSessionStep} />
                        <StepStatus label="Giá vé" completed={contract.isPriceStep} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? "text-blue-600" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}

function StepStatus({ label, completed }: { label: string; completed: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
          completed ? "bg-green-500" : "bg-red-500"
        }`}
      >
        {completed ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
        ) : (
          <AlertCircle className="w-3.5 h-3.5 text-white" />
        )}
      </div>
      <span className={`text-sm font-medium ${completed ? "text-green-700" : "text-red-700"}`}>
        {label}
      </span>
    </div>
  );
}