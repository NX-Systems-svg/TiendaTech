import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { quoteRequestSchema } from "@/lib/validations/quote";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido." }, { status: 400 });
  }

  const parsed = quoteRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos.", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const { name, phone, email, interest, message } = parsed.data;

  // Se inserta con la llave de servicio: la tabla no acepta escrituras desde el
  // navegador, así que nadie puede llenarla de basura con la llave publicable.
  let supabase;

  try {
    supabase = createAdminClient();
  } catch (error) {
    console.error("[quote] Supabase no está configurado", error);
    return NextResponse.json(
      { error: "No pudimos recibir tu solicitud. Escríbenos por WhatsApp." },
      { status: 503 },
    );
  }

  const { error } = await supabase.from("cotizaciones").insert({
    nombre: name,
    telefono: phone,
    correo: email || null,
    interes: interest,
    mensaje: message,
  });

  if (error) {
    // Antes esta ruta respondía siempre "ok" y solo hacía console.log: el
    // cliente veía "¡Solicitud enviada!" y la petición se perdía para siempre.
    // Vale más decirle que no se pudo, para que llame por WhatsApp, que
    // dejarlo esperando una respuesta que nunca va a llegar.
    console.error("[quote] No se pudo guardar la cotización", error);
    return NextResponse.json(
      { error: "No pudimos recibir tu solicitud. Escríbenos por WhatsApp." },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
