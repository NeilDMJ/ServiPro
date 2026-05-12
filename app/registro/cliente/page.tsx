"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type RegisterFormState = {
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  password: string;
  confirmPassword: string;
};

const initialState: RegisterFormState = {
  nombre: "",
  correo: "",
  telefono: "",
  direccion: "",
  password: "",
  confirmPassword: "",
};

export default function RegistroClientePage() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (form.password !== form.confirmPassword) {
      setErrorMessage("La confirmación de contraseña no coincide.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/clientes/registrar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const raw = await response.text();
      const data = raw
        ? (JSON.parse(raw) as {
            error?: string;
            usuario?: { nombre?: string; correo?: string };
          })
        : {};

      if (!response.ok) {
        setErrorMessage(data.error ?? "No fue posible completar el registro.");
        return;
      }

      setSuccessMessage(
        `Cuenta creada para ${data.usuario?.nombre ?? "el cliente"}. Ya puedes iniciar sesión.`
      );
      setForm(initialState);
      router.push("/iniciar-sesion?tipo=cliente");
    } catch {
      setErrorMessage("Ocurrió un error al conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <section className="page-hero auth-hero">
        <div className="container">
          <span className="eyebrow eyebrow-dark">Registro de cliente</span>
          <h1>Crea una cuenta para solicitar servicios del hogar.</h1>
          <p>
            Este formulario registra el usuario base y el perfil de cliente en
            la base de datos, incluyendo la dirección inicial para futuras
            órdenes.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container auth-form-layout">
          <form className="auth-form-card" onSubmit={handleSubmit}>
            <div className="auth-form-header">
              <h2>Datos del cliente</h2>
              <p>Completa la información obligatoria para habilitar el acceso.</p>
            </div>

            <div className="form-grid two-columns">
              <label className="form-field">
                <span>Nombre completo</span>
                <input
                  name="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ana Martinez"
                  required
                />
              </label>

              <label className="form-field">
                <span>Correo electrónico</span>
                <input
                  name="correo"
                  type="email"
                  value={form.correo}
                  onChange={handleChange}
                  placeholder="ana@correo.com"
                  required
                />
              </label>

              <label className="form-field">
                <span>Teléfono</span>
                <input
                  name="telefono"
                  type="tel"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="55 1234 5678"
                  required
                />
              </label>

              <label className="form-field">
                <span>Contraseña</span>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  required
                />
              </label>

              <label className="form-field form-field-full">
                <span>Dirección</span>
                <textarea
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  placeholder="Calle, número, colonia y referencias"
                  rows={4}
                  required
                />
              </label>

              <label className="form-field form-field-full">
                <span>Confirmar contraseña</span>
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repite tu contraseña"
                  minLength={8}
                  required
                />
              </label>
            </div>

            {errorMessage ? <p className="form-alert error">{errorMessage}</p> : null}
            {successMessage ? (
              <p className="form-alert success">{successMessage}</p>
            ) : null}

            <div className="form-actions-row">
              <button className="button-primary button-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Registrando..." : "Crear cuenta"}
              </button>
              <Link href="/iniciar-sesion?tipo=cliente" className="button-secondary">
                Ya tengo cuenta
              </Link>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}