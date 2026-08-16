# ANASAC Monorepo

Aplicaciones de la **Asociación de Natación de Santa Cruz (ANASAC)**.

> El sitio público [anasaccr.com](https://anasaccr.com) **no se modifica**.
> El dashboard web vivirá en `dashboard.anasaccr.com` (solo DNS del subdominio).

## Estructura

```
anasac/
  apps/
    web/       # Next.js — panel administrativo
    mobile/    # Expo — app móvil (mismo contenido y estilo)
  packages/
    shared/    # tipos, mocks, permisos, formato, tokens de marca
  supabase/    # migraciones (en apps/web/supabase por ahora)
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

## Móvil

La app usa **Expo SDK 54**, compatible con **Expo Go** de la App Store.

```bash
npm run dev:mobile
# Escanea el QR con Expo Go
```

Si ves “Project is incompatible with this version of Expo Go”, actualiza Expo Go o asegúrate de que el servidor esté en SDK 54 (`expo@54`).

### Cuentas demo

| Correo | Rol | Contraseña |
|--------|-----|------------|
| admin@anasaccr.com | Administrador | anasac2026 |
| entrenador@anasaccr.com | Entrenador | anasac2026 |
| consulta@anasaccr.com | Consulta | anasac2026 |

## Scripts raíz

| Comando | Descripción |
|---------|-------------|
| `npm run dev:web` | Next.js |
| `npm run dev:mobile` | Expo |
| `npm run build:web` | Build producción web |

## DNS (más adelante)

Solo crear CNAME `dashboard` → Vercel. **No** tocar A/`www`/MX de `anasaccr.com`.
