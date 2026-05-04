import type { NextRequest } from "next/server";

import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getString(value: unknown): string | undefined {
  return isNonEmptyString(value) ? value.trim() : undefined;
}

type RegisterTrabajadorPayload = {
  correo?: string;
  email?: string;
  nombre?: string;
  telefono?: string;
  password?: string;
  confirmPassword?: string;
  oficioPrincipal?: string;
  tarifaInicial?: string | number;
};

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const payload = (body ?? {}) as RegisterTrabajadorPayload;
  const correo = getString(payload.correo ?? payload.email)?.toLowerCase();
  const nombre = getString(payload.nombre);
  const telefono = getString(payload.telefono);
  const password = getString(payload.password);
  const confirmPassword = getString(payload.confirmPassword);
  const oficioPrincipal = getString(payload.oficioPrincipal);
  const tarifaInicial = parseFloat(String(payload.tarifaInicial || "0"));

  if (!correo) {
    return Response.json({ error: "correo es requerido" }, { status: 400 });
  }

  if (!nombre) {
    return Response.json({ error: "nombre es requerido" }, { status: 400 });
  }

  if (!telefono) {
    return Response.json({ error: "telefono es requerido" }, { status: 400 });
  }

  if (!password || password.length < 8) {
    return Response.json(
      { error: "password es requerido (mínimo 8 caracteres)" },
      { status: 400 }
    );
  }

  if (confirmPassword && password !== confirmPassword) {
    return Response.json(
      { error: "La confirmación de contraseña no coincide" },
      { status: 400 }
    );
  }

  try {
    const usuario = await prisma.usuario.create({
      data: {
        correo,
        nombre,
        telefono,
        passwordHash: hashPassword(password),
        role: "PRESTADOR",
        prestador: {
          create: {
            tipoRegistro: "INDEPENDIENTE",
            isDisponible: true,
            oficios: oficioPrincipal
              ? {
                  connectOrCreate: [
                    {
                      where: { nombreOficio: oficioPrincipal },
                      create: {
                        nombreOficio: oficioPrincipal,
                        tarifaBase: tarifaInicial,
                      },
                    },
                  ],
                }
              : undefined,
          },
        },
      },
      select: {
        id: true,
        correo: true,
        nombre: true,
        role: true,
        telefono: true,
        prestador: {
          select: {
            id: true,
            tipoRegistro: true,
            estadoVerificacion: true,
          },
        },
      },
    });

    return Response.json(
      {
        usuario,
        mensaje:
          "Registro exitoso. Por favor, carga los documentos requeridos para completar la verificación.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error(error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: unknown }).code === "P2002"
    ) {
      return Response.json(
        { error: "El correo ya está registrado" },
        { status: 409 }
      );
    }

    return Response.json({ error: "Error inesperado" }, { status: 500 });
  }
}