import { ConferencePriceResponse, SessionDetailForScheduleResponse } from "@/types/conference.type";
import { AuthUser } from "@/types/user.type";

export const getCurrentPrice = (price: ConferencePriceResponse) => {
  const basePrice = price.ticketPrice ?? 0;

  if (!price.pricePhases || price.pricePhases.length === 0) {
    return basePrice;
  }

  const now = new Date();
  const currentPhase = price.pricePhases.find((phase) => {
    const startDate = new Date(phase.startDate || "");
    const endDate = new Date(phase.endDate || "");
    return now >= startDate && now <= endDate;
  });

  if (!currentPhase || !currentPhase.applyPercent) {
    return basePrice;
  }

  const finalPrice = Math.round(basePrice * (currentPhase.applyPercent / 100));
  return finalPrice;
};

export const checkUserRole = (session: SessionDetailForScheduleResponse, user: AuthUser | null) => {
  if (!user?.userId || !session.presenterAuthor) {
    return { isRootAuthor: false, isPresenter: false };
  }

  let isRootAuthor = false;
  let isPresenter = false;

  session.presenterAuthor.forEach((presenter) => {
    if (presenter.paperAuthor) {
      presenter.paperAuthor.forEach((author) => {
        if (author.userId === user.userId) {
          if (author.isRootAuthor) {
            isRootAuthor = true;
          }
          if (author.isPresenter) {
            isPresenter = true;
          }
        }
      });
    }
  });

  return { isRootAuthor, isPresenter };
};