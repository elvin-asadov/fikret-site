import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { getNewProducts } from "@/lib/api/catalog";
import type { ProductListItem } from "@/lib/types/catalog";
import { ProductGrid } from "@/components/product/ProductGrid";

export async function NewProductsSection({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  let products: ProductListItem[];
  try {
    products = (await getNewProducts(8)).results;
  } catch {
    return <p className="py-8 text-center text-muted-foreground">{dict.common.error}</p>;
  }

  return <ProductGrid products={products} locale={locale} dict={dict} />;
}
