"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import { formatCurrency, formatDate } from "@/helper/format";
import { toast } from "sonner";
import type { Ticket, Phase, ResearchPhase } from "@/types/conference.type";

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
  reviewFee: number;
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
  numberPaperAccept,
  reviewFee,
}: ResearchPriceFormProps) {
  const [newTicket, setNewTicket] = useState<Omit<Ticket, "ticketId">>({
    ticketPrice: allowListener ? 0 : (reviewFee || 0),
    ticketName: "",
    ticketDescription: "",
    isAuthor: !allowListener,
    totalSlot: 0,
    phases: [], // ✅ Thêm phases vào initial state
  });

  const [editingTicketIndex, setEditingTicketIndex] = useState<number | null>(null);

  const mainPhase = researchPhases[0];
  const authorTimelineStart = mainPhase?.authorPaymentStart || "";
  const authorTimelineEnd = mainPhase?.authorPaymentEnd || "";

  const getUsedAuthorSlots = () => {
    let usedSlots = tickets
      .filter(t => t.isAuthor)
      .reduce((sum, t) => sum + t.totalSlot, 0);
    
    if (editingTicketIndex !== null && tickets[editingTicketIndex]?.isAuthor) {
      usedSlots -= tickets[editingTicketIndex].totalSlot;
    }
    
    return usedSlots;
  };

  const getUsedListenerSlots = () => {
    let usedSlots = tickets
      .filter(t => !t.isAuthor)
      .reduce((sum, t) => sum + t.totalSlot, 0);
    
    if (editingTicketIndex !== null && !tickets[editingTicketIndex]?.isAuthor) {
      usedSlots -= tickets[editingTicketIndex].totalSlot;
    }
    
    return usedSlots;
  };

  const remainingAuthorSlots = numberPaperAccept - getUsedAuthorSlots();
  const remainingListenerSlots = (maxTotalSlot - numberPaperAccept) - getUsedListenerSlots();

  useEffect(() => {
    if (editingTicketIndex === null) {
      setNewTicket((prev) => ({ 
        ...prev, 
        isAuthor: !allowListener,
        ticketPrice: allowListener ? prev.ticketPrice : (reviewFee || prev.ticketPrice)
      }));
    }
  }, [allowListener, reviewFee, editingTicketIndex]);

  const handleAddTicket = () => {
    if (!newTicket.ticketName.trim()) {
      toast.error("Vui lòng nhập tên!");
      return;
    }
    if (newTicket.ticketPrice <= 0) {
      toast.error("Số tiền phải lớn hơn 0!");
      return;
    }

    if (newTicket.isAuthor && newTicket.ticketPrice < reviewFee) {
      toast.error(
        `Chi phí cho tác giả (${newTicket.ticketPrice.toLocaleString()} VND) không được nhỏ hơn phí đánh giá bài báo (${reviewFee.toLocaleString()} VND)!`
      );
      return;
    }

    if (newTicket.totalSlot <= 0) {
      toast.error("Số lượng phải lớn hơn 0!");
      return;
    }

    // Kiểm tra timeline tương ứng
    const timelineStart = newTicket.isAuthor ? authorTimelineStart : ticketSaleStart;
    const timelineEnd = newTicket.isAuthor ? authorTimelineEnd : ticketSaleEnd;

    if (!timelineStart || !timelineEnd) {
      const missingTimeline = newTicket.isAuthor 
        ? "Author Payment (Timeline)" 
        : "Ticket Sale (Bước 1)";
      toast.error(`Vui lòng điền ${missingTimeline} trước!`);
      return;
    }

    if (newTicket.isAuthor) {
      if (newTicket.totalSlot > numberPaperAccept) {
        toast.error(
          `Số lượng cho tác giả (${newTicket.totalSlot}) không được vượt quá số bài báo được chấp nhận (${numberPaperAccept})!`
        );
        return;
      }
    }

    const currentAuthorSlots = tickets
      .filter((t, i) => t.isAuthor && i !== editingTicketIndex)
      .reduce((sum, t) => sum + t.totalSlot, 0);

    const currentListenerSlots = tickets
      .filter((t, i) => !t.isAuthor && i !== editingTicketIndex)
      .reduce((sum, t) => sum + t.totalSlot, 0);

    const totalAuthorSlots = newTicket.isAuthor 
      ? currentAuthorSlots + newTicket.totalSlot 
      : currentAuthorSlots;

    const totalListenerSlots = !newTicket.isAuthor 
      ? currentListenerSlots + newTicket.totalSlot 
      : currentListenerSlots;

    if (!allowListener) {
      if (!newTicket.isAuthor) {
        toast.error("Không cho phép tạo chi phí cho người nghe!");
        return;
      }
      
      if (totalAuthorSlots > numberPaperAccept) {
        toast.error(
          `Tổng số lượng cho tác giả (${totalAuthorSlots}) không được vượt quá số bài báo được chấp nhận (${numberPaperAccept})!`
        );
        return;
      }
    } else {
      const totalSlots = totalAuthorSlots + totalListenerSlots;
      if (totalSlots > maxTotalSlot) {
        toast.error(
          `Tổng số lượng chi phí (${totalSlots}) vượt quá giới hạn ${maxTotalSlot}!`
        );
        return;
      }

      if (totalAuthorSlots > numberPaperAccept) {
        toast.error(
          `Tổng số lượng chi phí cho tác giả (${totalAuthorSlots}) không được vượt quá số bài báo được chấp nhận (${numberPaperAccept})!`
        );
        return;
      }
    }

    // Tự động tạo 1 phase duy nhất
    const autoPhase: Phase = {
      phaseName: "Default Phase",
      applyPercent: 100, // Không tăng/giảm giá
      startDate: timelineStart,
      endDate: timelineEnd,
      totalslot: newTicket.totalSlot,
      refundInPhase: [], // Không có chính sách hoàn tiền
    };

    const ticketWithPhase = {
      ...newTicket,
      phases: [autoPhase],
    };

    if (editingTicketIndex !== null) {
      const updatedTickets = [...tickets];
      updatedTickets[editingTicketIndex] = {
        ...ticketWithPhase,
        ticketId: updatedTickets[editingTicketIndex]?.ticketId,
        priceId: updatedTickets[editingTicketIndex]?.priceId
      };
      onTicketsChange(updatedTickets);
      toast.success("Cập nhật thành công!");
    } else {
      onTicketsChange([...tickets, ticketWithPhase]);
      toast.success("Đã thêm!");
    }

    setNewTicket({
      ticketPrice: allowListener ? 0 : (reviewFee || 0),
      ticketName: "",
      ticketDescription: "",
      isAuthor: !allowListener,
      totalSlot: 0,
      phases: [], // ✅ Reset phases
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
      phases: ticket.phases || [], // ✅ Copy phases từ ticket đang edit
    });
    setEditingTicketIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRemoveTicket = (index: number) => {
    const ticket = tickets[index];
    const updatedList = tickets.filter((_, i) => i !== index);
    onTicketsChange(updatedList);
    
    if (onRemoveTicket && ticket.priceId) {
      onRemoveTicket(ticket.priceId);
    }
    toast.success("Đã xóa!");
  };

  return (
    <div className="space-y-4">
      {/* Ticket List */}
      <div className="border p-4 rounded mb-4">
        <h4 className="font-medium mb-3 text-blue-600">Danh sách đã tạo ({tickets.length})</h4>

        {tickets.map((t, idx) => {
          const phase = t.phases?.[0];
          
          return (
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
                        Tác giả
                      </span>
                    )}
                  </div>
                  {phase && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(phase.startDate)} - {formatDate(phase.endDate)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">
                    {formatCurrency(t.ticketPrice)}
                  </div>
                  <div className="text-xs text-gray-500">Số lượng: {t.totalSlot}</div>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => handleEditTicket(t, idx)} className="flex-1">
                  Sửa
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemoveTicket(idx)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium text-sm py-1.5"
                >
                  Xóa
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Ticket Form */}
      <div className="border p-4 rounded">
        <h4 className="font-medium mb-3">
          {editingTicketIndex !== null ? "Chỉnh sửa" : "Thêm mới"}
        </h4>
        
        {newTicket.isAuthor && reviewFee > 0 && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Lưu ý:</strong> Chi phí cho tác giả phải lớn hơn hoặc bằng phí đánh giá bài báo:{" "}
              <strong className="text-blue-900">{reviewFee.toLocaleString()} VND</strong>
            </div>
          </div>
        )}

        {newTicket.isAuthor && authorTimelineStart && authorTimelineEnd && (
          <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="text-sm text-amber-800">
              <strong>Thời gian thanh toán tác giả:</strong>{" "}
              {formatDate(authorTimelineStart)} – {formatDate(authorTimelineEnd)}
            </div>
          </div>
        )}

        {!newTicket.isAuthor && ticketSaleStart && ticketSaleEnd && (
          <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="text-sm text-amber-800">
              <strong>Thời gian bán vé:</strong>{" "}
              {formatDate(ticketSaleStart)} – {formatDate(ticketSaleEnd)}
            </div>
          </div>
        )}

        <FormInput
          label="Loại phí tham dự"
          value={newTicket.ticketName}
          onChange={(val) => setNewTicket({ ...newTicket, ticketName: val })}
          placeholder="Người nghe, tác giả"
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
              Dành cho tác giả
            </label>
          </div>
        )}

        {!allowListener && (
          <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="text-sm text-amber-800">Chỉ cho phép tạo dành cho tác giả.</div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-2">
          <FormInput
            label={
              newTicket.isAuthor 
                ? `Chi phí gốc (VND) - Tối thiểu: ${reviewFee.toLocaleString("vi-VN")}`
                : "Chi phí thính giả (VND)"
            }
            type="text"
            value={
              newTicket.ticketPrice > 0 
                ? newTicket.ticketPrice.toLocaleString("vi-VN") 
                : ""
            }
            onChange={(val) => {
              const rawValue = val.replace(/\D/g, "");
              const numValue = rawValue === "" ? 0 : Number(rawValue);
              setNewTicket({ ...newTicket, ticketPrice: numValue });
            }}
            placeholder={newTicket.isAuthor ? reviewFee.toLocaleString("vi-VN") : "500.000"}
          />
          <FormInput
            label={
              newTicket.isAuthor
                ? `Số lượng cho tác giả (Còn lại: ${remainingAuthorSlots})`
                : `Số lượng cho người nghe (Còn lại: ${remainingListenerSlots})`
            }         
            type="number"
            value={newTicket.totalSlot}
            onChange={(val) => setNewTicket({ ...newTicket, totalSlot: Number(val) })}
            placeholder="100"
            max={newTicket.isAuthor ? remainingAuthorSlots : remainingListenerSlots}
            min="0"
          />
        </div>

        <Button className="mt-4 w-full" onClick={handleAddTicket}>
          {editingTicketIndex !== null ? "Cập nhật" : "Thêm"}
        </Button>
      </div>
    </div>
  );
}