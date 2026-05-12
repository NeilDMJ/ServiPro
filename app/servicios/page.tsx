import Link from "next/link";

import { serviceCategories, zones } from "@/lib/siteContent";

export default function ServiciosPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Servicios para cada espacio del hogar.</h1>
          <p>
            Elige la categoria que necesitas y reserva en horarios flexibles con
            profesionales evaluados y soporte activo durante toda la visita.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            {serviceCategories.map((service) => (
              <article key={service.name} className="card">
                <h3>{service.name}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section strip">
        <div className="container">
          <div className="section-intro">
            <h2>Disponibilidad por zona.</h2>
            <p>
              Nuestro motor de asignacion prioriza cercania y especialidad para
              reducir tiempos de llegada y mejorar cumplimiento.
            </p>
          </div>
          <div className="chip-row">
            {zones.map((zone) => (
              <span key={zone} className="chip">
                {zone}
              </span>
            ))}
          </div>
          <div className="hero-actions" style={{ marginTop: "1.4rem" }}>
            <Link href="/contacto" className="button-primary">
              Solicitar cotizacion
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
