import { Tag } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site-config";

export function CtaBudget() {
  const whatsappHref = `https://wa.me/52${siteConfig.contact.whatsapp}`;

  return (
    <Container className="-mt-8 sm:-mt-10">
      <div className="flex flex-col items-center gap-6 rounded-3xl border border-brand-600/40 bg-gradient-to-br from-ink-850 to-ink-900 p-8 elevation-floating sm:flex-row sm:justify-between sm:p-10">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-brand-500/50 bg-brand-500/10 text-brand-400">
            <Tag className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <p className="font-display text-2xl font-black tracking-[-0.03em] text-mist-100">
              Presupuesto <span className="text-brand-500">abierto</span>
            </p>
            <p className="mt-1 text-sm text-mist-500 sm:text-base">
              Te damos la mejor solución al mejor precio. ¡Tu equipo en las mejores manos!
            </p>
          </div>
        </div>
        <Button href={whatsappHref} className="w-full sm:w-auto">
          Cotizar ahora
        </Button>
      </div>
    </Container>
  );
}
