import { NextResponse } from "next/server";
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

  // TODO: persistir en Supabase y/o notificar por correo/WhatsApp cuando estén
  // configuradas las credenciales (SUPABASE_SERVICE_ROLE) en variables de entorno.
  console.info("[quote] Nueva solicitud de cotización recibida", {
    interest: parsed.data.interest,
    name: parsed.data.name,
  });

  return NextResponse.json({ ok: true });
}
