import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para componentes del navegador.
 * Usa solo la llave publicable: nunca la de servicio.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
