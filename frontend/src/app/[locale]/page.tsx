import { Suspense } from "react";
import Link from "next/link";

import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductGridSkeleton } from "@/components/product/ProductGrid";
import { CategorySection } from "@/components/home/CategorySection";
import { NewProductsSection } from "@/components/home/NewProductsSection";
import { BrandSection } from "@/components/home/BrandSection";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <>
      {/* Hero */}
      <section className="bg-highlight text-primary">
        <Container className="flex flex-col gap-4 py-16 sm:py-24">
          <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-5xl">
            {dict.home.heroTitle}
          </h1>
          <p className="max-w-xl text-base text-primary/80 sm:text-lg">
            {dict.home.heroSubtitle}
          </p>
          <div>
            <Link
              href={`/${locale}/mehsullar`}
              className="mt-2 inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {dict.home.heroCta}
            </Link>
          </div>
        </Container>
      </section>

      <Container className="flex flex-col gap-12 py-12">
        {/* Categories */}
        <section>
          <h2 className="mb-5 text-xl font-bold sm:text-2xl">{dict.home.categoriesTitle}</h2>
          <Suspense
            fallback={
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            }
          >
            <CategorySection locale={locale} dict={dict} />
          </Suspense>
        </section>

        {/* New products */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold sm:text-2xl">{dict.home.newProductsTitle}</h2>
            <Link
              href={`/${locale}/mehsullar`}
              className="text-sm font-medium text-primary hover:underline"
            >
              {dict.home.viewAll}
            </Link>
          </div>
          <Suspense fallback={<ProductGridSkeleton count={8} />}>
            <NewProductsSection locale={locale} dict={dict} />
          </Suspense>
        </section>

        {/* Brands */}
        <section>
          <h2 className="mb-5 text-xl font-bold sm:text-2xl">{dict.home.brandsTitle}</h2>
          <Suspense
            fallback={
              <div className="flex flex-wrap gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-36" />
                ))}
              </div>
            }
          >
            <BrandSection locale={locale} dict={dict} />
          </Suspense>
        </section>
      </Container>
    </>
  );
}
