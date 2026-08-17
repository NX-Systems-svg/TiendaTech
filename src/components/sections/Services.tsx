"use client";

import { Check, Wrench } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { services } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { useQuote } from "@/lib/quote-context";

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export function Services() {
  const { items, add } = useCart();
  const { requestQuote } = useQuote();

  return (
    <Section id="servicios">
      <Container>
        <SectionHeading
          eyebrow="Lo que hacemos"
          title="Servicios que ofrecemos"
          description="Diagnóstico, mantenimiento y actualización de hardware y software con garantía en cada visita."
        />

        <div className="mb-10 flex items-start gap-3 rounded-2xl border border-ink-700 bg-ink-850/60 p-4 text-sm text-mist-500 sm:items-center">
          <Wrench className="mt-0.5 h-5 w-5 shrink-0 text-brand-400 sm:mt-0" aria-hidden />
          <p>
            Los precios mostrados son de{" "}
            <span className="font-semibold text-mist-300">mano de obra</span>. Las
            refacciones (SSD, memorias, licencias) se cotizan aparte según lo que
            necesite tu equipo: presupuesto abierto, siempre al mejor precio.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const inCart = items.some((item) => item.slug === service.slug);
            const serviceName = `${service.title} ${service.highlight}`;

            return (
              <Card key={service.slug} className="flex flex-col">
                <div
                  aria-hidden
                  className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-ink-600 bg-ink-800 text-brand-400 transition-colors duration-300 group-hover:border-brand-500 group-hover:text-brand-300"
                >
                  <Icon name={service.icon} />
                </div>
                <h3 className="text-lg font-bold text-mist-100">
                  {service.title} <span className="text-brand-400">{service.highlight}</span>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-mist-500">
                  {service.description}
                </p>

                <p className="mt-4 text-sm text-mist-500">
                  {typeof service.price === "number" ? (
                    <>
                      Mano de obra{" "}
                      <span className="font-semibold text-brand-400">
                        {currencyFormatter.format(service.price)}
                      </span>
                    </>
                  ) : (
                    <span className="font-semibold text-mist-300">
                      Sujeto a piezas disponibles
                    </span>
                  )}
                </p>

                <div className="mt-auto flex flex-col gap-2 pt-4">
                  {typeof service.price === "number" ? (
                    <>
                      <Button
                        onClick={() => add(service.slug)}
                        disabled={inCart}
                        className="w-full !py-2.5 text-sm"
                      >
                        {inCart ? (
                          <>
                            <Check className="h-4 w-4" aria-hidden />
                            En el carrito
                          </>
                        ) : (
                          "Agregar al carrito"
                        )}
                      </Button>
                      <Button
                        onClick={() => requestQuote(serviceName)}
                        variant="ghost"
                        className="w-full !py-2 text-sm text-mist-500 hover:text-brand-400"
                      >
                        Solicitar cotización
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => requestQuote(serviceName)}
                      variant="secondary"
                      className="w-full !py-2.5 text-sm"
                    >
                      Solicitar cotización
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
