# Carrito de compras + Checkout con Stripe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a shopping cart to TiendaTech (add/edit/remove products, localStorage persistence) with a real Stripe Checkout payment flow, using Stripe test keys already stored in `.env.local`.

**Architecture:** Client-side `CartContext` (React Context + localStorage) drives a `CartButton`/`CartDrawer` UI. Checkout is handled by a server API route that re-resolves prices from `src/lib/data.ts` (never trusts client-sent prices) and creates a Stripe Checkout Session via `price_data`, redirecting the browser to Stripe's hosted page. No order data is persisted server-side — Stripe Dashboard is the system of record.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Zod, Tailwind v4, `stripe` npm SDK (server-side only), `lucide-react` icons.

**Spec:** [docs/superpowers/specs/2026-08-16-carrito-checkout-design.md](../specs/2026-08-16-carrito-checkout-design.md)

## Global Constraints

- Precios del carrito SIEMPRE se resuelven en el servidor desde `products` en `src/lib/data.ts` por `slug` — nunca se confía en un precio enviado por el cliente.
- `success_url`/`cancel_url` de Stripe se construyen a partir de `siteConfig.url` (valor fijo del código), NUNCA del header `Origin`/`Host` de la request, para evitar open-redirect / host header injection.
- Moneda: MXN. `unit_amount` de Stripe va en centavos (`priceFrom * 100`, redondeado).
- El proyecto no tiene suite de tests automatizados todavía (confirmado en el spec). Cada tarea se verifica manualmente con el servidor de desarrollo (`npm run dev`) en vez de un ciclo TDD — se documenta explícitamente en cada tarea qué probar y qué esperar.
- Zod ya es una dependencia (`^4.4.3`) — reutilizar el mismo patrón de `src/lib/validations/quote.ts` para el nuevo schema de carrito.
- No modificar el flujo de cotización existente (`ContactForm`, `/api/quote`) — el carrito es un flujo aparte.
- Llaves de Stripe ya están en `.env.local` (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`) — no pedirlas de nuevo, no commitearlas.

---

## Task 1: Stripe server client, cart validation schema, and checkout API route

**Files:**
- Create: `src/lib/stripe.ts`
- Create: `src/lib/validations/cart.ts`
- Create: `src/app/api/checkout/route.ts`
- Modify: `package.json` (add `stripe` dependency)

**Interfaces:**
- Consumes: `products` from `src/lib/data.ts` (`{ slug, name, category, priceFrom, image }`), `siteConfig.url` from `src/lib/site-config.ts`.
- Produces: `POST /api/checkout` — accepts `{ items: { slug: string; qty: number }[] }`, returns `{ url: string }` on success (200) or `{ error: string, issues?: object }` on failure (400/422/500). This is the exact contract `CartDrawer` (Task 3) will call.

- [ ] **Step 1: Install the Stripe SDK**

Run:
```bash
npm install stripe
```

- [ ] **Step 2: Create the server-only Stripe client**

Create `src/lib/stripe.ts`:

```ts
import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error("STRIPE_SECRET_KEY no está configurada. Revisa .env.local.");
}

export const stripe = new Stripe(secretKey);
```

- [ ] **Step 3: Create the cart validation schema**

Create `src/lib/validations/cart.ts`:

```ts
import { z } from "zod";

export const cartCheckoutSchema = z.object({
  items: z
    .array(
      z.object({
        slug: z.string().min(1),
        qty: z.number().int().positive().max(20),
      }),
    )
    .min(1)
    .max(50),
});

export type CartCheckoutInput = z.infer<typeof cartCheckoutSchema>;
```

- [ ] **Step 4: Create the checkout API route**

Create `src/app/api/checkout/route.ts`:

```ts
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
```

Note: `success_url`/`cancel_url` use `siteConfig.url` (`https://garduno.tech`), not a header — this is intentional (see Global Constraints). When testing locally, Stripe will still redirect to the production domain; that's expected for this task's manual test (Task 5 covers the full local redirect flow via `NEXT_PUBLIC_SITE_URL`-independent local testing using Stripe's own test-mode UI, which allows navigating back manually).

