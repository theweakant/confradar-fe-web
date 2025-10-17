"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormInput } from "./FormInput";
import { SocialLoginButtons } from "./SocialLoginButtons";
import { LoginHeader } from "./LoginHeader";
import { useLoginForm } from "@/utils/useLoginForm";

export const LoginForm = () => {
  const {
    formData,
    errors,
    isLoading,
    handleInputChange,
    handleLogin,
    handleSocialLogin,
  } = useLoginForm();

  return (
    <div className="flex w-full md:w-2/5 items-center justify-center bg-white px-6 py-8 overflow-y-auto relative">
      <Card className="w-full max-w-md border-0 shadow-none">
        <LoginHeader isLoading={isLoading} />

        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <FormInput
              id="email"
              type="email"
              label="Email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              error={errors.email}
              disabled={isLoading}
            />

            <FormInput
              id="password"
              type="password"
              label="Mật Khẩu"
              placeholder="••••••••"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              error={errors.password}
              disabled={isLoading}
              showForgotPassword
            />

            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-sm transition-colors mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng Nhập"
              )}
            </Button>
          </form>

          <SocialLoginButtons
            onGoogleLogin={() => handleSocialLogin('google')}
            onOrcidLogin={() => handleSocialLogin('orcid')}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};