import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  // Validar que el usuario sea admin
  if (session.role !== "COMPANY_ADMIN") {
    return Response.json(
      { error: "Solo administradores pueden verificar prestadores" },
      { status: 403 }
    );
  }

  try {
    // Obtener el estado de filtrado (opcional)
    const url = new URL(request.url);
    const estado = url.searchParams.get("estado") ?? "PENDIENTE_DE_VERIFICACION";

    const prestadores = await prisma.prestador.findMany({
      where: {
        estadoVerificacion: estado as any, // Validar contra enum
        tipoRegistro: "INDEPENDIENTE", // Solo prestadores independientes necesitan verificación manual
      },
      select: {
        id: true,
        tipoRegistro: true,
        estadoVerificacion: true,
        notasVerificacion: true,
        fechaVerificacion: true,
        usuario: {
          select: {
            id: true,
            nombre: true,
            correo: true,
            telefono: true,
          },
        },
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
      orderBy: {
        createdAt: "asc",
      },
    });

    return Response.json({
      total: prestadores.length,
      prestadores,
    });
  } catch (error: unknown) {
    console.error(error);
    return Response.json(
      { error: "Error al obtener lista de prestadores" },
      { status: 500 }
    );
  }
}
