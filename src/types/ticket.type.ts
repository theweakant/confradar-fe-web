export interface Ticket {
    ticketId: string;
    userId?: string;
    conferencePriceId?: string;
    transactionId?: string;
    registeredDate?: string;
    isRefunded?: boolean;
    actualPrice?: number;
}