"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";

export function useCheckout() {
  const { items } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkout = async () => {
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

  return { loading, error, checkout };
}
