import type { Metadata } from "next";
import { CircleDollarSign, Inbox, Package, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Card";
import { AccesoAdmin } from "./AccesoAdmin";

export const metadata: Metadata = {
  title: "Panel",
  // El panel no debe aparecer en Google ni heredar el og-image de la tienda.
  robots: { index: false, follow: false },
};

const dinero = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const fecha = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

type Pedido = {
  id: string;
  email: string | null;
  aviso_estado: string;
  aviso_detalle: string | null;
  amount_total: number;
  currency: string;
  status: string;
  created_at: string;
  items: { name: string; quantity: number }[] | null;
};

type Cotizacion = {
  id: string;
  nombre: string;
  telefono: string;
  correo: string | null;
  interes: string;
  mensaje: string;
  atendida: boolean;
  creado_en: string;
};

const etiquetaInteres: Record<string, string> = {
  servicio: "Servicio",
  producto: "Producto",
  otro: "Otro",
};

function Kpi({
  icono,
  titulo,
  valor,
  nota,
}: {
  icono: React.ReactNode;
  titulo: string;
  valor: string;
  nota: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-ink-700 bg-ink-850/80 p-5 elevation-base">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-600 bg-ink-800 text-brand-400">
        {icono}
      </span>
      <div>
        <p className="text-2xl font-bold text-mist-100">{valor}</p>
        <p className="text-sm font-medium text-mist-300">{titulo}</p>
        <p className="mt-0.5 text-xs text-mist-500">{nota}</p>
      </div>
    </div>
  );
}

function Vacio({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-600 bg-ink-900/60 p-8 text-center text-sm text-mist-500">
      {children}
    </div>
  );
}

export default async function PanelAdmin() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <main id="contenido" className="py-20">
        <Container>
          <AccesoAdmin />
        </Container>
      </main>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main id="contenido" className="py-20">
        <Container>
          <AccesoAdmin />
        </Container>
      </main>
    );
  }

  // Quién es administrador lo responde la base, no una lista en el código: la
  // misma función que gobierna las políticas RLS. Si esto dijera que sí y las
  // políticas que no, la página saldría vacía en vez de filtrar datos.
  const { data: esAdmin } = await supabase.rpc("es_admin");

  if (!esAdmin) {
    return (
      <main id="contenido" className="py-20">
        <Container>
          <AccesoAdmin correoActual={user.email} />
        </Container>
      </main>
    );
  }

  const [pedidosRes, cotizacionesRes] = await Promise.all([
    supabase
      .from("orders")
      .select("id, email, amount_total, currency, status, created_at, items, aviso_estado, aviso_detalle")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("cotizaciones")
      .select("id, nombre, telefono, correo, interes, mensaje, atendida, creado_en")
      .order("creado_en", { ascending: false })
      .limit(50),
  ]);

  const pedidos = (pedidosRes.data ?? []) as Pedido[];
  const cotizaciones = (cotizacionesRes.data ?? []) as Cotizacion[];

  // Los montos de Stripe vienen en centavos.
  const ingresos = pedidos.reduce((suma, p) => suma + (p.amount_total ?? 0), 0) / 100;
  const ticket = pedidos.length > 0 ? ingresos / pedidos.length : 0;
  const pendientes = cotizaciones.filter((c) => !c.atendida).length;
  const sinAvisar = pedidos.filter((p) => p.aviso_estado === "fallido").length;

  return (
    <main id="contenido" className="py-12 sm:py-16">
      <Container className="flex flex-col gap-10">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
            Garduño Tech
          </p>
          <h1 className="text-3xl font-bold text-mist-100 sm:text-4xl">
            Panel de administración
          </h1>
          <p className="text-sm text-mist-500">
            Sesión de {user.email}. Últimos 50 registros de cada tabla.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi
            icono={<CircleDollarSign className="h-5 w-5" aria-hidden />}
            titulo="Ingresos cobrados"
            valor={dinero.format(ingresos)}
            nota="Suma de pagos completados"
          />
          <Kpi
            icono={<Package className="h-5 w-5" aria-hidden />}
            titulo="Pedidos"
            valor={String(pedidos.length)}
            nota="Pagados en Stripe"
          />
          <Kpi
            icono={<TrendingUp className="h-5 w-5" aria-hidden />}
            titulo="Ticket promedio"
            valor={dinero.format(ticket)}
            nota="Ingresos entre pedidos"
          />
          <Kpi
            icono={<Inbox className="h-5 w-5" aria-hidden />}
            titulo="Cotizaciones por atender"
            valor={String(pendientes)}
            nota={`${cotizaciones.length} en total`}
          />
        </section>

        {sinAvisar > 0 ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-mist-100">
            <strong className="font-semibold">
              {sinAvisar === 1
                ? "1 venta no te avisó por correo."
                : `${sinAvisar} ventas no te avisaron por correo.`}
            </strong>{" "}
            El pedido sí quedó registrado. El motivo aparece en la columna
            &ldquo;Aviso&rdquo;.
          </div>
        ) : null}

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-mist-100">Pedidos</h2>

          {pedidos.length === 0 ? (
            <Vacio>
              Todavía no hay pedidos pagados. Si acabas de comprar y no aparece,
              revisa en Stripe que el webhook haya entregado el evento.
            </Vacio>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-ink-700">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-ink-800/60 text-xs uppercase tracking-wide text-mist-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Fecha</th>
                    <th className="px-4 py-3 font-semibold">Cliente</th>
                    <th className="px-4 py-3 font-semibold">Artículos</th>
                    <th className="px-4 py-3 font-semibold">Aviso</th>
                    <th className="px-4 py-3 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((p) => (
                    <tr key={p.id} className="border-t border-ink-700 align-top">
                      <td className="whitespace-nowrap px-4 py-3 text-mist-500">
                        {fecha.format(new Date(p.created_at))}
                      </td>
                      <td className="px-4 py-3 text-mist-300">{p.email ?? "—"}</td>
                      <td className="px-4 py-3 text-mist-300">
                        {(p.items ?? [])
                          .map((i) => `${i.quantity}× ${i.name}`)
                          .join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {p.aviso_estado === "enviado" ? (
                          <span className="text-mist-500">Enviado</span>
                        ) : p.aviso_estado === "fallido" ? (
                          <span
                            className="font-semibold text-red-400"
                            title={p.aviso_detalle ?? ""}
                          >
                            No se envió
                            {p.aviso_detalle ? (
                              <span className="block text-xs font-normal text-mist-500">
                                {p.aviso_detalle}
                              </span>
                            ) : null}
                          </span>
                        ) : (
                          <span className="text-mist-500">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-brand-400">
                        {dinero.format((p.amount_total ?? 0) / 100)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-mist-100">Cotizaciones</h2>

          {cotizaciones.length === 0 ? (
            <Vacio>
              Aún no llegan solicitudes por el formulario de contacto.
            </Vacio>
          ) : (
            <ul className="flex flex-col gap-3">
              {cotizaciones.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-col gap-3 rounded-2xl border border-ink-700 bg-ink-850/80 p-5"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold text-mist-100">{c.nombre}</p>
                    <Badge>{etiquetaInteres[c.interes] ?? c.interes}</Badge>
                    {!c.atendida && <Badge>Por atender</Badge>}
                    <span className="ml-auto text-xs text-mist-500">
                      {fecha.format(new Date(c.creado_en))}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-mist-300">{c.mensaje}</p>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <a
                      href={`https://wa.me/52${c.telefono.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-brand-400 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
                    >
                      WhatsApp {c.telefono}
                    </a>
                    {c.correo && (
                      <a
                        href={`mailto:${c.correo}`}
                        className="text-mist-300 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
                      >
                        {c.correo}
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Container>
    </main>
  );
}
