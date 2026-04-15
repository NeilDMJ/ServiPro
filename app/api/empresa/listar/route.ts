import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ramo = searchParams.get("ramo");
  const ubicacion = searchParams.get("ubicacion");
  const q = searchParams.get("q");

  try {
    const empresas = await prisma.empresa.findMany({
      where: {
        AND: [
          ramo && ramo !== "Todos" ? { ramo: { equals: ramo } } : {},
          ubicacion && ubicacion !== "Todas" ? { ubicacion: { equals: ubicacion } } : {},
          q ? {
            OR: [
              { razonSocial: { contains: q, mode: "insensitive" } },
              { rfc: { contains: q, mode: "insensitive" } },
            ]
          } : {},
        ],
      },
      select: {
        id: true,
        razonSocial: true,
        rfc: true,
        ramo: true,
        ubicacion: true,
      },
      orderBy: { razonSocial: "asc" },
    });

    return Response.json({ empresas });
  } catch (error) {
    console.error("Error listing companies:", error);
    return Response.json({ error: "Error al listar empresas" }, { status: 500 });
  }
}
