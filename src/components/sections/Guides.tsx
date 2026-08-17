import { Section, SectionHeading } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { guides } from "@/lib/data";

export function Guides() {
  return (
    <Section id="guias" className="border-t border-ink-800/80 bg-ink-900/40">
      <Container>
        <SectionHeading
          eyebrow="Aprende"
          title="Conoce de computadoras"
          description="Conceptos básicos explicados en simple, para que sepas exactamente qué necesita tu equipo antes de cotizar."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <Card key={guide.slug}>
              <div
                aria-hidden
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-ink-600 bg-ink-800 text-brand-400 transition-colors duration-300 group-hover:border-brand-500 group-hover:text-brand-300"
              >
                <Icon name={guide.icon} />
              </div>
              <h3 className="text-lg font-bold text-mist-100">
                {guide.title} <span className="text-brand-400">{guide.highlight}</span>
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-mist-500">
                {guide.description}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
