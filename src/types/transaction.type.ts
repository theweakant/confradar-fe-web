export interface CreateTechPaymentRequest {
    conferencePriceId: string;
    paymentMethodId: string;
}

export interface CreatePaperPaymentRequest {
    conferencePriceId: string;
    title: string;
    description?: string;
    paymentMethodId: string;
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

export interface GeneralPaymentResultResponse {
    paymentMessage: string;
    checkOutUrl?: string;
    // isAddedWaitList?: boolean;
    // conferenceId?: string;
}