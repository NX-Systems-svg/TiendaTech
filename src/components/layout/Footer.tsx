import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { navLinks } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="border-t border-ink-800/80 bg-ink-950">
      <Container className="flex flex-col items-center gap-6 py-10 sm:flex-row sm:justify-between">
        <p className="font-display text-sm font-bold tracking-tight text-mist-100">
          GARDUÑO<span className="text-brand-500"> TECH</span>
        </p>

        <nav className="flex flex-wrap justify-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-mist-500 transition-colors duration-200 hover:text-brand-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-mist-500">
          © {new Date().getFullYear()} {siteConfig.name}. Prevenir hoy, es ahorrar mañana.
        </p>
      </Container>
    </footer>
  );
}
