import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos de uso | ANASAC",
  description:
    "Términos de uso de la app y el panel ANASAC (Asociación de Natación de Santa Cruz).",
};

const updated = "7 de septiembre de 2026";

export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-[var(--anasac-mist)] text-[var(--anasac-ink)]">
      <header className="border-b border-[var(--anasac-border)] bg-[var(--anasac-navy)] text-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-5">
          <Image
            src="/anasac-logo.png"
            alt="ANASAC"
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
          />
          <div>
            <p className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
              ANASAC
            </p>
            <p className="text-sm text-white/70">Términos de uso</p>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-3xl space-y-8 px-5 py-10 leading-relaxed">
        <p className="text-sm text-[var(--anasac-teal)]">
          Última actualización: {updated}
        </p>

        <section className="space-y-3">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--anasac-navy)]">
            Términos de uso
          </h1>
          <p>
            Estos términos regulan el uso del panel web{" "}
            <a
              className="font-medium text-[var(--anasac-teal)] underline-offset-2 hover:underline"
              href="https://dashboard.anasaccr.com"
            >
              dashboard.anasaccr.com
            </a>{" "}
            y de la aplicación móvil ANASAC, operados por la Asociación de
            Natación de Santa Cruz (ANASAC).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[var(--anasac-navy)]">
            1. Acceso
          </h2>
          <p>
            El servicio es de uso interno de la asociación. Solo pueden entrar
            personas invitadas por un administrador. No está permitido compartir
            credenciales ni intentar acceder sin autorización.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[var(--anasac-navy)]">
            2. Uso permitido
          </h2>
          <p>
            Debés usar el panel y la app únicamente para fines relacionados con
            la gestión deportiva y administrativa de ANASAC, respetando los
            permisos de tu rol y la confidencialidad de la información de
            nadadores, pagos y otros miembros.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[var(--anasac-navy)]">
            3. Cuentas
          </h2>
          <p>
            Sos responsable de la actividad realizada con tu cuenta. ANASAC
            puede suspender o desactivar el acceso si hay uso indebido, cuenta
            inactiva o revocación de la invitación.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[var(--anasac-navy)]">
            4. Contenido y exactitud
          </h2>
          <p>
            La información operativa (calendario, pagos, resultados, etc.) se
            gestiona para la asociación. Procuramos mantenerla actualizada, pero
            puede haber errores o demoras. Ante dudas, contactá a la
            administración de ANASAC.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[var(--anasac-navy)]">
            5. Disponibilidad
          </h2>
          <p>
            El servicio se ofrece “tal cual”. Pueden existir interrupciones por
            mantenimiento, fallas técnicas o de terceros (por ejemplo,
            autenticación o hosting).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[var(--anasac-navy)]">
            6. Privacidad
          </h2>
          <p>
            El tratamiento de datos personales se describe en la{" "}
            <Link
              href="/privacidad"
              className="font-medium text-[var(--anasac-teal)] underline-offset-2 hover:underline"
            >
              política de privacidad
            </Link>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[var(--anasac-navy)]">
            7. Contacto
          </h2>
          <p>
            <a
              className="text-[var(--anasac-teal)] underline-offset-2 hover:underline"
              href="mailto:info@anasaccr.com"
            >
              info@anasaccr.com
            </a>{" "}
            ·{" "}
            <a
              className="text-[var(--anasac-teal)] underline-offset-2 hover:underline"
              href="https://anasaccr.com"
            >
              anasaccr.com
            </a>
          </p>
        </section>
      </article>
    </main>
  );
}
