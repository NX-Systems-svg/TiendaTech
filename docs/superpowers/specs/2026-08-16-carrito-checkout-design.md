# Carrito de compras + Checkout con Stripe

Fecha: 2026-08-16

## Objetivo

Agregar un carrito de compras a TiendaTech: los usuarios pueden agregar
productos del catálogo, ver/editar cantidades, y pagar mediante Stripe
Checkout (llaves de prueba por ahora). No se persisten órdenes en base de
datos — el registro de pagos vive en el Stripe Dashboard.

## Alcance

- Carrito en cliente (Context API + localStorage), sin backend de sesión.
- Checkout real con Stripe Checkout Session (redirect hospedado por Stripe).
- Precios resueltos en servidor desde `src/lib/data.ts` (nunca confiar en
  precio enviado por el cliente).
- Páginas de resultado: éxito (vacía el carrito) y cancelado.
- Fuera de alcance: cuentas de usuario, historial de pedidos, envío de
  notificaciones por correo/WhatsApp, persistencia en Supabase, webhooks de
  Stripe (se puede agregar después si se necesita reconciliar pagos).

## Arquitectura

```
CartContext (localStorage) ──> CartButton (Header) ──> CartDrawer
                                                          │
                                                          ▼
                                          POST /api/checkout {items:[{slug,qty}]}
                                                          │
                                          resuelve precios desde data.ts (Zod)
                                                          │
                                          crea Stripe Checkout Session (price_data)
                                                          │
                                                          ▼
                                          redirect a Stripe Checkout (hospedado)
                                                          │
                                          ┌───────────────┴───────────────┐
                                          ▼                               ▼
                              /checkout/exito (vacía carrito)   /checkout/cancelado
```

## Componentes nuevos

- `src/lib/cart-context.tsx` — `CartProvider` + hook `useCart()`
  (`items`, `add(slug, qty)`, `remove(slug)`, `updateQty(slug, qty)`,
  `clear()`, `subtotal`). Persiste en `localStorage` bajo la clave
  `tiendatech-cart`, sincroniza en cada cambio con `useEffect`.
- `src/components/cart/CartButton.tsx` — ícono carrito en `Header` con
  badge de cantidad total de items.
- `src/components/cart/CartDrawer.tsx` — panel lateral (overlay) con lista
  de items, controles de cantidad, subtotal y botón "Pagar con Stripe".
- `src/app/api/checkout/route.ts` — recibe `{items:[{slug,qty}]}`, valida
  con Zod, resuelve cada `slug` contra `products` en `data.ts` (descarta
  slugs desconocidos), crea una Stripe Checkout Session en modo `payment`
  con `line_items` usando `price_data` (moneda MXN, `unit_amount` en
  centavos), `success_url` → `/checkout/exito`, `cancel_url` →
  `/checkout/cancelado`. Devuelve `{url}` para redirigir.
- `src/app/checkout/exito/page.tsx` — mensaje de confirmación, vacía el
  carrito vía `useCart().clear()` en un `useEffect` de cliente.
- `src/app/checkout/cancelado/page.tsx` — mensaje de cancelación, deja el
  carrito intacto.
- `ProductCatalog.tsx` — botón "Agregar al carrito" por producto (usa
  `useCart().add`).
- `layout.tsx` — envuelve la app con `<CartProvider>`.

## Datos y validación

- Tipo de item en carrito (cliente): `{ slug: string; qty: number }`.
- Zod schema en el servidor (`src/lib/validations/cart.ts`):
  `items: z.array(z.object({ slug: z.string(), qty: z.number().int().positive().max(20) })).min(1)`.
- El servidor ignora cualquier campo de precio/nombre que llegue del
  cliente; siempre relee de `products` en `data.ts` por `slug`.

## Manejo de errores

- `slug` no encontrado en `data.ts` → se omite ese item (no rompe el
  checkout completo); si tras filtrar no queda ningún item válido, la API
  responde 400.
- Error al crear la sesión de Stripe (llaves inválidas, red) → API
  responde 500 con mensaje genérico; el `CartDrawer` muestra un error
  inline y no navega.
- `localStorage` no disponible (SSR, modo privado estricto) → el
  `CartProvider` degrada a estado en memoria sin persistencia, sin
  lanzar excepciones.

## Testing

Verificación manual en navegador (no hay suite de tests automatizados en
el proyecto todavía):
1. Agregar 2 productos distintos al carrito, confirmar contador en
   `CartButton` y contenido del `CartDrawer`.
2. Editar cantidad de un item, confirmar que el subtotal se recalcula.
3. Recargar la página, confirmar que el carrito persiste (localStorage).
4. Clic en "Pagar", confirmar redirect a Stripe Checkout hospedado con los
   montos correctos.
5. Completar pago con tarjeta de prueba `4242 4242 4242 4242`, confirmar
   redirect a `/checkout/exito` y que el carrito quedó vacío.
6. Cancelar desde Stripe Checkout, confirmar redirect a
   `/checkout/cancelado` y que el carrito NO se vació.

## Config

Llaves de Stripe de prueba ya guardadas en `.env.local` (no versionado):
`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`. Al pasar a
producción, reemplazar por las llaves `live` — se le recordará al usuario
explícitamente en ese momento.
