import { NextRequest } from "next/server";
// [UC-03] Endpoint CRUD de categorías/oficios — rutas PUT y DELETE
import { prisma } from "@/lib/prisma";
import { requireSessionForPanel } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

// PUT /api/admin/categorias/[id] — Editar
export async function PUT(request: NextRequest, { params }: Params) {
  const session = await requireSessionForPanel("administrador").catch(() => null);
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { nombre, descripcion, icono, estado } = body;

  if (!nombre?.trim() || !descripcion?.trim()) {
    return Response.json({ error: "Nombre y descripción son obligatorios" }, { status: 400 });
  }
  if (descripcion.length < 20 || descripcion.length > 200) {
    return Response.json({ error: "Descripción debe tener entre 20 y 200 caracteres" }, { status: 400 });
  }

  // Verifica nombre duplicado excluyendo la categoría actual (S1)
  const duplicado = await prisma.categoria.findFirst({
    where: { nombre: nombre.trim(), NOT: { id } },
  });
  if (duplicado) {
    return Response.json({ error: "Ya existe una categoría con ese nombre", code: "NOMBRE_DUPLICADO" }, { status: 409 });
  }

  const categoria = await prisma.categoria.update({
    where: { id },
    data: { nombre: nombre.trim(), descripcion: descripcion.trim(), icono: icono || null, estado },
    include: { _count: { select: { prestadores: true } } },
  });

  // Notificar prestadores si hay asociados (S2)
  if (categoria._count.prestadores > 0) {
    console.log(`Notificar a ${categoria._count.prestadores} prestadores sobre cambio en "${categoria.nombre}"`);
  }

  await prisma.logAuditoria.create({
    data: {
      accion: "EDITAR",
      entidad: "Categoria",
      entidadId: id,
      usuarioId: session.sub,
      categoriaId: id,
      detalle: `Categoría "${categoria.nombre}" editada`,
    },
  });

  return Response.json(categoria);
}

// DELETE /api/admin/categorias/[id] — Eliminar
export async function DELETE(request: NextRequest, { params }: Params) {
  const session = await requireSessionForPanel("administrador").catch(() => null);
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;

  // Verificar prestadores activos (S3)
  const categoria = await prisma.categoria.findUnique({
    where: { id },
    include: { _count: { select: { prestadores: true } } },
  });
  if (!categoria) return Response.json({ error: "Categoría no encontrada" }, { status: 404 });

  if (categoria._count.prestadores > 0) {
    // Si no se puede eliminar físicamente se desactiva en su lugar
    const desactivada = await prisma.categoria.update({
      where: { id },
      data: { estado: "INACTIVA" },
    });
    await prisma.logAuditoria.create({
      data: {
        accion: "ELIMINAR",
        entidad: "Categoria",
        entidadId: id,
        usuarioId: session.sub,
        categoriaId: id,
        detalle: `Categoría "${categoria.nombre}" desactivada (tenía prestadores activos)`,
      },
    });
    return Response.json({
      mensaje: "Categoría desactivada (tiene prestadores asociados). Reasígnalos para eliminarla físicamente.",
      categoria: desactivada,
    });
  }

  // Eliminación física si no hay prestadores
  await prisma.categoria.delete({ where: { id } });
  await prisma.logAuditoria.create({
    data: {
      accion: "ELIMINAR",
      entidad: "Categoria",
      entidadId: id,
      usuarioId: session.sub,
      detalle: `Categoría "${categoria.nombre}" eliminada permanentemente`,
    },
  });

  return Response.json({ mensaje: "Categoría eliminada correctamente" });
}