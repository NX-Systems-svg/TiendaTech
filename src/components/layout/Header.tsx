"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { navLinks } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";
import { CartButton } from "@/components/cart/CartButton";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AuthButton } from "@/components/auth/AuthButton";

export function Header() {
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const whatsappHref = `https://wa.me/52${siteConfig.contact.whatsapp}`;

  return (
    <header className="sticky top-0 z-50 border-b border-ink-800/80 bg-ink-950/85 backdrop-blur-md">
      {/*
        Tres zonas: logo | navegación | acciones.
        Antes eran cuatro bloques con `justify-between`, y al iniciar sesión el
        bloque de la derecha crecía tanto (avatar + nombre + salir + WhatsApp +
        carrito) que se comía el aire de toda la barra. Con la rejilla, la
        navegación queda centrada de verdad y las acciones ocupan solo lo suyo.
      */}
      <Container className="grid h-18 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 py-3 lg:gap-6">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400"
          aria-label={siteConfig.name}
        >
          <Image
            src="/logo.png"
            alt={`Logo de ${siteConfig.name}`}
            width={44}
            height={44}
            className="object-contain"
            priority
          />
          <span className="font-display text-lg font-extrabold tracking-tight text-mist-100 lg:hidden xl:inline">
            GARDUÑO<span className="text-brand-500"> TECH</span>
          </span>
        </Link>

        <nav className="hidden min-w-0 items-center justify-center gap-4 lg:flex xl:gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-mist-300 transition-colors duration-200 hover:text-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <div className="hidden lg:block">
            <AuthButton />
          </div>

          {/* El envoltorio lleva el `hidden`: ponerlo en el botón chocaría con
              su propio `inline-flex` y quedaría a merced del orden del CSS. */}
          <div className="hidden lg:block">
            <Button href={whatsappHref} className="!py-2.5 !px-5 text-sm whitespace-nowrap">
              Cotizar por WhatsApp
            </Button>
          </div>

          <CartButton onClick={() => setCartOpen(true)} />

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-control p-2.5 text-mist-100 transition-colors duration-200 hover:border-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {open ? (
        <div className="border-t border-ink-800 bg-ink-950 lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-mist-300 transition-colors duration-200 hover:bg-ink-800 hover:text-brand-400"
              >
                {link.label}
              </Link>
            ))}

            <div className="my-2 border-t border-ink-800" />

            <AuthButton enLinea onNavegar={() => setOpen(false)} className="w-full" />

            <Button href={whatsappHref} className="mt-2 w-full">
              Cotizar por WhatsApp
            </Button>
          </Container>
        </div>
      ) : null}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
