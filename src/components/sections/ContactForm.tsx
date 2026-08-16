"use client";

import { useId, useState, type FormEvent } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { quoteRequestSchema } from "@/lib/validations/quote";

type Status = "idle" | "submitting" | "success" | "error";

const inputClasses =
  "w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-3 text-sm text-mist-100 placeholder:text-mist-500 transition-colors duration-200 focus:border-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40";

export function ContactForm() {
  const formId = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const raw = {
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      interest: String(formData.get("interest") ?? "servicio"),
      message: String(formData.get("message") ?? ""),
    };

    const parsed = quoteRequestSchema.safeParse(raw);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      setStatus("error");
      return;
    }

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) throw new Error("request-failed");

      setStatus("success");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-brand-600/40 bg-ink-850/60 p-8 text-center elevation-base">
        <CheckCircle2 className="h-10 w-10 text-brand-400" aria-hidden />
        <p className="text-lg font-bold text-mist-100">¡Solicitud enviada!</p>
        <p className="text-sm text-mist-500">
          Te contactaremos muy pronto por WhatsApp o correo para darte tu cotización.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${formId}-name`} className="text-sm font-medium text-mist-300">
            Nombre
          </label>
          <input id={`${formId}-name`} name="name" autoComplete="name" className={inputClasses} />
          {errors.name ? <p className="text-xs text-brand-400">{errors.name[0]}</p> : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${formId}-phone`} className="text-sm font-medium text-mist-300">
            Teléfono
          </label>
          <input id={`${formId}-phone`} name="phone" autoComplete="tel" className={inputClasses} />
          {errors.phone ? <p className="text-xs text-brand-400">{errors.phone[0]}</p> : null}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${formId}-email`} className="text-sm font-medium text-mist-300">
          Correo (opcional)
        </label>
        <input
          id={`${formId}-email`}
          name="email"
          type="email"
          autoComplete="email"
          className={inputClasses}
        />
        {errors.email ? <p className="text-xs text-brand-400">{errors.email[0]}</p> : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${formId}-interest`} className="text-sm font-medium text-mist-300">
          Me interesa
        </label>
        <select
          id={`${formId}-interest`}
          name="interest"
          defaultValue="servicio"
          className={inputClasses}
        >
          <option value="servicio">Un servicio de mantenimiento</option>
          <option value="producto">Comprar equipo o componentes</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${formId}-message`} className="text-sm font-medium text-mist-300">
          Cuéntanos qué necesitas
        </label>
        <textarea
          id={`${formId}-message`}
          name="message"
          rows={4}
          className={inputClasses}
        />
        {errors.message ? <p className="text-xs text-brand-400">{errors.message[0]}</p> : null}
      </div>

      <Button type="submit" disabled={status === "submitting"} className="mt-2">
        {status === "submitting" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Enviando...
          </>
        ) : (
          "Solicitar cotización"
        )}
      </Button>

      {status === "error" && Object.keys(errors).length === 0 ? (
        <p className="text-sm text-brand-400">
          Algo salió mal. Intenta de nuevo o escríbenos por WhatsApp.
        </p>
      ) : null}
    </form>
  );
}
