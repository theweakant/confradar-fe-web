import { Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FormInputProps {
  id: string;
  type: 'email' | 'password';
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  showForgotPassword?: boolean;
}

export const FormInput = ({ 
  id, 
  type, 
  label, 
  placeholder, 
  value, 
  onChange, 
  error, 
  disabled,
  showForgotPassword = false
}: FormInputProps) => {
  const router = useRouter();
  const Icon = type === 'email' ? Mail : Lock;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </Label>
        {showForgotPassword && (
          <button
            type="button"
            onClick={() => router.push("/auth/forgot-password")}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            disabled={disabled}
          >
            Quên mật khẩu?
          </button>
        )}
      </div>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`pl-11 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
            error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
          }`}
          disabled={disabled}
        />
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};