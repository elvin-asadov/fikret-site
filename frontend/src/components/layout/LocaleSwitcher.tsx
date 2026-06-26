"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { locales, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils/cn";

/** Swaps the leading locale segment of the current path. */
export function LocaleSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname();

  function pathForLocale(locale: Locale): string {
    const segments = pathname.split("/");
    // segments[0] is "" (leading slash), segments[1] is the current locale.
    segments[1] = locale;
    return segments.join("/") || `/${locale}`;
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      {locales.map((locale) => (
        <Link
          key={locale}
          href={pathForLocale(locale)}
          className={cn(
            "rounded px-2 py-1 uppercase transition-colors",
            locale === current
              ? "font-semibold text-primary-foreground"
              : "text-primary-foreground/70 hover:text-primary-foreground",
          )}
        >
          {locale}
        </Link>
      ))}
    </div>
  );
}
