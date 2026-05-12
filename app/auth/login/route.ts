import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  createSessionToken,
  getRoleFromUserType,
  getSessionCookieOptions,
  getUserTypeFromRole,
  sessionCookieName,
  verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getString(value: unknown): string | undefined {
  return isNonEmptyString(value) ? value.trim() : undefined;
}

export async function POST(request: NextRequest) {
  let body: any;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const correo = getString(body.correo ?? body.email)?.toLowerCase();
  const password = getString(body.password ?? body.contraseña);
  const role = getRoleFromUserType(body.tipoUsuario);

  if (!correo) {
    return Response.json({ error: "correo es requerido" }, { status: 400 });
  }

  if (!password) {
    return Response.json({ error: "password es requerido" }, { status: 400 });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { correo },
    select: {
      id: true,
      correo: true,
      nombre: true,
      role: true,
      passwordHash: true,
      prestador: {
        select: {
          estadoVerificacion: true,
        },
      },
    },
  });

  if (!usuario || !verifyPassword(password, usuario.passwordHash)) {
    return Response.json(
      { error: "Credenciales inválidas" },
      { status: 401 }
    );
  }

  if (role && usuario.role !== role) {
    return Response.json(
      { error: "La cuenta no corresponde al tipo de usuario seleccionado" },
      { status: 403 }
    );
  }

  if (usuario.role === "PRESTADOR") {
    if (!usuario.prestador?.estadoVerificacion) {
      return Response.json(
        { error: "El perfil del prestador no encontrado" },
        { status: 500 }
      );
    }

    if (usuario.prestador.estadoVerificacion === "PENDIENTE_DE_VERIFICACION") {
      return Response.json(
        {
          error: "Tu perfil está pendiente de verificación. Por favor, completa la carga de documentos requeridos.",
          estadoVerificacion: "PENDIENTE_DE_VERIFICACION",
        },
        { status: 403 }
      );
    }

    if (usuario.prestador.estadoVerificacion === "RECHAZADO") {
      return Response.json(
        {
          error: "Tu perfil ha sido rechazado. Contacta con soporte para más información.",
          estadoVerificacion: "RECHAZADO",
        },
        { status: 403 }
      );
    }
  }

  const cookieStore = await cookies();
  cookieStore.set(
    sessionCookieName,
    createSessionToken({
      sub: usuario.id,
      role: usuario.role,
      nombre: usuario.nombre,
      correo: usuario.correo,
    }),
    getSessionCookieOptions()
  );

  return Response.json(
    {
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        nombre: usuario.nombre,
        role: usuario.role,
        tipoUsuario: getUserTypeFromRole(usuario.role),
      },
    },
    { status: 200 }
  );
}
