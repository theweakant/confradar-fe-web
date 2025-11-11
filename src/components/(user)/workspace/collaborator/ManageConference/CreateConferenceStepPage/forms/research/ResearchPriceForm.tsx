import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import { formatCurrency, formatDate } from "@/helper/format";
import { toast } from "sonner";
import type { Ticket, Phase, ResearchPhase } from "@/types/conference.type";

interface ResearchPriceFormProps {
  tickets: Ticket[];
  onTicketsChange: (tickets: Ticket[]) => void;
  ticketSaleStart: string;
  ticketSaleEnd: string;
  researchPhases: ResearchPhase[];
  maxTotalSlot: number;
  onOpenPhaseModal: () => void;
}

export function ResearchPriceForm({
  tickets,
  onTicketsChange,
  ticketSaleStart,
  ticketSaleEnd,
  researchPhases,
  maxTotalSlot,
  onOpenPhaseModal,
}: ResearchPriceFormProps) {
  const [newTicket, setNewTicket] = useState<Omit<Ticket, "ticketId">>({
    ticketPrice: 0,
    ticketName: "",
    ticketDescription: "",
    isAuthor: false,
    totalSlot: 0,
    phases: [],
  });

  const mainPhase = researchPhases.find((p) => !p.isWaitlist);

  const handleAddTicket = () => {
    if (!newTicket.ticketName.trim()) {
      toast.error("Vui lòng nhập tên vé!");
      return;
    }

    if (newTicket.ticketPrice <= 0) {
      toast.error("Giá vé phải lớn hơn 0!");
      return;
    }

    if (newTicket.totalSlot <= 0) {
      toast.error("Số lượng vé phải lớn hơn 0!");
      return;
    }

    // VALIDATION CHO VÉ TÁC GIẢ
    if (newTicket.isAuthor) {
      if (!mainPhase?.registrationStartDate || !mainPhase?.registrationEndDate) {
        toast.error(
          "Vui lòng điền thông tin Timeline (Registration) trước khi thêm vé tác giả!"
        );
        return;
      }

      const regStart = new Date(mainPhase.registrationStartDate);
      const regEnd = new Date(mainPhase.registrationEndDate);

      if (newTicket.phases.length > 0) {
        for (const phase of newTicket.phases) {
          const phaseStart = new Date(phase.startDate);
          const phaseEnd = new Date(phase.endDate);

          if (phaseStart < regStart || phaseEnd > regEnd) {
            toast.error(
              `Vé tác giả phải bán trong thời gian đăng ký (${regStart.toLocaleDateString("vi-VN")} - ${regEnd.toLocaleDateString("vi-VN")}). Giai đoạn "${phase.phaseName}" không hợp lệ!`
            );
            return;
          }
        }
      } else {
        toast.error("Vé tác giả phải có ít nhất 1 giai đoạn giá!");
        return;
      }
    }
    // VALIDATION CHO VÉ NGƯỜI NGHE
    else {
      if (!ticketSaleStart || !ticketSaleEnd) {
        toast.error("Không tìm thấy thông tin thời gian bán vé!");
        return;
      }

      const saleStart = new Date(ticketSaleStart);
      const saleEnd = new Date(ticketSaleEnd);

      if (newTicket.phases.length > 0) {
        for (const phase of newTicket.phases) {
          const phaseStart = new Date(phase.startDate);
          const phaseEnd = new Date(phase.endDate);

          if (phaseStart < saleStart || phaseEnd > saleEnd) {
            toast.error(
              `Vé người nghe phải bán trong thời gian bán vé (${saleStart.toLocaleDateString("vi-VN")} - ${saleEnd.toLocaleDateString("vi-VN")}). Giai đoạn "${phase.phaseName}" không hợp lệ!`
            );
            return;
          }
        }
      } else {
        toast.error("Vé người nghe phải có ít nhất 1 giai đoạn giá!");
        return;
      }
    }

    // Check total slots
    if (newTicket.phases.length > 0) {
      const totalPhaseSlots = newTicket.phases.reduce((sum, p) => sum + p.totalslot, 0);
      if (totalPhaseSlots !== newTicket.totalSlot) {
        toast.error(
          `Tổng số lượng vé các giai đoạn (${totalPhaseSlots}) phải bằng tổng số chỗ ngồi vé (${newTicket.totalSlot})!`
        );
        return;
      }
    }

    onTicketsChange([...tickets, { ...newTicket }]);

    // Reset form
    setNewTicket({
      ticketPrice: 0,
      ticketName: "",
      ticketDescription: "",
      isAuthor: false,
      totalSlot: 0,
      phases: [],
    });

    toast.success("Đã thêm vé!");
  };

  const handleRemoveTicket = (index: number) => {
    onTicketsChange(tickets.filter((_, i) => i !== index));
    toast.success("Đã xóa vé!");
  };

  const handleRemovePhaseFromTicket = (phaseIndex: number) => {
    setNewTicket((prev) => ({
      ...prev,
      phases: prev.phases.filter((_, idx) => idx !== phaseIndex),
    }));
    toast.success("Đã xóa giai đoạn!");
  };

  return (
    <div className="space-y-4">
      {/* Ticket List */}
      <div className="border p-4 rounded mb-4">
        <h4 className="font-medium mb-3 text-blue-600">
          Danh sách vé ({tickets.length})
        </h4>

        {tickets.map((t, idx) => (
          <div
            key={t.ticketId || idx}
            className="border rounded-lg p-4 mb-3 bg-white shadow-sm hover:shadow-md transition-all duration-200"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-3 border-b pb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base text-gray-800">{t.ticketName}</h3>
                  {t.isAuthor && (
                    <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded">
                      Vé tác giả
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDate(t.phases?.[0]?.startDate)} -{" "}
                  {formatDate(t.phases?.[t.phases.length - 1]?.endDate)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">
                  {formatCurrency(t.ticketPrice)}
                </div>
                <div className="text-xs text-gray-500">Số lượng: {t.totalSlot}</div>
              </div>
            </div>

            {/* Phases */}
            {t.phases && t.phases.length > 0 && (
              <div className="mt-2">
                <div className="text-xs font-medium text-gray-600 mb-1.5">
                  Giai đoạn giá ({t.phases.length}):
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {t.phases.map((p, pi) => {
                    const isIncrease = p.applyPercent > 100;
                    const percentDisplay = isIncrease
                      ? `+${p.applyPercent - 100}%`
                      : `-${100 - p.applyPercent}%`;
                    const adjustedPrice = t.ticketPrice * (p.applyPercent / 100);

                    return (
                      <div
                        key={pi}
                        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-md p-2 border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <div className="text-xs font-semibold text-gray-800 mb-1 truncate" title={p.phaseName}>
                          {p.phaseName}
                        </div>
                        <div className="text-[10px] text-gray-500 mb-1 leading-tight">
                          {formatDate(p.startDate)} - {formatDate(p.endDate)}
                        </div>
                        <div className="text-[10px] text-gray-600 mb-1 font-medium">
                          Giá: {formatCurrency(adjustedPrice)}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Tổng: {p.totalslot}</span>
                          <span className={`font-bold ${isIncrease ? "text-red-600" : "text-green-600"}`}>
                            {percentDisplay}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Button */}
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleRemoveTicket(idx)}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium text-sm py-1.5 mt-3"
            >
              Xóa vé
            </Button>
          </div>
        ))}
      </div>

      {/* Add New Ticket Form */}
      <div className="border p-4 rounded">
        <h4 className="font-medium mb-3">Thêm vé mới</h4>

        {/* Registration Timeline Info for Author Tickets */}
        {mainPhase?.registrationStartDate && mainPhase?.registrationEndDate && (
          <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="text-sm text-amber-800">
              <strong>Thời gian đăng ký:</strong> {formatDate(mainPhase.registrationStartDate)} –{" "}
              {formatDate(mainPhase.registrationEndDate)}
            </div>
            <div className="text-xs text-amber-600 mt-1">
              * Vé tác giả phải bán trong khoảng thời gian này
            </div>
          </div>
        )}

        <FormInput
          label="Tên vé"
          value={newTicket.ticketName}
          onChange={(val) => setNewTicket({ ...newTicket, ticketName: val })}
          placeholder="Vé cơ bản, tiêu chuẩn, nâng cao ..."
        />

        <FormTextArea
          label="Mô tả"
          value={newTicket.ticketDescription}
          onChange={(val) => setNewTicket({ ...newTicket, ticketDescription: val })}
          rows={2}
        />

        {/* isAuthor Checkbox */}
        <div className="flex items-center gap-2 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <input
            type="checkbox"
            id="isAuthor"
            checked={newTicket.isAuthor}
            onChange={(e) => setNewTicket({ ...newTicket, isAuthor: e.target.checked })}
            className="w-4 h-4 text-blue-600"
          />
          <label htmlFor="isAuthor" className="text-sm font-medium text-blue-900">
            Đây là vé dành cho tác giả (bắt buộc ít nhất 1 loại)
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <FormInput
            label="Giá vé gốc (VND)"
            type="number"
            value={newTicket.ticketPrice}
            onChange={(val) => setNewTicket({ ...newTicket, ticketPrice: Number(val) })}
            placeholder="500000"
          />
          <FormInput
            label={`Tổng số lượng (Sức chứa: ${maxTotalSlot})`}
            type="number"
            value={newTicket.totalSlot}
            onChange={(val) => setNewTicket({ ...newTicket, totalSlot: Number(val) })}
            placeholder="100"
          />
        </div>

        {/* Phases Section */}
        <div className="mt-4 border-t pt-3">
          <h5 className="font-medium mb-2 flex items-center gap-2">
            Giai đoạn giá ({newTicket.phases.length})
            {newTicket.isAuthor && mainPhase?.registrationStartDate && mainPhase?.registrationEndDate ? (
              <span className="text-sm text-blue-600">
                ({formatDate(mainPhase.registrationStartDate)} → {formatDate(mainPhase.registrationEndDate)})
              </span>
            ) : (
              ticketSaleStart &&
              ticketSaleEnd && (
                <span className="text-sm text-blue-600">
                  ({formatDate(ticketSaleStart)} → {formatDate(ticketSaleEnd)})
                </span>
              )
            )}
          </h5>

          {newTicket.phases.length > 0 ? (
            <div className="mt-2">
              <div className="grid grid-cols-3 gap-2">
                {newTicket.phases.map((p, idx) => {
                  const isIncrease = p.applyPercent > 100;
                  const percentDisplay = isIncrease
                    ? `+${p.applyPercent - 100}%`
                    : `-${100 - p.applyPercent}%`;
                  const adjustedPrice = newTicket.ticketPrice * (p.applyPercent / 100);

                  return (
                    <div
                      key={idx}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-md p-2 border border-gray-200 relative"
                    >
                      <button
                        type="button"
                        onClick={() => handleRemovePhaseFromTicket(idx)}
                        className="absolute top-1 right-1 text-red-500 hover:text-red-700 text-xs font-bold"
                        title="Xóa giai đoạn"
                      >
                        ✕
                      </button>

                      <div className="text-xs font-semibold text-gray-800 mb-1 truncate" title={p.phaseName}>
                        {p.phaseName}
                      </div>
                      <div className="text-[10px] text-gray-500 mb-1 leading-tight">
                        {formatDate(p.startDate)} - {formatDate(p.endDate)}
                      </div>
                      <div className="text-[10px] text-gray-600 mb-1">
                        Giá: {formatCurrency(adjustedPrice)}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">SL: {p.totalslot}</span>
                        <span className={`font-bold ${isIncrease ? "text-red-600" : "text-green-600"}`}>
                          {percentDisplay}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Chưa có giai đoạn nào được thêm.</p>
          )}

          <Button size="sm" onClick={onOpenPhaseModal} className="w-full mt-2" variant="outline">
            Thêm giai đoạn giá
          </Button>
        </div>

        <Button className="mt-4 w-full" onClick={handleAddTicket}>
          Thêm vé
        </Button>
      </div>
    </div>
  );
}