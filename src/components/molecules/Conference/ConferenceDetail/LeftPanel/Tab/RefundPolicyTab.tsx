"use client";

import { DollarSign, ShieldCheck } from "lucide-react";
import { formatDate } from "@/helper/format";
import type {
  CommonConference,
  RefundPolicyResponse,
  ConferencePolicyResponse,
} from "@/types/conference.type";

interface RefundPolicyTabProps {
  conference: CommonConference;
}

export function RefundPolicyTab({ conference }: RefundPolicyTabProps) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Chính sách hoàn tiền & Quy định
      </h2>

      {/* Refund Policies */}
      <div>
        <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Chính sách hoàn tiền
        </h3>
        {conference.refundPolicies && conference.refundPolicies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {conference.refundPolicies.map(
              (policy: RefundPolicyResponse, index: number) => (
                <div
                  key={index}
                  className="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-sm transition text-sm"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <InfoField
                      label="Thứ tự hoàn tiền"
                      value={policy.refundOrder}
                    />
                    <InfoField
                      label="Tỷ lệ hoàn tiền"
                      value={`${policy.percentRefund ?? 0}%`}
                    />
                    <InfoField
                      label="Hạn hoàn tiền"
                      value={formatDate(policy.refundDeadline)}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            Không có chính sách hoàn tiền
          </p>
        )}
      </div>

      {/* Conference Policies */}
      <div>
        <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          Chính sách
        </h3>
        {conference.policies && conference.policies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {conference.policies.map((policy: ConferencePolicyResponse) => (
              <div
                key={policy.policyId}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-sm transition"
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {policy.policyName}
                  </h4>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {policy.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            Không có quy định
          </p>
        )}
      </div>
    </div>
  );
}

// --- Reusable Helper ---
interface InfoFieldProps {
  label: string;
  value: string | number | boolean | null | undefined;
}

function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-sm text-gray-900 font-semibold break-words">
        {value != null && value !== "" ? String(value) : "N/A"}
      </p>
    </div>
  );
}