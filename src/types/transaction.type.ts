export interface CreateTechPaymentRequest {
  conferencePriceId: string;
  paymentMethodId: string;
}

export interface CreatePaperPaymentRequest {
  conferencePriceId: string;
  paperId: string;
  // title: string;
  // description?: string;
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

export interface WalletTransaction {
  walletTransactionId: string;
  walletId: string;
  amount: number;
  transactionType: string;
  description: string;
  createdAt: string;
}

export interface WalletResponse {
  walletId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
  walletTransactions: WalletTransaction[];
}