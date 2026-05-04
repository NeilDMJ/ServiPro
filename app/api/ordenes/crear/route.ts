import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getString(value: unknown): string | undefined {
  return isNonEmptyString(value) ? value.trim() : undefined;
}

type CrearOrdenPayload = {
  prestadorId?: string;
  servicioId?: string;
  direccionServicio?: string;
  fechaAgendada?: string;
};

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  // Validar que el usuario sea cliente
  if (session.role !== "CLIENTE") {
    return Response.json(
      { error: "Solo clientes pueden crear órdenes" },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const payload = (body ?? {}) as CrearOrdenPayload;
  const prestadorId = getString(payload.prestadorId);
  const servicioId = getString(payload.servicioId);
  const direccionServicio = getString(payload.direccionServicio);
  const fechaAgendadaStr = getString(payload.fechaAgendada);

  if (!prestadorId) {
    return Response.json(
      { error: "prestadorId es requerido" },
      { status: 400 }
    );
  }

  if (!servicioId) {
    return Response.json({ error: "servicioId es requerido" }, { status: 400 });
  }

  if (!direccionServicio) {
    return Response.json(
      { error: "direccionServicio es requerido" },
      { status: 400 }
    );
  }

  try {
    // Obtener el cliente del usuario autenticado
    const cliente = await prisma.cliente.findUnique({
      where: { usuarioId: session.sub },
    });

    if (!cliente) {
      return Response.json(
        { error: "Perfil de cliente no encontrado" },
        { status: 404 }
      );
    }

    // Validar que el prestador exista y esté VERIFICADO
    const prestador = await prisma.prestador.findUnique({
      where: { id: prestadorId },
      select: {
        id: true,
        estadoVerificacion: true,
        tipoRegistro: true,
      },
    });

    if (!prestador) {
      return Response.json(
        { error: "Prestador no encontrado" },
        { status: 404 }
      );
    }

    if (prestador.estadoVerificacion !== "VERIFICADO") {
      return Response.json(
        {
          error: "El prestador no está verificado y no puede recibir órdenes",
          estadoVerificacion: prestador.estadoVerificacion,
        },
        { status: 403 }
      );
    }

    // Validar que el servicio exista
    const servicio = await prisma.servicio.findUnique({
      where: { id: servicioId },
    });

    if (!servicio) {
      return Response.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    // Crear la orden
    const fechaAgendada = fechaAgendadaStr
      ? new Date(fechaAgendadaStr)
      : undefined;

    const orden = await prisma.orden.create({
      data: {
        clienteId: cliente.id,
        prestadorId,
        servicioId,
        direccionServicio,
        fechaAgendada,
      },
      select: {
        id: true,
        estado: true,
        fechaCreacion: true,
        fechaAgendada: true,
        direccionServicio: true,
        cliente: {
          select: {
            usuario: { select: { nombre: true } },
          },
        },
        prestador: {
          select: {
            usuario: { select: { nombre: true } },
          },
        },
        servicio: {
          select: {
            nombreOficio: true,
            tarifaBase: true,
          },
        },
      },
    });

    return Response.json(
      {
        orden,
        mensaje: "Orden creada exitosamente",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error(error);
    return Response.json({ error: "Error al crear orden" }, { status: 500 });
  }
}
