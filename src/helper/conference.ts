import { ConferencePriceResponse } from "@/types/conference.type";

export const getCurrentPrice = (price: ConferencePriceResponse) => {
    const basePrice = price.ticketPrice ?? 0;

    if (!price.pricePhases || price.pricePhases.length === 0) {
        return basePrice;
    }

    const now = new Date();
    const currentPhase = price.pricePhases.find(phase => {
        const startDate = new Date(phase.startDate || '');
        const endDate = new Date(phase.endDate || '');
        return now >= startDate && now <= endDate;
    });

    if (!currentPhase || !currentPhase.applyPercent) {
        return basePrice;
    }

    const finalPrice = Math.round(basePrice * (currentPhase.applyPercent / 100));
    return finalPrice;
};