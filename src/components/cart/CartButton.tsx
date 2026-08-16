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
