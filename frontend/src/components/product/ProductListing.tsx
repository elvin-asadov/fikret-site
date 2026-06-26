import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { getProducts, type ProductQuery } from "@/lib/api/catalog";
import { ProductGrid } from "@/components/product/ProductGrid";

/**
 * Fetches and renders a filtered product grid. Used by the all-products
 * (`/mehsullar`) and category (`/kateqoriya/[slug]`) pages.
 */
export async function ProductListing({
  query,
  locale,
  dict,
}: {
  query: ProductQuery;
  locale: Locale;
  dict: Dictionary;
}) {
  let data;
  try {
    data = await getProducts(query);
  } catch {
    return <p className="py-12 text-center text-muted-foreground">{dict.common.error}</p>;
  }

  return <ProductGrid products={data.results} locale={locale} dict={dict} />;
}
