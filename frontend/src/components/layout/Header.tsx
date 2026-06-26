import Link from "next/link";
import { ShoppingCart, Search } from "lucide-react";

import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { Container } from "@/components/ui/Container";

import { LocaleSwitcher } from "./LocaleSwitcher";

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <header className="sticky top-0 z-40 bg-background">
      {/* Utility bar */}
      <div className="bg-primary text-primary-foreground">
        <Container className="flex h-9 items-center justify-end text-xs">
          <LocaleSwitcher current={locale} />
        </Container>
      </div>

      {/* Main nav */}
      <div className="border-b border-border bg-background">
        <Container className="flex h-16 items-center gap-4">
          <Link href={`/${locale}`} className="shrink-0 text-xl font-bold text-primary">
            {dict.brandName}
          </Link>

          <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
            <Link href={`/${locale}/mehsullar`} className="hover:text-primary">
              {dict.nav.products}
            </Link>
          </nav>

          {/* Native GET form -> /mehsullar?search=... (no client JS required). */}
          <form action={`/${locale}/mehsullar`} className="ml-auto hidden max-w-md flex-1 md:block">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                name="search"
                placeholder={dict.nav.searchPlaceholder}
                aria-label={dict.nav.searchPlaceholder}
                className="w-full rounded-full border border-border bg-muted py-2 pl-9 pr-4 text-sm outline-none focus:border-primary focus:bg-background"
              />
            </div>
          </form>

          <Link
            href={`/${locale}/sebet`}
            aria-label={dict.nav.cart}
            className="ml-auto flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted md:ml-0"
          >
            <ShoppingCart className="h-4 w-4" />
            {dict.nav.cart}
          </Link>
        </Container>
      </div>
    </header>
  );
}