- [ ] **Step 5: Manual verification**

Run: `npm run dev`

Then, in another terminal, run:
```bash
curl -s -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"items":[{"slug":"ssd-nvme-1tb","qty":2}]}'
```

Expected: JSON response with a `url` field pointing to `https://checkout.stripe.com/...`.

Also verify the error paths:
```bash
curl -s -X POST http://localhost:3000/api/checkout -H "Content-Type: application/json" -d '{"items":[]}'
curl -s -X POST http://localhost:3000/api/checkout -H "Content-Type: application/json" -d '{"items":[{"slug":"no-existe","qty":1}]}'
```

Expected: first returns 422 (empty array fails `min(1)`), second returns 400 (`"No hay productos válidos en el carrito."`).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/lib/stripe.ts src/lib/validations/cart.ts src/app/api/checkout/route.ts
git commit -m "feat: agregar API de checkout con Stripe"
```

---

## Task 2: Cart context with localStorage persistence

**Files:**
- Create: `src/lib/cart-context.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `products` from `src/lib/data.ts`.
- Produces: `CartProvider` component and `useCart()` hook returning
  `{ items: {slug:string; qty:number}[]; add(slug:string, qty?:number):void; remove(slug:string):void; updateQty(slug:string, qty:number):void; clear():void; itemCount:number; subtotal:number }`.
  Tasks 3 and 4 depend on this exact shape.

- [ ] **Step 1: Create the cart context**

Create `src/lib/cart-context.tsx`:

```tsx
"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { products } from "@/lib/data";

export type CartItem = {
  slug: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  add: (slug: string, qty?: number) => void;
  remove: (slug: string) => void;
  updateQty: (slug: string, qty: number) => void;
  clear: () => void;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "tiendatech-cart";

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CartItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as CartItem).slug === "string" &&
        typeof (item as CartItem).qty === "number" &&
        (item as CartItem).qty > 0,
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // localStorage no disponible (p.ej. modo privado estricto):
      // el carrito sigue funcionando en memoria durante la sesión.
    }
  }, [items, hydrated]);

  const add = (slug: string, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.slug === slug);
      if (existing) {
        return prev.map((item) =>
          item.slug === slug ? { ...item, qty: item.qty + qty } : item,
        );
      }
      return [...prev, { slug, qty }];
    });
  };

  const remove = (slug: string) => {
    setItems((prev) => prev.filter((item) => item.slug !== slug));
  };

  const updateQty = (slug: string, qty: number) => {
    if (qty <= 0) {
      remove(slug);
      return;
    }
    setItems((prev) => prev.map((item) => (item.slug === slug ? { ...item, qty } : item)));
  };

  const clear = () => setItems([]);

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.qty, 0), [items]);

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const product = products.find((p) => p.slug === item.slug);
        return product ? sum + product.priceFrom * item.qty : sum;
      }, 0),
    [items],
  );

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, clear, itemCount, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
```

- [ ] **Step 2: Wrap the app with `CartProvider`**

Modify `src/app/layout.tsx` — add the import and wrap `{children}`:

```tsx
import { CartProvider } from "@/lib/cart-context";
```

Change the `<body>` block from:
```tsx
      <body className="min-h-full flex flex-col bg-ink-950 text-mist-100">
        <Script
          id="local-business-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
```
to:
```tsx
      <body className="min-h-full flex flex-col bg-ink-950 text-mist-100">
        <Script
          id="local-business-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <CartProvider>{children}</CartProvider>
      </body>
```

- [ ] **Step 3: Manual verification**

Run: `npm run build`

Expected: build succeeds with no TypeScript errors (confirms `CartProvider` typechecks and layout compiles). This is a compile-time check since there's no UI wired to the context yet — Task 3 adds the first visible consumer.

- [ ] **Step 4: Commit**

