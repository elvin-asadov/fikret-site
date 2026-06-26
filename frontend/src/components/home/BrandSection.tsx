import Image from "next/image";
import Link from "next/link";

import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { getBrands } from "@/lib/api/catalog";
import { mediaUrl } from "@/lib/api/client";
import type { Brand } from "@/lib/types/catalog";

export async function BrandSection({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  let brands: Brand[];
  try {
    brands = (await getBrands()).results;
  } catch {
    return <p className="py-8 text-center text-muted-foreground">{dict.common.error}</p>;
  }

  if (brands.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-4">
      {brands.map((brand) => {
        const logo = mediaUrl(brand.logo);
        return (
          <Link
            key={brand.id}
            href={`/${locale}/mehsullar?brand=${brand.slug}`}
            className="flex h-20 w-36 items-center justify-center rounded-xl border border-border bg-card px-4 transition-shadow hover:shadow-md"
          >
            {logo ? (
              <Image
                src={logo}
                alt={brand.name}
                width={120}
                height={48}
                className="max-h-12 w-auto object-contain"
              />
            ) : (
              <span className="text-sm font-semibold text-foreground">{brand.name}</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
