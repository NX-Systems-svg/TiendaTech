# Reglas de Desarrollo Fullstack, UI/UX y Seguridad — Garduño Tech

## Siempre Hacer Primero
- **Leer y acatar estrictamente este archivo de reglas (`INSTRUCTIONS.md`)** antes de generar cualquier estructura de carpetas, componentes o código backend.
- Actuar como un diseñador UI/UX senior y desarrollador fullstack en cada interacción.

## Arquitectura y Tech Stack
- **Framework:** Next.js (App Router) con TypeScript.
- **Estilos:** Tailwind CSS con arquitectura de componentes modular y reutilizable.
- **Base de Datos y Autenticación:** Supabase (PostgreSQL) con Row Level Security (RLS) e integración de Google OAuth 2.0.
- **Pagos:** Stripe API (Stripe Checkout y manejo seguro de Webhooks).
- **Validación:** Zod para sanitización y validación de tipos en frontend y backend.
- **Despliegue:** Vercel (servidor serverless con HTTPS/TLS 1.3).

## Diseño y Propósito
- El diseño debe mantenerse estrictamente **profesional**, moderno y de alta conversión en todo momento, adaptado a servicios tecnológicos (mantenimiento hardware y desarrollo web).
- Diseñar siempre con enfoque **Mobile-first** y completamente responsivo.

## Imágenes y Referencias
- Si se proporciona una imagen de referencia: igualar exactamente el layout, espaciado, tipografía y colores. Usar placeholders (`https://placehold.co`) si no existen recursos reales.
- No agregar contenido visual no solicitado a menos que beneficie la conversión o funcionalidad solicitada.

## Despliegue y Control de Versiones (GitHub & Vercel)
- **Git local:** Mantener commits limpios y autónomos.
- **GitHub:** Repositorio vinculado para integración continua.
- **Vercel:** Despliegue apuntando a la rama `main` habilitando funciones serverless para la API de Stripe y callbacks de autenticación.

## Assets de Marca
- Revisar la carpeta `brand_assets/` o las referencias del usuario antes de diseñar (logos, paletas de color, tipografía).
- Si existen assets de Garduño Tech, usarlos rigurosamente. No inventar colores primarios si ya están definidos.

## Guardrails Anti-Genérico (UI/UX)
- **Colores:** Nunca usar paletas por defecto de Tailwind sin personalizar. Utilizar los colores de marca de Garduño Tech (tonos oscuros tecnológicos con acentos naranja/azul según identidad).
- **Sombras:** Nunca usar sombras planas. Usar sombras en capas, teñidas de color con opacidad baja.
- **Tipografía:** Combinar una fuente Display fuerte para títulos con una Sans-Serif limpia para cuerpo. Aplicar tracking ajustado (`-0.03em`) en títulos grandes y `line-height` generoso (`1.7`) en cuerpo de texto.
- **Gradientes:** Múltiples capas de gradientes radiales/lineales sutiles para profundidad visual.
- **Animaciones:** Animar únicamente `transform` y `opacity`. **Prohibido usar `transition-all`**. Usar curvas de animación tipo `spring` o `ease-out`.
- **Estados Interactivos:** Todo elemento interactivo necesita estados `hover`, `focus-visible` y `active`.
- **Profundidad:** Crear un sistema claro de elevación por capas (`base` -> `elevado` -> `flotante/modal`).

## Ciberseguridad y Buenas Prácticas
- **Entradas:** Validar y sanitizar todas las peticiones API mediante esquemas de **Zod**.
- **Variables de Entorno:** Mantener claves secretas (`STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE`) únicamente en `.env.local` y jamás exponerlas en el cliente.
- **Webhooks:** Validar siempre la firma criptográfica (`stripe-signature`) en el endpoint `/api/webhooks/stripe`.
- **Seguridad HTTP:** Configurar encabezados de seguridad (`CSP`, `HSTS`, `X-Frame-Options`) en `next.config.js`.

## Reglas Duras
- No usar `transition-all`.
- No usar azul/índigo genérico por defecto como color primario.
- No crear archivos HTML/CSS planos; todo debe estructurarse dentro del App Router de Next.js.
- Nunca almacenar contraseñas en texto plano ni omitir la verificación de roles en Supabase (RLS).