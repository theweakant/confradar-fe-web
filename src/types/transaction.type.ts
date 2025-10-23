export interface CreateTechPaymentRequest {
    conferencePriceId: string;
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
    PaymentStatusName?: string;
    PaymentMethodName?: string;
}
