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
