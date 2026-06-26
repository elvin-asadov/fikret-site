import Image from "next/image";
import Link from "next/link";

import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { mediaUrl } from "@/lib/api/client";
import type { ProductListItem } from "@/lib/types/catalog";
import { formatPrice } from "@/lib/format/price";
import { localizedName } from "@/lib/utils/localize";

export function ProductCard({
  product,
  locale,
  dict,
}: {
  product: ProductListItem;
  locale: Locale;
  dict: Dictionary;
}) {
  const name = localizedName(product, locale);
  const variant = product.default_variant;
  const image = mediaUrl(product.primary_image?.image);
  const inStock = (variant?.stock_quantity ?? 0) > 0;
  const hasDiscount = variant?.old_price && Number(variant.old_price) > Number(variant.price);

  return (
    <Link
      href={`/${locale}/mehsul/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image}
            alt={product.primary_image?.alt || name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {dict.product.noImage}
          </div>
        )}
        {hasDiscount && (
          <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">
            -%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.brand && (
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {product.brand.name}
          </span>
        )}
        <h3 className="line-clamp-2 text-sm font-medium text-foreground">{name}</h3>

        <div className="mt-auto flex flex-col gap-2 pt-3">
          {variant ? (
            <div className="flex items-baseline gap-2">
              <span className="text-base font-semibold text-foreground">
                {formatPrice(variant.price, locale)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(variant.old_price!, locale)}
                </span>
              )}
            </div>
          ) : null}
          <span
            className={
              inStock
                ? "text-xs font-medium text-accent"
                : "text-xs font-medium text-muted-foreground"
            }
          >
            {inStock ? dict.product.inStock : dict.product.outOfStock}
          </span>
          <span className="mt-1 inline-flex items-center justify-center rounded-full border border-primary px-4 py-1.5 text-xs font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            {dict.product.addToCart}
          </span>
        </div>
      </div>
    </Link>
  );
}
