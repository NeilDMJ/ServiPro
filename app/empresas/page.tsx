"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { serviceCategories, zones } from "@/lib/siteContent";

type EmpresaListing = {
  id: string;
  razonSocial: string;
  rfc: string;
  ramo: string | null;
  ubicacion: string | null;
};

export default function EmpresasDirectoryPage() {
  const [empresas, setEmpresas] = useState<EmpresaListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    ramo: "Todos",
    ubicacion: "Todas",
    q: "",
  });

  async function fetchEmpresas() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.ramo !== "Todos") params.append("ramo", filters.ramo);
      if (filters.ubicacion !== "Todas") params.append("ubicacion", filters.ubicacion);
      if (filters.q) params.append("q", filters.q);

      const res = await fetch(`/api/empresa/listar?${params.toString()}`);
      const data = await res.json();
      setEmpresas(data.empresas || []);
    } catch (err) {
      console.error("Error fetching companies:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmpresas();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow eyebrow-dark">Directorio operativo</span>
          <h1>Encuentra la empresa ideal para tu próximo servicio.</h1>
          <p>
            Explora nuestra red de organizaciones verificadas filtrando por su especialidad y zona de cobertura.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "2.5rem", alignItems: "start" }}>
          {/* Sidebar de Filtros */}
          <aside className="auth-summary-card" style={{ position: "sticky", top: "100px" }}>
            <h2 style={{ fontSize: "1.1rem", marginBottom: "1.2rem" }}>Filtrar por</h2>
            
            <div style={{ marginBottom: "1.8rem" }}>
              <p className="auth-summary-title" style={{ marginBottom: "0.8rem" }}>Especialidad / Ramo</p>
              <select 
                className="form-field" 
                value={filters.ramo}
                onChange={(e) => setFilters(prev => ({ ...prev, ramo: e.target.value }))}
                style={{ padding: "0.6rem", borderRadius: "0.8rem" }}
              >
                <option value="Todos">Todas las especialidades</option>
                {serviceCategories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "1.8rem" }}>
              <p className="auth-summary-title" style={{ marginBottom: "0.8rem" }}>Ubicación / Zona</p>
              <select 
                className="form-field" 
                value={filters.ubicacion}
                onChange={(e) => setFilters(prev => ({ ...prev, ubicacion: e.target.value }))}
                style={{ padding: "0.6rem", borderRadius: "0.8rem" }}
              >
                <option value="Todas">Todas las zonas</option>
                {zones.map(zone => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
            </div>

            <div>
              <p className="auth-summary-title" style={{ marginBottom: "0.8rem" }}>Búsqueda directa</p>
              <input 
                type="text" 
                placeholder="Nombre o RFC..." 
                className="form-field"
                value={filters.q}
                onChange={(e) => setFilters(prev => ({ ...prev, q: e.target.value }))}
                style={{ padding: "0.6rem", borderRadius: "0.8rem" }}
              />
            </div>
          </aside>

          {/* Grilla de Resultados */}
          <main>
            {isLoading ? (
              <div style={{ textAlign: "center", padding: "4rem", color: "var(--muted)" }}>Cargando empresas...</div>
            ) : empresas.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "4rem" }}>
                <h3>No se encontraron empresas</h3>
                <p>Intenta ajustar tus filtros de búsqueda.</p>
                <button 
                  onClick={() => setFilters({ ramo: "Todos", ubicacion: "Todas", q: "" })}
                  className="button-secondary"
                  style={{ marginTop: "1rem" }}
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-3">
                {empresas.map((emp) => (
                  <article key={emp.id} className="card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <div style={{ flex: 1 }}>
                      <span className="choice-accent" style={{ fontSize: "0.7rem" }}>
                        {emp.ramo || "Servicios Generales"}
                      </span>
                      <h3 style={{ margin: "0.4rem 0" }}>{emp.razonSocial}</h3>
                      <p style={{ fontSize: "0.85rem", marginBottom: "1rem" }}>
                        <span style={{ opacity: 0.7 }}>RFC:</span> {emp.rfc}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--muted)", fontSize: "0.85rem" }}>
                        <span>📍</span> {emp.ubicacion || "Cobertura Nacional"}
                      </div>
                    </div>
                    
                    <div style={{ marginTop: "1.5rem" }}>
                      <Link href={`#`} className="button-primary" style={{ width: "100%", fontSize: "0.85rem" }}>
                        Ver Perfil
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>
        </div>
      </section>
    </>
  );
}
