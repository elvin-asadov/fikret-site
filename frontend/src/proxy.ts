import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { defaultLocale, locales } from "@/i18n/config";

// Next.js 16 renamed Middleware -> Proxy. This runs before the request is
// completed and redirects locale-less paths (e.g. `/products`) to a localized
// path (`/az/products`), choosing the locale from the Accept-Language header.

function resolveLocale(request: NextRequest): string {
  const header = request.headers.get("accept-language");
  if (header) {
    // Parse "ru-RU,ru;q=0.9,en;q=0.8" -> ["ru", "en"] in priority order.
    const preferred = header
      .split(",")
      .map((part) => part.split(";")[0].trim().split("-")[0].toLowerCase());
    for (const lang of preferred) {
      if ((locales as readonly string[]).includes(lang)) return lang;
    }
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return;

  const locale = resolveLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip Next internals, the API proxy, and anything that looks like a file.
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
