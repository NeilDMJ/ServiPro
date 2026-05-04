import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getString(value: unknown): string | undefined {
  return isNonEmptyString(value) ? value.trim() : undefined;
}

type VerificacionPayload = {
  prestadorId?: string;
  accion?: string; // "verificar" | "rechazar"
  notas?: string;
};

export async function POST(request: NextRequest) {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const payload = (body ?? {}) as VerificacionPayload;
  const prestadorId = getString(payload.prestadorId);
  const accion = getString(payload.accion);
  const notas = getString(payload.notas);

  if (!prestadorId) {
    return Response.json({ error: "prestadorId es requerido" }, { status: 400 });
  }

  if (!accion || !["verificar", "rechazar"].includes(accion)) {
    return Response.json(
      { error: "accion debe ser 'verificar' o 'rechazar'" },
      { status: 400 }
    );
  }

  try {
    const prestador = await prisma.prestador.findUnique({
      where: { id: prestadorId },
      select: {
        id: true,
        estadoVerificacion: true,
        usuario: { select: { nombre: true, correo: true } },
      },
    });

    if (!prestador) {
      return Response.json(
        { error: "Prestador no encontrado" },
        { status: 404 }
      );
    }

    if (prestador.estadoVerificacion !== "PENDIENTE_DE_VERIFICACION") {
      return Response.json(
        {
          error: `El prestador ya ha sido ${prestador.estadoVerificacion === "VERIFICADO" ? "verificado" : "rechazado"}`,
        },
        { status: 400 }
      );
    }

    const nuevoEstado =
      accion === "verificar" ? "VERIFICADO" : "RECHAZADO";

    const prestadorActualizado = await prisma.prestador.update({
      where: { id: prestadorId },
      data: {
        estadoVerificacion: nuevoEstado,
        fechaVerificacion: new Date(),
        notasVerificacion: notas || null,
      },
      select: {
        id: true,
        estadoVerificacion: true,
        fechaVerificacion: true,
        notasVerificacion: true,
        usuario: {
          select: {
            nombre: true,
            correo: true,
          },
        },
      },
    });

    return Response.json(
      {
        prestador: prestadorActualizado,
        mensaje: `Prestador ${accion === "verificar" ? "verificado" : "rechazado"} exitosamente`,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(error);
    return Response.json(
      { error: "Error al procesar verificación" },
      { status: 500 }
    );
  }
}
