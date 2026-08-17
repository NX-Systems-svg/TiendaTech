import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site-config";

/**
 * Google devuelve aquí un código de un solo uso; se canjea por la sesión.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  // El destino se valida contra rutas internas: nunca se redirige a un dominio
  // que venga en la URL, para no abrir un open redirect.
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (!code) {
    return NextResponse.redirect(`${siteConfig.url}/?auth_error=1`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth] No se pudo canjear el código de sesión", error.message);
    return NextResponse.redirect(`${siteConfig.url}/?auth_error=1`);
  }

  return NextResponse.redirect(`${siteConfig.url}${safeNext}`);
}
