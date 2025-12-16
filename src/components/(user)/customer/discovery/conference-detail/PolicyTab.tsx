import React from "react";
import {
  ResearchConferenceDetailResponse,
  TechnicalConferenceDetailResponse,
} from "@/types/conference.type";
import { Shield, DollarSign, FileText } from "lucide-react";

interface PolicyTabProps {
  conference:
  | TechnicalConferenceDetailResponse
  | ResearchConferenceDetailResponse;
}

const PolicyTab: React.FC<PolicyTabProps> = ({ conference }) => {
  const policies = conference.policies || [];
  // Both technical and research conferences can have refund policies
  const refundPolicies = conference.refundPolicies || [];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Chính sách
      </h2>

      {/* Policies Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">
            Chính sách & Quy định
          </h3>
        </div>
        {policies.length > 0 ? (
          <div className="space-y-4">
            {policies.map((policy) => (
              <div
                key={policy.policyId}
                className="bg-gray-50 rounded-lg p-6 border border-gray-200"
              >
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                      {policy.policyName || "Chính sách chưa đặt tên"}
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {policy.description || "Chưa có mô tả cho chính sách này"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600 py-8 bg-gray-50 rounded-lg border border-gray-200">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-lg">
              Chưa có thông tin về chính sách và quy định
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Thông tin chính sách sẽ được cập nhật sớm
            </p>
          </div>
        )}
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-yellow-800 mb-1">
              Lưu ý quan trọng
            </h4>
            <p className="text-gray-700 text-sm">
              Vui lòng đọc kỹ các chính sách trước khi đăng ký tham gia hội
              nghị. Mọi thắc mắc về chính sách và điều khoản hoàn tiền, xin liên
              hệ ban tổ chức để được hỗ trợ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyTab;