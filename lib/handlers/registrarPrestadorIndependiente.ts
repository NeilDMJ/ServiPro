import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getString(value: unknown): string | undefined {
  return isNonEmptyString(value) ? value.trim() : undefined;
}

type Payload = {
  correo?: string;
  password?: string;
  nombre?: string;
  telefono?: string;
  oficios?: string[];
};

export async function handleRegistrarPrestadorIndependiente(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const payload = (body ?? {}) as Payload;

  const correo = getString(payload.correo);
  const password = getString(payload.password);
  const nombre = getString(payload.nombre);
  const telefono = getString(payload.telefono);
  const oficios = Array.isArray(payload.oficios) ? payload.oficios : undefined;

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

  const oficioConnectOrCreate = Array.isArray(oficios)
    ? oficios
        .map((o) => getString(o))
        .filter((o): o is string => Boolean(o))
        .map((nombreOficio) => ({
          where: { nombreOficio: nombreOficio.trim() },
          create: { nombreOficio: nombreOficio.trim(), tarifaBase: 0 },
        }))
    : undefined;

  try {
    const passwordHash = bcrypt.hashSync(password, 10);

    const usuario = await prisma.usuario.create({
      data: {
        correo: correo.toLowerCase(),
        passwordHash,
        role: "PRESTADOR",
        nombre,
        telefono,
        prestador: {
          create: {
            tipoRegistro: "INDEPENDIENTE",
            calificacionPromedio: 0,
            isDisponible: true,
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
          select: { id: true, tipoRegistro: true, oficios: { select: { nombreOficio: true } } },
        },
      },
    });

    return Response.json({ usuario }, { status: 201 });
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