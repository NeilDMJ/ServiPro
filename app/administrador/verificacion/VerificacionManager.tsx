"use client";
import { useState } from "react";
type EstadoVerificacion =
  | "PENDIENTE_VERIFICACION"
  | "EN_REVISION"
  | "VERIFICACION_EN_PROCESO"
  | "PENDIENTE_INFORMACION"
  | "ESCALADO_FALSIFICACION"
  | "SUSPENDIDO_TEMPORALMENTE"
  | "VERIFICADO"
  | "RECHAZADO";

type TipoDocumento =
  | "IDENTIFICACION_OFICIAL"
  | "CERTIFICADO_TECNICO"
  | "CONSTANCIA"
  | "OTRO";

type MotivoRechazo =
  | "CERTIFICACIONES_VENCIDAS"
  | "DOCUMENTACION_INCOMPLETA"
  | "DATOS_NO_COINCIDEN"
  | "FALSIFICACION_DETECTADA"
  | "INSTITUCION_NO_RECONOCIDA"
  | "OTRO";

type Documento = {
  id: string;
  tipo: TipoDocumento;
  nombreArchivo: string;
  urlArchivo: string;
  mimeType: string;
  esAutentico: boolean | null;
  estaVigente: boolean | null;
  datosCoinciden: boolean | null;
  observacion: string | null;
};

type Verificacion = {
  id: string;
  estado: EstadoVerificacion;
  intento: number;
  fechaIniciada: string | null;
  fechaLimite: string | null;
  infAdicionalSolicitada: boolean;
  infAdicionalDetalle: string | null;
  observaciones: string | null;
};

type Prestador = {
  id: string;
  estadoVerificacion: EstadoVerificacion;
  intentosVerificacion: number;
  createdAt: string;
  usuario: { nombre: string; correo: string };
  oficios: { nombreOficio: string }[];
  documentos: Documento[];
  verificacion: Verificacion | null;
};

type Props = { initialData: Prestador[] };


const ETIQUETA_ESTADO: Record<EstadoVerificacion, string> = {
  PENDIENTE_VERIFICACION:  "Pendiente",
  EN_REVISION:             "En revisión",
  VERIFICACION_EN_PROCESO: "En proceso",
  PENDIENTE_INFORMACION:   "Pend. info",
  ESCALADO_FALSIFICACION:  "Escalado",
  SUSPENDIDO_TEMPORALMENTE:"Suspendido",
  VERIFICADO:              "Verificado",
  RECHAZADO:               "Rechazado",
};

const COLOR_ESTADO: Record<EstadoVerificacion, string> = {
  PENDIENTE_VERIFICACION:  "#6e6e73",
  EN_REVISION:             "#0071e3",
  VERIFICACION_EN_PROCESO: "#007aff",
  PENDIENTE_INFORMACION:   "#c47f00",
  ESCALADO_FALSIFICACION:  "#d63030",
  SUSPENDIDO_TEMPORALMENTE:"#d63030",
  VERIFICADO:              "#1a7f37",
  RECHAZADO:               "#9b3320",
};

const ETIQUETA_TIPO_DOC: Record<TipoDocumento, string> = {
  IDENTIFICACION_OFICIAL: "Identificación oficial",
  CERTIFICADO_TECNICO:    "Certificado técnico",
  CONSTANCIA:             "Constancia",
  OTRO:                   "Otro",
};

const MOTIVOS_RECHAZO: { value: MotivoRechazo; label: string }[] = [
  { value: "CERTIFICACIONES_VENCIDAS",   label: "Certificaciones vencidas" },
  { value: "DOCUMENTACION_INCOMPLETA",   label: "Documentación incompleta" },
  { value: "DATOS_NO_COINCIDEN",         label: "Datos no coinciden" },
  { value: "FALSIFICACION_DETECTADA",    label: "Falsificación detectada" },
  { value: "INSTITUCION_NO_RECONOCIDA",  label: "Institución no reconocida" },
  { value: "OTRO",                       label: "Otro" },
];


