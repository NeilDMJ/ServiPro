import Link from "next/link";

import { processSteps, faqs } from "@/lib/siteContent";

export default function ComoFuncionaPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Una experiencia simple de principio a fin.</h1>
          <p>
            Disenamos el flujo para que puedas decidir rapido, confirmar con
            claridad y recibir soporte en cada etapa del servicio.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-4">
            {processSteps.map((step) => (
              <article key={step.title} className="card">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section strip">
        <div className="container">
          <div className="section-intro">
            <h2>Resolucion de dudas y soporte.</h2>
            <p>
              Un equipo humano acompana cambios de agenda, incidencias y
              solicitudes especiales durante tu servicio.
            </p>
          </div>
          <div className="grid grid-3">
            {faqs.map((faq) => (
              <article key={faq.question} className="card">
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
          <div className="hero-actions" style={{ marginTop: "1.5rem" }}>
            <Link href="/contacto" className="button-primary">
              Hablar con un asesor
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
