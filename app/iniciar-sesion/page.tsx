"use client";

import type { ChangeEvent, FormEvent } from "react";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type LoginFormState = {
  correo: string;
  password: string;
  tipoUsuario: "cliente" | "trabajador" | "administrador";
};

const userTypeOptions = [
  { value: "cliente", label: "Cliente" },
  { value: "trabajador", label: "Trabajador" },
  { value: "administrador", label: "Administrador" },
] as const;

function LoginFormComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<LoginFormState>({
    correo: "",
    password: "",
    tipoUsuario: "cliente",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const tipo = searchParams.get("tipo");

    if (
      tipo === "cliente" ||
      tipo === "trabajador" ||
      tipo === "administrador"
    ) {
      setForm((current) => ({ ...current, tipoUsuario: tipo }));
    }
  }, [searchParams]);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as {
        error?: string;
        estadoVerificacion?: string;
        usuario?: {
          nombre?: string;
          role?: string;
          correo?: string;
          tipoUsuario?: string;
        };
      };

      if (!response.ok) {
        setErrorMessage(data.error ?? "No fue posible validar las credenciales.");
        return;
      }

      setSuccessMessage(
        `Credenciales validadas para ${data.usuario?.nombre ?? "el usuario"} (${data.usuario?.role ?? "sin rol"}).`
      );
      setForm((current) => ({ ...current, password: "" }));
      router.push(
        data.usuario?.tipoUsuario ? `/panel/${data.usuario.tipoUsuario}` : "/cuenta"
      );
      router.refresh();
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
          <span className="eyebrow eyebrow-dark">Inicio de sesión</span>
          <h1>Valida tus credenciales antes de entrar al flujo operativo.</h1>
          <p>
            El acceso verifica correo, contraseña y compatibilidad con el tipo
            de usuario seleccionado. Si la combinación no corresponde al rol,
            el sistema rechaza la entrada.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container auth-form-layout">
          <form className="auth-form-card" onSubmit={handleSubmit}>
            <div className="auth-form-header">
              <h2>Acceder a ServiPro</h2>
              <p>Selecciona tu perfil y valida tus datos de acceso.</p>
            </div>

            <div className="form-grid">
              <label className="form-field">
                <span>Tipo de usuario</span>
                <select name="tipoUsuario" value={form.tipoUsuario} onChange={handleChange}>
                  {userTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <span>Correo electrónico</span>
                <input
                  name="correo"
                  type="email"
                  value={form.correo}
                  onChange={handleChange}
                  placeholder="usuario@servipro.com"
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
                  placeholder="Ingresa tu contraseña"
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
                {isSubmitting ? "Validando..." : "Iniciar sesión"}
              </button>
              <Link href="/registro/cliente" className="button-secondary">
                Crear cuenta de cliente
              </Link>
              <Link href="/registro" className="button-secondary">
                Ver tipos de acceso
              </Link>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

export default function IniciarSesionPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginFormComponent />
    </Suspense>
  );
}