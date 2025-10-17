import { useRouter } from "next/navigation";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface LoginHeaderProps {
  isLoading: boolean;
}

export const LoginHeader = ({ isLoading }: LoginHeaderProps) => {
  const router = useRouter();

  return (
    <>
      <div className="absolute top-8 right-8">
        <p className="text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <button
            onClick={() => router.push("/auth/register")}
            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            disabled={isLoading}
          >
            Đăng ký
          </button>
        </p>
      </div>

      <CardHeader className="space-y-2 pb-8 pt-16">
        <CardTitle className="text-3xl font-bold text-gray-900">
          Đăng nhập vào{" "}
          <span className="relative inline-block">
            <span className="relative z-10 text-blue-600">ConfRadar</span>
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 200 60"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse
                cx="100"
                cy="30"
                rx="95"
                ry="25"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="3"
                transform="rotate(-2 100 30)"
              />
            </svg>
          </span>
        </CardTitle>
        <CardDescription className="text-base text-gray-600">
          Từ sáng tạo đến tri thức – Gói trọn trong ConfRadar.
        </CardDescription>
      </CardHeader>
    </>
  );
};