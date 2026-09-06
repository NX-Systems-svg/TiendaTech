"use client";

import { LogIn, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site-config";

/**
 * Pantalla de entrada al panel. Solo pide la sesión: quién es administrador lo
 * decide el servidor contra la base, nunca este componente.
 */
export function AccesoAdmin({ correoActual }: { correoActual?: string | null }) {
  const { signInWithGoogle, isConfigured } = useAuth();

  const ajena = Boolean(correoActual);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 rounded-2xl border border-ink-700 bg-ink-850/80 p-8 text-center elevation-base">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-ink-600 bg-ink-800">
        <ShieldAlert className="h-6 w-6 text-brand-400" aria-hidden />
      </span>

      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold text-mist-100">
          {ajena ? "Esta cuenta no tiene acceso" : "Panel de administración"}
        </h1>
        <p className="text-sm leading-relaxed text-mist-500">
          {ajena ? (
            <>
              Entraste como <span className="text-mist-300">{correoActual}</span>. El panel
              es solo para la cuenta del negocio ({siteConfig.contact.email}).
            </>
          ) : (
            <>Inicia sesión con la cuenta de {siteConfig.contact.email} para continuar.</>
          )}
        </p>
      </div>

      {ajena ? (
        <form action="/auth/sign-out" method="post">
          <Button type="submit" variant="secondary">
            Cerrar sesión y cambiar de cuenta
          </Button>
        </form>
      ) : isConfigured ? (
        <Button type="button" onClick={signInWithGoogle}>
          <LogIn className="h-4 w-4" aria-hidden />
          Iniciar sesión con Google
        </Button>
      ) : (
        <p className="text-sm text-mist-500">
          El inicio de sesión no está disponible por ahora.
        </p>
      )}
    </div>
  );
}
