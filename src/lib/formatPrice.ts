/**
 * Format a price in Ghana Cedis (GH₵)
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(price);
};
