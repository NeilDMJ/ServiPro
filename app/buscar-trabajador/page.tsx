"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

/**
 * IMPLEMENTACIÓN SEGÚN: 
 * 1. Diagrama de Clases UML (Clase Prestador, Clase Servicio)
 * 2. Ticket #64: Pantalla: listado de trabajadores disponibles con filtros
 * Variables y atributos acoplados: nombre, oficios (nombreOficio), 
 * calificacionPromedio, isDisponible.
 */

// Datos simulados basados fielmente en el modelo de Clases UML
const MOCK_PRESTADORES = [
  { id: "1", nombre: "Juan Pérez", oficios: ["Plomería", "Electricidad"], calificacionPromedio: 4.8, isDisponible: true, tarifaBase: 250 },
  { id: "2", nombre: "María García", oficios: ["Limpieza", "Jardinería"], calificacionPromedio: 4.9, isDisponible: true, tarifaBase: 180 },
  { id: "3", nombre: "Carlos Ruiz", oficios: ["Plomería"], calificacionPromedio: 4.5, isDisponible: false, tarifaBase: 300 },
  { id: "4", nombre: "Ana López", oficios: ["Electricidad", "Pintura"], calificacionPromedio: 4.7, isDisponible: true, tarifaBase: 220 },
  { id: "5", nombre: "Roberto Díaz", oficios: ["Carpintería"], calificacionPromedio: 4.6, isDisponible: true, tarifaBase: 280 },
];

const OFICIOS_DISPONIBLES = ["Todos", "Plomería", "Electricidad", "Limpieza", "Jardinería", "Pintura", "Carpintería"];

export default function BuscarTrabajadorPage() {
  const [trabajadores, setTrabajadores] = useState<any[]>([]);
  const [filtroOficio, setFiltroOficio] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function cargarTrabajadores() {
      try {
        const response = await fetch("/api/prestadores/listar");
        const data = await response.json();
        setTrabajadores(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al cargar trabajadores:", error);
      } finally {
        setIsLoading(false);
      }
    }
    cargarTrabajadores();
  }, []);

  const trabajadoresFiltrados = useMemo(() => {
    return trabajadores.filter((p) => {
      const cumpleOficio = filtroOficio === "Todos" || p.oficios.includes(filtroOficio);
      const cumpleBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
      return cumpleOficio && cumpleBusqueda && p.isDisponible; 
    });
  }, [trabajadores, filtroOficio, busqueda]);

  return (
    <>
      <section className="page-hero auth-hero">
        <div className="container auth-hero-grid">
          <div>
            <span className="eyebrow eyebrow-dark">Búsqueda de Talento</span>
            <h1>Encuentra al prestador ideal para tu hogar.</h1>
            <p>
              Filtra por oficio y calificación para asegurar la mejor calidad en tu servicio. 
              Mostramos solo prestadores con estado <strong>isDisponible: true</strong>.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="search-filters-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Nombre del prestador</label>
              <input 
                type="text" 
                placeholder="Ej. Juan Pérez..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Filtrar por Oficio</label>
              <select 
                value={filtroOficio}
                onChange={(e) => setFiltroOficio(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white' }}
              >
                {OFICIOS_DISPONIBLES.map(oficio => (
                  <option key={oficio} value={oficio}>{oficio}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-3">
            {isLoading ? (
              <p>Cargando prestadores...</p>
            ) : (
              trabajadoresFiltrados.map((p) => (
                <article key={p.id} className="choice-card" style={{ textAlign: 'left', padding: '1.5rem', border: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{p.nombre}</h3>
                    <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      ⭐ {p.calificacionPromedio}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    {p.oficios.map(o => (
                      <span key={o} style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#475569' }}>{o}</span>
                    ))}
                  </div>
                  <p style={{ fontWeight: 'bold', fontSize: '1.3rem', margin: '0 0 1.5rem 0' }}>
                    ${p.tarifaBase} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#999' }}>tarifa base</span>
                  </p>
                  
                  <Link 
                    href={`/adjudicacion/${p.id}?nombre=${encodeURIComponent(p.nombre)}`} 
                    className="button-primary" 
                    style={{ display: 'block', textAlign: 'center', textDecoration: 'none', width: '100%' }}
                  >
                    Seleccionar y Adjudicar
                  </Link>
                </article>
              ))
            )}
          </div>

          {!isLoading && trabajadoresFiltrados.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', background: '#f9fafb', borderRadius: '12px' }}>
              <p style={{ color: '#666' }}>No se encontraron trabajadores disponibles con esos criterios de búsqueda.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
