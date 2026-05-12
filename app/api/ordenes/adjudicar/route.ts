import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prestadorId, monto } = body;

    if (!prestadorId) {
      return NextResponse.json({ error: "El ID del prestador es requerido" }, { status: 400 });
    }

    // 1. Simular la obtención del cliente actual (en una app real vendría de la sesión)
    // Para la demo, tomamos el primer cliente de la DB
    const cliente = await prisma.cliente.findFirst();
    
    if (!cliente) {
      return NextResponse.json({ error: "No se encontró un cliente para realizar la orden" }, { status: 404 });
    }

    // 2. Crear la Orden en estado PENDIENTE (según Diagrama de Estados)
    // Nota: Necesitamos un servicioId válido. Tomamos el primero asociado al prestador o uno genérico.
    const prestador = await prisma.prestador.findUnique({
      where: { id: prestadorId },
      include: { oficios: true }
    });

    if (!prestador || prestador.oficios.length === 0) {
      return NextResponse.json({ error: "El prestador no tiene oficios registrados" }, { status: 400 });
    }

    const orden = await prisma.orden.create({
      data: {
        clienteId: cliente.id,
        prestadorId: prestador.id,
        servicioId: prestador.oficios[0].id,
        estado: "PENDIENTE",
        direccionServicio: cliente.direccionDefault || "Dirección del cliente",
        pago: {
          create: {
            monto: monto || 250.00,
            metodoPago: "EFECTIVO",
            estado: "PENDIENTE"
          }
        }
      }
    });

    console.log(`[Escrow] Fondos retenidos para la Orden #${orden.id}. Monto: $${monto}`);

    return NextResponse.json({ 
      success: true, 
      ordenId: orden.id, 
      mensaje: "retencionExitosa" 
    }, { status: 201 });

  } catch (error) {
    console.error("Error en adjudicación:", error);
    return NextResponse.json({ error: "Error al procesar la adjudicación" }, { status: 500 });
  }
}
