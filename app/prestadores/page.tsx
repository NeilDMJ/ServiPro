import { providerHighlights, trustStats } from "@/lib/siteContent";

export default function PrestadoresPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Prestadores listos para responder con calidad.</h1>
          <p>
            Construimos una red operativa con filtros de calidad, capacitacion
            continua y metrica permanente de desempeno por servicio.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-4">
            {providerHighlights.map((item) => (
              <article key={item.title} className="card">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section strip">
        <div className="container">
          <div className="section-intro">
            <h2>Rendimiento visible y trazable.</h2>
            <p>
              Seguimos cada visita con indicadores de puntualidad, finalizacion
              y satisfaccion para mejorar la experiencia hogar por hogar.
            </p>
          </div>
          <div className="grid grid-4">
            {trustStats.map((item) => (
              <article key={item.label} className="card">
                <h3>{item.value}</h3>
                <p>{item.label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
