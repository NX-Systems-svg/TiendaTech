import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { trustBadges } from "@/lib/data";

export function TrustBadges() {
  return (
    <Section id="nosotros" className="py-14 sm:py-16">
      <Container>
        <div className="grid gap-8 border-t border-ink-800/80 pt-14 sm:grid-cols-2 lg:grid-cols-4">
          {trustBadges.map((badge) => (
            <div key={badge.title} className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-ink-600 bg-ink-800/70 text-accent-400 elevation-base">
                <Icon name={badge.icon} className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold text-mist-100">
                {badge.title} <span className="text-accent-400">{badge.highlight}</span>
              </p>
              <p className="text-xs leading-relaxed text-mist-500">{badge.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
