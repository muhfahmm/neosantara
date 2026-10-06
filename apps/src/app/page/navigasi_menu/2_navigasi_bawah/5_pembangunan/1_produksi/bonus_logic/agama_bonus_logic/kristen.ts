export const PROTESTANT_SELL_PRICE_BONUS = 0.05;
export const PROTESTANT_BUY_PRICE_DISCOUNT = 0.05;

export type TradeDirection = "buy" | "sell";

export function applyProtestantTradePrice(
  basePrice: number,
  religion: unknown,
  direction: TradeDirection
): number {
  const normalizedReligion = String(religion || "").trim().toLowerCase();
  if (normalizedReligion !== "protestan") return basePrice;

  const multiplier = direction === "sell"
    ? 1 + PROTESTANT_SELL_PRICE_BONUS
    : 1 - PROTESTANT_BUY_PRICE_DISCOUNT;
  return basePrice * multiplier;
}
