"use client";

import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

type TipoDocumento = "IDENTIFICACION_OFICIAL" | "CERTIFICADO_TECNICO" | "CONSTANCIA";

type DocumentoSubido = {
  id: string;
  nombreArchivo: string;
  tipo: TipoDocumento;
  createdAt: string;
};

type Seccion = {
  tipo: TipoDocumento;
  titulo: string;
  descripcion: string;
  requisitos: string[];
};

const SECCIONES: Seccion[] = [
  {
    tipo: "IDENTIFICACION_OFICIAL",
    titulo: "Credencial de elector (INE)",
    descripcion: "Identificación oficial vigente para verificar tu identidad.",
    requisitos: [
      "Foto legible del frente y vuelta de la credencial.",
      "Debe estar vigente.",
      "Formato: JPG, PNG o PDF (máx. 5 MB).",
    ],
  },
  {
    tipo: "CERTIFICADO_TECNICO",
    titulo: "Certificaciones técnicas",
    descripcion:
      "Diplomas, constancias de cursos o certificaciones que avalen tu especialidad.",
    requisitos: [
      "Ej. certificado de electricidad, plomería, IMSS, CONOCER, etc.",
      "Debe mostrar nombre, institución y fecha de emisión.",
      "Formato: JPG, PNG o PDF (máx. 5 MB).",
    ],
  },
  {
    tipo: "CONSTANCIA",
    titulo: "Constancias adicionales",
    descripcion:
      "Cualquier otro documento de respaldo: cartas de recomendación, constancias laborales, etc.",
    requisitos: [
      "Carta de recomendación de empleador anterior.",
      "Constancia de no antecedentes penales.",
      "Formato: JPG, PNG o PDF (máx. 5 MB).",
    ],
  },
];

const ETIQUETAS: Record<TipoDocumento, string> = {
  IDENTIFICACION_OFICIAL: "INE",
  CERTIFICADO_TECNICO: "Certificación",
  CONSTANCIA: "Constancia",
};

