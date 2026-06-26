import type { Locale } from "@/i18n/config";

const intlLocale: Record<Locale, string> = {
  az: "az-AZ",
  ru: "ru-RU",
};

/**
 * Format a price for display in Azerbaijani manat (AZN).
 * Variant prices come from the API as decimal strings (e.g. "12.50").
 */
export function formatPrice(value: string | number, locale: Locale): string {
  const amount = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(amount)) return "";
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency: "AZN",
    minimumFractionDigits: 2,
  }).format(amount);
}
