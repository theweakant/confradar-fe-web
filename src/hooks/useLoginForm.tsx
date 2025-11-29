import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/redux/hooks/useAuth";
import { useFirebaseLogin } from "@/hooks/useFirebaseLogin";
import { validateLoginForm } from "@/helper/validation";
import { getRoleForRedirect, getRouteByRole } from "@/constants/roles";
import type { LoginFormData, FormErrors } from "@/types/auth.type";
import { toast } from "sonner";

export const useLoginForm = () => {
  const router = useRouter();
  const { login, loading } = useAuth();
  const { handleGoogleLogin } = useFirebaseLogin();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const { success, user, message } = await login({
      email: formData.email,
      password: formData.password,
    });

    if (success && user) {
      toast.success("Đăng nhập thành công!", {
        description: `Chào mừng ${user.email}`,
      });

      const roleToUse = getRoleForRedirect(user.role);

      const redirectUrl = getRouteByRole(roleToUse ?? "");
      router.push(redirectUrl);
    } else {
      toast.error("Đăng nhập thất bại!", {
        description: message || 'Vui lòng kiểm tra lại thông tin đăng nhập, hoặc xác nhận tài khoản qua email (nếu chưa)',
      });

      setErrors({
        email: message,
        // password: statusCode === 401 ? "Sai mật khẩu" : undefined,
      });
      // toast.error("Đăng nhập thất bại!", {
      //   description: message || "Email hoặc mật khẩu không đúng",
      // });
      // setErrors({ email: message });
    }
  };

  const handleSocialLogin = async (provider: "google" | "orcid") => {
    if (provider === "google") {
      try {
        const { success, user } = await handleGoogleLogin();

        if (success && user) {
          const roleToUse = getRoleForRedirect(user.role);

          const redirectUrl = getRouteByRole(roleToUse ?? "");
          // const redirectUrl = getRouteByRole(user.role ?? "");
          router.push(redirectUrl);
        } else {
          setErrors({ email: "Đăng nhập Google thất bại" });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Đăng nhập Google thất bại";

        setErrors({ email: errorMessage });
      }
    } else if (provider === "orcid") {
      console.log("ORCID login - will implement later");
    }
  };

  return {
    formData,
    errors,
    isLoading: loading,
    handleInputChange,
    handleLogin,
    handleSocialLogin,
  };
};
