import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site-config";

/**
 * Cierre de sesión. Es POST a propósito: un GET permitiría que cualquier
 * imagen o enlace externo sacara al usuario de su cuenta.
 */
export async function POST() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  return NextResponse.redirect(siteConfig.url, { status: 303 });
}
