"use client";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import { DatePickerInput } from "@/components/atoms/DatePickerInput";
import { formatCurrency, formatDate } from "@/helper/format";
import { toast } from "sonner";
import type { Ticket, Phase, RefundInPhase, ResearchPhase } from "@/types/conference.type";

// ======================
// PhaseModal (giống hệt PriceForm)
// ======================
interface PhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (phase: Phase) => void;
  timelineStart: string;
  timelineEnd: string;
  ticketPrice: number;
  maxSlot: number;
  usedSlots: number;
  editingPhase?: Phase | null;
}

function PhaseModal({
  isOpen,
  onClose,
  onAdd,
  timelineStart,
  timelineEnd,
  ticketPrice,
  maxSlot,
  usedSlots,
  editingPhase,
}: PhaseModalProps) {
  const [phaseData, setPhaseData] = useState({
    phaseName: "",
    percentValue: 0,
    percentType: "increase" as "increase" | "decrease",
    startDate: timelineStart,
    durationInDays: 1,
    totalslot: 0,
  });

  const [refundPolicies, setRefundPolicies] = useState<RefundInPhase[]>([
    { percentRefund: 100, refundDeadline: timelineStart },
  ]);

  const calculateEndDate = (startDate: string, duration: number): string => {
    if (!startDate || duration <= 0) return "";
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + duration - 1);
    return end.toISOString().split("T")[0];
  };

  const maxDuration = useMemo(() => {
    if (!phaseData.startDate) return 1;
    const start = new Date(phaseData.startDate);
    const saleEnd = new Date(timelineEnd);
    const diffTime = saleEnd.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diffDays);
  }, [phaseData.startDate, timelineEnd]);

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
        durationInDays: Math.min(durationInDays, maxDuration),
        totalslot: editingPhase.totalslot,
      });

      const sortedRefunds = [...(editingPhase.refundInPhase || [])].sort(
        (a, b) => new Date(a.refundDeadline).getTime() - new Date(b.refundDeadline).getTime()
      );
      setRefundPolicies(sortedRefunds.length > 0 ? sortedRefunds : [{ percentRefund: 100, refundDeadline: editingPhase.startDate }]);
    }
  }, [editingPhase, maxDuration]);

  useEffect(() => {
    if (isOpen && !editingPhase) {
      setPhaseData({
        phaseName: "",
        percentValue: 0,
        percentType: "increase",
        startDate: timelineStart,
        durationInDays: 1,
        totalslot: 0,
      });
      setRefundPolicies([{ percentRefund: 100, refundDeadline: timelineStart }]);
    }
  }, [isOpen, timelineStart]);

  const handleAddRefund = () => {
    setRefundPolicies([...refundPolicies, { percentRefund: 100, refundDeadline: timelineStart }]);
  };

  const handleRemoveRefund = (index: number) => {
    if (refundPolicies.length <= 1) {
      toast.error("Phải có ít nhất 1 chính sách hoàn tiền!");
      return;
    }
    setRefundPolicies(refundPolicies.filter((_, i) => i !== index));
  };

  const handleUpdateRefund = (index: number, field: keyof RefundInPhase, value: string | number) => {
    const updated = [...refundPolicies];

    // @ts-expect-error thêm message để không lỗi run build
    updated[index][field] = value;
    setRefundPolicies(updated);
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

    const phaseEndDate = calculateEndDate(phaseData.startDate, phaseData.durationInDays);
    for (const refund of refundPolicies) {
      if (!refund.refundDeadline) {
        toast.error("Vui lòng chọn hạn hoàn tiền!");
        return;
      }
      const deadline = new Date(refund.refundDeadline);
      const start = new Date(phaseData.startDate);
      const timelineEndDt = new Date(timelineEnd);

      if (deadline < start) {
        toast.error("Hạn hoàn tiền phải sau ngày bắt đầu giai đoạn!");
        return;
      }
      if (deadline > timelineEndDt) {
        toast.error("Hạn hoàn tiền không được sau ngày kết thúc!");
        return;
      }
    }

    const sortedRefunds = [...refundPolicies].sort(
      (a, b) => new Date(a.refundDeadline).getTime() - new Date(b.refundDeadline).getTime()
    );

    const applyPercent =
      phaseData.percentType === "increase"
        ? 100 + phaseData.percentValue
        : 100 - phaseData.percentValue;

    const phase: Phase = {
      phaseName: phaseData.phaseName,
      applyPercent,
      startDate: phaseData.startDate,
      endDate: phaseEndDate,
      totalslot: phaseData.totalslot,
      refundInPhase: sortedRefunds,
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
            {timelineStart && timelineEnd && (
              <span className="text-sm text-blue-600">
                ({new Date(timelineStart).toLocaleDateString("vi-VN")} →{" "}
                {new Date(timelineEnd).toLocaleDateString("vi-VN")})
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
                    }>
                    {calculatedPrice.toLocaleString()} VND
                  </strong>
                  {" "}({phaseData.percentType === "increase" ? "+" : "-"}{phaseData.percentValue}%)
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
                minDate={timelineStart}
                maxDate={timelineEnd}
                required
              />
            </div>

            <FormInput
              label="Số ngày"
              type="number"
              min="1"
              max={maxDuration}
              value={phaseData.durationInDays}
              onChange={(val) => {
                const numVal = Number(val);
                if (numVal > maxDuration) return;
                setPhaseData({ ...phaseData, durationInDays: numVal });
              }}
            />

            <div>
              <label className="block text-sm font-medium mb-2">Ngày kết thúc</label>
              <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 flex items-center h-[42px]">
                {phaseData.startDate && phaseData.durationInDays > 0 ? (
                  <span className="text-gray-900">
                    {new Date(calculateEndDate(phaseData.startDate, phaseData.durationInDays)).toLocaleDateString("vi-VN")}
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

          {/* Multiple Refund Policies */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-sm text-red-600">Chính sách hoàn tiền</h4>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddRefund}
                className="text-xs"
              >
                + Thêm mức hoàn
              </Button>
            </div>

            <div className="space-y-2">
              {refundPolicies.map((refund, idx) => (
                <div key={idx} className="grid grid-cols-[1fr,1fr,auto] gap-2 items-end">
                  <FormInput
                    label={idx === 0 ? "Tỷ lệ hoàn (%)" : ""}
                    type="number"
                    min="0"
                    max="100"
                    value={refund.percentRefund}
                    onChange={(val) =>
                      handleUpdateRefund(idx, "percentRefund", Number(val))
                    }
                  />
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {idx === 0 ? "Hạn hoàn tiền" : ""}
                    </label>
                    <DatePickerInput
                      value={refund.refundDeadline}
                      onChange={(val) =>
                        handleUpdateRefund(idx, "refundDeadline", val)
                      }
                      minDate={phaseData.startDate}
                      maxDate={timelineEnd}
                      className="text-sm py-1.5"
                    />
                  </div>
                  {refundPolicies.length > 1 && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveRefund(idx)}
                      className="h-[34px] w-[34px] p-0 flex items-center justify-center text-xs"
                      title="Xoá mức hoàn"
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
            </div>
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

// ======================
// ResearchPriceForm (main)
// ======================
interface ResearchPriceFormProps {
  tickets: Ticket[];
  onTicketsChange: (tickets: Ticket[]) => void;
  onRemoveTicket?: (ticketId: string) => void;
  ticketSaleStart: string;
  ticketSaleEnd: string;
  researchPhases: ResearchPhase[];
  maxTotalSlot: number;
  allowListener: boolean; 
  numberPaperAccept: number;
}

export function ResearchPriceForm({
  tickets,
  onTicketsChange,
  onRemoveTicket,
  ticketSaleStart,
  ticketSaleEnd,
  researchPhases,
  maxTotalSlot,
  allowListener,
  numberPaperAccept
}: ResearchPriceFormProps) {
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
  const [editingPhaseIndex, setEditingPhaseIndex] = useState<number | null>(null); 

  const mainPhase = researchPhases.find((p) => !p.isWaitlist);
  const authorTimelineStart = mainPhase?.registrationStartDate || "";
  const authorTimelineEnd = mainPhase?.registrationEndDate || "";

  useEffect(() => {
    if (!allowListener) {
      setNewTicket(prev => ({ ...prev, isAuthor: true }));
    }
  }, [allowListener]);

  // Xác định timeline dựa trên isAuthor
  const currentTimelineStart = newTicket.isAuthor ? authorTimelineStart : ticketSaleStart;
  const currentTimelineEnd = newTicket.isAuthor ? authorTimelineEnd : ticketSaleEnd;

  const handleAddOrUpdatePhase = (phase: Phase) => {
    if (editingPhaseIndex !== null) {
      const updatedPhases = [...newTicket.phases];
      updatedPhases[editingPhaseIndex] = phase;
      setNewTicket({ ...newTicket, phases: updatedPhases });
      toast.success("Đã cập nhật giai đoạn!");
    } else {
      // Thêm phase mới
      setNewTicket({
        ...newTicket,
        phases: [...newTicket.phases, phase],
      });
      toast.success("Đã thêm giai đoạn giá!");
    }
    setIsPhaseModalOpen(false);
    setEditingPhaseIndex(null);
  };

  const handleRemovePhase = (phaseIndex: number) => {
    setNewTicket({
      ...newTicket,
      phases: newTicket.phases.filter((_, i) => i !== phaseIndex),
    });
    toast.success("Đã xóa giai đoạn!");
  };

  const handleEditPhase = (phase: Phase, index: number) => {
    setEditingPhaseIndex(index);
    setIsPhaseModalOpen(true);
  };

  const usedPhaseSlots = newTicket.phases.reduce((sum, p, i) => sum + (i === editingPhaseIndex ? 0 : p.totalslot), 0);

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

    if (newTicket.isAuthor) {
      if (newTicket.totalSlot > numberPaperAccept) {
        toast.error(
          `Số lượng vé tác giả (${newTicket.totalSlot}) không được vượt quá số bài báo được chấp nhận (${numberPaperAccept})!`
        );
        return;
      }
    }
    if (newTicket.isAuthor) {
      if (!authorTimelineStart || !authorTimelineEnd) {
        toast.error("Vui lòng điền Timeline (Registration) trước khi thêm vé tác giả!");
        return;
      }
    } else {
      if (!ticketSaleStart || !ticketSaleEnd) {
        toast.error("Thiếu thông tin thời gian bán vé!");
        return;
      }
    }

    if (newTicket.phases.length > 0) {
      const totalPhaseSlots = newTicket.phases.reduce((sum, p) => sum + p.totalslot, 0);
      if (totalPhaseSlots !== newTicket.totalSlot) {
        toast.error(
          `Tổng slot các giai đoạn (${totalPhaseSlots}) phải bằng tổng slot vé (${newTicket.totalSlot})!`
        );
        return;
      }

      const sortedPhases = [...newTicket.phases].sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

      if (sortedPhases[0].startDate !== currentTimelineStart) {
        toast.error(
          `Giai đoạn đầu tiên phải bắt đầu từ ${formatDate(currentTimelineStart)}`
        );
        return;
      }

      const lastPhase = sortedPhases[sortedPhases.length - 1];
      if (lastPhase.endDate !== currentTimelineEnd) {
        toast.error(
          `Giai đoạn cuối cùng phải kết thúc vào ${formatDate(currentTimelineEnd)}`
        );
        return;
      }

      for (let i = 0; i < sortedPhases.length - 1; i++) {
        const current = sortedPhases[i];
        const next = sortedPhases[i + 1];
        const currentDate = new Date(current.endDate);
        const nextStartDate = new Date(next.startDate);
        const expectedNextDate = new Date(currentDate);
        expectedNextDate.setDate(currentDate.getDate() + 1);

        if (nextStartDate.getTime() !== expectedNextDate.getTime()) {
          toast.error(`Giai đoạn "${current.phaseName}" và "${next.phaseName}" bị đứt quãng hoặc chồng lấn!`);
          return;
        }
      }
    } else {
      toast.error("Phải có ít nhất 1 giai đoạn giá!");
      return;
    }

    if (editingTicketIndex !== null) {
      const updatedTickets = [...tickets];
      updatedTickets[editingTicketIndex] = {
        ...newTicket,
        ticketId: updatedTickets[editingTicketIndex]?.ticketId,
      };
      onTicketsChange(updatedTickets);
      toast.success("Cập nhật vé thành công!");
    } else {
      onTicketsChange([...tickets, { ...newTicket }]);
      toast.success("Đã thêm vé!");
    }

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
    const ticket = tickets[index];
    
    if (onRemoveTicket && ticket.ticketId) {
      onRemoveTicket(ticket.ticketId);
    }

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
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 text-xs">Tổng: {p.totalslot}</span>
                            <span className={`font-bold ${isIncrease ? "text-red-600" : "text-green-600"} text-xs`}>
                              {percentDisplay}
                            </span>
                          </div>
                          {p.refundInPhase?.map((refund, ri) => (
                            <div key={ri} className="text-[10px] text-orange-600 font-medium">
                              Hoàn {refund.percentRefund}% trước {formatDate(refund.refundDeadline)}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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

        {/* Author timeline info */}
        {newTicket.isAuthor && mainPhase?.registrationStartDate && mainPhase?.registrationEndDate && (
          <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="text-sm text-amber-800">
              <strong>Thời gian đăng ký tác giả:</strong>{" "}
              {formatDate(mainPhase.registrationStartDate)} – {formatDate(mainPhase.registrationEndDate)}
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

        {allowListener && (
          <div className="flex items-center gap-2 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <input
              type="checkbox"
              id="isAuthor"
              checked={newTicket.isAuthor}
              onChange={(e) => setNewTicket({ ...newTicket, isAuthor: e.target.checked })}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="isAuthor" className="text-sm font-medium text-blue-900">
              Đây là vé dành cho tác giả
            </label>
          </div>
        )}

        {!allowListener && (
          <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="text-sm text-amber-800">
              ⚠️ Chỉ cho phép tạo vé dành cho tác giả.
            </div>
          </div>
        )}

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

        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between items-center mb-3">
            <h5 className="font-medium text-sm">
              Giai đoạn giá ({newTicket.phases.length}) - Đã dùng: {usedPhaseSlots}/{newTicket.totalSlot}
            </h5>
            <Button
              size="sm"
              onClick={() => {
                setEditingPhaseIndex(null);
                setIsPhaseModalOpen(true);
              }}
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
                      <div className="space-y-0.5">
                        <div className="text-xs">
                          <span className={isIncrease ? "text-red-600" : "text-green-600"}>
                            {percentDisplay}
                          </span>
                          {" → "}
                          <span className="font-medium">{formatCurrency(adjustedPrice)}</span>
                        </div>
                        {phase.refundInPhase?.map((refund, ri) => (
                          <div key={ri} className="text-[10px] text-orange-600 font-medium">
                            Hoàn {refund.percentRefund}% trước {formatDate(refund.refundDeadline)}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditPhase(phase, idx)}
                      >
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemovePhase(idx)}
                      >
                        Xóa
                      </Button>
                    </div>
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
        onClose={() => {
          setIsPhaseModalOpen(false);
          setEditingPhaseIndex(null);
        }}
        onAdd={handleAddOrUpdatePhase}
        timelineStart={currentTimelineStart}
        timelineEnd={currentTimelineEnd}
        ticketPrice={newTicket.ticketPrice}
        maxSlot={newTicket.totalSlot}
        usedSlots={usedPhaseSlots}
        editingPhase={editingPhaseIndex !== null ? newTicket.phases[editingPhaseIndex] : null}
      />
    </div>
  );
}