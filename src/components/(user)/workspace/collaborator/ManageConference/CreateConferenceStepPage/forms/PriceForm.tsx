import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import { DatePickerInput } from "@/components/atoms/DatePickerInput";
import { formatCurrency, formatDate } from "@/helper/format";
import { toast } from "sonner";
import type { Ticket, Phase } from "@/types/conference.type";

interface PriceFormProps {
  tickets: Ticket[];
  onTicketsChange: (tickets: Ticket[]) => void;
  ticketSaleStart: string;
  ticketSaleEnd: string;
  maxTotalSlot: number;
}

// Phase Modal Component
interface PhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (phase: Phase) => void;
  ticketSaleStart: string;
  ticketSaleEnd: string;
  ticketPrice: number;
  maxSlot: number;
  usedSlots: number;
  editingPhase?: Phase | null;
}

function PhaseModal({
  isOpen,
  onClose,
  onAdd,
  ticketSaleStart,
  ticketSaleEnd,
  ticketPrice,
  maxSlot,
  usedSlots,
  editingPhase,
}: PhaseModalProps) {
  const [phaseData, setPhaseData] = useState({
    phaseName: "",
    percentValue: 0,
    percentType: "increase" as "increase" | "decrease",
    startDate: ticketSaleStart,
    durationInDays: 1,
    totalslot: 0,
  });

  useEffect(() => {
    if (editingPhase) {
      const percentValue =
        editingPhase.applyPercent > 100
          ? editingPhase.applyPercent - 100
          : 100 - editingPhase.applyPercent;
      const percentType = editingPhase.applyPercent > 100 ? "increase" : "decrease";

      const start = new Date(editingPhase.startDate);
      const end = new Date(editingPhase.endDate);
      const durationInDays =
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      setPhaseData({
        phaseName: editingPhase.phaseName,
        percentValue,
        percentType,
        startDate: editingPhase.startDate,
        durationInDays,
        totalslot: editingPhase.totalslot,
      });
    } else {
      // Reset khi không edit
      setPhaseData({
        phaseName: "",
        percentValue: 0,
        percentType: "increase",
        startDate: ticketSaleStart,
        durationInDays: 1,
        totalslot: 0,
      });
    }
  }, [editingPhase, ticketSaleStart]);

  const calculateEndDate = (startDate: string, duration: number): string => {
    if (!startDate || duration <= 0) return "";
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + duration - 1);
    return end.toISOString().split("T")[0];
  };

  const handleAdd = () => {
    if (!phaseData.phaseName.trim()) {
      toast.error("Vui lòng nhập tên giai đoạn!");
      return;
    }
    if (!phaseData.startDate) {
      toast.error("Vui lòng chọn ngày bắt đầu!");
      return;
    }
    if (phaseData.totalslot <= 0) {
      toast.error("Số lượng phải lớn hơn 0!");
      return;
    }

    const remainingSlots = maxSlot - usedSlots;
    if (phaseData.totalslot > remainingSlots) {
      toast.error(`Chỉ còn ${remainingSlots} slot khả dụng!`);
      return;
    }

    const applyPercent =
      phaseData.percentType === "increase"
        ? 100 + phaseData.percentValue
        : 100 - phaseData.percentValue;

    const phase: Phase = {
      phaseName: phaseData.phaseName,
      applyPercent,
      startDate: phaseData.startDate,
      endDate: calculateEndDate(phaseData.startDate, phaseData.durationInDays),
      totalslot: phaseData.totalslot,
    };

    onAdd(phase);
    onClose();
  };

  if (!isOpen) return null;

  const calculatedPrice =
    ticketPrice *
    (phaseData.percentType === "increase"
      ? (100 + phaseData.percentValue) / 100
      : (100 - phaseData.percentValue) / 100);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">
              {editingPhase ? "Chỉnh sửa giai đoạn giá" : "Thêm giai đoạn giá"}
            </h3>
            {ticketSaleStart && ticketSaleEnd && (
              <span className="text-sm text-blue-600">
                ({new Date(ticketSaleStart).toLocaleDateString("vi-VN")} →{" "}
                {new Date(ticketSaleEnd).toLocaleDateString("vi-VN")})
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <FormInput
            label="Tên giai đoạn"
            value={phaseData.phaseName}
            onChange={(val) => setPhaseData({ ...phaseData, phaseName: val })}
            placeholder="Early Bird, Standard, Late..."
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium">Điều chỉnh giá</label>
            <div className="flex items-end gap-3">
              <div className="w-24">
                <FormInput
                  label=""
                  type="number"
                  min="0"
                  max="100"
                  value={phaseData.percentValue}
                  onChange={(val) =>
                    setPhaseData({ ...phaseData, percentValue: Number(val) })
                  }
                  placeholder=""
                />
              </div>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="percentType"
                    value="increase"
                    checked={phaseData.percentType === "increase"}
                    onChange={() =>
                      setPhaseData({ ...phaseData, percentType: "increase" })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-red-600 font-medium">Tăng</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="percentType"
                    value="decrease"
                    checked={phaseData.percentType === "decrease"}
                    onChange={() =>
                      setPhaseData({ ...phaseData, percentType: "decrease" })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-green-600 font-medium">Giảm</span>
                </label>
              </div>
              {ticketPrice > 0 && phaseData.percentValue > 0 && (
                <div className="text-sm bg-gray-50 p-2 rounded">
                  <strong
                    className={
                      phaseData.percentType === "increase"
                        ? "text-red-600"
                        : "text-green-600"
                    }
                  >
                    {calculatedPrice.toLocaleString()} VND
                  </strong>{" "}
                  ({phaseData.percentType === "increase" ? "+" : "-"}
                  {phaseData.percentValue}%)
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <DatePickerInput
                label="Ngày bắt đầu"
                value={phaseData.startDate}
                onChange={(val) => setPhaseData({ ...phaseData, startDate: val })}
                minDate={ticketSaleStart}
                maxDate={ticketSaleEnd}
                required
              />
            </div>

            <FormInput
              label="Số ngày"
              type="number"
              min="1"
              value={phaseData.durationInDays}
              onChange={(val) =>
                setPhaseData({ ...phaseData, durationInDays: Number(val) })
              }
            />

            <div>
              <label className="block text-sm font-medium mb-2">Ngày kết thúc</label>
              <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 flex items-center h-[42px]">
                {phaseData.startDate && phaseData.durationInDays > 0 ? (
                  <span className="text-gray-900">
                    {new Date(
                      calculateEndDate(phaseData.startDate, phaseData.durationInDays)
                    ).toLocaleDateString("vi-VN")}
                  </span>
                ) : (
                  <span className="text-gray-400">--/--/----</span>
                )}
              </div>
            </div>

            <FormInput
              label={`Số lượng (Tối đa: ${maxSlot - usedSlots})`}
              type="number"
              min="1"
              max={maxSlot - usedSlots}
              value={phaseData.totalslot}
              onChange={(val) => setPhaseData({ ...phaseData, totalslot: Number(val) })}
              placeholder={`Còn ${maxSlot - usedSlots}`}
            />
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Hủy
            </Button>
            <Button onClick={handleAdd} className="flex-1">
              {editingPhase ? "Cập nhật" : "Thêm giai đoạn"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PriceForm({
  tickets,
  onTicketsChange,
  ticketSaleStart,
  ticketSaleEnd,
  maxTotalSlot,
}: PriceFormProps) {
  const [newTicket, setNewTicket] = useState<Omit<Ticket, "ticketId">>({
    ticketPrice: 0,
    ticketName: "",
    ticketDescription: "",
    isAuthor: false,
    totalSlot: 0,
    phases: [],
  });

  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [editingTicketIndex, setEditingTicketIndex] = useState<number | null>(null);

  const handleAddPhase = (phase: Phase) => {
    setNewTicket({
      ...newTicket,
      phases: [...newTicket.phases, phase],
    });
    toast.success("Đã thêm giai đoạn giá!");
  };

  const handleRemovePhase = (phaseIndex: number) => {
    setNewTicket({
      ...newTicket,
      phases: newTicket.phases.filter((_, i) => i !== phaseIndex),
    });
    toast.success("Đã xóa giai đoạn!");
  };

  const usedPhaseSlots = newTicket.phases.reduce((sum, p) => sum + p.totalslot, 0);

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

    if (newTicket.phases.length > 0) {
      const totalPhaseSlots = newTicket.phases.reduce((sum, p) => sum + p.totalslot, 0);
      if (totalPhaseSlots !== newTicket.totalSlot) {
        toast.error(
          `Tổng slot các giai đoạn (${totalPhaseSlots}) phải bằng tổng slot vé (${newTicket.totalSlot})!`
        );
        return;
      }
    }

    if (editingTicketIndex !== null) {
      const updatedTickets = [...tickets];
      updatedTickets[editingTicketIndex] = {
        ...newTicket,
        ticketId: updatedTickets[editingTicketIndex]?.ticketId,
        isAuthor: false,
      };
      onTicketsChange(updatedTickets);
      toast.success("Cập nhật vé thành công!");
    } else {
      onTicketsChange([...tickets, { ...newTicket, isAuthor: false }]);
      toast.success("Đã thêm vé!");
    }

    // Reset form
    setNewTicket({
      ticketPrice: 0,
      ticketName: "",
      ticketDescription: "",
      isAuthor: false,
      totalSlot: 0,
      phases: [],
    });
    setEditingTicketIndex(null);
  };

  const handleEditTicket = (ticket: Ticket, index: number) => {
    setNewTicket({
      ticketPrice: ticket.ticketPrice,
      ticketName: ticket.ticketName,
      ticketDescription: ticket.ticketDescription || "",
      isAuthor: ticket.isAuthor ?? false,
      totalSlot: ticket.totalSlot,
      phases: ticket.phases || [],
    });
    setEditingTicketIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRemoveTicket = (index: number) => {
    onTicketsChange(tickets.filter((_, i) => i !== index));
    toast.success("Đã xóa vé!");
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
                <h3 className="font-semibold text-base text-gray-800">{t.ticketName}</h3>
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
                        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-md p-2 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
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

            {/* Action Buttons */}
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" onClick={() => handleEditTicket(t, idx)} className="flex-1">
                Sửa vé
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleRemoveTicket(idx)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium text-sm py-1.5"
              >
                Xóa vé
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Ticket Form */}
      <div className="border p-4 rounded">
        <h4 className="font-medium mb-3">
          {editingTicketIndex !== null ? "Chỉnh sửa vé" : "Thêm vé mới"}
        </h4>
        
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

        <div className="grid grid-cols-2 gap-3 mt-2">
          <FormInput
            label="Giá vé gốc (VND)"
            type="number"
            value={newTicket.ticketPrice}
            onChange={(val) => setNewTicket({ ...newTicket, ticketPrice: Number(val) })}
            placeholder="500000"
          />
          <FormInput
            label={`Tổng số lượng vé (Sức chứa: ${maxTotalSlot})`}
            type="number"
            value={newTicket.totalSlot}
            onChange={(val) => setNewTicket({ ...newTicket, totalSlot: Number(val) })}
            placeholder="100"
          />
        </div>

        {/* Phase Management */}
        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between items-center mb-3">
            <h5 className="font-medium text-sm">
              Giai đoạn giá ({newTicket.phases.length}) - Đã dùng: {usedPhaseSlots}/{newTicket.totalSlot}
            </h5>
            <Button
              size="sm"
              onClick={() => setIsPhaseModalOpen(true)}
              disabled={!newTicket.ticketPrice || !newTicket.totalSlot}
            >
              + Thêm giai đoạn
            </Button>
          </div>

          {newTicket.phases.length > 0 && (
            <div className="space-y-2">
              {newTicket.phases.map((phase, idx) => {
                const isIncrease = phase.applyPercent > 100;
                const percentDisplay = isIncrease
                  ? `+${phase.applyPercent - 100}%`
                  : `-${100 - phase.applyPercent}%`;
                const adjustedPrice = newTicket.ticketPrice * (phase.applyPercent / 100);

                return (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{phase.phaseName}</div>
                      <div className="text-xs text-gray-600">
                        {formatDate(phase.startDate)} - {formatDate(phase.endDate)} | Slot: {phase.totalslot}
                      </div>
                      <div className="text-xs">
                        <span className={isIncrease ? "text-red-600" : "text-green-600"}>
                          {percentDisplay}
                        </span>
                        {" → "}
                        <span className="font-medium">{formatCurrency(adjustedPrice)}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemovePhase(idx)}
                    >
                      Xóa
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Button className="mt-4 w-full" onClick={handleAddTicket}>
          {editingTicketIndex !== null ? "Cập nhật vé" : "Thêm vé"}
        </Button>
      </div>

      {/* Phase Modal */}
      <PhaseModal
        isOpen={isPhaseModalOpen}
        onClose={() => setIsPhaseModalOpen(false)}
        onAdd={handleAddPhase}
        ticketSaleStart={ticketSaleStart}
        ticketSaleEnd={ticketSaleEnd}
        ticketPrice={newTicket.ticketPrice}
        maxSlot={newTicket.totalSlot}
        usedSlots={usedPhaseSlots}
        editingPhase={null}
      />
    </div>
  );
}