import Image from "next/image";
import { PackageSearch } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { products } from "@/lib/data";

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export function ProductCatalog() {
  return (
    <Section id="productos" className="border-t border-ink-800/80 bg-ink-900/40">
      <Container>
        <SectionHeading
          eyebrow="Equipo y componentes"
          title="Productos bajo pedido"
          description="Trabajamos como intermediarios con proveedores certificados: cotizamos, conseguimos y entregamos el equipo que necesitas, sin manejar inventario propio."
        />

        <div className="mb-10 flex items-start gap-3 rounded-2xl border border-ink-700 bg-ink-850/60 p-4 text-sm text-mist-500 sm:items-center">
          <PackageSearch className="mt-0.5 h-5 w-5 shrink-0 text-brand-400 sm:mt-0" aria-hidden />
          <p>
            Los precios son de referencia y pueden variar según disponibilidad del
            proveedor. Al confirmar tu pedido te damos costo final y tiempo de entrega
            antes de cualquier pago.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.slug} className="flex flex-col p-0">
              <div className="overflow-hidden rounded-t-2xl border-b border-ink-700">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={600}
                  height={450}
                  className="aspect-4/3 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <Badge>{product.category}</Badge>
                <h3 className="text-base font-bold text-mist-100">{product.name}</h3>
                <p className="text-sm text-mist-500">
                  Desde{" "}
                  <span className="font-semibold text-brand-400">
                    {currencyFormatter.format(product.priceFrom)}
                  </span>
                </p>
                <div className="mt-auto pt-2">
                  <Button
                    href={`#contacto?producto=${encodeURIComponent(product.name)}`}
                    variant="secondary"
                    className="w-full !py-2.5 text-sm"
                  >
                    Solicitar cotización
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
