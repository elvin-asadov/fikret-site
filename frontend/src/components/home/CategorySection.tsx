import Image from "next/image";
import Link from "next/link";

import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { getRootCategories } from "@/lib/api/catalog";
import { mediaUrl } from "@/lib/api/client";
import type { Category } from "@/lib/types/catalog";
import { localizedName } from "@/lib/utils/localize";

export async function CategorySection({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  let categories: Category[];
  try {
    categories = await getRootCategories();
  } catch {
    return <p className="py-8 text-center text-muted-foreground">{dict.common.error}</p>;
  }

  if (categories.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {categories.map((category) => {
        const name = localizedName(category, locale);
        const image = mediaUrl(category.image);
        return (
          <Link
            key={category.id}
            href={`/${locale}/kateqoriya/${category.slug}`}
            className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-xl bg-primary p-4 text-white transition-transform hover:-translate-y-0.5"
          >
            {image ? (
              <Image
                src={image}
                alt={name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover opacity-70 transition-transform duration-200 group-hover:scale-105"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <span className="relative line-clamp-2 text-sm font-semibold">{name}</span>
          </Link>
        );
      })}
    </div>
  );
}
