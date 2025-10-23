import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { FormSelect } from "@/components/molecules/FormSelect";
import { FormTextArea } from "@/components/molecules/FormTextArea";

export function ResearchConferenceForm({ 
  conference, 
  onSave, 
  onCancel 
}) {
  const [formData, setFormData] = useState({
    conferenceTitle: conference?.conferenceTitle || "",
    conferenceDescription: conference?.conferenceDescription || "",
    startDate: conference?.startDate || "",
    endDate: conference?.endDate || "",
    location: conference?.location || "",
    submissionDeadline: conference?.submissionDeadline || "",
    reviewDeadline: conference?.reviewDeadline || "",
    revisionDeadline: conference?.revisionDeadline || "",
    cameraReadyDeadline: conference?.cameraReadyDeadline || "",
    maxReviewRounds: conference?.maxReviewRounds || 1,
    sessionList: conference?.sessionList || "",
    roomAssignments: conference?.roomAssignments || "",
    conferenceCategoryId: conference?.conferenceCategoryId || "",
    ticketPhases: conference?.ticketPhases || [
      { phase: "Early Bird", price: 0, deadline: "" }
    ],
    presenter: conference?.presenter || "",
    status: conference?.status || "active"
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTicketPhaseChange = (index, field, value) => {
    const updatedPhases = [...formData.ticketPhases];
    updatedPhases[index][field] = value;
    setFormData((prev) => ({ ...prev, ticketPhases: updatedPhases }));
  };

  const addTicketPhase = () => {
    setFormData((prev) => ({
      ...prev,
      ticketPhases: [
        ...prev.ticketPhases,
        { phase: "", price: 0, deadline: "" }
      ]
    }));
  };

  const removeTicketPhase = (index) => {
    const updatedPhases = formData.ticketPhases.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, ticketPhases: updatedPhases }));
  };

  const handleSubmit = () => {
    // Validate chronological order of deadlines
    const dates = {
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      submissionDeadline: new Date(formData.submissionDeadline),
      reviewDeadline: new Date(formData.reviewDeadline),
      revisionDeadline: new Date(formData.revisionDeadline),
      cameraReadyDeadline: new Date(formData.cameraReadyDeadline)
    };

    if (dates.endDate < dates.startDate) {
      alert("Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }

    if (dates.submissionDeadline >= dates.startDate) {
      alert("Deadline nộp bài phải trước ngày bắt đầu hội thảo");
      return;
    }

    if (dates.reviewDeadline <= dates.submissionDeadline) {
      alert("Deadline review phải sau deadline nộp bài");
      return;
    }

    if (dates.revisionDeadline <= dates.reviewDeadline) {
      alert("Deadline chỉnh sửa phải sau deadline review");
      return;
    }

    if (dates.cameraReadyDeadline <= dates.revisionDeadline) {
      alert("Deadline bản cuối cùng phải sau deadline chỉnh sửa");
      return;
    }

    onSave(formData);
  };

  const categoryOptions = [
    { value: "ai-ml", label: "AI & Machine Learning" },
    { value: "data-science", label: "Data Science" },
    { value: "software-eng", label: "Software Engineering" },
    { value: "cybersecurity", label: "Cybersecurity" },
    { value: "blockchain", label: "Blockchain" },
    { value: "iot", label: "Internet of Things" }
  ];

  const statusOptions = [
    { value: "active", label: "Đang hoạt động" },
    { value: "draft", label: "Bản nháp" },
    { value: "completed", label: "Đã hoàn thành" },
    { value: "cancelled", label: "Đã hủy" }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
        <h3 className="font-semibold text-blue-900">Tạo Hội Thảo Nghiên Cứu</h3>
        <p className="text-sm text-blue-700 mt-1">
          Điền thông tin chi tiết cho hội thảo nghiên cứu. Hệ thống sẽ tự động khởi tạo các giai đoạn nộp bài và review.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Information */}
        <div className="md:col-span-2">
          <FormInput
            label="Tên hội thảo"
            name="conferenceTitle"
            value={formData.conferenceTitle}
            onChange={(value) => handleChange("conferenceTitle", value)}
            required
            placeholder="VD: International Conference on AI and Machine Learning 2025"
          />
        </div>

        <div className="md:col-span-2">
          <FormTextArea
            label="Mô tả hội thảo"
            name="conferenceDescription"
            value={formData.conferenceDescription}
            onChange={(value) => handleChange("conferenceDescription", value)}
            required
            placeholder="Mô tả tổng quan về hội thảo, chủ đề, mục tiêu..."
            rows={4}
          />
        </div>

        {/* Dates */}
        <FormInput
          label="Ngày bắt đầu"
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={(value) => handleChange("startDate", value)}
          required
        />

        <FormInput
          label="Ngày kết thúc"
          name="endDate"
          type="date"
          value={formData.endDate}
          onChange={(value) => handleChange("endDate", value)}
          required
        />

        <div className="md:col-span-2">
          <FormInput
            label="Địa điểm"
            name="location"
            value={formData.location}
            onChange={(value) => handleChange("location", value)}
            required
            placeholder="VD: Trung tâm Hội nghị Quốc gia hoặc nền tảng online (Zoom, Teams)"
          />
        </div>

        {/* Deadlines */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">
            Các Mốc Thời Gian Quan Trọng
          </h3>
        </div>

        <FormInput
          label="Deadline nộp bài"
          name="submissionDeadline"
          type="date"
          value={formData.submissionDeadline}
          onChange={(value) => handleChange("submissionDeadline", value)}
          required
        />

        <FormInput
          label="Deadline review"
          name="reviewDeadline"
          type="date"
          value={formData.reviewDeadline}
          onChange={(value) => handleChange("reviewDeadline", value)}
          required
        />

        <FormInput
          label="Deadline chỉnh sửa"
          name="revisionDeadline"
          type="date"
          value={formData.revisionDeadline}
          onChange={(value) => handleChange("revisionDeadline", value)}
          required
        />

        <FormInput
          label="Deadline bản cuối (Camera-ready)"
          name="cameraReadyDeadline"
          type="date"
          value={formData.cameraReadyDeadline}
          onChange={(value) => handleChange("cameraReadyDeadline", value)}
          required
        />

        {/* Review Configuration */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">
            Cấu Hình Review
          </h3>
        </div>

        <FormInput
          label="Số vòng review tối đa"
          name="maxReviewRounds"
          type="number"
          value={formData.maxReviewRounds}
          onChange={(value) => handleChange("maxReviewRounds", Number(value))}
          required
          placeholder="VD: 2"
          min="1"
          max="5"
        />

        {/* Sessions and Rooms */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">
            Phiên Họp & Phòng
          </h3>
        </div>

        <div className="md:col-span-2">
          <FormTextArea
            label="Danh sách phiên họp"
            name="sessionList"
            value={formData.sessionList}
            onChange={(value) => handleChange("sessionList", value)}
            placeholder="VD: Keynote Session, AI Track, ML Track, Poster Session (mỗi phiên một dòng)"
            rows={3}
          />
        </div>

        <div className="md:col-span-2">
          <FormTextArea
            label="Phân bổ phòng"
            name="roomAssignments"
            value={formData.roomAssignments}
            onChange={(value) => handleChange("roomAssignments", value)}
            placeholder="VD: Keynote Session - Hall A, AI Track - Room 101, ML Track - Room 102"
            rows={3}
          />
        </div>

        {/* Category */}
        <div className="md:col-span-2">
          <FormSelect
            label="Danh mục hội thảo"
            name="conferenceCategoryId"
            value={formData.conferenceCategoryId}
            onChange={(value) => handleChange("conferenceCategoryId", value)}
            options={categoryOptions}
            required
          />
        </div>

        {/* Ticket Phases */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">
            Giai Đoạn Vé & Giá
          </h3>
        </div>

        {formData.ticketPhases.map((ticket, index) => (
          <div key={index} className="md:col-span-2 border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-700">Giai đoạn {index + 1}</h4>
              {formData.ticketPhases.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeTicketPhase(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Xóa
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <FormInput
                label="Tên giai đoạn"
                name={`ticketPhase-${index}`}
                value={ticket.phase}
                onChange={(value) => handleTicketPhaseChange(index, "phase", value)}
                placeholder="VD: Early Bird"
              />
              <FormInput
                label="Giá vé (VND)"
                name={`ticketPrice-${index}`}
                type="number"
                value={ticket.price}
                onChange={(value) => handleTicketPhaseChange(index, "price", Number(value))}
                placeholder="VD: 1500000"
                min="0"
              />
              <FormInput
                label="Deadline giai đoạn"
                name={`ticketDeadline-${index}`}
                type="date"
                value={ticket.deadline}
                onChange={(value) => handleTicketPhaseChange(index, "deadline", value)}
              />
            </div>
          </div>
        ))}

        <div className="md:col-span-2">
          <Button
            type="button"
            onClick={addTicketPhase}
            className="text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            + Thêm giai đoạn vé
          </Button>
        </div>

        {/* Presenter */}
        <div className="md:col-span-2">
          <FormInput
            label="Người trình bày (để trống nếu chưa có)"
            name="presenter"
            value={formData.presenter}
            onChange={(value) => handleChange("presenter", value)}
            placeholder="Sẽ được điền sau khi phân công"
          />
        </div>

        {/* Status */}
        <div className="md:col-span-2">
          <FormSelect
            label="Trạng thái"
            name="status"
            value={formData.status}
            onChange={(value) => handleChange("status", value)}
            options={statusOptions}
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Hủy
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {conference ? "Cập nhật hội thảo" : "Tạo hội thảo nghiên cứu"}
        </Button>
      </div>
    </div>
  );
}