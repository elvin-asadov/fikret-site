import type { Dictionary } from "@/i18n/dictionaries";
import { Container } from "@/components/ui/Container";

export function Footer({ dict }: { dict: Dictionary }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 bg-primary text-primary-foreground">
      <Container className="flex flex-col gap-2 py-10 text-sm text-primary-foreground/80">
        <span className="text-base font-bold text-primary-foreground">{dict.brandName}</span>
        <p className="max-w-md">{dict.footer.tagline}</p>
        <p className="mt-4">
          © {year} {dict.brandName}. {dict.footer.rights}
        </p>
      </Container>
    </footer>
  );
}
