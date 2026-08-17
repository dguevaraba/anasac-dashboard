# ANASAC Monorepo

Aplicaciones de la **Asociación de Natación de Santa Cruz (ANASAC)**.

> El sitio público [anasaccr.com](https://anasaccr.com) **no se modifica**.
> El dashboard vive en `dashboard.anasaccr.com` (solo DNS del subdominio).

## Estructura

```
anasac/
  apps/
    web/       # Next.js — panel administrativo
    mobile/    # Expo — app móvil (mismo contenido y estilo)
  packages/
    shared/    # tipos, mocks, permisos, formato, tokens de marca
  apps/web/supabase/  # migraciones SQL
```

## Requisitos

- Node.js 20+
- npm 10+

## Instalación

```bash
npm install
```

## Web

```bash
npm run dev:web
# http://localhost:3000
```

- Panel real: `/login` (Google + invitaciones)
- Demo con datos mock: `/example/login`

## Producción (Supabase + Google)

Solo el **administrador** crea usuarios. Cada persona entra con **su Gmail** usando un enlace de invitación. Roles: administrador, entrenador, nadador, asociado, contador.

### 1. Proyecto Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecutá en orden:
   - `apps/web/supabase/migrations/001_schema.sql`
   - `apps/web/supabase/migrations/002_rls.sql`
   - `apps/web/supabase/migrations/003_invitations_and_roles.sql`
3. Authentication → Providers → **Google**: activarlo con Client ID y Secret de Google Cloud.
4. Authentication → URL Configuration:
   - Site URL: `https://dashboard.anasaccr.com`
   - Redirect URLs:
     - `https://dashboard.anasaccr.com/auth/callback`
     - `http://localhost:3000/auth/callback`
5. Authentication → Providers → Email: podés desactivar “Confirm email” si vas a usar el alta por correo además de Google.
6. **Dejá habilitado el registro de usuarios** (Google necesita crear la cuenta). El panel igual bloquea a quien no tenga invitación.

En Google Cloud, el redirect autorizado es el de Supabase:

`https://<PROJECT_REF>.supabase.co/auth/v1/callback`

### 2. Variables en Vercel (y `.env.local`)

Copiá `apps/web/.env.example`. Valores desde Supabase → Settings → API:

| Variable | Dónde |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role (nunca en el navegador) |
| `ADMIN_BOOTSTRAP_EMAIL` | **tu Gmail** — la primera vez que entres, te convierte en admin |
| `NEXT_PUBLIC_APP_URL` | `https://dashboard.anasaccr.com` |

Después de guardar las env vars, redesplegá.

### 3. Primer acceso

1. Abrí `https://dashboard.anasaccr.com/login`
2. Entrá con el **mismo Gmail** de `ADMIN_BOOTSTRAP_EMAIL`
3. En **Usuarios**, generá un enlace de invitación (rol + nombre opcional)
4. La otra persona abre el enlace y entra con **su** Gmail

Sin invitación (y sin ser el correo bootstrap) nadie entra.

## Móvil

La app usa **Expo SDK 54**, compatible con **Expo Go** de la App Store.

```bash
npm run dev:mobile
```

### Cuentas demo (solo `/example` y la app móvil)

| Correo | Rol | Contraseña |
|--------|-----|------------|
| admin@anasaccr.com | Administrador | anasac2026 |
| entrenador@anasaccr.com | Entrenador | anasac2026 |
| nadador@anasaccr.com | Nadador | anasac2026 |

## Scripts raíz

| Comando | Descripción |
|---------|-------------|
| `npm run dev:web` | Next.js |
| `npm run dev:mobile` | Expo |
| `npm run build:web` | Build producción web |

## DNS

Solo CNAME `dashboard` → Vercel. **No** tocar A/`www`/MX de `anasaccr.com`.
