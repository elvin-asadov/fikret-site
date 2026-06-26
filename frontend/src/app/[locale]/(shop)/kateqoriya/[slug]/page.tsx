import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Container } from "@/components/ui/Container";
import { ProductGridSkeleton } from "@/components/product/ProductGrid";
import { ProductListing } from "@/components/product/ProductListing";
import { getCategory } from "@/lib/api/catalog";
import { ApiError } from "@/lib/api/client";
import type { Category } from "@/lib/types/catalog";
import { localizedName } from "@/lib/utils/localize";

// Cached so generateMetadata and the page share one request.
const loadCategory = cache((slug: string) => getCategory(slug));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  try {
    const category = await loadCategory(slug);
    return { title: localizedName(category, locale) };
  } catch {
    return {};
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  let category: Category;
  try {
    category = await loadCategory(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-2xl font-bold">{localizedName(category, locale)}</h1>
      <Suspense key={slug} fallback={<ProductGridSkeleton count={12} />}>
        <ProductListing query={{ category: slug }} locale={locale} dict={dict} />
      </Suspense>
    </Container>
  );
}
