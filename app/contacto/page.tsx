import Link from "next/link";

const contactBlocks = [
  {
    title: "Atencion comercial",
    detail: "contacto@servipro.local",
    note: "Cotizaciones y planes para hogares y edificios.",
  },
  {
    title: "Linea directa",
    detail: "+52 55 0000 0000",
    note: "Soporte para incidencias y seguimiento de servicio.",
  },
  {
    title: "Horario operativo",
    detail: "Lunes a Sabado | 08:00 - 20:00",
    note: "Cobertura extendida con monitoreo digital.",
  },
];

export default function ContactoPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Contacta al equipo ServiPro.</h1>
          <p>
            Cuentanos que necesitas y te ayudamos a definir el servicio ideal,
            tiempos de atencion y esquema operativo para tu hogar.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            {contactBlocks.map((item) => (
              <article key={item.title} className="card">
                <h3>{item.title}</h3>
                <p>
                  <strong>{item.detail}</strong>
                </p>
                <p>{item.note}</p>
              </article>
            ))}
          </div>
          <div className="hero-actions" style={{ marginTop: "1.5rem" }}>
            <Link href="/servicios" className="button-primary">
              Ver catalogo de servicios
            </Link>
            <a href="mailto:contacto@servipro.local" className="button-ghost" style={{ color: "#1d1d1f", borderColor: "#d2d2d7" }}>
              Enviar correo
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
