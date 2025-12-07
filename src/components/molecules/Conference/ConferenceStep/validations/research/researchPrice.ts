import type { Ticket, Phase, ResearchPhase } from "@/types/conference.type";
import type { ValidationResult } from "../basic";

// Validate author ticket phase (must be within registration period)
export const validateAuthorTicketPhase = (
  phase: Phase,
  authorPaymentStart: string, // ✅ Đổi từ registrationStart
  authorPaymentEnd: string     // ✅ Đổi từ registrationEnd
): ValidationResult => {
  if (!authorPaymentStart || !authorPaymentEnd) {
    return {
      isValid: false,
      error: "Không tìm thấy thông tin thời gian thanh toán tác giả (Author Payment)",
    };
  }

  const phaseStart = new Date(phase.startDate);
  const phaseEnd = new Date(phase.endDate);
  const paymentStart = new Date(authorPaymentStart);
  const paymentEnd = new Date(authorPaymentEnd);

  // Phase must start within author payment period
  if (phaseStart < paymentStart || phaseStart > paymentEnd) {
    return {
      isValid: false,
      error: `Chi phí cho tác giả: Giai đoạn "${phase.phaseName}" phải bắt đầu trong thời gian thanh toán tác giả (${paymentStart.toLocaleDateString("vi-VN")} - ${paymentEnd.toLocaleDateString("vi-VN")})`,
    };
  }

  // Phase must end before or on author payment end date
  if (phaseEnd > paymentEnd) {
    return {
      isValid: false,
      error: `Chi phí cho tác giả: Giai đoạn "${phase.phaseName}" phải kết thúc trước ${paymentEnd.toLocaleDateString("vi-VN")}`,
    };
  }

  return { isValid: true };
};
// Validate listener ticket phase (must be within ticket sale period)
export const validateListenerTicketPhase = (
  phase: Phase,
  ticketSaleStart: string,
  ticketSaleEnd: string
): ValidationResult => {
  if (!ticketSaleStart || !ticketSaleEnd) {
    return {
      isValid: false,
      error: "Không tìm thấy thông tin thời gian bán ",
    };
  }

  const phaseStart = new Date(phase.startDate);
  const phaseEnd = new Date(phase.endDate);
  const saleStart = new Date(ticketSaleStart);
  const saleEnd = new Date(ticketSaleEnd);

  // Phase must start within sale period
  if (phaseStart < saleStart || phaseStart > saleEnd) {
    return {
      isValid: false,
      error: `Chi phí người nghe: Giai đoạn "${phase.phaseName}" phải bắt đầu trong thời gian bán (${saleStart.toLocaleDateString("vi-VN")} - ${saleEnd.toLocaleDateString("vi-VN")})`,
    };
  }

  // Phase must end before or on sale end date
  if (phaseEnd > saleEnd) {
    return {
      isValid: false,
      error: `Chi phí người nghe: Giai đoạn "${phase.phaseName}" phải kết thúc trước ${saleEnd.toLocaleDateString("vi-VN")}`,
    };
  }

  return { isValid: true };
};

// Validate ticket with author/listener logic
export const validateResearchTicket = (
  ticket: Omit<Ticket, "ticketId">,
  researchPhases: ResearchPhase[],
  ticketSaleStart: string,
  ticketSaleEnd: string
): ValidationResult => {
  // Basic validation
  if (!ticket.ticketName.trim()) {
    return { isValid: false, error: "Vui lòng nhập tên loại chi phí" };
  }

  if (ticket.ticketPrice <= 0) {
    return { isValid: false, error: "Số tiền loại chi phí phải lớn hơn 0" };
  }

  if (ticket.totalSlot <= 0) {
    return { isValid: false, error: "Số lượng phải lớn hơn 0" };
  }

  if (ticket.phases.length === 0) {
    return { isValid: false, error: "Chi phí tham dự phải có ít nhất 1 giai đoạn giá" };
  }

  // ✅ Lấy phase đầu tiên thay vì tìm !isWaitlist
  const mainPhase = researchPhases[0];

  // Author ticket validation
  if (ticket.isAuthor) {
    // ✅ Đổi sang authorPaymentStart/End
    if (!mainPhase?.authorPaymentStart || !mainPhase?.authorPaymentEnd) {
      return {
        isValid: false,
        error: "Vui lòng điền thông tin Timeline (Author Payment) trước khi thêm chi phí tác giả",
      };
    }

    // Validate each phase
    for (const phase of ticket.phases) {
      const result = validateAuthorTicketPhase(
        phase,
        mainPhase.authorPaymentStart,  // ✅ Đổi từ registrationStartDate
        mainPhase.authorPaymentEnd     // ✅ Đổi từ registrationEndDate
      );
      if (!result.isValid) {
        return result;
      }
    }
  }
  // Listener ticket validation
  else {
    if (!ticketSaleStart || !ticketSaleEnd) {
      return {
        isValid: false,
        error: "Không tìm thấy thông tin thời gian bán vé",
      };
    }

    // Validate each phase
    for (const phase of ticket.phases) {
      const result = validateListenerTicketPhase(phase, ticketSaleStart, ticketSaleEnd);
      if (!result.isValid) {
        return result;
      }
    }
  }

  // Check total phase slots equals ticket total slot
  const totalPhaseSlots = ticket.phases.reduce((sum, p) => sum + p.totalslot, 0);
  if (totalPhaseSlots !== ticket.totalSlot) {
    return {
      isValid: false,
      error: `Tổng số lượng loại chi phí của các giai đoạn (${totalPhaseSlots}) phải bằng số lượng người tham dự (${ticket.totalSlot})`,
    };
  }

  return { isValid: true };
};

// Validate that at least one author ticket exists
export const validateAuthorTicketExists = (tickets: Ticket[]): ValidationResult => {
  const hasAuthorTicket = tickets.some((t) => t.isAuthor === true);

  if (!hasAuthorTicket) {
    return {
      isValid: false,
      error: "Hội nghị nghiên cứu cần có ít nhất một loại chi phí dành cho tác giả",
    };
  }

  return { isValid: true };
};

// Check phase overlap
export const validatePhaseNoOverlap = (
  newPhase: Phase,
  existingPhases: Phase[]
): ValidationResult => {
  const newStart = new Date(newPhase.startDate);
  const newEnd = new Date(newPhase.endDate);

  const hasOverlap = existingPhases.some((p) => {
    const pStart = new Date(p.startDate);
    const pEnd = new Date(p.endDate);
    return newStart <= pEnd && newEnd >= pStart;
  });

  if (hasOverlap) {
    return {
      isValid: false,
      error: "Giai đoạn này bị trùng thời gian với giai đoạn khác",
    };
  }

  return { isValid: true };
};