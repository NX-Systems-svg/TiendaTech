import nodemailer from "nodemailer";
import { siteConfig } from "@/lib/site-config";

/**
 * Envía correos con la cuenta de Gmail del negocio.
 * Requiere una "contraseña de aplicación" de Google (no la contraseña normal).
 */
function createTransport() {
  const user = process.env.GMAIL_USER ?? siteConfig.contact.email;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!pass) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export type OrderLine = {
  name: string;
  quantity: number;
  amount: number;
};

/**
 * Avisa al dueño del negocio que entró una venta.
 *
 * Nunca lanza excepción: un fallo de correo no debe hacer que Stripe reintente
 * el webhook ni que se pierda el pedido, que ya quedó guardado en la base.
 */
export async function sendSaleNotification(params: {
  email: string | null;
  amountTotal: number;
  lines: OrderLine[];
  sessionId: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const transport = createTransport();

  if (!transport) {
    return { sent: false, reason: "GMAIL_APP_PASSWORD no configurada" };
  }

  const money = (cents: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
      cents / 100,
    );

  const rows = params.lines
    .map((line) => `<li>${line.quantity} × ${line.name} — ${money(line.amount)}</li>`)
    .join("");

  const to = process.env.GMAIL_USER ?? siteConfig.contact.email;

  try {
    await transport.sendMail({
      from: `"${siteConfig.name}" <${to}>`,
      to,
      subject: `Nueva venta: ${money(params.amountTotal)}`,
      html: `
        <h2>Recibiste un pago</h2>
        <p><strong>Total:</strong> ${money(params.amountTotal)}</p>
        <p><strong>Cliente:</strong> ${params.email ?? "sin correo"}</p>
        <h3>Detalle</h3>
        <ul>${rows}</ul>
        <p style="color:#666;font-size:12px">Sesión de Stripe: ${params.sessionId}</p>
      `,
    });
    return { sent: true };
  } catch (error) {
    console.error("[mailer] No se pudo enviar el aviso de venta", error);
    return { sent: false, reason: "error al enviar" };
  }
}
