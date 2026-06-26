import { notFound } from "next/navigation";
import { ShoppingCart } from "lucide-react";

import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Container } from "@/components/ui/Container";

// Placeholder — the cart backend (apps/cart) is not implemented yet. This page
// is wired into the header so there are no dead links; it becomes a real cart
// (localStorage stub layer) in milestone M4.
export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <Container className="flex flex-col items-center gap-4 py-24 text-center">
      <ShoppingCart className="h-12 w-12 text-muted-foreground" />
      <h1 className="text-2xl font-bold">{dict.nav.cart}</h1>
      <p className="text-muted-foreground">{dict.common.comingSoon}</p>
    </Container>
  );
}
