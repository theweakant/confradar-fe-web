import type { LoginFormData, FormErrors } from "@/types/auth.type";

export const validateLoginForm = (data: LoginFormData): FormErrors => {
  const errors: FormErrors = {};

  if (!data.email) {
    errors.email = "Email là bắt buộc";
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = "Vui lòng nhập email hợp lệ";
  }

  if (!data.password) {
    errors.password = "Mật khẩu là bắt buộc";
  } else if (data.password.length < 6) {
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
  }

  return errors;
};
