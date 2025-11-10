import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import { formatDate } from "@/helper/format";
import { toast } from "sonner";
import type { Policy, RefundPolicy } from "@/types/conference.type";

interface PolicyFormProps {
  policies: Policy[];
  refundPolicies: RefundPolicy[];
  onPoliciesChange: (policies: Policy[]) => void;
  onRefundPoliciesChange: (refundPolicies: RefundPolicy[]) => void;
  eventStartDate: string;
  ticketSaleStart: string;
  ticketSaleEnd: string;
}

export function PolicyForm({
  policies,
  refundPolicies,
  onPoliciesChange,
  onRefundPoliciesChange,
  eventStartDate,
  ticketSaleStart,
  ticketSaleEnd,
}: PolicyFormProps) {
  const [newPolicy, setNewPolicy] = useState<Policy>({
    policyName: "",
    description: "",
  });

  const [newRefundPolicy, setNewRefundPolicy] = useState<Omit<RefundPolicy, "refundPolicyId">>({
    percentRefund: 0,
    refundDeadline: "",
    refundOrder: 1,
  });

  const handleAddPolicy = () => {
    if (!newPolicy.policyName) {
      toast.error("Vui lòng nhập tên chính sách!");
      return;
    }
    onPoliciesChange([...policies, newPolicy]);
    setNewPolicy({ policyName: "", description: "" });
    toast.success("Đã thêm chính sách!");
  };

  const handleRemovePolicy = (index: number) => {
    onPoliciesChange(policies.filter((_, i) => i !== index));
    toast.success("Đã xóa chính sách!");
  };

  const handleEditPolicy = (policy: Policy, index: number) => {
    setNewPolicy(policy);
    onPoliciesChange(policies.filter((_, i) => i !== index));
  };

  const handleAddRefundPolicy = () => {
    if (newRefundPolicy.percentRefund <= 0 || newRefundPolicy.percentRefund > 100) {
      toast.error("Phần trăm hoàn tiền phải từ 1-100%!");
      return;
    }

    if (!newRefundPolicy.refundDeadline) {
      toast.error("Vui lòng chọn hạn hoàn tiền!");
      return;
    }

    if (!eventStartDate) {
      toast.error("Không tìm thấy thông tin thời gian sự kiện!");
      return;
    }

    const deadline = new Date(newRefundPolicy.refundDeadline);
    const eventStart = new Date(eventStartDate);

    if (deadline >= eventStart) {
      toast.error("Hạn hoàn tiền phải trước ngày bắt đầu sự kiện!");
      return;
    }

    // Check duplicate order
    const existingOrder = refundPolicies.find((p) => p.refundOrder === newRefundPolicy.refundOrder);
    if (existingOrder) {
      toast.error("Thứ tự này đã tồn tại!");
      return;
    }

    onRefundPoliciesChange([...refundPolicies, newRefundPolicy]);
    setNewRefundPolicy({
      percentRefund: 0,
      refundDeadline: "",
      refundOrder: refundPolicies.length + 1,
    });
    toast.success("Đã thêm chính sách hoàn tiền!");
  };

  const handleRemoveRefundPolicy = (index: number) => {
    onRefundPoliciesChange(refundPolicies.filter((_, i) => i !== index));
    toast.success("Đã xóa chính sách hoàn tiền!");
  };

  const handleEditRefundPolicy = (policy: RefundPolicy, index: number) => {
    setNewRefundPolicy(policy);
    onRefundPoliciesChange(refundPolicies.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* General Policies Section */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">A. Chính sách chung (Tùy chọn)</h4>

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

      {/* Refund Policies Section */}
      {/* <div className="border-t pt-6">
        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
          B. Chính sách hoàn tiền (Tùy chọn)
          {eventStartDate && (
            <span className="text-sm text-blue-600">
              (Trước ngày {new Date(eventStartDate).toLocaleDateString("vi-VN")})
              (Trong thời gian bán vé {new Date(ticketSaleStart).toLocaleDateString("vi-VN")} -{" "}
              {new Date(ticketSaleEnd).toLocaleDateString("vi-VN")})
            </span>
          )}
        </h4>

        <div className="space-y-2 mb-4">
          {refundPolicies.length === 0 ? (
            <div className="p-4 bg-gray-50 text-gray-600 rounded-lg text-sm border border-gray-200 text-center">
              Chưa có chính sách hoàn tiền nào. Bạn có thể bỏ qua hoặc thêm mới bên dưới.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-3">
              {refundPolicies
                .sort((a, b) => a.refundOrder - b.refundOrder)
                .map((rp, idx) => (
                  <div
                    key={idx}
                    className="relative bg-white border border-gray-300 rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-black px-2 py-0.5 rounded text-xs font-semibold">
                          #{rp.refundOrder}
                        </span>
                        <span className="text-blue-700 font-semibold">Hoàn trả {rp.percentRefund}%</span>
                      </div>
                      <div className="text-sm text-gray-700">
                        Trước ngày: <strong>{formatDate(rp.refundDeadline)}</strong>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => handleEditRefundPolicy(rp, idx)}>
                        Sửa
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleRemoveRefundPolicy(idx)}>
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="border p-4 rounded space-y-3 bg-gray-50">
          <h5 className="font-medium">Thêm chính sách hoàn tiền mới</h5>

          <div className="grid grid-cols-3 gap-3">
            <FormInput
              label="Thứ tự"
              type="number"
              min="1"
              value={newRefundPolicy.refundOrder}
              onChange={(val) => setNewRefundPolicy({ ...newRefundPolicy, refundOrder: Number(val) })}
              placeholder="1, 2, 3..."
            />

            <FormInput
              label="% Hoàn tiền"
              type="number"
              min="1"
              max="100"
              value={newRefundPolicy.percentRefund}
              onChange={(val) => setNewRefundPolicy({ ...newRefundPolicy, percentRefund: Number(val) })}
              placeholder="VD: 80"
            />

            <FormInput
              label="Hạn hoàn tiền"
              type="date"
              min={ticketSaleStart || undefined}
              max={ticketSaleEnd || undefined}
              value={newRefundPolicy.refundDeadline}
              onChange={(val) => setNewRefundPolicy({ ...newRefundPolicy, refundDeadline: val })}
            />
          </div>

          <div className="text-xs text-gray-600 bg-white p-2 rounded">
            <strong>Ví dụ:</strong> Hoàn 80% nếu hủy trước 7 ngày, 50% nếu hủy trước 3 ngày, 0% nếu hủy trong
            24h.
          </div>

          <Button onClick={handleAddRefundPolicy} className="w-full">
            + Thêm chính sách hoàn tiền
          </Button>
        </div>
      </div> */}
    </div>
  );
}