import Link from "next/link";

import { LogoutButton } from "@/app/components/LogoutButton";
import { getPanelPathForRole, getUserTypeFromRole } from "@/lib/auth";
import { requireSession } from "@/lib/session";

export default async function CuentaPage() {
  const session = await requireSession();

  return (
    <>
      <section className="page-hero auth-hero">
        <div className="container">
          <span className="eyebrow eyebrow-dark">Cuenta activa</span>
          <h1>Bienvenido, {session.nombre}.</h1>
          <p>
            Estás conectado como <strong>{getUserTypeFromRole(session.role)}</strong>. Accede a tu panel o administra tu sesión desde aquí.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container auth-choice-grid compact-grid">
          <article className="choice-card">
            <span className="choice-accent">Panel operativo</span>
            <h2>Continuar al panel</h2>
            <p>Accede a la vista específica para el rol autenticado.</p>
            <Link href={getPanelPathForRole(session.role)} className="button-primary">
              Ir al panel
            </Link>
          </article>

          <article className="choice-card">
            <span className="choice-accent">Control de acceso</span>
            <h2>Administrar sesión</h2>
            <p>Usa esta acción para limpiar la cookie de sesión y salir del sistema.</p>
            <LogoutButton />
          </article>
        </div>
      </section>
    </>
  );
}