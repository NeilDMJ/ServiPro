"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type EmpresaMatch = {
  id: string;
  razonSocial: string;
  rfc: string;
};

type RegisterState = {
  empresaId: string;
  nombre: string;
  correo: string;
  telefono: string;
  password: string;
  confirmPassword: string;
};

const initialState: RegisterState = {
  empresaId: "",
  nombre: "",
  correo: "",
  telefono: "",
  password: "",
  confirmPassword: "",
};

export default function RegistroTrabajadorEmpresaPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [searchQuery, setSearchQuery] = useState("");
  const [empresas, setEmpresas] = useState<EmpresaMatch[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<EmpresaMatch | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Debounced search for companies
  useEffect(() => {
    if (searchQuery.length < 2 || selectedEmpresa) {
      setEmpresas([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const res = await fetch(`/api/empresa/verificar?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        
        if (data.dbError) {
           setSearchError("Error de base de datos. Usando modo demo (escribe 'test').");
        }

        const found = data.empresas || [];
        
        // Mock fallback for testing if no results found in DB
        if (found.length === 0 && searchQuery.toLowerCase().includes("test")) {
           setEmpresas([{ id: "mock-id-123", razonSocial: "Empresa de Prueba (Test)", rfc: searchQuery.toUpperCase() }]);
        } else {
           setEmpresas(found);
        }
      } catch (err: any) {
        console.error("Error searching companies:", err);
        setSearchError("No se pudo conectar con la base de datos.");
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedEmpresa]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSelectEmpresa(empresa: EmpresaMatch) {
    setSelectedEmpresa(empresa);
    setForm((current) => ({ ...current, empresaId: empresa.id }));
    setSearchQuery(empresa.razonSocial);
    setEmpresas([]);
  }

  function handleResetEmpresa() {
    setSelectedEmpresa(null);
    setForm((current) => ({ ...current, empresaId: "" }));
    setSearchQuery("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!form.empresaId) {
      setErrorMessage("Debes seleccionar una empresa válida de la lista.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMessage("La confirmación de contraseña no coincide.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/empresa/prestadores/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const raw = await response.text();
      const data = raw ? JSON.parse(raw) : {};

      if (!response.ok) {
        setErrorMessage(data.error ?? "No fue posible crear la cuenta de trabajador.");
        return;
      }

      setSuccessMessage(`Cuenta creada exitosamente para vincularte a ${selectedEmpresa?.razonSocial}.`);
      setForm(initialState);
      setSelectedEmpresa(null);
      setSearchQuery("");
      
      setTimeout(() => {
        router.push("/iniciar-sesion?tipo=trabajador");
      }, 2000);
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
            <span className="eyebrow eyebrow-dark">Registro de trabajador de empresa</span>
            <h1>Únete al equipo operativo de una empresa registrada.</h1>
            <p>
              Busca tu empresa por nombre o RFC y completa tu perfil para comenzar a recibir asignaciones.
            </p>
          </div>
          <div className="auth-summary-card">
            <p className="auth-summary-title">Proceso de vinculación</p>
            <ul className="auth-summary-list">
              <li>Paso 1: Localiza tu empresa en nuestro padrón.</li>
              <li>Paso 2: Ingresa tus datos personales de contacto.</li>
              <li>Paso 3: Tu cuenta quedará vinculada automáticamente.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container auth-form-layout">
          <form className="auth-form-card" onSubmit={handleSubmit}>
            <div className="auth-form-header">
              <h2>Validación de empresa</h2>
              <p>Busca y selecciona la empresa a la que perteneces.</p>
            </div>

            <div className="form-grid">
              <div className="form-field form-field-full">
                <span>Nombre o RFC de la empresa</span>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Escribe para buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={!!selectedEmpresa}
                    required
                  />
                  {selectedEmpresa && (
                    <button
                      type="button"
                      onClick={handleResetEmpresa}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "#f0f0f3",
                        border: "1px solid #d2d2d7",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                      }}
                      title="Cambiar empresa"
                    >
                      ✕
                    </button>
                  )}
                  
                  {isSearching && (
                    <div style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", color: "var(--muted)" }}>
                      Buscando...
                    </div>
                  )}

                  {searchError && (
                    <p style={{ color: "#d93025", fontSize: "0.8rem", marginTop: "5px" }}>
                      ⚠️ {searchError} (Verifica que la BD esté activa)
                    </p>
                  )}

                  {!selectedEmpresa && !isSearching && searchQuery.length >= 2 && empresas.length === 0 && !searchError && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #ffccbc", borderRadius: "1rem", marginTop: "5px", padding: "10px", zIndex: 10, color: "#bf360c", fontSize: "0.85rem" }}>
                      No se encontraron empresas con "{searchQuery}". Pruebe con "test" para modo demo.
                    </div>
                  )}

                  {!selectedEmpresa && empresas.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        background: "#fff",
                        border: "1px solid #d2d2d7",
                        borderRadius: "1rem",
                        marginTop: "5px",
                        zIndex: 10,
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        overflow: "hidden",
                      }}
                    >
                      {empresas.map((e) => (
                        <div
                          key={e.id}
                          onClick={() => handleSelectEmpresa(e)}
                          style={{
                            padding: "12px 15px",
                            cursor: "pointer",
                            borderBottom: "1px solid #f5f5f7",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(ev) => (ev.currentTarget.style.background = "#f5f5f7")}
                          onMouseLeave={(ev) => (ev.currentTarget.style.background = "transparent")}
                        >
                          <div style={{ fontWeight: "600", fontSize: "0.95rem" }}>{e.razonSocial}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>RFC: {e.rfc}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedEmpresa && (
                <>
                  <div className="auth-form-header" style={{ marginTop: "1rem", gridColumn: "1 / -1" }}>
                    <h2>Información Personal</h2>
                    <p>Completa tus datos profesionales para el registro.</p>
                  </div>

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

                  {/* Espacio vacío para mantener el grid de 2 columnas si es necesario */}
                  <div className="form-field"></div>

                  <label className="form-field">
                    <span>Contraseña</span>
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      minLength={8}
                      required
                    />
                  </label>

                  <label className="form-field">
                    <span>Confirmar contraseña</span>
                    <input
                      name="confirmPassword"
                      type="password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      minLength={8}
                      required
                    />
                  </label>
                </>
              )}
            </div>

            {errorMessage ? <p className="form-alert error">{errorMessage}</p> : null}
            {successMessage ? <p className="form-alert success">{successMessage}</p> : null}

            <div className="form-actions-row">
              <button
                className="button-primary button-submit"
                type="submit"
                disabled={isSubmitting || !selectedEmpresa}
              >
                {isSubmitting ? "Vinculando..." : "Completar Registro"}
              </button>
              <Link href="/registro" className="button-secondary">
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
