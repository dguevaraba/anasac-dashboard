import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de privacidad | ANASAC",
  description:
    "Política de privacidad de la app y el panel ANASAC (Asociación de Natación de Santa Cruz).",
};

const updated = "7 de septiembre de 2026";

export default function PrivacidadPage() {
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
            <p className="text-sm text-white/70">Política de privacidad</p>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-3xl space-y-8 px-5 py-10 leading-relaxed">
        <p className="text-sm text-[var(--anasac-teal)]">
          Última actualización: {updated}
        </p>

        <section className="space-y-3">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--anasac-navy)]">
            Política de privacidad
          </h1>
          <p>
            Esta política describe cómo la Asociación de Natación de Santa Cruz
            (ANASAC) trata la información personal cuando usás el panel web en{" "}
            <a
              className="font-medium text-[var(--anasac-teal)] underline-offset-2 hover:underline"
              href="https://dashboard.anasaccr.com"
            >
              dashboard.anasaccr.com
            </a>{" "}
            o la aplicación móvil ANASAC.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[var(--anasac-navy)]">
            1. Responsable
          </h2>
          <p>
            ANASAC — Asociación Deportiva de Natación Sta. Cruz, Costa Rica.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Correo:{" "}
              <a
                className="text-[var(--anasac-teal)] underline-offset-2 hover:underline"
                href="mailto:info@anasaccr.com"
              >
                info@anasaccr.com
              </a>
            </li>
            <li>
              Sitio:{" "}
              <a
                className="text-[var(--anasac-teal)] underline-offset-2 hover:underline"
                href="https://anasaccr.com"
              >
                anasaccr.com
              </a>
            </li>
            <li>Teléfono: +506 8370 6170</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[var(--anasac-navy)]">
            2. Qué datos tratamos
          </h2>
          <p>Según tu rol e invitación, podemos tratar:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Datos de cuenta: nombre, correo electrónico e identificadores de
              sesión.
            </li>
            <li>
              Datos de autenticación vía proveedores (Google o Microsoft),
              limitados a lo necesario para iniciar sesión.
            </li>
            <li>
              Datos operativos del club: roles, nadadores, entrenadores,
              calendario, competencias, resultados y pagos/mensualidades.
            </li>
            <li>
              Datos técnicos básicos del dispositivo o navegador necesarios para
              el funcionamiento del servicio (por ejemplo, tokens de sesión).
            </li>
          </ul>
          <p>
            El acceso es solo por invitación. No hay registro público abierto.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[var(--anasac-navy)]">
            3. Para qué los usamos
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Autenticar usuarios invitados y gestionar permisos por rol.</li>
            <li>
              Operar el panel y la app (calendario, pagos, nadadores,
              competencias y resultados).
            </li>
            <li>Comunicar información operativa relacionada con ANASAC.</li>
            <li>Mantener la seguridad y el correcto funcionamiento del servicio.</li>
          </ul>
          <p>
            No vendemos datos personales ni los usamos para publicidad de
            terceros.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[var(--anasac-navy)]">
            4. Con quién los compartimos
          </h2>
          <p>
            Usamos proveedores que procesan datos en nuestro nombre para operar
            el servicio, en particular infraestructura de autenticación y base
            de datos (Supabase) y, si iniciás sesión con ellos, Google o
            Microsoft. También podemos compartir información cuando lo exija la
            ley.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[var(--anasac-navy)]">
            5. Conservación y seguridad
          </h2>
          <p>
            Conservamos los datos mientras tu cuenta esté activa o sea necesario
            para la gestión del club y obligaciones legales. Aplicamos medidas
            técnicas razonables (acceso restringido, sesión autenticada,
            comunicación cifrada HTTPS).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[var(--anasac-navy)]">
            6. Tus derechos
          </h2>
          <p>
            Podés solicitar acceso, corrección o eliminación de tus datos de
            cuenta escribiendo a{" "}
            <a
              className="text-[var(--anasac-teal)] underline-offset-2 hover:underline"
              href="mailto:info@anasaccr.com"
            >
              info@anasaccr.com
            </a>
            . Algunas solicitudes pueden requerir verificación de identidad y
            pueden limitarse por obligaciones legales o de la asociación.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[var(--anasac-navy)]">
            7. Menores
          </h2>
          <p>
            La app y el panel están dirigidos a personal y miembros autorizados
            de ANASAC. Datos de nadadores menores se tratan en el marco de la
            gestión deportiva de la asociación y del consentimiento o
            autorización de padres/tutores cuando corresponda.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[var(--anasac-navy)]">
            8. Cambios
          </h2>
          <p>
            Podemos actualizar esta política. La fecha de “última
            actualización” indica la versión vigente. El uso continuado del
            servicio después de un cambio implica el conocimiento de la nueva
            versión.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[var(--anasac-navy)]">
            9. Contacto
          </h2>
          <p>
            Consultas de privacidad:{" "}
            <a
              className="text-[var(--anasac-teal)] underline-offset-2 hover:underline"
              href="mailto:info@anasaccr.com"
            >
              info@anasaccr.com
            </a>
          </p>
        </section>

        <p className="border-t border-[var(--anasac-border)] pt-6 text-sm text-[var(--anasac-teal)]">
          También podés ver los{" "}
          <Link
            href="/terminos"
            className="font-medium underline-offset-2 hover:underline"
          >
            términos de uso
          </Link>
          .
        </p>
      </article>
    </main>
  );
}
