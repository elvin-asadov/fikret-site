import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Container } from "@/components/ui/Container";
import { ProductDetailView } from "@/components/product/ProductDetailView";
import { getProduct } from "@/lib/api/catalog";
import { ApiError } from "@/lib/api/client";
import type { ProductDetail } from "@/lib/types/catalog";
import { localizedName } from "@/lib/utils/localize";

// Cached so generateMetadata and the page share a single request.
const loadProduct = cache((slug: string) => getProduct(slug));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  try {
    const product = await loadProduct(slug);
    return {
      title: product.meta_title || localizedName(product, locale),
      description: product.meta_description || undefined,
    };
  } catch {
    return {};
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  let product: ProductDetail;
  try {
    product = await loadProduct(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <Container className="py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/${locale}`} className="hover:text-primary">
          {dict.nav.home}
        </Link>
        <span>/</span>
        <Link
          href={`/${locale}/kateqoriya/${product.category.slug}`}
          className="hover:text-primary"
        >
          {localizedName(product.category, locale)}
        </Link>
      </nav>

      <ProductDetailView product={product} locale={locale} dict={dict} />
    </Container>
  );
}
