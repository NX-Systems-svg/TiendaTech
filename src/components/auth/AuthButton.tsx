"use client";

import Link from "next/link";
import { LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { UserMenu } from "@/components/auth/UserMenu";

/**
 * En el header (por defecto) la sesión se resuelve con un menú desplegable.
 * Dentro del menú móvil, que ya es una lista vertical, un desplegable dentro de
 * otro desplegable estorba: ahí las opciones se muestran en línea.
 */
export function AuthButton({
  className,
  enLinea = false,
  onNavegar,
}: {
  className?: string;
  enLinea?: boolean;
  onNavegar?: () => void;
}) {
  const { user, ready, isAdmin, signInWithGoogle } = useAuth();

  // Mientras no sabemos si hay sesión no mostramos nada, para no enseñar
  // "Iniciar sesión" un instante a alguien que ya entró.
  if (!ready) {
    return <div className={className} aria-hidden />;
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={signInWithGoogle}
        className={`inline-flex items-center justify-center min-h-11 gap-2 whitespace-nowrap rounded-full border border-control px-4 py-2.5 text-sm font-semibold text-mist-100 transition-colors duration-200 hover:border-brand-500 hover:text-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 ${className ?? ""}`}
      >
        <LogIn className="h-4 w-4" aria-hidden />
        Iniciar sesión
      </button>
    );
  }

  if (!enLinea) {
    return (
      <div className={className}>
        <UserMenu user={user} isAdmin={isAdmin} />
      </div>
    );
  }

  const opcion =
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-3 text-base font-medium text-mist-300 transition-colors duration-200 hover:bg-ink-800 hover:text-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-400";

  return (
    <div className={`flex flex-col ${className ?? ""}`}>
      <p className="truncate px-3 py-2 text-xs text-mist-500">{user.email}</p>

      {isAdmin ? (
        <Link href="/admin" onClick={onNavegar} className={opcion}>
          <LayoutDashboard className="h-4 w-4 text-brand-400" aria-hidden />
          Panel de administración
        </Link>
      ) : null}

      <form action="/auth/sign-out" method="post">
        <button type="submit" className={opcion}>
          <LogOut className="h-4 w-4" aria-hidden />
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
