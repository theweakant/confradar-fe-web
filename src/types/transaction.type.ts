export interface CreateTechPaymentRequest {
    conferencePriceId: string;
}

export interface CreatePaperPaymentRequest {
    conferencePriceId: string;
    title: string;
    description?: string;
}

export interface Transaction {
    transactionId: string;
    userId?: string;
    currency?: string;
    amount?: number;
    transactionCode?: string;
    createdAt?: string;
    transactionStatusId?: string;
    transactionTypeId?: string;
    paymentMethodId?: string;
    paymentStatusName: string;
    paymentMethodName: string;
}

export interface PaymentMethod {
    paymentMethodId: string;
    methodName?: string;
    methodDescription?: string;
}