import Link from "next/link";
import { LogoutButton } from "@/app/components/LogoutButton";
import { requireSessionForPanel } from "@/lib/session";

type CardSimple = string;
type CardLink = { label: string; descripcion: string; href: string | null };

const panelContent = {
  cliente: {
    title: "Panel de cliente",
    description:
      "Consulta próximas órdenes, administra direcciones y revisa el estado de tus solicitudes.",
    cards: [
      "Solicitar un nuevo servicio con dirección guardada.",
      "Consultar historial de órdenes y pagos.",
      "Actualizar datos de contacto para futuras visitas.",
    ] as CardSimple[],
  },
  trabajador: {
    title: "Panel de trabajador",
    description:
      "Revisa asignaciones, disponibilidad, especialidades registradas y seguimiento de servicios en campo.",
    cards: [
      "Visualizar agenda y órdenes pendientes.",
      "Actualizar disponibilidad operativa.",
      "Consultar métricas de cumplimiento y calidad.",
    ] as CardSimple[],
  },
  administrador: {
    title: "Panel de administrador",
    description:
      "Supervisa la operación, coordina prestadores y valida el flujo general de servicio desde una vista central.",
    cards: [
      { label: "Gestionar categorías", descripcion: "Alta, edición y baja de categorías de servicios.", href: "/administrador/categorias" },
      { label: "Monitorear personal", descripcion: "Monitorear altas de personal y cobertura activa.", href: null },
      { label: "Revisar incidencias", descripcion: "Revisar incidencias y cumplimiento por zona.", href: null },
    ] as CardLink[],
  },
};

type PanelPageProps = {
  params: Promise<{ tipo: keyof typeof panelContent }>;
};

export default async function PanelPage({ params }: PanelPageProps) {
  const { tipo } = await params;
  const content = panelContent[tipo];
  const session = await requireSessionForPanel(tipo);

  return (
    <>
      <section className="page-hero auth-hero">
        <div className="container auth-hero-grid">
          <div>
            <span className="eyebrow eyebrow-dark">{session.role}</span>
            <h1>{content.title}</h1>
            <p>{content.description}</p>
          </div>
          <div className="auth-summary-card">
            <p className="auth-summary-title">Sesión actual</p>
            <ul className="auth-summary-list">
              <li>Usuario: {session.nombre}</li>
              <li>Correo: {session.correo}</li>
              <li>Acceso autorizado para: {tipo}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container auth-choice-grid">
          {content.cards.map((item, i) => {
            const isLink = typeof item === "object";
            const articleContent = (
              <article key={i} className="choice-card">
                <span className="choice-accent">Acción disponible</span>
                <h2>{isLink ? item.label : content.title}</h2>
                <p>{isLink ? item.descripcion : item}</p>
              </article>
            );

            if (isLink && item.href) {
              return (
                <Link key={i} href={item.href} style={{ textDecoration: "none" }}>
                  {articleContent}
                </Link>
              );
            }
            return articleContent;
          })}
        </div>

        <div className="container form-actions-row panel-actions-row">
          <Link href="/cuenta" className="button-primary">
            Ver cuenta
          </Link>
          <LogoutButton />
        </div>
      </section>
    </>
  );
}