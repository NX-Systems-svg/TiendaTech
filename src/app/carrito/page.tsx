"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart-context";
import { useCheckout } from "@/lib/use-checkout";
import { products } from "@/lib/data";

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export default function CarritoPage() {
  const { items, updateQty, remove, subtotal } = useCart();
  const { loading, error, checkout } = useCheckout();

  return (
    <>
      <Header />
      <main className="flex-1">
        <Section>
          <Container>
            <SectionHeading
              eyebrow="Tu pedido"
              title="Carrito de compras"
              align="left"
            />

            {items.length === 0 ? (
              <Card className="flex flex-col items-center gap-4 py-16 text-center">
                <ShoppingCart className="h-12 w-12 text-mist-500" aria-hidden />
                <p className="text-mist-300">Tu carrito está vacío.</p>
                <Button href="/#productos">Ver productos</Button>
              </Card>
            ) : (
              <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
                <div className="space-y-4 lg:col-span-2">
                  {items.map((item) => {
                    const product = products.find((p) => p.slug === item.slug);
                    if (!product) return null;
                    return (
                      <Card key={item.slug} className="flex gap-4 p-4 sm:p-5">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={140}
                          height={105}
                          className="h-24 w-32 shrink-0 rounded-xl object-cover sm:h-28 sm:w-40"
                        />
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <p className="font-semibold text-mist-100">{product.name}</p>
                            <p className="mt-1 text-sm text-mist-500">{product.category}</p>
                            <p className="mt-1 text-sm font-semibold text-brand-400">
                              {currencyFormatter.format(product.priceFrom)}
                            </p>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateQty(item.slug, item.qty - 1)}
                              aria-label="Disminuir cantidad"
                              className="rounded-full border border-ink-600 p-1.5 hover:border-brand-500"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.slug, item.qty + 1)}
                              aria-label="Aumentar cantidad"
                              disabled={item.qty >= 20}
                              className="rounded-full border border-ink-600 p-1.5 hover:border-brand-500 disabled:pointer-events-none disabled:opacity-50"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(item.slug)}
                              aria-label="Eliminar producto"
                              className="ml-auto flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm text-mist-500 hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}

                  <Link
                    href="/#productos"
                    className="inline-block text-sm font-semibold text-brand-400 hover:text-brand-300"
                  >
                    ← Seguir comprando
                  </Link>
                </div>

                <Card className="lg:sticky lg:top-24">
                  <h2 className="text-lg font-bold text-mist-100">Resumen</h2>
                  <div className="mt-4 flex items-center justify-between text-sm text-mist-500">
                    <span>Subtotal</span>
                    <span>{currencyFormatter.format(subtotal)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-ink-700 pt-4 text-base font-bold text-mist-100">
                    <span>Total</span>
                    <span>{currencyFormatter.format(subtotal)}</span>
                  </div>
                  <p className="mt-3 text-xs text-mist-500">
                    Costo final y tiempo de entrega se confirman antes de cualquier pago.
                  </p>
                  {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}
                  <Button
                    onClick={checkout}
                    disabled={loading}
                    className="mt-5 w-full"
                  >
                    {loading ? "Redirigiendo…" : "Pagar con Stripe"}
                  </Button>
                </Card>
              </div>
            )}
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
