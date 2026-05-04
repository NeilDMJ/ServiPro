import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getString(value: unknown): string | undefined {
  return isNonEmptyString(value) ? value.trim() : undefined;
}

type DocumentoPayload = {
  nombreArchivo?: string;
  tipoDocumento?: string; // "cedula", "certificado", "comprobante_domicilio", etc.
  rutaArchivo?: string;
};

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const payload = (body ?? {}) as DocumentoPayload;
  const nombreArchivo = getString(payload.nombreArchivo);
  const tipoDocumento = getString(payload.tipoDocumento);
  const rutaArchivo = getString(payload.rutaArchivo);

  if (!nombreArchivo) {
    return Response.json(
      { error: "nombreArchivo es requerido" },
      { status: 400 }
    );
  }

  if (!tipoDocumento) {
    return Response.json(
      { error: "tipoDocumento es requerido" },
      { status: 400 }
    );
  }

  if (!rutaArchivo) {
    return Response.json({ error: "rutaArchivo es requerido" }, { status: 400 });
  }

  // Validar que el usuario sea prestador
  if (session.role !== "PRESTADOR") {
    return Response.json(
      { error: "Solo prestadores pueden cargar documentos" },
      { status: 403 }
    );
  }

  try {
    const prestador = await prisma.prestador.findUnique({
      where: { usuarioId: session.sub },
    });

    if (!prestador) {
      return Response.json(
        { error: "Perfil de prestador no encontrado" },
        { status: 404 }
      );
    }

    const documento = await prisma.documento.create({
      data: {
        nombreArchivo,
        tipoDocumento,
        rutaArchivo,
        prestadorId: prestador.id,
        estado: "CARGADO",
      },
    });

    return Response.json(
      {
        documento,
        mensaje: "Documento cargado exitosamente",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error(error);
    return Response.json({ error: "Error al cargar documento" }, { status: 500 });
  }
}
