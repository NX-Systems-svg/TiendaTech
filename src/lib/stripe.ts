import Stripe from "stripe";

let cached: Stripe | null = null;

/**
 * Cliente de Stripe. Solo puede usarse en el servidor.
 *
 * Devuelve null si falta STRIPE_SECRET_KEY, en vez de lanzar al evaluar el
 * módulo. La versión anterior lanzaba desde el cuerpo del archivo, y como
 * `next build` evalúa cada route handler para recolectar su configuración,
 * eso reventaba el build ENTERO del sitio —no solo la ruta de pago— en
 * cualquier entorno sin la llave. Es la misma guarda que ya tienen los
 * clientes de Supabase.
 */
export function getStripe(): Stripe | null {
  if (cached) return cached;

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) return null;

  cached = new Stripe(secretKey);

  return cached;
}
