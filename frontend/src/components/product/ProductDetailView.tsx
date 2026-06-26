"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { mediaUrl } from "@/lib/api/client";
import type { ProductDetail } from "@/lib/types/catalog";
import { formatPrice } from "@/lib/format/price";
import { localizedName } from "@/lib/utils/localize";
import { cn } from "@/lib/utils/cn";

export function ProductDetailView({
  product,
  locale,
  dict,
}: {
  product: ProductDetail;
  locale: Locale;
  dict: Dictionary;
}) {
  const defaultVariant =
    product.variants.find((v) => v.is_default) ?? product.variants[0] ?? null;

  const [variantId, setVariantId] = useState<number | null>(defaultVariant?.id ?? null);
  const [imageIndex, setImageIndex] = useState(0);
  const [cartNote, setCartNote] = useState(false);

  const variant = product.variants.find((v) => v.id === variantId) ?? defaultVariant;
  const name = localizedName(product, locale);
  const images = product.images;
  const mainImage = mediaUrl(images[imageIndex]?.image);
  const stock = variant?.stock_quantity ?? 0;
  const inStock = stock > 0;
  const lowStock = inStock && stock <= 10;
  const hasDiscount =
    variant?.old_price && Number(variant.old_price) > Number(variant.price);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Gallery */}
      <div className="flex flex-col gap-4">
        <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={images[imageIndex]?.alt || name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-6"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              {dict.product.noImage}
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {images.map((img, i) => {
              const thumb = mediaUrl(img.image);
              if (!thumb) return null;
              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setImageIndex(i)}
                  className={cn(
                    "relative h-16 w-16 overflow-hidden rounded-lg border bg-muted",
                    i === imageIndex ? "border-primary" : "border-border",
                  )}
                >
                  <Image src={thumb} alt={img.alt || name} fill sizes="64px" className="object-contain p-1" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-4">
        {product.brand && (
          <Link
            href={`/${locale}/mehsullar?brand=${product.brand.slug}`}
            className="text-sm uppercase tracking-wide text-muted-foreground hover:text-primary"
          >
            {product.brand.name}
          </Link>
        )}
        <h1 className="text-2xl font-bold sm:text-3xl">{name}</h1>

        {variant && (
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(variant.price, locale)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(variant.old_price!, locale)}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          <span
            className={cn(
              "text-sm font-medium",
              inStock ? "text-accent" : "text-muted-foreground",
            )}
          >
            {inStock ? dict.product.inStock : dict.product.outOfStock}
          </span>
          {lowStock && (
            <span className="text-sm text-muted-foreground">
              {dict.product.onlyLeft.replace("{count}", String(stock))}
            </span>
          )}
        </div>

        {/* Variants */}
        {product.variants.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariantId(v.id)}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                  v.id === variantId
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary",
                )}
              >
                {v.name}
              </button>
            ))}
          </div>
        )}

        {/* Add to cart (cart backend lands in a later phase) */}
        <div className="mt-2 flex flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={!inStock}
              onClick={() => setCartNote(true)}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {dict.product.buyNow}
            </button>
            <button
              type="button"
              disabled={!inStock}
              onClick={() => setCartNote(true)}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-primary px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {dict.product.addToCart}
            </button>
          </div>
          {cartNote && <span className="text-sm text-muted-foreground">{dict.common.comingSoon}</span>}
        </div>

        {product.description && (
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
            {product.description}
          </p>
        )}

        {/* Attributes */}
        {product.attribute_values.length > 0 && (
          <dl className="mt-4 divide-y divide-border rounded-xl border border-border">
            {product.attribute_values.map((attr) => (
              <div key={attr.id} className="flex justify-between gap-4 px-4 py-2 text-sm">
                <dt className="text-muted-foreground">{attr.attribute_name}</dt>
                <dd className="font-medium">{attr.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
