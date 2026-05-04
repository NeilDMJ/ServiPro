import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  // Validar que el usuario sea prestador
  if (session.role !== "PRESTADOR") {
    return Response.json(
      { error: "Solo prestadores pueden consultar su estado" },
      { status: 403 }
    );
  }

  try {
    const prestador = await prisma.prestador.findUnique({
      where: { usuarioId: session.sub },
      select: {
        id: true,
        estadoVerificacion: true,
        notasVerificacion: true,
        fechaVerificacion: true,
        tipoRegistro: true,
        documentos: {
          select: {
            id: true,
            nombreArchivo: true,
            tipoDocumento: true,
            estado: true,
            createdAt: true,
          },
        },
      },
    });

    if (!prestador) {
      return Response.json(
        { error: "Perfil de prestador no encontrado" },
        { status: 404 }
      );
    }

    return Response.json({
      prestador,
    });
  } catch (error: unknown) {
    console.error(error);
    return Response.json(
      { error: "Error al obtener estado de verificación" },
      { status: 500 }
    );
  }
}
