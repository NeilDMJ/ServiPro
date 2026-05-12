"use client";
"use client";
// [UC-03] Gestión CRUD de categorías/oficios — componente cliente

import { useState } from "react";

// ── Tipos ──────────────────────────────────────────────────────────────────
type Estado = "ACTIVA" | "INACTIVA";

type Categoria = {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string | null;
  estado: Estado;
  createdAt: string;
  _count: { prestadores: number };
};

type FormType = {
  nombre: string;
  descripcion: string;
  icono: string;
  estado: Estado;
};

type Props = { initialData: Categoria[] };

const EMPTY_FORM: FormType = {
  nombre: "",
  descripcion: "",
  icono: "",
  estado: "ACTIVA",
};

// ── Componente ─────────────────────────────────────────────────────────────
export function CategoriasManager({ initialData }: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>(initialData);
  const [form, setForm] = useState<FormType>(EMPTY_FORM);
  const [editando, setEditando] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditando(null);
    setError("");
    setMensaje("");
  };

  const recargar = async () => {
    const res = await fetch("/api/administrador/categorias");
    if (res.ok) {
      const data: Categoria[] = await res.json();
      setCategorias(data);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setMensaje("");
    setLoading(true);

    const url = editando
      ? `/api/administrador/categorias/${editando}`
      : "/api/administrador/categorias";
    const method = editando ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Error al guardar");
      return;
    }

    setMensaje(editando ? "Categoría actualizada." : "Categoría creada.");
    resetForm();
    recargar();
  };

  const handleEditar = (cat: Categoria) => {
    setEditando(cat.id);
    setForm({
      nombre: cat.nombre,
      descripcion: cat.descripcion,
      icono: cat.icono || "",
      estado: cat.estado,
    });
    setError("");
    setMensaje("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEliminar = async (cat: Categoria) => {
    if (!confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return;

    setLoading(true);
    const res = await fetch(`/api/administrador/categorias/${cat.id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    setLoading(false);
    setMensaje(data.mensaje ?? "Categoría eliminada.");
    recargar();
  };

  return (
    <>
      {/* ── Cabecera ──────────────────────────────────────────── */}
      <div style={{ marginBottom: "1.8rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.04em", margin: 0 }}>
          Gestión de categorías
        </h1>
        <p style={{ color: "var(--muted)", marginTop: "0.4rem", fontSize: "0.97rem" }}>
          Alta, edición y baja de categorías de servicios del hogar.
        </p>
      </div>

      {/* ── Formulario ────────────────────────────────────────── */}
      <div className="auth-form-card" style={{ marginBottom: "2rem" }}>
        <div className="auth-form-header">
          <h2>{editando ? "Editar categoría" : "Nueva categoría"}</h2>
          <p>
            {editando
              ? "Modifica los datos y guarda los cambios."
              : "Completa los campos para registrar una nueva categoría."}
          </p>
        </div>

        {error   && <p className="form-alert error">{error}</p>}
        {mensaje && <p className="form-alert success">{mensaje}</p>}

        <div className="form-grid two-columns" style={{ marginTop: "1.2rem" }}>
          <label className="form-field">
            <span>Nombre *</span>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Plomería"
            />
          </label>

          <label className="form-field">
            <span>Icono (emoji o URL)</span>
            <input
              type="text"
              value={form.icono}
              onChange={(e) => setForm({ ...form, icono: e.target.value })}
              placeholder="🔧"
            />
          </label>

          <label className="form-field form-field-full">
            <span>
              Descripción *{" "}
              <small style={{ fontWeight: 400, color: "var(--muted)" }}>
                ({form.descripcion.length}/200 car.)
              </small>
            </span>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Describe el tipo de servicios que agrupa esta categoría…"
              rows={3}
            />
          </label>

          <label className="form-field">
            <span>Estado</span>
            <select
              value={form.estado}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "ACTIVA" || v === "INACTIVA") setForm({ ...form, estado: v });
              }}
            >
              <option value="ACTIVA">Activa</option>
              <option value="INACTIVA">Inactiva</option>
            </select>
          </label>
        </div>

        <div className="form-actions-row">
          <button
            className="button-primary button-submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Guardando…" : editando ? "Guardar cambios" : "Crear categoría"}
          </button>
          {editando && (
            <button className="button-secondary" onClick={resetForm}>
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* ── Tabla de categorías ───────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "1.2rem 1.4rem", borderBottom: "1px solid var(--line)" }}>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 650 }}>
            Categorías registradas{" "}
            <span style={{ color: "var(--muted)", fontWeight: 400 }}>({categorias.length})</span>
          </h3>
        </div>

        {categorias.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--muted)", padding: "2.5rem 1rem" }}>
            No hay categorías registradas.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.93rem" }}>
              <thead>
                <tr style={{ background: "var(--background)" }}>
                  {["Nombre", "Descripción", "Prestadores", "Estado", "Creada", "Acciones"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "0.7rem 1rem",
                        textAlign: "left",
                        fontWeight: 600,
                        fontSize: "0.83rem",
                        color: "var(--muted)",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        borderBottom: "1px solid var(--line)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categorias.map((cat, i) => (
                  <tr
                    key={cat.id}
                    style={{
                      borderBottom: i < categorias.length - 1 ? "1px solid var(--line)" : "none",
                      background: editando === cat.id ? "rgba(0,113,227,0.04)" : "transparent",
                    }}
                  >
                    <td style={{ padding: "0.8rem 1rem", fontWeight: 560 }}>
                      {cat.icono && <span style={{ marginRight: "0.4rem" }}>{cat.icono}</span>}
                      {cat.nombre}
                    </td>
                    <td style={{ padding: "0.8rem 1rem", color: "var(--muted)", maxWidth: 260 }}>
                      {cat.descripcion.length > 70
                        ? cat.descripcion.substring(0, 70) + "…"
                        : cat.descripcion}
                    </td>
                    <td style={{ padding: "0.8rem 1rem", textAlign: "center" }}>
                      {cat._count.prestadores}
                    </td>
                    <td style={{ padding: "0.8rem 1rem" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          padding: "0.2rem 0.65rem",
                          borderRadius: "999px",
                          background: cat.estado === "ACTIVA" ? "#f2fbf4" : "#f5f5f7",
                          color: cat.estado === "ACTIVA" ? "#1d6c32" : "var(--muted)",
                          border: `1px solid ${cat.estado === "ACTIVA" ? "#c8e8ce" : "var(--line)"}`,
                        }}
                      >
                        {cat.estado === "ACTIVA" ? "● Activa" : "○ Inactiva"}
                      </span>
                    </td>
                    <td style={{ padding: "0.8rem 1rem", color: "var(--muted)", whiteSpace: "nowrap" }}>
                      {new Date(cat.createdAt).toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td style={{ padding: "0.8rem 1rem", whiteSpace: "nowrap" }}>
                      <button
                        className="button-secondary"
                        style={{
                          marginRight: "0.5rem",
                          minHeight: "auto",
                          padding: "0.3rem 0.8rem",
                          fontSize: "0.85rem",
                        }}
                        onClick={() => handleEditar(cat)}
                        disabled={loading}
                      >
                        Editar
                      </button>
                      <button
                        style={{
                          background: "transparent",
                          border: "1px solid #ffd3cb",
                          color: "#9b3320",
                          borderRadius: "999px",
                          padding: "0.3rem 0.8rem",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          fontWeight: 560,
                        }}
                        onClick={() => handleEliminar(cat)}
                        disabled={loading}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}