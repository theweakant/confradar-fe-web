"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Mail, CreditCard, Link2, ArrowRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type StatusType = "email-confirm" | "payment" | "link-orcid";
type ResultType = "success" | "fail";

interface StatusConfig {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: {
        label: string;
        href: string;
    };
}

export default function StatusPage() {
    const params = useParams();
    const router = useRouter();
    const [config, setConfig] = useState<StatusConfig | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        // Đọc type và result từ URL params
        const type = params.type as StatusType;
        const result = params.result as ResultType;

        if (!type || !result) {
            router.push("/");
            return;
        }

        setIsSuccess(result === "success");

        // Cấu hình message cho từng trường hợp
        const statusConfigs: Record<StatusType, Record<ResultType, StatusConfig>> = {
            "email-confirm": {
                success: {
                    icon: <Mail className="w-12 h-12 text-white" />,
                    title: "Email Confirmed Successfully!",
                    description:
                        "Your email address has been verified. You can now access all features of your account.",
                    action: {
                        label: "Go to Login",
                        href: "/auth/login",
                    },
                },
                fail: {
                    icon: <Mail className="w-12 h-12 text-white" />,
                    title: "Email Confirmation Failed",
                    description:
                        "We couldn't verify your email address. The link may have expired or is invalid. Please request a new confirmation email.",
                    action: {
                        label: "Resend Confirmation Email",
                        href: "/auth/register",
                    },
                },
            },
            payment: {
                success: {
                    icon: <CreditCard className="w-12 h-12 text-white" />,
                    title: "Payment Successful!",
                    description:
                        "Your payment has been processed successfully. Thank you for your purchase!.",
                    action: {
                        label: "View Ticket Details",
                        href: "/customer/tickets",
                    },
                },
                fail: {
                    icon: <CreditCard className="w-12 h-12 text-white" />,
                    title: "Payment Failed",
                    description:
                        "We couldn't process your payment. Please check your payment details and try again. If the problem persists, contact support.",
                    action: {
                        label: "Continue Browsing",
                        href: "/customer/discovery",
                    },
                },
            },
            "link-orcid": {
                success: {
                    icon: <Link2 className="w-12 h-12 text-white" />,
                    title: "ORCID Linked Successfully!",
                    description:
                        "Your ORCID account has been successfully linked to your profile. Your research contributions are now connected.",
                    action: {
                        label: "View Profile",
                        href: "/customer/profile",
                    },
                },
                fail: {
                    icon: <Link2 className="w-12 h-12 text-white" />,
                    title: "ORCID Linking Failed",
                    description:
                        "We couldn't link your ORCID account. The authorization may have been cancelled or expired. Please try again.",
                    action: {
                        label: "Retry ORCID Linking",
                        href: "/customer/profile",
                    },
                },
            },
        };

        const selectedConfig = statusConfigs[type]?.[result];
        if (selectedConfig) {
            setConfig(selectedConfig);
        } else {
            router.push("/");
        }
    }, [params, router]);

    if (!config) {
        return (
            // <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            // </div>
        );
    }

    return (
        // <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="min-h-screen flex items-center justify-center p-4 ">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
                {/* Icon */}
                <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isSuccess
                        ? "bg-gradient-to-br from-green-400 to-green-600"
                        : "bg-gradient-to-br from-red-400 to-red-600"
                        }`}
                >
                    {isSuccess ? (
                        <CheckCircle2 className="w-12 h-12 text-white" />
                    ) : (
                        <XCircle className="w-12 h-12 text-white" />
                    )}
                </div>

                {/* Status Badge */}
                <div
                    className={`inline-block px-4 py-1 rounded-full text-sm font-medium mb-4 ${isSuccess
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                >
                    {isSuccess ? "Success" : "Failed"}
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    {config.title}
                </h1>

                {/* Description */}
                <p className="text-gray-600 mb-8 leading-relaxed">
                    {config.description}
                </p>

                {/* Action Buttons */}
                <div className="space-y-3">
                    {config.action && (
                        <button
                            onClick={() => router.push(config.action!.href)}
                            className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all flex items-center justify-center group ${isSuccess
                                ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-lg"
                                : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-lg"
                                }`}
                        >
                            {config.action.label}
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}

                    <button
                        onClick={() => router.push("/")}
                        className="w-full py-3 px-6 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        Back to Home
                    </button>
                </div>

                {/* Additional Help */}
                {!isSuccess && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                            Need help?{" "}
                            <Link
                                href="/support"
                                className="text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                Contact Support
                            </Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}