import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // El panel y las rutas de sesión/API no aportan nada en un buscador, y
      // el panel además no debe salir listado en ningún lado.
      disallow: ["/admin", "/api/", "/auth/", "/checkout/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
