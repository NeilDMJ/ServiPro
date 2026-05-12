import type { NextRequest } from "next/server";

import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// [UC-01] Endpoint de registro unificado para Cliente y Trabajador.
function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getString(value: unknown): string | undefined {
  return isNonEmptyString(value) ? value.trim() : undefined;
}

type RegisterPayload = {
  tipoUsuario?: string;
  correo?: string;
  email?: string;
  nombre?: string;
  telefono?: string;
  password?: string;
  confirmPassword?: string;

  // Cliente
  direccion?: string;
  direccionDefault?: string;

  // Trabajador
  oficioPrincipal?: string;
  tarifaInicial?: string | number;
};

function normalizeUserType(value: unknown): "cliente" | "trabajador" | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === "cliente" || normalized === "trabajador") {
    return normalized;
  }
  return undefined;
}

export async function handleAuthRegister(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON invalido" }, { status: 400 });
  }

  const payload = (body ?? {}) as RegisterPayload;
  const tipoUsuario = normalizeUserType(payload.tipoUsuario);
  const correo = getString(payload.correo ?? payload.email)?.toLowerCase();
  const nombre = getString(payload.nombre);
  const telefono = getString(payload.telefono);
  const password = getString(payload.password);
  const confirmPassword = getString(payload.confirmPassword);

  if (!tipoUsuario) {
    return Response.json(
      { error: "tipoUsuario es requerido (cliente o trabajador)" },
      { status: 400 }
    );
  }

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
      { error: "password es requerido (minimo 8 caracteres)" },
      { status: 400 }
    );
  }

  if (confirmPassword && password !== confirmPassword) {
    return Response.json(
      { error: "La confirmacion de contrasena no coincide" },
      { status: 400 }
    );
  }

  try {
    if (tipoUsuario === "cliente") {
      const direccion = getString(payload.direccion ?? payload.direccionDefault);
      if (!direccion) {
        return Response.json({ error: "direccion es requerida" }, { status: 400 });
      }

      const usuario = await prisma.usuario.create({
        data: {
          correo,
          nombre,
          telefono,
          passwordHash: hashPassword(password),
          role: "CLIENTE",
          cliente: {
            create: {
              direccionDefault: direccion,
            },
          },
        },
        select: {
          id: true,
          correo: true,
          nombre: true,
          role: true,
          telefono: true,
          cliente: {
            select: {
              id: true,
              direccionDefault: true,
            },
          },
        },
      });

      return Response.json({ usuario }, { status: 201 });
    }

    const oficioPrincipal = getString(payload.oficioPrincipal);
    const tarifaInicial = parseFloat(String(payload.tarifaInicial || "0"));

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
          },
        },
      },
    });

    return Response.json({ usuario }, { status: 201 });
  } catch (error: unknown) {
    console.error(error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: unknown }).code === "P2002"
    ) {
      return Response.json(
        { error: "El correo ya esta registrado" },
        { status: 409 }
      );
    }

    return Response.json({ error: "Error inesperado" }, { status: 500 });
  }
}
