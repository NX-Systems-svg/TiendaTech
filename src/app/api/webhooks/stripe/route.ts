import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendSaleNotification, type OrderLine } from "@/lib/mailer";

/**
 * Recibe los avisos de pago de Stripe.
 *
 * Es la única fuente confiable de "esto ya se pagó": la página de éxito depende
 * de que el navegador del cliente regrese, y eso falla si cierra la pestaña o
 * pierde la conexión.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET no está configurada");
    return NextResponse.json({ error: "Webhook no configurado." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Falta la firma." }, { status: 400 });
  }

  // La firma se calcula sobre el cuerpo tal cual llegó: hay que leerlo como
  // texto, sin parsear, o la verificación falla.
  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (error) {
    // Sin esta verificación cualquiera podría avisar "ya pagué" sin haber
    // pagado, y estaríamos entregando equipo gratis.
    console.error("[webhook] Firma inválida", error);
    return NextResponse.json({ error: "Firma inválida." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    // Los demás eventos se aceptan sin hacer nada, para que Stripe no reintente.
    return NextResponse.json({ received: true });
  }

  const session = event.data.object;

  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 100,
    });

    const lines: OrderLine[] = lineItems.data.map((item) => ({
      name: item.description ?? "Artículo",
      quantity: item.quantity ?? 1,
      amount: item.amount_total,
    }));

    const supabase = createAdminClient();

    // Stripe puede entregar el mismo evento más de una vez. `stripe_session_id`
    // es único y con `ignoreDuplicates` un reintento no crea un pedido repetido.
    const { error } = await supabase.from("orders").upsert(
      {
        stripe_session_id: session.id,
        user_id: session.metadata?.user_id ?? null,
        email: session.customer_email ?? session.customer_details?.email ?? null,
        items: lines,
        amount_total: session.amount_total ?? 0,
        currency: session.currency ?? "mxn",
        status: "paid",
      },
      { onConflict: "stripe_session_id", ignoreDuplicates: true },
    );

    if (error) {
      // Devolvemos 500 a propósito: Stripe reintentará y no perderemos la venta.
      console.error("[webhook] No se pudo guardar el pedido", error);
      return NextResponse.json({ error: "No se pudo guardar el pedido." }, { status: 500 });
    }

    // El correo va después de guardar: si falla, el pedido ya está a salvo.
    const mail = await sendSaleNotification({
      email: session.customer_email ?? session.customer_details?.email ?? null,
      amountTotal: session.amount_total ?? 0,
      lines,
      sessionId: session.id,
    });

    if (!mail.sent) {
      console.warn("[webhook] Pedido guardado, aviso por correo no enviado:", mail.reason);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[webhook] Error procesando el pago", error);
    return NextResponse.json({ error: "Error procesando el pago." }, { status: 500 });
  }
}
