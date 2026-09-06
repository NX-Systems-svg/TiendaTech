"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type AuthContextValue = {
  user: User | null;
  /** true solo si la cuenta de la sesión está en la tabla `administradores`. */
  isAdmin: boolean;
  /** false mientras aún no sabemos si hay sesión (evita parpadeos en el botón). */
  ready: boolean;
  /** false si el sitio todavía no tiene configurada la conexión a Supabase. */
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  /**
   * Correo confirmado como administrador. Se guarda el correo y no un booleano
   * para no arrastrar un `true` viejo si alguien cambia de cuenta sin recargar.
   */
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  useEffect(() => {
    // Sin conexión configurada no hay sesión posible: se marca como resuelto
    // para que la interfaz no se quede esperando para siempre.
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReady(true);
      return;
    }

    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user ?? null);
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !user) return;

    let active = true;

    // La respuesta la da la base con la misma función que gobierna las
    // políticas RLS, así que la interfaz no puede ofrecer un panel al que la
    // base luego le negaría los datos. Esto solo decide si se ve el enlace.
    supabase.rpc("es_admin").then(({ data }) => {
      if (active && data === true) setAdminEmail(user.email ?? null);
    });

    return () => {
      active = false;
    };
  }, [supabase, user]);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return;

    // Volvemos a la página actual tras iniciar sesión, para no perder el
    // contexto (por ejemplo, si estaba en /carrito a punto de pagar).
    const next = `${window.location.pathname}${window.location.search}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        signInWithGoogle,
        isConfigured: Boolean(supabase),
        isAdmin: Boolean(user?.email && adminEmail === user.email),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
