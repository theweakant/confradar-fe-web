type ValidationRule = {
  validate: (value: string | number) => boolean;
  message: string;
};

type FieldValidation = {
  [key: string]: ValidationRule[];
};

export const validationUserRules: FieldValidation = {
  name: [
    {
      validate: (value) => String(value).trim().length > 0,
      message: "Tên người dùng là bắt buộc"
    },
    {
      validate: (value) => String(value).trim().length >= 2,
      message: "Tên phải có ít nhất 2 ký tự"
    },
    {
      validate: (value) => String(value).trim().length <= 100,
      message: "Tên không được vượt quá 100 ký tự"
    }
  ],
  email: [
    {
      validate: (value) => String(value).trim().length > 0,
      message: "Email là bắt buộc"
    },
    {
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)),
      message: "Email không hợp lệ"
    },
    {
      validate: (value) => String(value).length <= 255,
      message: "Email không được vượt quá 255 ký tự"
    }
  ],
  role: [
    {
      validate: (value) => String(value).trim().length > 0,
      message: "Vai trò là bắt buộc"
    },
    {
      validate: (value) => ["admin", "organizer", "attendee"].includes(String(value)),
      message: "Vai trò không hợp lệ"
    }
  ],
  status: [
    {
      validate: (value) => String(value).trim().length > 0,
      message: "Trạng thái là bắt buộc"
    },
    {
      validate: (value) => ["active", "inactive"].includes(String(value)),
      message: "Trạng thái không hợp lệ"
    }
  ]
};