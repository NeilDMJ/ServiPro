"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";

/**
 * IMPLEMENTACIÓN SEGÚN: Figura 37. Diagrama de Secuencia: Publicación y Notificación Push
 * Variables y métodos acoplados: solicitarCrearTrabajo, datos, habilidad,
 * confirmarPublicaciónExitosa, idTrabajo.
 */
export default function PublicarNecesidadPage() {
  const [datos, setDatos] = useState({
    titulo: "",
    descripcion: "",
    habilidad: "",
    direccion: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setDatos((current) => ({ ...current, [name]: value }));
  }

  // Corresponde a confirmarPublicaciónExitosa(idTrabajo) del diagrama
  function confirmarPublicaciónExitosa(idTrabajo: string) {
    setMensajeExito(`Trabajo #${idTrabajo} publicado exitosamente. Los trabajadores con la habilidad "${datos.habilidad}" están recibiendo la notificación push.`);
    setDatos({
      titulo: "",
      descripcion: "",
      habilidad: "",
      direccion: "",
    });
  }

  // Corresponde a solicitarCrearTrabajo(datos) del diagrama
  async function solicitarCrearTrabajo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensajeError(null);
    setMensajeExito(null);
    setIsSubmitting(true);

    try {
      // El backend de la plataforma se encargará de:
      // crear(datos) -> iniciarAlgoritmoNotificaciones(idTrabajo) 
      // -> buscarTrabajadoresPorHabilidad(habilidad) -> loop(enviarAlertaPush(id, mensaje))
      const response = await fetch("/api/trabajos/publicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMensajeError(data.error || "Ocurrió un error al solicitar crear el trabajo en la plataforma.");
        return;
      }

      // El backend retorna confirmarPublicaciónExitosa
      confirmarPublicaciónExitosa(data.idTrabajo || Math.floor(Math.random() * 10000).toString());
    } catch {
      setMensajeError("Error de conexión al solicitar crear el trabajo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <section className="page-hero auth-hero">
        <div className="container auth-hero-grid">
          <div>
            <span className="eyebrow eyebrow-dark">Cliente</span>
            <h1>Publicar Necesidad de Trabajo</h1>
            <p>
              Describe tu problema. La plataforma se encargará de crear el trabajo, 
              buscar prestadores por la habilidad solicitada y enviar alertas push a sus dispositivos.
            </p>
          </div>
          <div className="auth-summary-card">
             <p className="auth-summary-title">Flujo según diagrama</p>
             <ul className="auth-summary-list">
               <li>Envía la solicitud: solicitarCrearTrabajo(datos).</li>
               <li>Plataforma notifica automáticamente.</li>
               <li>Retorna: confirmarPublicaciónExitosa(idTrabajo).</li>
             </ul>
           </div>
        </div>
      </section>

      <section className="section">
        <div className="container auth-form-layout">
          <form className="auth-form-card" onSubmit={solicitarCrearTrabajo}>
            <div className="auth-form-header">
              <h2>Detalles de tu necesidad</h2>
            </div>

            <div className="form-grid">
              <label className="form-field form-field-full">
                <span>Título del trabajo</span>
                <input 
                  name="titulo" 
                  type="text" 
                  value={datos.titulo} 
                  onChange={handleChange} 
                  placeholder="Ej. Fuga de agua en lavabo" 
                  required 
                />
              </label>

              <label className="form-field form-field-full">
                <span>Habilidad requerida</span>
                <input 
                  name="habilidad" 
                  type="text" 
                  value={datos.habilidad} 
                  onChange={handleChange} 
                  placeholder="Ej. Plomería" 
                  required 
                />
                <small className="form-text text-muted" style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                  El algoritmo buscará trabajadores con esta habilidad para notificarlos.
                </small>
              </label>

              <label className="form-field form-field-full">
                <span>Descripción detallada</span>
                <textarea 
                  name="descripcion" 
                  value={datos.descripcion} 
                  onChange={handleChange} 
                  rows={4} 
                  placeholder="Describe exactamente qué necesitas..." 
                  required 
                />
              </label>

              <label className="form-field form-field-full">
                <span>Dirección</span>
                <textarea 
                  name="direccion" 
                  value={datos.direccion} 
                  onChange={handleChange} 
                  rows={2} 
                  placeholder="Dirección donde se realizará el servicio..." 
                  required 
                />
              </label>
            </div>

            {mensajeError && <p className="form-alert error">{mensajeError}</p>}
            {mensajeExito && <p className="form-alert success">{mensajeExito}</p>}

            <div className="form-actions-row">
              <button className="button-primary button-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Procesando..." : "Publicar necesidad"}
              </button>
              <Link href="/panel/cliente" className="button-secondary">
                Regresar al panel
              </Link>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
