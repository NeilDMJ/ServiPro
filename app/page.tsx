import Link from "next/link";

import {
  serviceCategories,
  processSteps,
  trustStats,
  zones,
  faqs,
} from "@/lib/siteContent";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-panel">
          <span className="eyebrow">Plataforma de servicios para el hogar</span>
          <h1>Tu casa, atendida con precision profesional.</h1>
          <p>
            ServiPro conecta hogares con especialistas confiables en limpieza,
            mantenimiento y reparaciones. Agenda, monitorea y evalua cada servicio
            desde una sola experiencia digital.
          </p>
          <div className="hero-actions">
            <Link href="/registro/cliente" className="button-primary">
              Crear cuenta
            </Link>
            <Link href="/iniciar-sesion?tipo=cliente" className="button-ghost">
              Iniciar sesion
            </Link>
            <Link href="/servicios" className="button-primary">
              Ver servicios
            </Link>
            <Link href="/como-funciona" className="button-ghost">
              Conocer el proceso
            </Link>
          </div>
          <div className="stats-row" aria-label="Indicadores principales">
            {trustStats.map((item) => (
              <div key={item.label} className="stat">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section strip">
        <div className="container">
          <div className="section-intro">
            <h2>Conoce lo que puedes resolver en minutos.</h2>
            <p>
              Selecciona una categoria, compara perfiles y reserva con precio
              visible. Todo con seguimiento desde tu panel.
            </p>
          </div>
          <div className="grid grid-3">
            {serviceCategories.slice(0, 6).map((service) => (
              <article key={service.name} className="card">
                <h3>{service.name}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-intro">
            <h2>Un flujo simple para decisiones claras.</h2>
            <p>
              Desde la solicitud hasta la evaluacion final, cada etapa deja
              registro para garantizar cumplimiento y calidad constante.
            </p>
          </div>
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
            <h2>Cobertura en zonas clave.</h2>
            <p>
              Operamos en colonias prioritarias para asegurar tiempos de llegada
              consistentes y mejor disponibilidad de especialistas.
            </p>
          </div>
          <div className="chip-row" aria-label="Zonas con cobertura">
            {zones.map((zone) => (
              <span key={zone} className="chip">
                {zone}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-intro">
            <h2>Preguntas frecuentes.</h2>
            <p>
              Respuestas rapidas para ayudarte a contratar con confianza desde el
              primer servicio.
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
        </div>
      </section>
    </>
  );
}
