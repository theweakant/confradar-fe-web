import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { FormSelect } from "@/components/molecules/FormSelect";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import { validationConfRules } from "@/lib/utils/validationConfRules";
import type {    
  ConferenceFormData, 
  ConferenceFormProps 
} from "@/types/conference.type";

export function TechConferenceForm({ 
  conference, 
  onSave, 
  onCancel
}: ConferenceFormProps) {
  const [formData, setFormData] = useState<ConferenceFormData>({
    conferenceName: conference?.conferenceName || "",
    description: conference?.description || "",
    startDate: conference?.startDate || "",
    endDate: conference?.endDate || "",
    capacity: conference?.capacity || 0,
    address: conference?.address || "",
    bannerImageUrl: conference?.bannerImageUrl || "",
    isInternalHosted: conference?.isInternalHosted ?? true,
    conferenceRanking: conference?.conferenceRanking || "",
    userId: conference?.userId || "",
    city: conference?.city || "",
    country: conference?.country || "",
    conferenceCategoryId: conference?.conferenceCategoryId || "",
    conferenceTypeId: conference?.conferenceTypeId || "tech",
    globalStatus: conference?.globalStatus || "draft",
    isActive: conference?.isActive ?? true,
    createdAt: conference?.createdAt || ""
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ConferenceFormData, string>>>({});
  const [touched, setTouched] = useState<Set<keyof ConferenceFormData>>(new Set());
  
  const [tickets, setTickets] = useState<Array<{
    id: string;
    ticketName: string;
    ticketDescription: string;
    ticketPrice: number;
    actualPrice: number;
    availableQuantity: number;
  }>>([]);
  
  const [isAddingTicket, setIsAddingTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    ticketName: "",
    ticketDescription: "",
    ticketPrice: 0,
    actualPrice: 0,
    availableQuantity: 0
  });

  const handleChange = (
    field: keyof ConferenceFormData, 
    value: string | number | boolean
  ) => {
    setFormData((prev: ConferenceFormData) => ({ ...prev, [field]: value }));
    
    validateField(field, value);
    setTouched((prev: Set<keyof ConferenceFormData>) => new Set(prev).add(field));
  };

  const validateField = (
    field: keyof ConferenceFormData, 
    value: string | number | boolean
  ): boolean => {
    if (typeof value === "boolean") return true;

    if (typeof field !== "string") return true;
    const fieldRules = validationConfRules[field];
    if (!fieldRules) return true;

    for (const rule of fieldRules) {
      if (!rule.validate(value)) {
        setErrors((prev: Partial<Record<keyof ConferenceFormData, string>>) => ({ 
          ...prev, 
          [field]: rule.message 
        }));
        return false;
      }
    }

    setErrors((prev: Partial<Record<keyof ConferenceFormData, string>>) => ({ 
      ...prev, 
      [field]: "" 
    }));
    return true;
  };

  const validate = (): boolean => {
    let isValid = true;
    const allFields = Object.keys(formData) as Array<keyof ConferenceFormData>;
    
    allFields.forEach((field: keyof ConferenceFormData) => {
      if (field === "bannerImageUrl" || field === "userId" || field === "isInternalHosted" || field === "isActive" || field === "createdAt") return;
      
      const fieldValue = formData[field];
      const fieldIsValid = validateField(field, fieldValue);
      
      if (!fieldIsValid) {
        isValid = false;
        setTouched((prev: Set<keyof ConferenceFormData>) => new Set(prev).add(field));
      }
    });

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setErrors((prev: Partial<Record<keyof ConferenceFormData, string>>) => ({ 
        ...prev, 
        endDate: "Ngày kết thúc phải sau ngày bắt đầu" 
      }));
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = () => {
    if (validate()) {
      const submitData = {
        ...formData,
        createdAt: conference?.createdAt || new Date().toISOString(),
        tickets: tickets // Gửi kèm danh sách vé
      };
      onSave(submitData);
    }
  };

  const handleAddTicket = () => {
    if (!newTicket.ticketName || !newTicket.ticketPrice || !newTicket.availableQuantity) {
      alert("Vui lòng điền đầy đủ thông tin vé");
      return;
    }
    
    const ticket = {
      id: `ticket-${Date.now()}`,
      ...newTicket,
      actualPrice: newTicket.actualPrice || newTicket.ticketPrice
    };
    
    setTickets([...tickets, ticket]);
    setNewTicket({
      ticketName: "",
      ticketDescription: "",
      ticketPrice: 0,
      actualPrice: 0,
      availableQuantity: 0
    });
    setIsAddingTicket(false);
  };

  const handleRemoveTicket = (id: string) => {
    setTickets(tickets.filter(t => t.id !== id));
  };

  const handleEditTicket = (id: string) => {
    const ticket = tickets.find(t => t.id === id);
    if (ticket) {
      setNewTicket({
        ticketName: ticket.ticketName,
        ticketDescription: ticket.ticketDescription,
        ticketPrice: ticket.ticketPrice,
        actualPrice: ticket.actualPrice,
        availableQuantity: ticket.availableQuantity
      });
      handleRemoveTicket(id);
      setIsAddingTicket(true);
    }
  };

  const categoryOptions = [
    { value: "ai-ml", label: "AI & Machine Learning" },
    { value: "web-dev", label: "Web Development" },
    { value: "cloud", label: "Cloud Computing" },
    { value: "cybersecurity", label: "Cybersecurity" },
    { value: "data-science", label: "Data Science" },
    { value: "mobile", label: "Mobile Development" }
  ];

  const rankingOptions = [
    { value: "ieee", label: "IEEE" },
    { value: "acm", label: "ACM" },
    { value: "springer", label: "Springer" },
    { value: "elsevier", label: "Elsevier" },
    { value: "scopus", label: "Scopus" },
    { value: "other", label: "Khác" }
  ];

  const globalStatusOptions = [
    { value: "draft", label: "Nháp" },
    { value: "published", label: "Đã xuất bản" },
    { value: "open", label: "Đang mở đăng ký" },
    { value: "closed", label: "Đã đóng đăng ký" },
    { value: "ongoing", label: "Đang diễn ra" },
    { value: "completed", label: "Đã kết thúc" },
    { value: "cancelled", label: "Đã hủy" }
  ];

  const countryOptions = [
    { value: "VN", label: "Việt Nam" },
    { value: "US", label: "United States" },
    { value: "UK", label: "United Kingdom" },
    { value: "SG", label: "Singapore" },
    { value: "JP", label: "Japan" },
    { value: "KR", label: "South Korea" }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* THÔNG TIN CƠ BẢN */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
          Thông tin cơ bản
        </h3>
        <div className="space-y-4">
          <FormInput
            label="Tên hội thảo"
            name="conferenceName"
            value={formData.conferenceName}
            onChange={(value: string) => handleChange("conferenceName", value)}
            onBlur={() => validateField("conferenceName", formData.conferenceName)}
            required
            error={touched.has("conferenceName") ? errors.conferenceName : undefined}
            success={touched.has("conferenceName") && !errors.conferenceName}
            placeholder="VD: International Conference on AI and Machine Learning 2025"
          />

          <FormTextArea
            label="Mô tả"
            name="description"
            value={formData.description}
            onChange={(value: string) => handleChange("description", value)}
            required
            error={errors.description}
            placeholder="Mô tả chi tiết về hội thảo..."
            rows={4}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Ngày bắt đầu"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={(value: string) => handleChange("startDate", value)}
              onBlur={() => validateField("startDate", formData.startDate)}
              required
              error={touched.has("startDate") ? errors.startDate : undefined}
              success={touched.has("startDate") && !errors.startDate}
            />

            <FormInput
              label="Ngày kết thúc"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={(value: string) => handleChange("endDate", value)}
              onBlur={() => validateField("endDate", formData.endDate)}
              required
              error={touched.has("endDate") ? errors.endDate : undefined}
              success={touched.has("endDate") && !errors.endDate}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Danh mục"
              name="conferenceCategoryId"
              value={formData.conferenceCategoryId}
              onChange={(value: string) => handleChange("conferenceCategoryId", value)}
              options={categoryOptions}
              required
              error={errors.conferenceCategoryId}
            />

            <FormSelect
              label="Xếp hạng hội thảo"
              name="conferenceRanking"
              value={formData.conferenceRanking}
              onChange={(value: string) => handleChange("conferenceRanking", value)}
              options={rankingOptions}
              required
              error={errors.conferenceRanking}
            />
          </div>

          <FormInput
            label="Banner Image URL (tùy chọn)"
            name="bannerImageUrl"
            type="url"
            value={formData.bannerImageUrl || ""}
            onChange={(value: string) => handleChange("bannerImageUrl", value)}
            placeholder="https://example.com/banner.jpg"
          />
        </div>
      </div>

      {/* ĐỊA ĐIỂM */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
          Địa điểm
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Quốc gia"
              name="country"
              value={formData.country}
              onChange={(value: string) => handleChange("country", value)}
              options={countryOptions}
              required
              error={errors.country}
            />

            <FormInput
              label="Thành phố"
              name="city"
              value={formData.city}
              onChange={(value: string) => handleChange("city", value)}
              onBlur={() => validateField("city", formData.city)}
              required
              error={touched.has("city") ? errors.city : undefined}
              success={touched.has("city") && !errors.city}
              placeholder="VD: Hồ Chí Minh"
            />
          </div>

          <FormInput
            label="Địa chỉ cụ thể"
            name="address"
            value={formData.address}
            onChange={(value: string) => handleChange("address", value)}
            onBlur={() => validateField("address", formData.address)}
            required
            error={touched.has("address") ? errors.address : undefined}
            success={touched.has("address") && !errors.address}
            placeholder="VD: 227 Nguyễn Văn Cừ, Quận 5"
          />
        </div>
      </div>

      {/* SỨC CHỨA & VÉ */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
          Sức chứa & Vé
        </h3>
        <div className="space-y-6">
          <FormInput
            label="Sức chứa tối đa"
            name="capacity"
            type="number"
            value={formData.capacity}
            onChange={(value: string) => handleChange("capacity", Number(value))}
            onBlur={() => validateField("capacity", formData.capacity)}
            required
            error={touched.has("capacity") ? errors.capacity : undefined}
            success={touched.has("capacity") && !errors.capacity}
            placeholder="VD: 500"
          />

          {/* Ticket List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Danh sách vé ({tickets.length})
              </label>
              <button
                type="button"
                onClick={() => setIsAddingTicket(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <span>+</span> Thêm loại vé
              </button>
            </div>

            {tickets.length > 0 && (
              <div className="space-y-2 mb-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{ticket.ticketName}</h4>
                      <p className="text-sm text-gray-600 mt-1">{ticket.ticketDescription}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-gray-700">
                          Giá: <span className="font-semibold text-blue-600">{ticket.ticketPrice.toLocaleString('vi-VN')} VND</span>
                        </span>
                        {ticket.actualPrice !== ticket.ticketPrice && (
                          <span className="text-gray-500 line-through">
                            {ticket.actualPrice.toLocaleString('vi-VN')} VND
                          </span>
                        )}
                        <span className="text-gray-700">
                          Số lượng: <span className="font-semibold">{ticket.availableQuantity}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditTicket(ticket.id)}
                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveTicket(ticket.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Ticket Form */}
            {isAddingTicket && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-4">
                <h4 className="font-medium text-gray-900">Thêm loại vé mới</h4>
                
                <FormInput
                  label="Tên loại vé"
                  name="ticketName"
                  value={newTicket.ticketName}
                  onChange={(value: string) => setNewTicket({...newTicket, ticketName: value})}
                  placeholder="VD: Vé Early Bird, Vé VIP..."
                  required
                />

                <FormTextArea
                  label="Mô tả vé"
                  name="ticketDescription"
                  value={newTicket.ticketDescription}
                  onChange={(value: string) => setNewTicket({...newTicket, ticketDescription: value})}
                  placeholder="Mô tả các quyền lợi của loại vé này..."
                  rows={2}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormInput
                    label="Giá bán (VND)"
                    name="ticketPrice"
                    type="number"
                    value={newTicket.ticketPrice}
                    onChange={(value: string) => setNewTicket({...newTicket, ticketPrice: Number(value)})}
                    placeholder="0"
                    required
                  />

                  <FormInput
                    label="Giá gốc (VND)"
                    name="actualPrice"
                    type="number"
                    value={newTicket.actualPrice}
                    onChange={(value: string) => setNewTicket({...newTicket, actualPrice: Number(value)})}
                    placeholder="Để trống nếu không có"
                  />

                  <FormInput
                    label="Số lượng"
                    name="availableQuantity"
                    type="number"
                    value={newTicket.availableQuantity}
                    onChange={(value: string) => setNewTicket({...newTicket, availableQuantity: Number(value)})}
                    placeholder="0"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingTicket(false);
                      setNewTicket({
                        ticketName: "",
                        ticketDescription: "",
                        ticketPrice: 0,
                        actualPrice: 0,
                        availableQuantity: 0
                      });
                    }}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleAddTicket}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Thêm vé
                  </button>
                </div>
              </div>
            )}

            {tickets.length === 0 && !isAddingTicket && (
              <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-300">
                Chưa có loại vé nào. Nhấn "Thêm loại vé" để bắt đầu.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TRẠNG THÁI & CÀI ĐẶT */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
          Trạng thái & Cài đặt
        </h3>
        <div className="space-y-4">
          <FormSelect
            label="Trạng thái"
            name="globalStatus"
            value={formData.globalStatus}
            onChange={(value: string) => handleChange("globalStatus", value)}
            options={globalStatusOptions}
            required
            error={errors.globalStatus}
          />

          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleChange("isActive", e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                Kích hoạt hội thảo
              </label>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                id="isInternalHosted"
                checked={formData.isInternalHosted}
                onChange={(e) => handleChange("isInternalHosted", e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="isInternalHosted" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                Tổ chức nội bộ
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="flex justify-end gap-3 pt-4 border-t bg-white p-6 rounded-lg sticky bottom-0 shadow-lg">
        <Button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Hủy
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          {conference ? "Cập nhật" : "Thêm mới"}
        </Button>
      </div>
    </div>
  );
}