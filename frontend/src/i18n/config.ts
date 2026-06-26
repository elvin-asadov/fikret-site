// Native Next.js 16 i18n config (no third-party lib — chosen for compatibility
// with this Next version, which renamed Middleware -> Proxy). Structured so it
// can be migrated to next-intl later without touching call sites.

export const locales = ["az", "ru"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "az";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
