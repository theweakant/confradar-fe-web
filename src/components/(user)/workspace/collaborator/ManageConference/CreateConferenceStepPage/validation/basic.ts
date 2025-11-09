 export const validateBasicForm = (): boolean => {
    const saleStart = new Date(basicForm.ticketSaleStart);
    const saleEnd = new Date(basicForm.ticketSaleEnd);
    const eventStart = new Date(basicForm.startDate);

    if (saleStart >= eventStart || saleEnd >= eventStart) {
      toast.error("Hãy chọn ngày bán vé trước ngày bắt đầu sự kiện");
      return false;
    }
    if (!basicForm.conferenceName.trim()) {
      toast.error("Vui lòng nhập tên hội thảo!");
      return false;
    }
    if (!basicForm.startDate || !basicForm.endDate) {
      toast.error("Vui lòng chọn ngày bắt đầu và kết thúc!");
      return false;
    }
    if (!basicForm.conferenceCategoryId) {
      toast.error("Vui lòng chọn danh mục!");
      return false;
    }
    return true;
  };