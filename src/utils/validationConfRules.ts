// src/lib/validationConfRules.ts


export type ValidationRule = {
  validate: (value: string | number) => boolean;
  message: string;
};

// Cho phép thêm cả các field tùy chọn ngoài ConferenceFormData
export type FieldValidation = {
  [key: string]: ValidationRule[];
};

export const validationConfRules: FieldValidation = {
  conferenceName: [
    {
      validate: (value) => String(value).trim().length > 0,
      message: "Tiêu đề hội thảo là bắt buộc",
    },
    {
      validate: (value) => String(value).trim().length >= 5,
      message: "Tiêu đề phải có ít nhất 5 ký tự",
    },
  ],
  description: [
    {
      validate: (value) => String(value).trim().length > 0,
      message: "Mô tả là bắt buộc",
    },
    {
      validate: (value) => String(value).trim().length >= 20,
      message: "Mô tả phải có ít nhất 20 ký tự",
    },
  ],
  startDate: [
    {
      validate: (value) => String(value).length > 0,
      message: "Ngày bắt đầu là bắt buộc",
    },
  ],
  endDate: [
    {
      validate: (value) => String(value).length > 0,
      message: "Ngày kết thúc là bắt buộc",
    },
  ],
  locationId: [
    {
      validate: (value) => String(value).trim().length > 0,
      message: "Địa điểm là bắt buộc",
    },
  ],
  registrationDeadline: [
    {
      validate: (value) => String(value).length > 0,
      message: "Hạn đăng ký là bắt buộc",
    },
  ],
  maxAttendees: [
    {
      validate: (value) => Number(value) > 0,
      message: "Số lượng người tham dự phải lớn hơn 0",
    },
  ],
  organizerName: [
    {
      validate: (value) => String(value).trim().length > 0,
      message: "Tên người tổ chức là bắt buộc",
    },
  ],
  organizerEmail: [
    {
      validate: (value) => String(value).trim().length > 0,
      message: "Email người tổ chức là bắt buộc",
    },
    {
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)),
      message: "Email không hợp lệ",
    },
  ],
};
