import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { cartCheckoutSchema } from "@/lib/validations/cart";
import { products } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";

export async function POST(request: Request) {
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
    const product = products.find((p) => p.slug === item.slug);
    if (!product) return [];
    return [
      {
        quantity: item.qty,
        price_data: {
          currency: "mxn",
          unit_amount: Math.round(product.priceFrom * 100),
          product_data: {
            name: product.name,
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
      success_url: `${siteConfig.url}/checkout/exito`,
      cancel_url: `${siteConfig.url}/checkout/cancelado`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[checkout] Error creando sesión de Stripe", error);
    return NextResponse.json({ error: "No se pudo iniciar el pago." }, { status: 500 });
  }
}