```bash
git add src/lib/cart-context.tsx src/app/layout.tsx
git commit -m "feat: agregar CartContext con persistencia en localStorage"
```

---

## Task 3: CartButton + CartDrawer wired into Header

**Files:**
- Create: `src/components/cart/CartButton.tsx`
- Create: `src/components/cart/CartDrawer.tsx`
- Modify: `src/components/layout/Header.tsx`

**Interfaces:**
- Consumes: `useCart()` from Task 2 (`items`, `itemCount`, `subtotal`, `updateQty`, `remove`), `products` from `src/lib/data.ts`, `Button` from `src/components/ui/Button.tsx`.
- Produces: `<CartButton onClick={() => void}>` and `<CartDrawer open={boolean} onClose={() => void}>` — Task 4 does not consume these directly (it only calls `useCart().add`), but relies on `CartDrawer` already existing to display added items.
- Note: `CartDrawer`'s "Pagar con Stripe" button calls `POST /api/checkout` (built in Task 1) — this task wires that call in, so end-to-end checkout is testable once Task 4 lets you add a real product.

- [ ] **Step 1: Create `CartButton`**

Create `src/components/cart/CartButton.tsx`:

```tsx
"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export function CartButton({ onClick }: { onClick: () => void }) {
  const { itemCount } = useCart();

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative inline-flex items-center justify-center rounded-full border border-ink-700 p-2.5 text-mist-100 transition-colors duration-200 hover:border-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
      aria-label={`Carrito de compras${itemCount > 0 ? `, ${itemCount} artículos` : ""}`}
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-ink-950">
          {itemCount}
        </span>
      ) : null}
    </button>
  );
}
```

- [ ] **Step 2: Create `CartDrawer`**

