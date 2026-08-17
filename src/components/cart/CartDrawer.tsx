"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart-context";
import { useCheckout } from "@/lib/use-checkout";
import { products } from "@/lib/data";

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, updateQty, remove, subtotal, itemCount } = useCart();
  const { loading, error, checkout } = useCheckout();

  // Mientras el panel está abierto: cerrar con Escape y bloquear el scroll
  // del fondo para que solo se desplace el contenido del carrito.
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  // El panel se monta en <body> mediante un portal: el <header> aplica
  // backdrop-filter, que crea un containing block y atraparía este overlay
  // `fixed` dentro de la altura del header.
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Carrito de compras"
    >
      <button
        type="button"
        aria-label="Cerrar carrito"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div className="relative flex h-full w-full max-w-md flex-col border-l border-ink-700 bg-ink-900 elevation-floating">
        <div className="flex shrink-0 items-center justify-between border-b border-ink-700 px-6 py-5">
          <h2 className="font-display text-lg font-bold text-mist-100">
            Tu carrito{" "}
            {itemCount > 0 ? (
              <span className="text-sm font-medium text-mist-500">({itemCount})</span>
            ) : null}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar carrito"
            className="rounded-full p-2 text-mist-300 transition-colors hover:bg-ink-800 hover:text-mist-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <ShoppingCart className="h-10 w-10 text-mist-500" aria-hidden />
              <p className="text-sm text-mist-500">Tu carrito está vacío.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {items.map((item) => {
                  const product = products.find((p) => p.slug === item.slug);
                  if (!product) return null;
                  return (
                    <div
                      key={item.slug}
                      className="flex gap-3 rounded-xl border border-ink-700 bg-ink-850/60 p-3"
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={72}
                        height={72}
                        className="h-18 w-18 shrink-0 rounded-lg object-cover"
                      />
                      <div className="flex flex-1 flex-col gap-1">
                        <p className="text-sm font-semibold text-mist-100">{product.name}</p>
                        <p className="text-xs text-brand-400">
                          {currencyFormatter.format(product.priceFrom)}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQty(item.slug, item.qty - 1)}
                            aria-label="Disminuir cantidad"
                            className="rounded-full border border-ink-600 p-1 transition-colors hover:border-brand-500"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.slug, item.qty + 1)}
                            aria-label="Aumentar cantidad"
                            disabled={item.qty >= 20}
                            className="rounded-full border border-ink-600 p-1 transition-colors hover:border-brand-500 disabled:pointer-events-none disabled:opacity-50"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(item.slug)}
                            aria-label="Eliminar producto"
                            className="ml-auto rounded-full p-1 text-mist-500 transition-colors hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link
                href="/carrito"
                onClick={onClose}
                className="mt-4 inline-block text-xs font-semibold text-brand-400 transition-colors hover:text-brand-300"
              >
                Ver carrito completo →
              </Link>
            </>
          )}
        </div>

        <div className="shrink-0 border-t border-ink-700 px-6 py-5">
          <div className="mb-4 flex items-center justify-between text-sm font-semibold text-mist-100">
            <span>Subtotal</span>
            <span>{currencyFormatter.format(subtotal)}</span>
          </div>
          {error ? <p className="mb-3 text-xs text-red-400">{error}</p> : null}
          <Button onClick={checkout} disabled={items.length === 0 || loading} className="w-full">
            {loading ? "Redirigiendo…" : "Pagar con Stripe"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