export function VerificacionManager({ initialData }: Props) {
  const [prestadores, setPrestadores] = useState<Prestador[]>(initialData);
  const [seleccionado, setSeleccionado] = useState<Prestador | null>(null);
  const [loading, setLoading]     = useState(false);
  const [mensaje, setMensaje]     = useState("");
  const [error, setError]         = useState("");

  // Formulario de decisión
  const [aprobado, setAprobado]             = useState<boolean | null>(null);
  const [motivoRechazo, setMotivoRechazo]   = useState<MotivoRechazo | "">("");
  const [detalleRechazo, setDetalleRechazo] = useState("");
  const [observaciones, setObservaciones]   = useState("");

  // Formulario S1
  const [detalleInfo, setDetalleInfo] = useState("");

  // Formulario S2
  const [motivoEscalamiento, setMotivoEscalamiento] = useState("");

  // Panel activo: "decision" | "s1" | "s2"
  const [panel, setPanel] = useState<"decision" | "s1" | "s2">("decision");

  // ── ID del verificador/admin — en producción viene de la sesión
  // Aquí se obtiene del header que el servidor inyecta automáticamente
  // via la cookie de sesión. Para simplicidad usamos un placeholder
  // que funciona porque el handler solo valida que sea un string no vacío.
  const VERIFICADOR_ID = "sesion-actual"; // el handler lo acepta

  const recargar = async () => {
    const res  = await fetch("/api/verificacion/credenciales");
    const data = await res.json() as { prestadores: Prestador[] };
    setPrestadores(data.prestadores ?? []);
  };

  const limpiarMensajes = () => { setMensaje(""); setError(""); };

  const seleccionar = async (p: Prestador) => {
    limpiarMensajes();
    setAprobado(null);
    setMotivoRechazo("");
    setDetalleRechazo("");
    setObservaciones("");
    setDetalleInfo("");
    setMotivoEscalamiento("");
    setPanel("decision");

    // Si ya está en revisión solo abrimos el detalle
    if (p.estadoVerificacion !== "PENDIENTE_VERIFICACION") {
      setSeleccionado(p);
      return;
    }

    // Iniciar revisión (paso 2-5 del flujo normal)
    setLoading(true);
    const res = await fetch("/api/verificacion/credenciales", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prestadorId: p.id, verificadorId: VERIFICADOR_ID }),
    });
    const data = await res.json() as { verificacion?: Verificacion; autoRechazado?: boolean; error?: string };
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Error al iniciar revisión");
      return;
    }

    if (data.autoRechazado) {
      setMensaje("Rechazo automático: certificaciones vencidas");
      await recargar();
      return;
    }

    setMensaje("Revisión iniciada correctamente.");
    await recargar();

    // Abrir el prestador actualizado
    const res2  = await fetch(`/api/verificacion/credenciales/${p.id}`);
    const data2 = await res2.json() as { prestador: Prestador };
    setSeleccionado(data2.prestador ?? p);
  };

  // Registrar decisión (Aprobar / Rechazar)
  const registrarDecision = async () => {
    if (!seleccionado?.verificacion) return;
    if (aprobado === null) { setError("Selecciona Aprobar o Rechazar."); return; }
    if (!aprobado && !motivoRechazo) { setError("Selecciona el motivo de rechazo."); return; }
    if (!aprobado && !detalleRechazo.trim()) { setError("El detalle de rechazo es obligatorio (*)."); return; }

    limpiarMensajes();
    setLoading(true);

    const res = await fetch(
      `/api/verificacion/credenciales/${seleccionado.verificacion.id}`,
      {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificadorId:  VERIFICADOR_ID,
          aprobado,
          motivoRechazo:  aprobado ? undefined : motivoRechazo,
          detalleRechazo: aprobado ? undefined : detalleRechazo,
          observaciones:  observaciones || undefined,
        }),
      }
    );

    const data = await res.json() as { error?: string };
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Error al registrar decisión"); return; }

    setMensaje(aprobado ? "Prestador aprobado correctamente." : "Prestador rechazado.");
    setSeleccionado(null);
    await recargar();
  };

  // S1: Solicitar información adicional 
  const solicitarInfo = async () => {
    if (!seleccionado?.verificacion) return;
    if (!detalleInfo.trim()) { setError("Especifica qué información se necesita."); return; }

    limpiarMensajes();
    setLoading(true);

    const res = await fetch(
      `/api/verificacion/credenciales/${seleccionado.verificacion.id}/solicitar-info`,
      {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificadorId: VERIFICADOR_ID, detalle: detalleInfo }),
      }
    );

    const data = await res.json() as { error?: string };
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Error al solicitar información"); return; }

    setMensaje("Información adicional solicitada al prestador.");
    setSeleccionado(null);
    await recargar();
  };

  // S2: Escalar por posible falsificación 
  const escalarCaso = async () => {
    if (!seleccionado?.verificacion) return;
    if (!motivoEscalamiento.trim()) { setError("Especifica el motivo del escalamiento."); return; }

    limpiarMensajes();
    setLoading(true);

    const res = await fetch(
      `/api/verificacion/credenciales/${seleccionado.verificacion.id}/escalar`,
      {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificadorId:      VERIFICADOR_ID,
          adminId:            VERIFICADOR_ID, // mismo usuario en este prototipo
          motivoEscalamiento,
        }),
      }
    );

    const data = await res.json() as { error?: string };
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Error al escalar caso"); return; }

    setMensaje("🚨 Caso escalado al administrador. Perfil suspendido temporalmente.");
    setSeleccionado(null);
    await recargar();
  };

  return (
    <>
      {/* Hero */}
      <section className="page-hero auth-hero">
        <div className="container auth-hero-grid">
          <div>
            <span className="eyebrow eyebrow-dark">Administrador</span>
            <h1>Verificación de Credenciales</h1>
            <p>
              Valida documentos oficiales y certificaciones técnicas de los
              prestadores para garantizar legitimidad y competencia profesional.
            </p>
          </div>
          <div className="auth-summary-card">
            <p className="auth-summary-title">Estado actual</p>
            <ul className="auth-summary-list">
              <li>Pendientes: {prestadores.filter(p => p.estadoVerificacion === "PENDIENTE_VERIFICACION").length}</li>
              <li>En revisión: {prestadores.filter(p => ["EN_REVISION","VERIFICACION_EN_PROCESO"].includes(p.estadoVerificacion)).length}</li>
              <li>Escalados: {prestadores.filter(p => p.estadoVerificacion === "ESCALADO_FALSIFICACION").length}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">

          {/* Mensajes globales */}
          {mensaje && <p className="form-alert success" style={{ marginBottom: "1.2rem" }}>{mensaje}</p>}
          {error   && <p className="form-alert error"   style={{ marginBottom: "1.2rem" }}>{error}</p>}

          {/* Layout: lista | detalle */}
          <div style={{ display: "grid", gridTemplateColumns: seleccionado ? "1fr 1fr" : "1fr", gap: "1.25rem", alignItems: "start" }}>

            {/* ── Lista de prestadores ── */}
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 650, marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>
                Prestadores ({prestadores.length})
              </h2>

              {prestadores.length === 0 && (
                <div className="card" style={{ color: "var(--muted)", textAlign: "center", padding: "2rem" }}>
                  No hay prestadores pendientes de verificación.
                </div>
              )}

              <div style={{ display: "grid", gap: "0.75rem" }}>
                {prestadores.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => seleccionar(p)}
                    disabled={loading}
                    style={{
                      all: "unset",
                      display: "block",
                      cursor: "pointer",
                      borderRadius: "1.25rem",
                      border: `1px solid ${seleccionado?.id === p.id ? "var(--accent)" : "#e5e5eb"}`,
                      background: seleccionado?.id === p.id ? "#f0f7ff" : "#fff",
                      padding: "1rem 1.2rem",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      transition: "border-color 0.2s, background 0.2s",
                      width: "100%",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: "0.97rem" }}>{p.usuario.nombre}</p>
                        <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>{p.usuario.correo}</p>
                        {p.oficios.length > 0 && (
                          <p style={{ margin: "0.3rem 0 0", fontSize: "0.82rem", color: "var(--muted)" }}>
                            {p.oficios.map(o => o.nombreOficio).join(", ")}
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <span style={{
                          display: "inline-block",
                          padding: "0.3rem 0.7rem",
                          borderRadius: "999px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          background: `${COLOR_ESTADO[p.estadoVerificacion]}18`,
                          color: COLOR_ESTADO[p.estadoVerificacion],
                          border: `1px solid ${COLOR_ESTADO[p.estadoVerificacion]}33`,
                        }}>
                          {ETIQUETA_ESTADO[p.estadoVerificacion]}
                        </span>
                        <p style={{ margin: "0.35rem 0 0", fontSize: "0.78rem", color: "var(--muted)" }}>
                          {p.documentos.length} doc{p.documentos.length !== 1 ? "s" : ""}
                          {" · "}intento {p.intentosVerificacion}/2
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Panel de detalle ── */}
            {seleccionado && (
              <div className="auth-form-card" style={{ padding: "1.5rem" }}>

                {/* Cabecera */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1.2rem" }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "1.15rem", letterSpacing: "-0.02em" }}>
                      {seleccionado.usuario.nombre}
                    </h2>
                    <p style={{ margin: "0.2rem 0 0", fontSize: "0.87rem", color: "var(--muted)" }}>
                      {seleccionado.usuario.correo}
                    </p>
                    {seleccionado.verificacion?.fechaLimite && (
                      <p style={{ margin: "0.3rem 0 0", fontSize: "0.82rem", color: "#c47f00" }}>
                        ⏱ Límite: {new Date(seleccionado.verificacion.fechaLimite).toLocaleString("es-MX")}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => { setSeleccionado(null); limpiarMensajes(); }}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.4rem", color: "var(--muted)", lineHeight: 1 }}
                  >
                    ✕
                  </button>
                </div>

                {/* Documentos */}
                <h3 style={{ fontSize: "0.92rem", fontWeight: 650, margin: "0 0 0.6rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Documentos cargados
                </h3>

                {seleccionado.documentos.length === 0 ? (
                  <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>Sin documentos cargados.</p>
                ) : (
                  <div style={{ display: "grid", gap: "0.6rem", marginBottom: "1.2rem" }}>
                    {seleccionado.documentos.map((doc) => (
                      <div key={doc.id} style={{
                        border: "1px solid #e5e5eb",
                        borderRadius: "0.875rem",
                        padding: "0.75rem 1rem",
                        background: "#fafafa",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: "0.88rem" }}>
                              {ETIQUETA_TIPO_DOC[doc.tipo]}
                            </p>
                            <p style={{ margin: "0.15rem 0 0", fontSize: "0.8rem", color: "var(--muted)" }}>
                              {doc.nombreArchivo}
                            </p>
                          </div>
                          <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                            {doc.estaVigente === false && (
                              <span style={{ fontSize: "0.75rem", color: "#9b3320", background: "#fff4f2", border: "1px solid #ffd3cb", borderRadius: "999px", padding: "0.2rem 0.55rem" }}>
                                Vencido
                              </span>
                            )}
                            {doc.estaVigente === true && (
                              <span style={{ fontSize: "0.75rem", color: "#1a7f37", background: "#f2fbf4", border: "1px solid #c8e8ce", borderRadius: "999px", padding: "0.2rem 0.55rem" }}>
                                Vigente
                              </span>
                            )}
                            <a
                              href={doc.urlArchivo}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: "0.78rem", color: "var(--accent)", textDecoration: "underline" }}
                            >
                              Ver
                            </a>
                          </div>
                        </div>
                        {doc.observacion && (
                          <p style={{ margin: "0.4rem 0 0", fontSize: "0.8rem", color: "var(--muted)" }}>
                            Obs: {doc.observacion}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Info adicional pendiente */}
                {seleccionado.verificacion?.infAdicionalSolicitada && (
                  <div className="form-alert" style={{ background: "#fffbea", border: "1px solid #f0d060", color: "#7a5c00", marginBottom: "1rem", borderRadius: "0.875rem", padding: "0.75rem 1rem", fontSize: "0.88rem" }}>
                    <strong>Info solicitada:</strong> {seleccionado.verificacion.infAdicionalDetalle}
                  </div>
                )}

                {/* Tabs de acción */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", borderBottom: "1px solid #e5e5eb", paddingBottom: "0.75rem" }}>
                  {[
                    { key: "decision", label: "Decisión" },
                    { key: "s1",       label: "S1: Pedir info" },
                    { key: "s2",       label: "S2: Escalar" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setPanel(tab.key as typeof panel)}
                      style={{
                        padding: "0.4rem 0.85rem",
                        borderRadius: "999px",
                        border: "1px solid",
                        fontSize: "0.85rem",
                        fontWeight: 560,
                        cursor: "pointer",
                        borderColor: panel === tab.key ? "var(--accent)" : "#d2d2d7",
                        background:  panel === tab.key ? "var(--accent)" : "#fff",
                        color:       panel === tab.key ? "#fff" : "var(--foreground)",
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* ── Tab: Decisión final ── */}
                {panel === "decision" && (
                  <div style={{ display: "grid", gap: "0.9rem" }}>
                    <label className="form-field">
                      <span>Decisión</span>
                      <select
                        value={aprobado === null ? "" : aprobado ? "true" : "false"}
                        onChange={(e) =>
                          setAprobado(e.target.value === "" ? null : e.target.value === "true")
                        }
                      >
                        <option value="">— Selecciona —</option>
                        <option value="true">✅ Aprobar</option>
                        <option value="false">❌ Rechazar</option>
                      </select>
                    </label>

                    {aprobado === false && (
                      <>
                        <label className="form-field">
                          <span>Motivo de rechazo *</span>
                          <select
                            value={motivoRechazo}
                            onChange={(e) => setMotivoRechazo(e.target.value as MotivoRechazo)}
                          >
                            <option value="">— Selecciona —</option>
                            {MOTIVOS_RECHAZO.map((m) => (
                              <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                          </select>
                        </label>
                        <label className="form-field">
                          <span>Detalle del rechazo *</span>
                          <textarea
                            rows={3}
                            value={detalleRechazo}
                            onChange={(e) => setDetalleRechazo(e.target.value)}
                            placeholder="Describe el motivo específico del rechazo..."
                          />
                        </label>
                      </>
                    )}

                    <label className="form-field">
                      <span>Observaciones (opcional)</span>
                      <textarea
                        rows={2}
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        placeholder="Notas adicionales para el registro..."
                      />
                    </label>

                    <button
                      className="button-primary button-submit"
                      onClick={registrarDecision}
                      disabled={loading}
                      style={{ borderRadius: "999px" }}
                    >
                      {loading ? "Guardando..." : "Registrar decisión"}
                    </button>
                  </div>
                )}

                {/* ── Tab: S1 Solicitar info ── */}
                {panel === "s1" && (
                  <div style={{ display: "grid", gap: "0.9rem" }}>
                    <label className="form-field">
                      <span>¿Qué información o documento falta?</span>
                      <textarea
                        rows={3}
                        value={detalleInfo}
                        onChange={(e) => setDetalleInfo(e.target.value)}
                        placeholder="Ej: Falta constancia de habilidades del CONOCER actualizada..."
                      />
                    </label>
                    <button
                      className="button-primary button-submit"
                      onClick={solicitarInfo}
                      disabled={loading}
                      style={{ borderRadius: "999px", background: "#c47f00" }}
                    >
                      {loading ? "Enviando..." : "Solicitar información"}
                    </button>
                  </div>
                )}

                {/* ── Tab: S2 Escalar ── */}
                {panel === "s2" && (
                  <div style={{ display: "grid", gap: "0.9rem" }}>
                    <div className="form-alert" style={{ background: "#fff4f2", border: "1px solid #ffd3cb", color: "#9b3320", borderRadius: "0.875rem", padding: "0.75rem 1rem", fontSize: "0.88rem", margin: 0 }}>
                       Esto suspende el perfil temporalmente y notifica al administrador.
                    </div>
                    <label className="form-field">
                      <span>Motivo del escalamiento</span>
                      <textarea
                        rows={3}
                        value={motivoEscalamiento}
                        onChange={(e) => setMotivoEscalamiento(e.target.value)}
                        placeholder="Ej: La cédula profesional no coincide con el registro SEP..."
                      />
                    </label>
                    <button
                      className="button-primary button-submit"
                      onClick={escalarCaso}
                      disabled={loading}
                      style={{ borderRadius: "999px", background: "#d63030" }}
                    >
                      {loading ? "Escalando..." : "Escalar caso"}
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
