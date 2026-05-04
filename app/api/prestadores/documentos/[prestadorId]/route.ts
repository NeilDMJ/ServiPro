import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ prestadorId: string }> }
) {
  const session = await getSession();

  if (!session) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const { prestadorId } = await params;

  if (!prestadorId) {
    return Response.json(
      { error: "prestadorId es requerido" },
      { status: 400 }
    );
  }

  try {
    // Validar que el usuario sea admin o el prestador mismo
    const prestador = await prisma.prestador.findUnique({
      where: { id: prestadorId },
      select: {
        usuarioId: true,
      },
    });

    if (!prestador) {
      return Response.json(
        { error: "Prestador no encontrado" },
        { status: 404 }
      );
    }

    // Solo el admin o el prestador mismo puede ver los documentos
    if (
      session.role !== "COMPANY_ADMIN" &&
      session.sub !== prestador.usuarioId
    ) {
      return Response.json(
        {
          error: "No tienes permiso para ver estos documentos",
        },
        { status: 403 }
      );
    }

    const documentos = await prisma.documento.findMany({
      where: { prestadorId },
      select: {
        id: true,
        nombreArchivo: true,
        tipoDocumento: true,
        rutaArchivo: true,
        estado: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json({
      prestadorId,
      documentos,
      total: documentos.length,
    });
  } catch (error: unknown) {
    console.error(error);
    return Response.json(
      { error: "Error al obtener documentos" },
      { status: 500 }
    );
  }
}
