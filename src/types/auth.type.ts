//types/auth.type
export interface LoginFormData {
  email: string;
  password: string;
}

export interface FormErrors {
  email?: string;
  password?: string;
}

export interface ForgetPasswordData {
  email: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ForgetPasswordResponse {
}

export interface VerifyForgetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface VerifyForgetPasswordResponse {
}
