"use client";

import Image from "next/image";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function AuthButton({ className }: { className?: string }) {
  const { user, ready, signInWithGoogle } = useAuth();

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
        className={`inline-flex items-center justify-center gap-2 rounded-full border border-ink-700 px-4 py-2.5 text-sm font-semibold text-mist-100 transition-colors duration-200 hover:border-brand-500 hover:text-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 ${className ?? ""}`}
      >
        <LogIn className="h-4 w-4" aria-hidden />
        Iniciar sesión
      </button>
    );
  }

  const avatar = user.user_metadata?.avatar_url as string | undefined;
  const name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "Mi cuenta";

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <span className="flex items-center gap-2 rounded-full border border-ink-700 py-1.5 pl-1.5 pr-3">
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
        <span className="max-w-32 truncate text-sm font-medium text-mist-100" title={name}>
          {name}
        </span>
      </span>

      <form action="/auth/sign-out" method="post">
        <button
          type="submit"
          aria-label="Cerrar sesión"
          className="inline-flex items-center justify-center rounded-full border border-ink-700 p-2.5 text-mist-300 transition-colors duration-200 hover:border-red-500/60 hover:text-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
        >
          <LogOut className="h-4 w-4" aria-hidden />
        </button>
      </form>
    </div>
  );
}
