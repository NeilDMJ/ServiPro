"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type RegisterEmpresaState = {
  razonSocial: string;
  rfc: string;
  correo: string;
  contraseña: string;
  confirmarContraseña: string;
  responsable: string;
  documentosEmpresa: string;
};

const initialState: RegisterEmpresaState = {
  razonSocial: "",
  rfc: "",
  correo: "",
  contraseña: "",
  confirmarContraseña: "",
  responsable: "",
  documentosEmpresa: "",
};

/**
 * IMPLEMENTACIÓN SEGÚN: 
 * 1. Diagrama de Actividad: Registro (Rama Empresa - estado "Pendiente")
 * 2. Diagrama de Secuencia: Registro
 * Variables y métodos acoplados: enviarDatosRegistro, razonSocial, RFC, correo, 
 * contraseña, responsable, documentosEmpresa, rol, estado, confirmacionRegistro, registroExitoso.
 */
export default function RegistroEmpresaPage() {
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
    router.push("/iniciar-sesion?tipo=administrador");
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
        razonSocial: form.razonSocial,
        rfc: form.rfc,
        correo: form.correo,
        contraseña: form.contraseña,
        responsable: form.responsable,
        documentosEmpresa: form.documentosEmpresa,
        rol: "Empresa",
        estado: "Pendiente"
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

      confirmacionRegistro(`Cuenta de empresa creada exitosamente para ${form.razonSocial}. En espera de validación.`);
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
            <span className="eyebrow eyebrow-dark">Registro de empresa</span>
            <h1>Registra tu organización en la plataforma.</h1>
            <p>Completa los datos fiscales, designa un responsable y sube la documentación requerida.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container auth-form-layout">
          <form className="auth-form-card" onSubmit={enviarDatosRegistro}>
            <div className="auth-form-header">
              <h2>Datos de la empresa</h2>
            </div>

            <div className="form-grid two-columns">
              <label className="form-field">
                <span>Razón Social</span>
                <input name="razonSocial" type="text" value={form.razonSocial} onChange={handleChange} required />
              </label>

              <label className="form-field">
                <span>RFC</span>
                <input name="rfc" type="text" value={form.rfc} onChange={handleChange} required />
              </label>

              <label className="form-field">
                <span>Correo electrónico de la empresa</span>
                <input name="correo" type="email" value={form.correo} onChange={handleChange} required />
              </label>

              <label className="form-field">
                <span>Registrar responsable (Nombre completo)</span>
                <input name="responsable" type="text" value={form.responsable} onChange={handleChange} required />
              </label>

              <label className="form-field form-field-full">
                <span>Cargar documentos de empresa</span>
                <input
                  name="documentosEmpresa"
                  type="file"
                  accept=".pdf,.jpg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setForm((prev) => ({ ...prev, documentosEmpresa: file.name }));
                  }}
                  required
                />
                <small className="form-text text-muted" style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px', display: 'block' }}>Sube tu Acta Constitutiva o Constancia de Situación Fiscal.</small>
              </label>

              <label className="form-field">
                <span>Contraseña</span>
                <input name="contraseña" type="password" value={form.contraseña} onChange={handleChange} minLength={8} required />
              </label>

              <label className="form-field">
                <span>Confirmar contraseña</span>
                <input name="confirmarContraseña" type="password" value={form.confirmarContraseña} onChange={handleChange} minLength={8} required />
              </label>
            </div>

            {errorMessage ? <p className="form-alert error">{errorMessage}</p> : null}
            {successMessage ? <p className="form-alert success">{successMessage}</p> : null}

            <div className="form-actions-row">
              <button className="button-primary button-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Registrando..." : "Crear cuenta de empresa"}
              </button>
              <Link href="/iniciar-sesion" className="button-secondary">
                Ya tengo cuenta
              </Link>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
