import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { cartCheckoutSchema } from "@/lib/validations/cart";
import { findCatalogItem } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  // Se exige sesión para pagar. Esta es la verificación real: la del carrito
  // es solo de interfaz y cualquiera puede saltársela con una petición directa.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Inicia sesión para completar tu compra." },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido." }, { status: 400 });
  }

  const parsed = cartCheckoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos de carrito inválidos.", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const lineItems = parsed.data.items.flatMap((item) => {
    // El catálogo es la única fuente de precios. Un slug desconocido —o un
    // servicio sin precio fijo, que solo se ofrece por cotización— devuelve
    // null y se descarta, aunque venga en la petición.
    const entry = findCatalogItem(item.slug);
    if (!entry) return [];

    // Un servicio se cobra una sola vez por pedido, sin importar la cantidad
    // que llegue del cliente.
    const quantity = entry.kind === "servicio" ? 1 : item.qty;

    return [
      {
        quantity,
        price_data: {
          currency: "mxn",
          unit_amount: Math.round(entry.price * 100),
          product_data: {
            name: entry.name,
          },
        },
      },
    ];
  });

  if (lineItems.length === 0) {
    return NextResponse.json(
      { error: "No hay productos válidos en el carrito." },
      { status: 400 },
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      // Liga el pago a la cuenta que lo hizo: es lo que después alimenta el
      // aviso de pago y el panel de administración.
      customer_email: user.email,
      metadata: { user_id: user.id },
      success_url: `${siteConfig.url}/checkout/exito`,
      cancel_url: `${siteConfig.url}/checkout/cancelado`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[checkout] Error creando sesión de Stripe", error);
    return NextResponse.json({ error: "No se pudo iniciar el pago." }, { status: 500 });
  }
}
