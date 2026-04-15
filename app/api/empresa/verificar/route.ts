import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return Response.json({ empresas: [] });
  }

  try {
    const empresas = await prisma.empresa.findMany({
      where: {
        OR: [
          { razonSocial: { contains: query, mode: "insensitive" } },
          { rfc: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        razonSocial: true,
        rfc: true,
      },
      take: 5,
    });

    return Response.json({ empresas });
  } catch (error) {
    console.error("Error al buscar empresas:", error);
    // Retornamos un 200 con un flag de error para evitar que el frontend explote
    return Response.json({ 
      empresas: [], 
      dbError: true,
      message: "No se pudo conectar con la base de datos" 
    }, { status: 200 });
  }
}
