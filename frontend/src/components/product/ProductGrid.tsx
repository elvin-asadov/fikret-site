import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import type { ProductListItem } from "@/lib/types/catalog";
import { Skeleton } from "@/components/ui/Skeleton";

import { ProductCard } from "./ProductCard";

const GRID = "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4";

export function ProductGrid({
  products,
  locale,
  dict,
  emptyMessage,
}: {
  products: ProductListItem[];
  locale: Locale;
  dict: Dictionary;
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        {emptyMessage ?? dict.products.noResults}
      </p>
    );
  }

  return (
    <div className={GRID}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} locale={locale} dict={dict} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={GRID}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-xl border border-border p-3">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="mt-2 h-5 w-1/2" />
        </div>
      ))}
    </div>
  );
}