export default function CargaDocumentosPage() {
  const router = useRouter();

  // Un estado de carga independiente por sección
  const [archivos, setArchivos] = useState<Record<TipoDocumento, File | null>>({
    IDENTIFICACION_OFICIAL: null,
    CERTIFICADO_TECNICO: null,
    CONSTANCIA: null,
  });
  const [previews, setPreviews] = useState<Record<TipoDocumento, string | null>>({
    IDENTIFICACION_OFICIAL: null,
    CERTIFICADO_TECNICO: null,
    CONSTANCIA: null,
  });
  const [subiendo, setSubiendo] = useState<Record<TipoDocumento, boolean>>({
    IDENTIFICACION_OFICIAL: false,
    CERTIFICADO_TECNICO: false,
    CONSTANCIA: false,
  });
  const [errores, setErrores] = useState<Record<TipoDocumento, string | null>>({
    IDENTIFICACION_OFICIAL: null,
    CERTIFICADO_TECNICO: null,
    CONSTANCIA: null,
  });
  const [exitos, setExitos] = useState<Record<TipoDocumento, string | null>>({
    IDENTIFICACION_OFICIAL: null,
    CERTIFICADO_TECNICO: null,
    CONSTANCIA: null,
  });

  const [documentos, setDocumentos] = useState<DocumentoSubido[]>([]);
  const inputRefs = useRef<Record<TipoDocumento, HTMLInputElement | null>>({
    IDENTIFICACION_OFICIAL: null,
    CERTIFICADO_TECNICO: null,
    CONSTANCIA: null,
  });

  useEffect(() => {
    fetch("/api/trabajadores/documentos")
      .then((r) => r.json())
      .then((data) => setDocumentos(data.documentos ?? []));
  }, []);

  function handleArchivoChange(tipo: TipoDocumento, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setArchivos((prev) => ({ ...prev, [tipo]: file }));
    setErrores((prev) => ({ ...prev, [tipo]: null }));
    setExitos((prev) => ({ ...prev, [tipo]: null }));

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () =>
        setPreviews((prev) => ({ ...prev, [tipo]: reader.result as string }));
      reader.readAsDataURL(file);
    } else {
      setPreviews((prev) => ({ ...prev, [tipo]: null }));
    }
  }

  async function handleSubir(tipo: TipoDocumento) {
    const archivo = archivos[tipo];
    if (!archivo) {
      setErrores((prev) => ({ ...prev, [tipo]: "Selecciona un archivo antes de continuar." }));
      return;
    }

    setSubiendo((prev) => ({ ...prev, [tipo]: true }));
    setErrores((prev) => ({ ...prev, [tipo]: null }));
    setExitos((prev) => ({ ...prev, [tipo]: null }));

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = () => reject(new Error("Error al leer el archivo"));
        reader.readAsDataURL(archivo);
      });

      const response = await fetch("/api/trabajadores/documentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreArchivo: archivo.name,
          mimeType: archivo.type,
          base64Data,
          tipo,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        documento?: DocumentoSubido;
      };

      if (!response.ok) {
        setErrores((prev) => ({ ...prev, [tipo]: data.error ?? "Error al subir el documento." }));
        return;
      }

      setExitos((prev) => ({
        ...prev,
        [tipo]: "Documento subido correctamente. Quedará pendiente de revisión.",
      }));
      setArchivos((prev) => ({ ...prev, [tipo]: null }));
      setPreviews((prev) => ({ ...prev, [tipo]: null }));
      if (inputRefs.current[tipo]) inputRefs.current[tipo]!.value = "";
      if (data.documento) setDocumentos((prev) => [data.documento!, ...prev]);
    } catch {
      setErrores((prev) => ({ ...prev, [tipo]: "Error de conexión al subir el archivo." }));
    } finally {
      setSubiendo((prev) => ({ ...prev, [tipo]: false }));
    }
  }

  // Agrupar documentos ya subidos por tipo
  const docsPorTipo = (tipo: TipoDocumento) =>
    documentos.filter((d) => d.tipo === tipo);

  return (
    <>
      <section className="page-hero auth-hero">
        <div className="container auth-hero-grid">
          <div>
            <span className="eyebrow eyebrow-dark">Verificación de perfil</span>
            <h1>Sube tus documentos para activar tu cuenta.</h1>
            <p>
              Para operar como prestador verificado necesitas subir tu INE y
              cualquier certificación técnica que avale tu especialidad. El
              equipo de ServiPro revisará todo en un plazo de 48 horas hábiles.
            </p>
          </div>
          <div className="auth-summary-card">
            <p className="auth-summary-title">Documentos requeridos</p>
            <ul className="auth-summary-list">
              <li>
                <strong>INE</strong> — identificación oficial vigente.
              </li>
              <li>
                <strong>Certificación técnica</strong> — diploma o constancia de
                tu especialidad.
              </li>
              <li>
                <strong>Constancias adicionales</strong> — opcionales pero
                recomendadas.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {SECCIONES.map((seccion) => {
            const docsExistentes = docsPorTipo(seccion.tipo);
            const archivo = archivos[seccion.tipo];
            const preview = previews[seccion.tipo];
            const error = errores[seccion.tipo];
            const exito = exitos[seccion.tipo];
            const cargando = subiendo[seccion.tipo];

            return (
              <div key={seccion.tipo} className="auth-form-card">
                <div className="auth-form-header">
                  <h2>{seccion.titulo}</h2>
                  <p>{seccion.descripcion}</p>
                </div>

                <ul className="auth-summary-list" style={{ marginBottom: "1.25rem" }}>
                  {seccion.requisitos.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>

                <label className="form-field" style={{ cursor: "pointer" }}>
                  <span>Seleccionar archivo</span>
                  <input
                    ref={(el) => { inputRefs.current[seccion.tipo] = el; }}
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={(e) => handleArchivoChange(seccion.tipo, e)}
                    style={{ marginTop: "0.5rem" }}
                  />
                </label>

                {preview && (
                  <div style={{ marginTop: "1rem", textAlign: "center" }}>
                    <img
                      src={preview}
                      alt="Vista previa"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        borderRadius: "8px",
                        border: "1px solid var(--line)",
                      }}
                    />
                  </div>
                )}

                {archivo && !preview && (
                  <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "var(--muted)" }}>
                    📄 {archivo.name}
                  </p>
                )}

                {error && <p className="form-alert error">{error}</p>}
                {exito && <p className="form-alert success">{exito}</p>}

                <div className="form-actions-row" style={{ marginTop: "1.25rem" }}>
                  <button
                    className="button-primary button-submit"
                    onClick={() => handleSubir(seccion.tipo)}
                    disabled={cargando || !archivo}
                  >
                    {cargando ? "Subiendo..." : `Subir ${ETIQUETAS[seccion.tipo]}`}
                  </button>
                </div>

                {docsExistentes.length > 0 && (
                  <div style={{ marginTop: "1.25rem" }}>
                    <p style={{ fontWeight: 600, marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                      Documentos cargados:
                    </p>
                    <ul className="auth-summary-list">
                      {docsExistentes.map((doc) => (
                        <li key={doc.id}>
                          📎 {doc.nombreArchivo}{" "}
                          <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                            — {new Date(doc.createdAt).toLocaleDateString("es-MX")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}

          <div className="form-actions-row" style={{ paddingBottom: "2rem" }}>
            <button
              className="button-secondary"
              onClick={() => router.push("/panel/trabajador")}
            >
              Volver al panel
            </button>
          </div>
        </div>
      </section>
    </>
  );
}