export const validatePriceStep = (conferenceId, tickets) => {
  if (!conferenceId) {
    toast.error("Không tìm thấy conference ID!");
    return false;
  }
  if (tickets.length === 0) {
    toast.error("Vui lòng thêm ít nhất 1 loại vé!");
    return false;
  }
  return true;
};

export const validatePhase = (newPhase, basicForm, newTicket, editingPhase, tickets) => {
  const { phaseName, percentValue, percentType, startDate, durationInDays, totalslot } = newPhase;
  
  if (!phaseName.trim()) {
    toast.error("Vui lòng nhập tên giai đoạn!");
    return false;
  }
  if (!startDate) {
    toast.error("Vui lòng chọn ngày bắt đầu!");
    return false;
  }
  if (totalslot <= 0) {
    toast.error("Số lượng phải lớn hơn 0!");
    return false;
  }
  
  const saleStart = new Date(basicForm.ticketSaleStart);
  const saleEnd = new Date(basicForm.ticketSaleEnd);
  const phaseStart = new Date(startDate);
  const phaseEnd = new Date(phaseStart);
  phaseEnd.setDate(phaseStart.getDate() + durationInDays - 1);

  if (phaseStart < saleStart || phaseStart > saleEnd) {
    toast.error(`Ngày bắt đầu giai đoạn phải trong khoảng ${saleStart.toLocaleDateString("vi-VN")} - ${saleEnd.toLocaleDateString("vi-VN")}!`);
    return false;
  }
  if (phaseEnd > saleEnd) {
    toast.error(`Ngày kết thúc giai đoạn (${phaseEnd.toLocaleDateString("vi-VN")}) vượt quá thời gian bán vé!`);
    return false;
  }

  // Check overlap logic...
  return true;
};