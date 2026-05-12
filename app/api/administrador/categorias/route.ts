import { NextRequest } from "next/server";
// [UC-03] Endpoint CRUD de categorías/oficios — rutas GET y POST
import { prisma } from "@/lib/prisma";
import { requireSessionForPanel } from "@/lib/session";

// GET /api/admin/categorias — Listar todas
export async function GET() {
  const categorias = await prisma.categoria.findMany({
    include: {
      _count: { select: { prestadores: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(categorias);
}

// POST /api/admin/categorias — Crear nueva
export async function POST(request: NextRequest) {
  const session = await requireSessionForPanel("administrador").catch(() => null);
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const { nombre, descripcion, icono, estado } = body;

  // Validación de campos obligatorios
  if (!nombre?.trim() || !descripcion?.trim()) {
    return Response.json({ error: "Nombre y descripción son obligatorios" }, { status: 400 });
  }
  if (descripcion.length < 20 || descripcion.length > 200) {
    return Response.json({ error: "La descripción debe tener entre 20 y 200 caracteres" }, { status: 400 });
  }

  // Verificar nombre duplicado (S1)
  const existe = await prisma.categoria.findUnique({ where: { nombre: nombre.trim() } });
  if (existe) {
    return Response.json({ error: "Ya existe una categoría con ese nombre", code: "NOMBRE_DUPLICADO" }, { status: 409 });
  }

  const categoria = await prisma.categoria.create({
    data: {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      icono: icono?.trim() || null,
      estado: estado || "ACTIVA",
    },
  });

  // Log de auditoría
  await prisma.logAuditoria.create({
    data: {
      accion: "CREAR",
      entidad: "Categoria",
      entidadId: categoria.id,
      usuarioId: session.sub,
      categoriaId: categoria.id,
      detalle: `Categoría "${categoria.nombre}" creada`,
    },
  });

  return Response.json(categoria, { status: 201 });
}