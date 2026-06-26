import type { Locale } from "@/i18n/config";

/** Pick the localized name, falling back to Azerbaijani when RU is empty. */
export function localizedName(
  item: { name_az: string; name_ru: string },
  locale: Locale,
): string {
  if (locale === "ru" && item.name_ru) return item.name_ru;
  return item.name_az;
}
