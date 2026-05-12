import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const prestadores = await prisma.prestador.findMany({
      where: {
        isDisponible: true,
        estadoVerificacion: "VERIFICADO",
      },
      include: {
        usuario: {
          select: {
            nombre: true,
            correo: true,
            telefono: true,
          }
        },
        oficios: {
          select: {
            nombreOficio: true,
          }
        }
      }
    });

    const result = prestadores.map(p => ({
      id: p.id,
      nombre: p.usuario.nombre,
      oficios: p.oficios.map(o => o.nombreOficio),
      calificacionPromedio: p.calificacionPromedio,
      isDisponible: p.isDisponible,
      tarifaBase: 250 // Valor estático para la demo o podrías agregarlo al modelo
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error al listar prestadores:", error);
    return NextResponse.json({ error: "Error al obtener prestadores" }, { status: 500 });
  }
}
