import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para componentes del navegador.
 * Usa solo la llave publicable: nunca la de servicio.
 *
 * Devuelve null si el proyecto aún no tiene configurada la conexión, en vez de
 * lanzar una excepción: sin esa guarda, el prerenderizado de Next falla y se
 * cae el build del sitio completo por una función que todavía no se usa.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createBrowserClient(url, key);
}
