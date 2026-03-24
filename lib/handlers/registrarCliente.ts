import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getString(value: unknown): string | undefined {
  return isNonEmptyString(value) ? value.trim() : undefined;
}

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

type Payload = {
  correo?: string;
  password?: string;
  nombre?: string;
  telefono?: string;
  direccionDefault?: string;
};

export async function handleRegistrarCliente(request: NextRequest) {
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
  const direccionDefault = getString(payload.direccionDefault);

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

  try {
    const passwordHash = hashPassword(password);

    const usuario = await prisma.usuario.create({
      data: {
        correo: correo.toLowerCase(),
        passwordHash,
        role: "CLIENTE",
        nombre,
        telefono,
        cliente: {
          create: {
            direccionDefault,
          },
        },
      },
      select: {
        id: true,
        correo: true,
        role: true,
        cliente: { select: { id: true, direccionDefault: true } },
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