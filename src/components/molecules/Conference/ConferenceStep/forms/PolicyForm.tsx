"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import { toast } from "sonner";
import type { Policy } from "@/types/conference.type";
import { useStepNavigation } from "../hooks/useStepNavigation";

interface PolicyFormProps {
  policies: Policy[];
  onPoliciesChange: (policies: Policy[]) => void;
  onRemovePolicy?: (policyId: string) => void;
  eventStartDate: string;
  ticketSaleStart: string;
  ticketSaleEnd: string;
}

export function PolicyForm({
  policies,
  onPoliciesChange,
  onRemovePolicy,
  eventStartDate,
  ticketSaleStart,
  ticketSaleEnd,
}: PolicyFormProps) {
  const { currentStep, isStepCompleted, handleUnmarkCompleted } = useStepNavigation();

  const [newPolicy, setNewPolicy] = useState<Policy>({
    policyName: "",
    description: "",
  });

  useEffect(() => {
    if (isStepCompleted(currentStep)) {
      handleUnmarkCompleted(currentStep);
    }
  }, [policies]);

  const handleAddPolicy = () => {
    if (!newPolicy.policyName.trim()) {
      toast.error("Vui lòng nhập tên chính sách!");
      return;
    }
    onPoliciesChange([...policies, newPolicy]);
    setNewPolicy({ policyName: "", description: "" });
    toast.success("Đã thêm chính sách!");
  };

  const handleRemovePolicy = (index: number) => {
    const policy = policies[index];

    const updatedList = policies.filter((_, i) => i !== index);
    onPoliciesChange(updatedList);

    if (onRemovePolicy && policy.policyId) {
      onRemovePolicy(policy.policyId);
    }

    toast.success("Đã xóa chính sách!");
  };
  
  const handleEditPolicy = (policy: Policy, index: number) => {
    setNewPolicy(policy);
    onPoliciesChange(policies.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* General Policies Section */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Chính sách chung (Tùy chọn)</h4>

        <div className="space-y-2 mb-4">
          {policies.length === 0 ? (
            <div className="p-4 bg-gray-50 text-gray-600 rounded-lg text-sm border border-gray-200 text-center">
              Chưa có chính sách nào. Bạn có thể bỏ qua hoặc thêm chính sách mới bên dưới.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              {policies.map((p, idx) => (
                <div
                  key={idx}
                  className="relative bg-white border border-gray-300 rounded-xl p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="font-semibold text-gray-900">{p.policyName}</div>
                    {p.description && <div className="text-sm text-gray-600 mt-1">{p.description}</div>}
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => handleEditPolicy(p, idx)}>
                      Sửa
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleRemovePolicy(idx)}>
                      Xóa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border p-4 rounded space-y-3">
          <h5 className="font-medium">Thêm chính sách chung</h5>
          <FormInput
            label="Tên chính sách"
            value={newPolicy.policyName}
            onChange={(val) => setNewPolicy({ ...newPolicy, policyName: val })}
          />
          <FormTextArea
            label="Mô tả"
            value={newPolicy.description || ""}
            onChange={(val) => setNewPolicy({ ...newPolicy, description: val })}
            rows={3}
          />
          <Button onClick={handleAddPolicy}>Thêm chính sách</Button>
        </div>
      </div>
    </div>
  );
}