Create `src/components/cart/CartDrawer.tsx`:

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart-context";
import { products } from "@/lib/data";

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, updateQty, remove, subtotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleCheckout = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ slug: item.slug, qty: item.qty })),
        }),
      });

      if (!res.ok) {
        setError("No pudimos iniciar el pago. Intenta de nuevo en un momento.");
        return;
      }

      const data: { url?: string } = await res.json();
      if (typeof data.url === "string") {
        window.location.href = data.url;
      } else {
        setError("No pudimos iniciar el pago. Intenta de nuevo en un momento.");
      }
    } catch {
      setError("No pudimos conectar con el servidor de pagos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        aria-label="Cerrar carrito"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div className="relative flex h-full w-full max-w-md flex-col bg-ink-900 border-l border-ink-700 p-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-mist-100">Tu carrito</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar carrito"
            className="rounded-full p-2 text-mist-300 hover:bg-ink-800 hover:text-mist-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <p className="mt-8 text-sm text-mist-500">Tu carrito está vacío.</p>
        ) : (
          <div className="mt-6 flex-1 space-y-4">
            {items.map((item) => {
              const product = products.find((p) => p.slug === item.slug);
              if (!product) return null;
              return (
                <div key={item.slug} className="flex gap-3 rounded-xl border border-ink-700 p-3">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  />
                  <div className="flex flex-1 flex-col gap-1">
                    <p className="text-sm font-semibold text-mist-100">{product.name}</p>
                    <p className="text-xs text-mist-500">
                      {currencyFormatter.format(product.priceFrom)}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQty(item.slug, item.qty - 1)}
                        aria-label="Disminuir cantidad"
                        className="rounded-full border border-ink-600 p-1 hover:border-brand-500"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.slug, item.qty + 1)}
                        aria-label="Aumentar cantidad"
                        className="rounded-full border border-ink-600 p-1 hover:border-brand-500"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(item.slug)}
                        aria-label="Eliminar producto"
                        className="ml-auto rounded-full p-1 text-mist-500 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 border-t border-ink-700 pt-4">
          <div className="mb-4 flex items-center justify-between text-sm font-semibold text-mist-100">
            <span>Subtotal</span>
            <span>{currencyFormatter.format(subtotal)}</span>
          </div>
          {error ? <p className="mb-3 text-xs text-red-400">{error}</p> : null}
          <Button
            onClick={handleCheckout}
            disabled={items.length === 0 || loading}
            className="w-full"
          >
            {loading ? "Redirigiendo…" : "Pagar con Stripe"}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wire into `Header`**

Modify `src/components/layout/Header.tsx`:

Add imports:
```tsx
import { CartButton } from "@/components/cart/CartButton";
import { CartDrawer } from "@/components/cart/CartDrawer";
```

Add cart-open state next to the existing `open` state:
```tsx
export function Header() {
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const whatsappHref = `https://wa.me/52${siteConfig.contact.whatsapp}`;
```

Render `CartButton` next to the WhatsApp button (both desktop and mobile need access — place it just before the mobile hamburger button so it's always visible):

Replace:
```tsx
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-full border border-ink-700 p-2.5 text-mist-100 transition-colors duration-200 hover:border-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 md:hidden"
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>
```
with:
```tsx
        <div className="flex items-center gap-2">
          <CartButton onClick={() => setCartOpen(true)} />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-full border border-ink-700 p-2.5 text-mist-100 transition-colors duration-200 hover:border-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 md:hidden"
            aria-expanded={open}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>
```

And render the drawer at the end of the header, right before the closing `</header>`:
```tsx
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
```

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, open `http://localhost:3000` in the browser.

1. Confirm a cart icon appears in the header (desktop and mobile widths).
2. Click it — the drawer opens from the right, showing "Tu carrito está vacío."
3. Click the backdrop or the X — the drawer closes.
4. No console errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/cart/CartButton.tsx src/components/cart/CartDrawer.tsx src/components/layout/Header.tsx
git commit -m "feat: agregar CartButton y CartDrawer en el header"
```

---

## Task 4: "Agregar al carrito" button in ProductCatalog

**Files:**
- Modify: `src/components/sections/ProductCatalog.tsx`

**Interfaces:**
- Consumes: `useCart().add(slug: string, qty?: number)` from Task 2.

- [ ] **Step 1: Convert to a client component and add the cart button**

Modify `src/components/sections/ProductCatalog.tsx` — add `"use client";` as the first line, add the `useCart` import, and add an "Agregar al carrito" button per product card.

Full updated file:

```tsx
"use client";

import Image from "next/image";
import { PackageSearch } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { products } from "@/lib/data";
import { useCart } from "@/lib/cart-context";

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export function ProductCatalog() {
  const { add } = useCart();

  return (
    <Section id="productos" className="border-t border-ink-800/80 bg-ink-900/40">
      <Container>
        <SectionHeading
          eyebrow="Equipo y componentes"
          title="Productos bajo pedido"
          description="Trabajamos como intermediarios con proveedores certificados: cotizamos, conseguimos y entregamos el equipo que necesitas, sin manejar inventario propio."
        />

        <div className="mb-10 flex items-start gap-3 rounded-2xl border border-ink-700 bg-ink-850/60 p-4 text-sm text-mist-500 sm:items-center">
          <PackageSearch className="mt-0.5 h-5 w-5 shrink-0 text-brand-400 sm:mt-0" aria-hidden />
          <p>
            Los precios son de referencia y pueden variar según disponibilidad del
            proveedor. Al confirmar tu pedido te damos costo final y tiempo de entrega
            antes de cualquier pago.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.slug} className="flex flex-col p-0">
              <div className="overflow-hidden rounded-t-2xl border-b border-ink-700">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={600}
                  height={450}
                  className="aspect-4/3 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <Badge>{product.category}</Badge>
                <h3 className="text-base font-bold text-mist-100">{product.name}</h3>
                <p className="text-sm text-mist-500">
                  Desde{" "}
                  <span className="font-semibold text-brand-400">
                    {currencyFormatter.format(product.priceFrom)}
                  </span>
                </p>
                <div className="mt-auto flex flex-col gap-2 pt-2">
                  <Button
                    onClick={() => add(product.slug)}
                    className="w-full !py-2.5 text-sm"
                  >
                    Agregar al carrito
                  </Button>
                  <Button
                    href={`#contacto?producto=${encodeURIComponent(product.name)}`}
                    variant="secondary"
                    className="w-full !py-2.5 text-sm"
                  >
                    Solicitar cotización
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 2: Manual verification**

Run: `npm run dev`, open `http://localhost:3000#productos`.

1. Click "Agregar al carrito" on a product — the header cart badge should show `1`.
2. Click it again on the same product — badge should show `2` (quantity increments, not a duplicate row).
3. Open the cart drawer — confirm the product appears with the right name, price, and quantity, and the subtotal matches `priceFrom * qty` summed across items.
4. Reload the page — confirm the cart still shows the same items (localStorage persistence from Task 2).

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/ProductCatalog.tsx
git commit -m "feat: agregar boton 'Agregar al carrito' en el catalogo de productos"
```

---

## Task 5: Success/cancel pages and end-to-end payment test

**Files:**
- Create: `src/app/checkout/exito/page.tsx`
- Create: `src/app/checkout/cancelado/page.tsx`

**Interfaces:**
- Consumes: `useCart().clear()` from Task 2, `Button` from `src/components/ui/Button.tsx`.

- [ ] **Step 1: Create the success page**

Create `src/app/checkout/exito/page.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart-context";

export default function CheckoutExitoPage() {
  const { clear } = useCart();

  useEffect(() => {
    clear();
    // Se ejecuta una sola vez al montar: vaciar el carrito tras un pago
    // exitoso no debe repetirse si `clear` se re-crea entre renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <CheckCircle2 className="h-14 w-14 text-brand-400" aria-hidden />
      <h1 className="font-display text-2xl font-bold text-mist-100">¡Pago recibido!</h1>
      <p className="max-w-md text-sm text-mist-500">
        Gracias por tu compra. Te contactaremos en breve para coordinar la entrega.
      </p>
      <Button href="/">Volver al inicio</Button>
    </Container>
  );
}
```

- [ ] **Step 2: Create the cancel page**

Create `src/app/checkout/cancelado/page.tsx`:

```tsx
import { XCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function CheckoutCanceladoPage() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <XCircle className="h-14 w-14 text-mist-500" aria-hidden />
      <h1 className="font-display text-2xl font-bold text-mist-100">Pago cancelado</h1>
      <p className="max-w-md text-sm text-mist-500">
        No se realizó ningún cargo. Tu carrito sigue intacto si quieres continuar.
      </p>
      <Button href="/">Volver al inicio</Button>
    </Container>
  );
}
```

- [ ] **Step 3: Manual end-to-end verification**

Since `success_url`/`cancel_url` point at `siteConfig.url` (`https://garduno.tech`, per Global Constraints), the redirect after a real Stripe test payment will NOT land back on `localhost`. To verify these pages locally:

1. Run `npm run dev` and navigate directly to `http://localhost:3000/checkout/exito` — confirm it shows the success message and does not throw (even with an empty cart, `clear()` on an empty cart is a no-op).
2. Navigate directly to `http://localhost:3000/checkout/cancelado` — confirm it shows the cancel message.
3. Add a product to the cart, then navigate to `/checkout/exito` — confirm the header cart badge disappears (cart cleared).
4. Add a product to the cart, then navigate to `/checkout/cancelado` — confirm the header cart badge is unchanged (cart NOT cleared).

To verify the full real redirect (optional, once the site is deployed or tested via a tunnel to a public URL matching `siteConfig.url`): add a product, click "Pagar con Stripe", complete payment with Stripe's test card `4242 4242 4242 4242`, any future expiry, any CVC — confirm redirect to `/checkout/exito` and an empty cart afterward.

- [ ] **Step 4: Commit**

```bash
git add src/app/checkout/exito/page.tsx src/app/checkout/cancelado/page.tsx
git commit -m "feat: agregar paginas de resultado de checkout (exito/cancelado)"
```

---

## Task 6: Security audit pass

**Files:**
- No new files expected; this task reviews everything touched in Tasks 1-5 and fixes findings in place.

**Interfaces:**
- N/A (review task).

- [ ] **Step 1: Run the project's security-review skill against the full diff**

Invoke the `security-review` skill (or `/security-review` if running interactively) against the branch changes from Tasks 1-5. It should specifically confirm:
- No secrets (Stripe keys) are logged, returned in API responses, or committed to git (`git log -p -- .env.local` should show nothing — the file was never staged).
- `/api/checkout` validates and sanitizes all client input with Zod before use (already done in Task 1) and never trusts a client-sent price (already done — prices come from `products` in `data.ts`).
- `/api/checkout` never reflects the `Origin`/`Host` header into `success_url`/`cancel_url` (already fixed in Task 1 — uses `siteConfig.url`).
- Existing security headers in `next.config.ts` (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) still cover the new `js.stripe.com`/`api.stripe.com`/`hooks.stripe.com` origins used by Stripe Checkout — confirm by reading `next.config.ts:7-18` (already allow-listed, added ahead of this feature).
- New client components (`CartDrawer`, `ProductCatalog`) don't use `dangerouslySetInnerHTML` or render unsanitized user input.

- [ ] **Step 2: Run `npm audit` for dependency vulnerabilities**

Run:
```bash
npm audit --omit=dev
```

Expected: no high/critical vulnerabilities in production dependencies (including the newly added `stripe` package). If any appear, run `npm audit fix` and re-verify `npm run build` still succeeds.

- [ ] **Step 3: Manual OWASP-aligned checklist**

Verify each item by reading the relevant file (no code changes expected if Tasks 1-5 were followed correctly; fix inline if not):

1. **Injection** — `/api/checkout` only accepts `{slug, qty}` validated by Zod; `slug` is used solely as a lookup key against a hardcoded array (`products.find`), never interpolated into a query, shell command, or HTML. ✓
2. **Broken access control** — no auth-gated resources are touched by this feature; nothing to check.
3. **Sensitive data exposure** — `STRIPE_SECRET_KEY` is read only in `src/lib/stripe.ts` (server-only module, never imported by a `"use client"` file). Confirm with: `grep -rn "STRIPE_SECRET_KEY" src/` — it must appear ONLY in `src/lib/stripe.ts`.
4. **Security misconfiguration** — confirm `.env.local` is listed under `.env*` in `.gitignore` (already true) and `git status` shows it as untracked, not staged.
5. **XSS** — no new `dangerouslySetInnerHTML` usage; product names rendered via JSX text nodes (`{product.name}`) are auto-escaped by React.
6. **Insecure deserialization** — `JSON.parse` calls (in `cart-context.tsx` reading localStorage, and in the API route reading the request body) are both wrapped in `try/catch` and the parsed shape is validated (`readStoredCart` filters malformed entries; the API route runs the result through `cartCheckoutSchema`) before use.
7. **Using components with known vulnerabilities** — covered by Step 2 (`npm audit`).
8. **Insufficient logging/monitoring** — `console.error` on Stripe session-creation failure is already present in the API route; no PII or secrets are logged.
9. **CSRF** — `/api/checkout` only creates a Stripe session (no state-changing effect on TiendaTech's own data), and does not act on cookies/session identity, so a forged cross-site POST cannot do more than a legitimate visitor could already do by using the site normally. No cart/order data is stored server-side for an attacker to manipulate.
10. **Open redirect** — `success_url`/`cancel_url` are hardcoded to `siteConfig.url` and never derived from user input or request headers (verified in Task 1). ✓

- [ ] **Step 4: Fix any findings inline, then commit**

If Steps 1-3 surface any issues, fix them in the relevant file(s) now.

```bash
git add -A
git commit -m "chore: auditoria de seguridad del carrito y checkout"
```

(If no changes were needed, skip the commit — nothing to record.)

---
