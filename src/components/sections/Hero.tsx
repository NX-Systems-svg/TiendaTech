import Image from "next/image";
import { Laptop2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { benefits } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";

export function Hero() {
  const whatsappHref = `https://wa.me/52${siteConfig.contact.whatsapp}`;

  return (
    <section className="relative overflow-hidden border-b border-ink-800/80">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 15% 15%, color-mix(in srgb, var(--color-brand-500) 16%, transparent), transparent), radial-gradient(50% 45% at 85% 25%, color-mix(in srgb, var(--color-accent-500) 18%, transparent), transparent), radial-gradient(70% 60% at 50% 100%, color-mix(in srgb, var(--color-brand-700) 10%, transparent), transparent)",
        }}
      />

      <Container className="grid gap-14 py-16 sm:py-24 lg:grid-cols-2 lg:items-center lg:py-28">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-800/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">
            <Laptop2 className="h-3.5 w-3.5" aria-hidden />
            Escritorios y laptops
          </span>

          <h1 className="mt-6 text-balance font-display text-4xl font-black tracking-[-0.03em] text-mist-100 sm:text-5xl lg:text-6xl">
            Mantenimiento{" "}
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              de Computadoras
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-mist-500">
            Cuidamos tu equipo para que funcione siempre al{" "}
            <span className="font-semibold text-brand-400">100%</span>. Diagnóstico,
            limpieza, actualización y soporte para escritorios y laptops en un solo lugar.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button href={whatsappHref}>Solicita tu presupuesto</Button>
            <Button href="#servicios" variant="secondary">
              Ver servicios
            </Button>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex flex-col gap-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-600 bg-ink-800/70 text-brand-400 elevation-base">
                  <Icon name={benefit.icon} className="h-5 w-5" />
                </div>
                <dt className="text-sm font-semibold text-mist-100">{benefit.title}</dt>
                <dd className="text-xs leading-relaxed text-mist-500">
                  {benefit.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative animate-fade-up [animation-delay:150ms]">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-500/15 via-transparent to-accent-500/15 blur-2xl" />
          <div className="overflow-hidden rounded-3xl border border-ink-700 elevation-floating">
            <Image
              src="https://placehold.co/1000x800/0d1220/8a93b3/png?text=Equipo+en+mantenimiento"
              alt="Equipo de cómputo en proceso de mantenimiento"
              width={1000}
              height={800}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
