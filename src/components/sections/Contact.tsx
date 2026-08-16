import { MessageCircle, Mail } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/sections/ContactForm";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "@/components/ui/SocialIcons";
import { siteConfig } from "@/lib/site-config";

export function Contact() {
  const whatsappHref = `https://wa.me/52${siteConfig.contact.whatsapp}`;

  return (
    <Section id="contacto" className="border-t border-ink-800/80">
      <Container>
        <SectionHeading
          eyebrow="Hablemos"
          title="Solicita tu cotización"
          description="Cuéntanos qué necesitas y te contactamos con la mejor solución al mejor precio."
        />

        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-ink-700 bg-ink-850/60 p-6 elevation-raised sm:p-8">
              <ContactForm />
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-2">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl border border-ink-700 bg-ink-850/60 p-5 elevation-base transition-colors duration-200 hover:border-brand-500"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500/10 text-brand-400">
                <MessageCircle className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="block text-sm text-mist-500">WhatsApp</span>
                <span className="block font-semibold text-mist-100">
                  {siteConfig.contact.whatsappDisplay}
                </span>
              </span>
            </a>

            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="flex items-center gap-4 rounded-2xl border border-ink-700 bg-ink-850/60 p-5 elevation-base transition-colors duration-200 hover:border-brand-500"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-500/10 text-accent-400">
                <Mail className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="block text-sm text-mist-500">Correo</span>
                <span className="block font-semibold text-mist-100">
                  {siteConfig.contact.email}
                </span>
              </span>
            </a>

            <div className="flex flex-col gap-3 rounded-2xl border border-ink-700 bg-ink-850/60 p-5 elevation-base">
              <span className="text-sm text-mist-500">Redes sociales</span>
              <div className="flex gap-3">
                <a
                  href={siteConfig.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook de Garduño Tech"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-600 text-mist-300 transition-colors duration-200 hover:border-brand-500 hover:text-brand-400"
                >
                  <FacebookIcon className="h-4.5 w-4.5" />
                </a>
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram de Garduño Tech"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-600 text-mist-300 transition-colors duration-200 hover:border-brand-500 hover:text-brand-400"
                >
                  <InstagramIcon className="h-4.5 w-4.5" />
                </a>
                <a
                  href={siteConfig.social.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok de Garduño Tech"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-600 text-mist-300 transition-colors duration-200 hover:border-brand-500 hover:text-brand-400"
                >
                  <TikTokIcon className="h-4.5 w-4.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
