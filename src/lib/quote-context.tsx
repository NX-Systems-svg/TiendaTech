"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type QuoteRequest = {
  /** Nombre del producto que se quiere cotizar. */
  product: string;
  /** Cambia en cada solicitud para que el formulario se rellene de nuevo
   *  aunque se pida dos veces el mismo producto. */
  id: number;
};

type QuoteContextValue = {
  request: QuoteRequest | null;
  requestQuote: (product: string) => void;
};

const QuoteContext = createContext<QuoteContextValue | null>(null);

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<QuoteRequest | null>(null);

  const requestQuote = useCallback((product: string) => {
    setRequest((previous) => ({ product, id: (previous?.id ?? 0) + 1 }));
    document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <QuoteContext.Provider value={{ request, requestQuote }}>{children}</QuoteContext.Provider>
  );
}

export function useQuote() {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error("useQuote debe usarse dentro de <QuoteProvider>");
  return ctx;
}
