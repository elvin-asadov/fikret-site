import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Container } from "@/components/ui/Container";
import { ProductGridSkeleton } from "@/components/product/ProductGrid";
import { ProductListing } from "@/components/product/ProductListing";
import type { ProductQuery } from "@/lib/api/catalog";

type SearchParams = Promise<{
  search?: string;
  brand?: string;
  category?: string;
  ordering?: string;
}>;

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: SearchParams;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  const sp = await searchParams;
  const query: ProductQuery = {
    search: sp.search,
    brand: sp.brand,
    category: sp.category,
    ordering: sp.ordering,
  };

  const title = sp.search ? `${dict.products.resultsFor}: “${sp.search}”` : dict.products.title;

  const sortOptions: { value: string; label: string }[] = [
    { value: "", label: dict.products.sort.relevance },
    { value: "-created_at", label: dict.products.sort.newest },
  ];

  return (
    <Container className="py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((opt) => {
            const active = (sp.ordering ?? "") === opt.value;
            const params = new URLSearchParams();
            if (sp.search) params.set("search", sp.search);
            if (sp.brand) params.set("brand", sp.brand);
            if (sp.category) params.set("category", sp.category);
            if (opt.value) params.set("ordering", opt.value);
            const href = `?${params.toString()}`;
            return (
              <Link
                key={opt.value}
                href={href}
                className={
                  active
                    ? "rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
                    : "rounded-full border border-border px-4 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
                }
              >
                {opt.label}
              </Link>
            );
          })}
        </div>
      </div>
      <Suspense key={JSON.stringify(query)} fallback={<ProductGridSkeleton count={12} />}>
        <ProductListing query={query} locale={locale} dict={dict} />
      </Suspense>
    </Container>
  );
}
