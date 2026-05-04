import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  // Validar que el usuario sea admin o cliente
  if (session.role === "PRESTADOR") {
    return Response.json(
      { error: "Los prestadores no pueden listar otros prestadores" },
      { status: 403 }
    );
  }

  try {
    const url = new URL(request.url);
    const tipoRegistro = url.searchParams.get("tipoRegistro"); // "INDEPENDIENTE" | "EMPRESA" | null para ambos
    const disponibles = url.searchParams.get("disponibles") === "true";

    const filtros: any = {
      estadoVerificacion: "VERIFICADO",
    };

    if (tipoRegistro && ["INDEPENDIENTE", "EMPRESA"].includes(tipoRegistro)) {
      filtros.tipoRegistro = tipoRegistro;
    }

    if (disponibles) {
      filtros.isDisponible = true;
    }

    const prestadores = await prisma.prestador.findMany({
      where: filtros,
      select: {
        id: true,
        tipoRegistro: true,
        calificacionPromedio: true,
        isDisponible: true,
        usuario: {
          select: {
            nombre: true,
            correo: true,
            telefono: true,
          },
        },
        oficios: {
          select: {
            id: true,
            nombreOficio: true,
            tarifaBase: true,
          },
        },
      },
      orderBy: {
        calificacionPromedio: "desc",
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
