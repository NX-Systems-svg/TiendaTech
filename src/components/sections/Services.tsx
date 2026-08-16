import { Section, SectionHeading } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { services } from "@/lib/data";

export function Services() {
  return (
    <Section id="servicios">
      <Container>
        <SectionHeading
          eyebrow="Lo que hacemos"
          title="Servicios que ofrecemos"
          description="Diagnóstico, mantenimiento y actualización de hardware y software con garantía en cada visita."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.slug}>
              <div
                aria-hidden
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-ink-600 bg-ink-800 text-brand-400 transition-colors duration-300 group-hover:border-brand-500 group-hover:text-brand-300"
              >
                <Icon name={service.icon} />
              </div>
              <h3 className="text-lg font-bold text-mist-100">
                {service.title}{" "}
                <span className="text-brand-400">{service.highlight}</span>
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-mist-500">
                {service.description}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
