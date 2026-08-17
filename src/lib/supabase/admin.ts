import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con llave de servicio: omite las políticas de seguridad a nivel de
 * fila. SOLO puede usarse en el servidor (webhooks y rutas de API).
 *
 * Nunca importar este archivo desde un componente con "use client": la llave
 * terminaría en el paquete que descarga el navegador.
 */
export function createAdminClient() {
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE;

  if (!serviceRole) {
    throw new Error("SUPABASE_SERVICE_ROLE no está configurada. Revisa .env.local.");
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
