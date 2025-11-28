import ForgotPassword from "@/components/(auth)/ForgotPassword/ForgotPassword";
import ResetPassword from "@/components/(auth)/ResetPassword/ResetPassword";
import Image from "next/image";

interface ResetPasswordPageProps {
  params: { mode: "reset" | "create" };
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  return (
    <div className="relative h-screen w-full overflow-hidden">

      <Image
        src="/images/reset-pass-bg.jpg"
        alt="Background"
        fill
        priority
        className="object-cover scale-105 blur-[0.2px]"
      />

      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      <div className="relative z-10">
        <ResetPassword mode={params.mode} />
      </div>
    </div>
  );
}
