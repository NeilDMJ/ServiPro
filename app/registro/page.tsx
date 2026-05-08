import Link from "next/link";

const userChoices = [
  {
    title: "Cliente",
    description:
      "Crea tu cuenta para solicitar servicios, guardar tu dirección y administrar futuras órdenes.",
    href: "/registro/cliente",
    cta: "Registrar cliente",
    accent: "Solicitar servicios",
  },
  {
    title: "Trabajador Independiente",
    description:
      "Registra tu perfil operativo por tu cuenta para recibir asignaciones directas.",
    href: "/registro/trabajador",
    cta: "Registrar independiente",
    accent: "Prestador autónomo",
  },
  {
    title: "Empresa",
    description:
      "Registra tu organización en la plataforma para ofrecer servicios.",
    href: "/registro/empresa",
    cta: "Registrar empresa",
    accent: "Organización",
  },
  {
    title: "Administrador",
    description:
      "Panel de control para supervisar la operación y validar órdenes de servicio.",
    href: "/iniciar-sesion?tipo=administrador",
    cta: "Panel administrativo",
    accent: "Gestión principal",
  },
];

export default function RegistroPage() {
  return (
    <>
      <section className="page-hero auth-hero">
        <div className="container auth-hero-grid">
          <div>
            <span className="eyebrow eyebrow-dark">Acceso y registro</span>
            <h1>Selecciona el tipo de usuario con el que vas a entrar.</h1>
            <p>
              El flujo cambia según el rol. Los clientes crean cuenta para
              contratar servicios y los perfiles operativos acceden con sus
              credenciales existentes.
            </p>
          </div>
          <div className="auth-summary-card">
            <p className="auth-summary-title">Modelo conectado a base de datos</p>
            <ul className="auth-summary-list">
              <li>Cliente: crea usuario con dirección predeterminada.</li>
              <li>Trabajador: inicia sesión como prestador registrado.</li>
              <li>Administrador: accede con rol de gestión empresarial.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container auth-choice-grid">
          {userChoices.map((choice) => (
            <article key={choice.title} className="choice-card">
              <span className="choice-accent">{choice.accent}</span>
              <h2>{choice.title}</h2>
              <p>{choice.description}</p>
              <Link href={choice.href} className="button-primary">
                {choice.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}