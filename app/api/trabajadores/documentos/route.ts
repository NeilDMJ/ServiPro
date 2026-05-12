import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { TipoDocumento } from "@prisma/client";

const TIPOS_VALIDOS: TipoDocumento[] = [
  "IDENTIFICACION_OFICIAL",
  "CERTIFICADO_TECNICO",
  "CONSTANCIA",
];

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "PRESTADOR") {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { nombreArchivo, mimeType, base64Data, tipo } = body as {
    nombreArchivo?: string;
    mimeType?: string;
    base64Data?: string;
    tipo?: string;
  };

  if (!nombreArchivo || !mimeType || !base64Data || !tipo) {
    return Response.json(
      { error: "nombreArchivo, mimeType, base64Data y tipo son requeridos" },
      { status: 400 }
    );
  }

  if (!TIPOS_VALIDOS.includes(tipo as TipoDocumento)) {
    return Response.json({ error: "Tipo de documento no válido" }, { status: 422 });
  }

  const tiposPermitidos = ["image/jpeg", "image/png", "application/pdf"];
  if (!tiposPermitidos.includes(mimeType)) {
    return Response.json(
      { error: "Tipo de archivo no permitido. Usa JPG, PNG o PDF." },
      { status: 422 }
    );
  }

  const prestador = await prisma.prestador.findUnique({
    where: { usuarioId: session.sub },
    select: { id: true, estadoVerificacion: true },
  });

  if (!prestador) {
    return Response.json({ error: "Prestador no encontrado" }, { status: 404 });
  }

  const documento = await prisma.documento.create({
    data: {
      prestadorId: prestador.id,
      tipo: tipo as TipoDocumento,
      nombreArchivo,
      urlArchivo: `uploads/${prestador.id}/${nombreArchivo}`,
      mimeType,
    },
  });

  return Response.json({ documento }, { status: 201 });
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "PRESTADOR") {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const prestador = await prisma.prestador.findUnique({
    where: { usuarioId: session.sub },
    select: {
      id: true,
      estadoVerificacion: true,
      documentos: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!prestador) {
    return Response.json({ error: "Prestador no encontrado" }, { status: 404 });
  }

  return Response.json({
    documentos: prestador.documentos,
    estadoVerificacion: prestador.estadoVerificacion,
  });
}