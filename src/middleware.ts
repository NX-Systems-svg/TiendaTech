import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresca el token de sesión en cada petición y lo reescribe en las cookies.
 * Sin esto la sesión expira a media navegación y el usuario "se sale" solo.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Sin configuración no hay sesión que refrescar. Se deja pasar la petición:
  // lo contrario tumbaría TODAS las páginas del sitio, no solo el login.
  if (!url || !key) return response;

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Obliga a revalidar el token. No quitar: sin esta llamada las cookies no se
  // refrescan y la sesión muere sola.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * Todas las rutas excepto archivos estáticos, imágenes optimizadas y los
     * webhooks (los llama Stripe servidor a servidor: no hay sesión que
     * refrescar y el middleware solo agregaría latencia al reintento).
     */
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
