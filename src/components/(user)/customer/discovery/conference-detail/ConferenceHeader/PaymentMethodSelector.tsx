// PaymentMethodSelector.tsx
import { PaymentMethod } from "@/types/transaction.type";
import React from "react";

interface PaymentMethodSelectorProps {
    selectedPaymentMethod: string | null;
    onSelectPaymentMethod: (id: string | null) => void;
    showPaymentMethods: boolean;
    onTogglePaymentMethods: (show: boolean) => void;
    paymentMethods: PaymentMethod[];
    paymentMethodsLoading: boolean;
    isAuthorTicket?: boolean;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
    selectedPaymentMethod,
    onSelectPaymentMethod,
    showPaymentMethods,
    onTogglePaymentMethods,
    paymentMethods,
    paymentMethodsLoading,
    isAuthorTicket,
}) => {
    return (
        <div className={`${isAuthorTicket ? "flex-1" : "w-full"} relative`}>
            <button
                onClick={() => onTogglePaymentMethods(!showPaymentMethods)}
                className="w-full flex items-center justify-between p-3 rounded-lg 
                   bg-gradient-to-r from-blue-50 to-indigo-50 
                   border border-blue-200 hover:border-blue-300 
                   transition-all duration-200 group shadow-sm hover:shadow-md"
            >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <svg
                        className="w-5 h-5 text-blue-600 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 truncate">
                        {selectedPaymentMethod ? (
                            paymentMethods.find((pm) => pm.paymentMethodId === selectedPaymentMethod)?.methodName
                        ) : (
                            <>
                                Phương Thức Thanh toán <span className="text-red-600">*</span>
                            </>
                        )}
                    </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {selectedPaymentMethod && (
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    )}
                    <svg
                        className={`w-4 h-4 text-blue-600 transition-transform duration-200 
                           ${showPaymentMethods ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
            </button>

            {showPaymentMethods && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => onTogglePaymentMethods(false)} />

                    <div
                        className="absolute bottom-full left-0 right-0 mb-2 z-20 
                          bg-white rounded-xl 
                          border-2 border-blue-200 shadow-2xl
                          overflow-hidden animate-slideDown"
                    >
                        {paymentMethodsLoading ? (
                            <div className="flex items-center justify-center p-6">
                                <svg
                                    className="animate-spin h-5 w-5 text-blue-600"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                <span className="ml-2 text-sm text-gray-600">Đang tải...</span>
                            </div>
                        ) : (
                            <div
                                className="max-h-64 overflow-y-auto"
                                style={{
                                    scrollbarWidth: "thin",
                                    scrollbarColor: "rgba(59, 130, 246, 0.4) transparent",
                                }}
                            >
                                {paymentMethods.map((method, index) => (
                                    <button
                                        key={method.paymentMethodId}
                                        onClick={() => {
                                            onSelectPaymentMethod(method.paymentMethodId);
                                            onTogglePaymentMethods(false);
                                        }}
                                        className={`w-full p-3 flex items-center gap-3 transition-all duration-150
                                           hover:bg-blue-50 border-b border-gray-100 last:border-0
                                           ${selectedPaymentMethod === method.paymentMethodId
                                                ? "bg-blue-50"
                                                : "bg-white"
                                            }`}
                                        style={{
                                            animationDelay: `${index * 30}ms`,
                                        }}
                                    >
                                        <div
                                            className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                                               transition-colors ${selectedPaymentMethod === method.paymentMethodId
                                                    ? "bg-blue-100"
                                                    : "bg-gray-100"
                                                }`}
                                        >
                                            {selectedPaymentMethod === method.paymentMethodId ? (
                                                <svg
                                                    className="w-4 h-4 text-green-600"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    className="w-4 h-4 text-gray-500"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                                    />
                                                </svg>
                                            )}
                                        </div>

                                        <div className="flex-1 text-left min-w-0">
                                            <div
                                                className={`font-medium text-sm truncate ${selectedPaymentMethod === method.paymentMethodId
                                                    ? "text-blue-700"
                                                    : "text-gray-800"
                                                    }`}
                                            >
                                                {method.methodName}
                                            </div>
                                            {method.methodDescription && (
                                                <div className="text-xs text-gray-500 truncate mt-0.5">
                                                    {method.methodDescription}
                                                </div>
                                            )}
                                        </div>

                                        {selectedPaymentMethod === method.paymentMethodId && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0 animate-pulse" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default PaymentMethodSelector;