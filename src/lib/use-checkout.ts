"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

export function useCheckout() {
  const { items } = useCart();
  const { user, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkout = async () => {
    // Sin sesión no se puede pagar: en vez de fallar, lo mandamos a entrar.
    if (!user) {
      await signInWithGoogle();
      return;
    }

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

      if (res.status === 401) {
        setError("Tu sesión expiró. Inicia sesión de nuevo para pagar.");
        return;
      }

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

  return { loading, error, checkout, isSignedIn: Boolean(user) };
}
