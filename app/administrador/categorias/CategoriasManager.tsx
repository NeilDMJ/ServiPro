"use client";
import { useState } from "react";

// 🔹 Tipos base
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
  };

  const recargar = async () => {
    const res = await fetch("/api/administrador/categorias");
    const data = await res.json();
    setCategorias(data);
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

    setMensaje(editando ? "Categoría actualizada" : "Categoría creada");
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
  };

  const handleEliminar = async (cat: Categoria) => {
    if (!confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return;

    setLoading(true);
    const res = await fetch(`/api/administrador/categorias/${cat.id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    setLoading(false);
    setMensaje(data.mensaje);
    recargar();
  };

  return (
    <div>
      {/* Formulario */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: 20,
          borderRadius: 8,
          marginBottom: 24,
        }}
      >
        <h2>{editando ? "Editar Categoría" : "Nueva Categoría"}</h2>

        <label>Nombre *</label>
        <input
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          placeholder="Ej: Plomería"
          style={{ display: "block", width: "100%", marginBottom: 8 }}
        />

        <label>Descripción * (20-200 caracteres)</label>
        <textarea
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          placeholder="Describe la categoría..."
          rows={3}
          style={{ display: "block", width: "100%", marginBottom: 8 }}
        />
        <small>{form.descripcion.length}/200 caracteres</small>

        <label>Icono (URL o emoji)</label>
        <input
          value={form.icono}
          onChange={(e) => setForm({ ...form, icono: e.target.value })}
          placeholder="🔧 o URL de imagen"
          style={{ display: "block", width: "100%", marginBottom: 8 }}
        />

        <label>Estado</label>
        <select
          value={form.estado}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "ACTIVA" || value === "INACTIVA") {
              setForm({ ...form, estado: value });
            }
          }}
          style={{ display: "block", marginBottom: 12 }}
        >
          <option value="ACTIVA">Activa</option>
          <option value="INACTIVA">Inactiva</option>
        </select>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="button-primary"
        >
          {loading ? "Guardando..." : editando ? "Guardar cambios" : "Crear categoría"}
        </button>

        {editando && (
          <button onClick={resetForm} style={{ marginLeft: 8 }}>
            Cancelar
          </button>
        )}
      </div>

      {/* Tabla */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={{ padding: 8, textAlign: "left" }}>Nombre</th>
            <th style={{ padding: 8 }}>Descripción</th>
            <th style={{ padding: 8 }}>Prestadores</th>
            <th style={{ padding: 8 }}>Estado</th>
            <th style={{ padding: 8 }}>Fecha creación</th>
            <th style={{ padding: 8 }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((cat) => (
            <tr key={cat.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 8 }}>
                {cat.icono} {cat.nombre}
              </td>
              <td style={{ padding: 8, fontSize: 13, color: "#555" }}>
                {cat.descripcion.substring(0, 60)}...
              </td>
              <td style={{ padding: 8, textAlign: "center" }}>
                {cat._count.prestadores}
              </td>
              <td style={{ padding: 8 }}>
                <span style={{ color: cat.estado === "ACTIVA" ? "green" : "gray" }}>
                  {cat.estado}
                </span>
              </td>
              <td style={{ padding: 8, fontSize: 13, color: "#555" }}>
                {new Date(cat.createdAt).toLocaleDateString("es-MX", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td style={{ padding: 8 }}>
                <button
                  onClick={() => handleEditar(cat)}
                  style={{ marginRight: 4 }}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(cat)}
                  style={{ color: "red" }}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}

          {categorias.length === 0 && (
            <tr>
              <td
                colSpan={6}
                style={{ textAlign: "center", padding: 20, color: "#999" }}
              >
                No hay categorías registradas
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}