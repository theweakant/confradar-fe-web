import ForgotPassword from "@/components/(auth)/ForgotPassword/ForgotPassword";
import ResetPassword from "@/components/(auth)/ResetPassword/ResetPassword";
import Image from "next/image";

interface PageProps {
  params: Promise<{ mode: string }>;
}

export default async function ResetPasswordPage({ params }: PageProps) {
  const { mode } = await params;

  const normalizedMode = mode === "create" ? "create" : "reset";

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
        <ResetPassword mode={normalizedMode} />
      </div>
    </div>
  );
}
