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
