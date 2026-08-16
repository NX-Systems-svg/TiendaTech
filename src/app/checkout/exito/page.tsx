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
