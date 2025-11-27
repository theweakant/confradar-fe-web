// components/molecules/Conference/ConferenceDetail/LeftPanel/Tab/ContractTab.tsx

import { Download, FileText, Calendar, Percent, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TechnicalConferenceDetailResponse } from "@/types/conference.type";

interface ContractTabProps {
  conferenceData: TechnicalConferenceDetailResponse; 
}

export function ContractTab({ conferenceData }: ContractTabProps) {
  const contract = conferenceData.contract;

  if (!contract) {
    return (
      <div className="py-6 text-center text-gray-500">
        Không tìm thấy thông tin hợp đồng.
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderStepStatus = (isCompleted: boolean) => (
    <div className="flex items-center gap-2">
      {isCompleted ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500" />
      )}
      <span className={isCompleted ? "text-green-700" : "text-red-600"}>
        {isCompleted ? "Hoàn thành" : "Chưa hoàn thành"}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">Hợp đồng cộng tác</h2>
      </div>

      {/* Link tải hợp đồng */}
      {contract.contractUrl && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-700" />
              <span className="font-medium text-blue-800">Tệp hợp đồng</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                    if (contract.contractUrl) {
                    window.open(contract.contractUrl, "_blank");
                    }
                }}                
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                <ExternalLink className="w-4 h-4 mr-1" />
                Xem
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <a href={contract.contractUrl} download>
                  <Download className="w-4 h-4 mr-1" />
                  Tải về
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Thông tin cốt lõi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoItem label="Ngày ký hợp đồng" icon={<Calendar className="w-4 h-4" />}>
          {formatDate(contract.signDay)}
        </InfoItem>
        <InfoItem label="Ngày thanh toán hợp đồng" icon={<Calendar className="w-4 h-4" />}>
          {formatDate(contract.finalizePaymentDate)}
        </InfoItem>
        <InfoItem label="Hoa hồng (%)" icon={<Percent className="w-4 h-4" />}>
          {contract.commission}%
        </InfoItem>
        <InfoItem label="Trạng thái hợp đồng">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              contract.isClosed
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {contract.isClosed ? "Đã đóng" : "Đang hiệu lực"}
          </span>
        </InfoItem>
      </div>

      {/* Trạng thái các bước */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-gray-600" />
          Cho phép
        </h3>
        <div className="space-y-3">
          <StepItem label="Nhà tài trợ" status={contract.isSponsorStep} />
          <StepItem label="Media" status={contract.isMediaStep} />
          <StepItem label="Chính sách" status={contract.isPolicyStep} />
          <StepItem label="Session" status={contract.isSessionStep} />
          <StepItem label="Giá vé" status={contract.isPriceStep} />
          <StepItem label="Bán vé hộ" status={contract.isTicketSelling} />
        </div>
      </div>
    </div>
  );
}

// Component con: Hiển thị 1 mục thông tin
function InfoItem({
  label,
  children,
  icon,
}: {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start">
      {icon && <div className="mt-0.5 text-gray-500 mr-2">{icon}</div>}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium">{children}</p>
      </div>
    </div>
  );
}

// Component con: Hiển thị trạng thái bước
function StepItem({ label, status }: { label: string; status: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
      <span className="text-gray-700">{label}</span>
      {status ? (
        <CheckCircle className="w-5 h-5 text-green-600" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500" />
      )}
    </div>
  );
}