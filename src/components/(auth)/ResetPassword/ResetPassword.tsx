"use client";

import { useState, useEffect } from "react";
import { Lock, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useVerifyForgetPasswordMutation } from "@/redux/services/auth.service";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errors, setErrors] = useState({
        password: "",
        confirmPassword: "",
    });
    const [token, setToken] = useState("");

    const searchParams = useSearchParams();
    const router = useRouter();

    const [verifyForgetPassword, { isLoading }] =
        useVerifyForgetPasswordMutation();

    useEffect(() => {
        // Đọc token từ URL
        const tokenFromUrl = searchParams.get("token");
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            toast.error("Invalid reset link");
            // Có thể redirect về trang forgot password nếu không có token
        }
    }, [searchParams]);

    const validatePassword = (password: string) => {
        if (password.length < 8) {
            return "Password must be at least 8 characters";
        }
        if (!/[A-Z]/.test(password)) {
            return "Password must contain at least one uppercase letter";
        }
        if (!/[a-z]/.test(password)) {
            return "Password must contain at least one lowercase letter";
        }
        if (!/[0-9]/.test(password)) {
            return "Password must contain at least one number";
        }
        return "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Reset errors
        setErrors({
            password: "",
            confirmPassword: "",
        });

        // Validation
        let hasError = false;
        const newErrors = {
            password: "",
            confirmPassword: "",
        };

        if (!password) {
            newErrors.password = "Please enter your password";
            hasError = true;
        } else {
            const passwordError = validatePassword(password);
            if (passwordError) {
                newErrors.password = passwordError;
                hasError = true;
            }
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
            hasError = true;
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            toast.error("Please fix the errors");
            return;
        }

        if (!token) {
            toast.error("Invalid reset link");
            return;
        }

        try {
            const result = await verifyForgetPassword({
                token,
                password,
                confirmPassword,
            }).unwrap();

            if (result.success) {
                setIsSuccess(true);
                toast.success("Password reset successfully!", {
                    description: "You can now login with your new password",
                });

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            }
        } catch (error: unknown) {
            console.error("❌ Error:", error);

            const message =
                error instanceof Error
                    ? error.message
                    : (error as { data?: { message?: string } })?.data?.message ||
                    "Failed to reset password. Please try again.";

            toast.error(message);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Password Reset Successful!
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Your password has been reset successfully. Redirecting to login...
                    </p>
                    <button
                        onClick={() => router.push("/login")}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 w-full max-w-md">
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Reset Password
                    </h1>
                    <p className="text-gray-600">
                        Enter your new password below
                    </p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            New Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setErrors({ ...errors, password: "" });
                                }}
                                placeholder="Enter new password"
                                className={`w-full pl-10 pr-12 py-3 border ${errors.password ? "border-red-500" : "border-gray-300"
                                    } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                                <span className="mr-1">⚠</span> {errors.password}
                            </p>
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                            Must be at least 8 characters with uppercase, lowercase, and number
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setErrors({ ...errors, confirmPassword: "" });
                                }}
                                placeholder="Confirm new password"
                                className={`w-full pl-10 pr-12 py-3 border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"
                                    } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                                <span className="mr-1">⚠</span> {errors.confirmPassword}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className={`w-full py-3 rounded-lg font-medium text-white transition-all ${isLoading
                                ? "bg-indigo-400 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg"
                            }`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Resetting...
                            </span>
                        ) : (
                            "Reset Password"
                        )}
                    </button>
                </div>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Remember your password?{" "}
                    <a
                        href="/login"
                        className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                        Sign In
                    </a>
                </p>
            </div>
        </div>
    );
}