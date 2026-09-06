"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, LayoutDashboard, LogOut, User as UserIcon } from "lucide-react";
import type { User } from "@supabase/supabase-js";

/**
 * Botón de cuenta con menú desplegable.
 *
 * Antes el header mostraba el nombre completo en una píldora más un botón
 * suelto de cerrar sesión: dos elementos anchos que, junto al de WhatsApp y el
 * carrito, dejaban la barra sin aire. Aquí todo eso vive dentro de un solo
 * avatar, y de paso cabe el acceso al panel, que antes había que teclear a mano.
 */
export function UserMenu({ user, isAdmin }: { user: User; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    function alTeclear(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function alClicFuera(event: MouseEvent) {
      if (!contenedor.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("keydown", alTeclear);
    document.addEventListener("mousedown", alClicFuera);

    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.removeEventListener("mousedown", alClicFuera);
    };
  }, [open]);

  const avatar = user.user_metadata?.avatar_url as string | undefined;
  const nombre =
    (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "Mi cuenta";
  const primerNombre = nombre.split(" ")[0];

  const opcion =
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-mist-300 transition-colors duration-200 hover:bg-ink-800 hover:text-mist-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-400";

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        className="flex items-center gap-2 rounded-full border border-ink-700 py-1.5 pl-1.5 pr-2.5 transition-colors duration-200 hover:border-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
      >
        {avatar ? (
          <Image
            src={avatar}
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-800 text-mist-300">
            <UserIcon className="h-4 w-4" aria-hidden />
          </span>
        )}
        <span className="hidden max-w-24 truncate text-sm font-medium text-mist-100 lg:inline">
          {primerNombre}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-mist-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
        <span className="sr-only">{open ? "Cerrar menú de cuenta" : "Abrir menú de cuenta"}</span>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 origin-top-right rounded-xl border border-ink-700 bg-ink-900 p-1.5 elevation-floating"
        >
          <p className="truncate px-3 pb-2 pt-1.5 text-xs text-mist-500" title={user.email ?? ""}>
            {user.email}
          </p>

          {isAdmin ? (
            <Link
              href="/admin"
              role="menuitem"
              onClick={() => setOpen(false)}
              className={opcion}
            >
              <LayoutDashboard className="h-4 w-4 text-brand-400" aria-hidden />
              Panel de administración
            </Link>
          ) : null}

          <form action="/auth/sign-out" method="post">
            <button type="submit" role="menuitem" className={opcion}>
              <LogOut className="h-4 w-4" aria-hidden />
              Cerrar sesión
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
