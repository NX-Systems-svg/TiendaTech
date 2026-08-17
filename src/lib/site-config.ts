/**
 * URL base del sitio. Se usa para construir los destinos de retorno de Stripe
 * y de Google, así que DEBE ser el dominio real donde corre la app.
 *
 * Se toma de una variable de entorno (no del header Host de la petición) para
 * que nadie pueda inyectar un dominio ajeno y desviar esos retornos.
 * En local, `.env.local` la fija a http://localhost:3000.
 */
const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://tiendatech-teal.vercel.app"
).replace(/\/$/, "");

export const siteConfig = {
  name: "Garduño Tech",
  tagline: "Soluciones tecnológicas que conectan ideas",
  description:
    "Mantenimiento de computadoras (escritorios y laptops), venta de equipo y componentes tecnológicos bajo pedido, y desarrollo web. Diagnóstico, cambio de SSD, actualización de RAM, instalación de sistema operativo y paquetería Office con garantía en Querétaro.",
  url: siteUrl,
  locale: "es_MX",
  themeColor: "#05070d",
  contact: {
    whatsapp: "4424515885",
    whatsappDisplay: "442 451 5885",
    email: "garduno.tech@gmail.com",
  },
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61591920626241",
    instagram: "https://www.instagram.com/garduno.tech/",
    tiktok: "https://www.tiktok.com/@gardunotech",
  },
} as const;
