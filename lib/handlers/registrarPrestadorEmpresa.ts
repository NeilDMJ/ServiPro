import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getString(value: unknown): string | undefined {
  return isNonEmptyString(value) ? value.trim() : undefined;
}

type PayloadCompat = {
  // nombres recomendados (ServiPro)
  empresaId?: string;
  correo?: string;
  password?: string;
  nombre?: string;
  telefono?: string;
  oficios?: string[];

  // compat con versión anterior
  companyId?: string;
  email?: string;
  displayName?: string;
  phone?: string;
  trades?: string[];
};

export async function handleRegistrarPrestadorEmpresa(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const payload = (body ?? {}) as PayloadCompat;

  const empresaId = getString(payload.empresaId ?? payload.companyId);
  const correo = getString(payload.correo ?? payload.email);
  const password = getString(payload.password);
  const nombre = getString(payload.nombre ?? payload.displayName);
  const telefono = getString(payload.telefono ?? payload.phone);
  const oficios = Array.isArray(payload.oficios)
    ? payload.oficios
    : Array.isArray(payload.trades)
      ? payload.trades
      : undefined;

  if (!empresaId) {
    return Response.json({ error: "empresaId es requerido" }, { status: 400 });
  }
  if (!correo) {
    return Response.json({ error: "correo es requerido" }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return Response.json(
      { error: "password es requerido (mínimo 8 caracteres)" },
      { status: 400 }
    );
  }
  if (!nombre) {
    return Response.json({ error: "nombre es requerido" }, { status: 400 });
  }

  const empresa = await prisma.empresa.findUnique({
    where: { id: empresaId },
    select: { id: true },
  });

  if (!empresa) {
    return Response.json({ error: "Empresa no encontrada" }, { status: 404 });
  }

  const correoNormalizado = correo.toLowerCase();

  const oficioConnectOrCreate = Array.isArray(oficios)
    ? oficios
        .map((o) => getString(o))
        .filter((o): o is string => Boolean(o))
        .map((nombreOficio) => {
          const nombreLimpio = nombreOficio.trim();
          return {
            where: { nombreOficio: nombreLimpio },
            create: { nombreOficio: nombreLimpio, tarifaBase: 0 },
          };
        })
    : undefined;

  try {
    const passwordHash = hashPassword(password);

    const usuario = await prisma.usuario.create({
      data: {
        correo: correoNormalizado,
        passwordHash,
        role: "PRESTADOR",
        nombre,
        telefono,
        prestador: {
          create: {
            tipoRegistro: "EMPRESA",
            empresa: { connect: { id: empresaId } },
            calificacionPromedio: 0,
            isDisponible: true,
            estadoVerificacion: "VERIFICADO", // Auto-verificado por ser de empresa
            fechaVerificacion: new Date(),
            oficios: oficioConnectOrCreate
              ? { connectOrCreate: oficioConnectOrCreate }
              : undefined,
          },
        },
      },
      select: {
        id: true,
        correo: true,
        role: true,
        prestador: { 
          select: { 
            id: true, 
            empresaId: true, 
            tipoRegistro: true,
            estadoVerificacion: true,
          } 
        },
      },
    });

    return Response.json(
      { 
        usuario,
        mensaje: "Registro exitoso. La cuenta está lista para usar."
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error(err);

    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: unknown }).code === "P2002"
    ) {
      return Response.json(
        { error: "El correo ya está registrado" },
        { status: 409 }
      );
    }

    return Response.json({ error: "Error inesperado" }, { status: 500 });
  }
}
