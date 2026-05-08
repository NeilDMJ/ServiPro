"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type RegisterTrabajadorState = {
  nombre: string;
  correo: string;
  telefono: string;
  especialidad: string;
  tarifaInicial: string;
  documentosProfesionales: string;
  contraseña: string;
  confirmarContraseña: string;
};

const initialState: RegisterTrabajadorState = {
  nombre: "",
  correo: "",
  telefono: "",
  especialidad: "",
  tarifaInicial: "",
  documentosProfesionales: "",
  contraseña: "",
  confirmarContraseña: "",
};

/**
 * IMPLEMENTACIÓN SEGÚN: 
 * 1. Diagrama de Actividad: Registro (Rama Freelancer - estado "Pendiente")
 * 2. Diagrama de Secuencia: Registro
 * Variables y métodos acoplados: enviarDatosRegistro, nombre, correo, contraseña, 
 * especialidad, documentosProfesionales, rol, estado, confirmacionRegistro, registroExitoso.
 */
export default function RegistroTrabajadorPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function confirmacionRegistro(mensaje: string) {
    setSuccessMessage(mensaje);
  }

  function registroExitoso() {
    setForm(initialState);
    router.push("/iniciar-sesion?tipo=trabajador");
  }

  async function enviarDatosRegistro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (form.contraseña !== form.confirmarContraseña) {
      setErrorMessage("La confirmación de contraseña no coincide.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        nombre: form.nombre,
        correo: form.correo,
        contraseña: form.contraseña,
        rol: "Freelancer",
        estado: "Pendiente",
        telefono: form.telefono,
        especialidad: form.especialidad,
        tarifaInicial: form.tarifaInicial,
        documentosProfesionales: form.documentosProfesionales
      };

      const response = await fetch("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data: any = {};
      try {
        const raw = await response.text();
        data = raw ? JSON.parse(raw) : {};
      } catch {
        // ...
      }

      if (!response.ok) {
        setErrorMessage(data.error ?? "El endpoint de registro aún no está implementado en el backend.");
        return;
      }

      confirmacionRegistro(
        `Cuenta de trabajador creada para ${data.usuario?.nombre ?? "el usuario"}.`
      );
      registroExitoso();
    } catch {
      setErrorMessage("Ocurrió un error al conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <section className="page-hero auth-hero">
        <div className="container auth-hero-grid">
          <div>
            <span className="eyebrow eyebrow-dark">Registro de trabajador</span>
            <h1>Crea una cuenta para operar como prestador independiente.</h1>
            <p>
              Este registro crea un usuario con rol PRESTADOR y un perfil
              asociado listo para asignaciones de servicio.
            </p>
          </div>
          <div className="auth-summary-card">
            <p className="auth-summary-title">Datos requeridos</p>
            <ul className="auth-summary-list">
              <li>Usuario: nombre, correo, teléfono y contraseña.</li>
              <li>Prestador: tipo INDEPENDIENTE y disponibilidad inicial activa.</li>
              <li>Oficio y tarifa obligatorios para clasificación.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container auth-form-layout">
          <form className="auth-form-card" onSubmit={enviarDatosRegistro}>
            <div className="auth-form-header">
              <h2>Datos del trabajador</h2>
              <p>Completa los campos para habilitar acceso operativo.</p>
            </div>

            <div className="form-grid two-columns">
              <label className="form-field">
                <span>Nombre completo</span>
                <input name="nombre" type="text" value={form.nombre} onChange={handleChange} required />
              </label>

              <label className="form-field">
                <span>Correo electrónico</span>
                <input name="correo" type="email" value={form.correo} onChange={handleChange} required />
              </label>

              <label className="form-field">
                <span>Teléfono</span>
                <input name="telefono" type="tel" value={form.telefono} onChange={handleChange} required />
              </label>

              <label className="form-field">
                <span>Especialidad</span>
                <input
                  name="especialidad"
                  type="text"
                  value={form.especialidad}
                  onChange={handleChange}
                  placeholder="Ej. Electricista, Plomero..."
                  required
                />
              </label>

              <label className="form-field form-field-full">
                <span>Cargar documentos profesionales</span>
                <input
                  name="documentosProfesionales"
                  type="file"
                  accept=".pdf,.jpg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setForm((prev) => ({ ...prev, documentosProfesionales: file.name }));
                  }}
                  required
                />
                <small className="form-text text-muted" style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px', display: 'block' }}>Sube tu CV, certificaciones o documentos de identidad.</small>
              </label>

              <label className="form-field">
                <span>Tarifa inicial ($)</span>
                <input
                  name="tarifaInicial"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.tarifaInicial}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </label>

              <label className="form-field">
                <span>Contraseña</span>
                <input
                  name="contraseña"
                  type="password"
                  value={form.contraseña}
                  onChange={handleChange}
                  minLength={8}
                  required
                />
              </label>

              <label className="form-field">
                <span>Confirmar contraseña</span>
                <input
                  name="confirmarContraseña"
                  type="password"
                  value={form.confirmarContraseña}
                  onChange={handleChange}
                  minLength={8}
                  required
                />
              </label>
            </div>

            {errorMessage ? <p className="form-alert error">{errorMessage}</p> : null}
            {successMessage ? <p className="form-alert success">{successMessage}</p> : null}

            <div className="form-actions-row">
              <button className="button-primary button-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Registrando..." : "Crear cuenta de trabajador"}
              </button>
              <Link href="/iniciar-sesion?tipo=trabajador" className="button-secondary">
                Ya tengo cuenta
              </Link>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}