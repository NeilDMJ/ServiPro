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

// [UC-01] Endpoint de autenticacion: login con JWT para rutas protegidas.

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getString(value: unknown): string | undefined {
  return isNonEmptyString(value) ? value.trim() : undefined;
}

type Payload = {
  correo?: string;
  email?: string;
  password?: string;
  tipoUsuario?: string;
};

export async function handleLogin(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const payload = (body ?? {}) as Payload;

  const correo = getString(payload.correo ?? payload.email)?.toLowerCase();
  const password = getString(payload.password);
  const role = getRoleFromUserType(payload.tipoUsuario);

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
      passwordHash: true,
      nombre: true,
      role: true,
    },
  });

  // Mismo mensaje para usuario no encontrado y contraseña incorrecta
  // para no revelar qué correos existen en el sistema
  if (!usuario) {
    return Response.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  const passwordValido = verifyPassword(password, usuario.passwordHash);
  if (!passwordValido) {
    return Response.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  if (role && usuario.role !== role) {
    return Response.json(
      { error: "La cuenta no corresponde al tipo de usuario seleccionado" },
      { status: 403 }
    );
  }

  const sessionToken = createSessionToken({
    sub: usuario.id,
    role: usuario.role,
    nombre: usuario.nombre,
    correo: usuario.correo,
  });

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, sessionToken, getSessionCookieOptions());

  // No devolver el hash en la respuesta
  const { passwordHash: _, ...usuarioSinHash } = usuario;

  return Response.json(
    {
      token: sessionToken,
      usuario: {
        ...usuarioSinHash,
        tipoUsuario: getUserTypeFromRole(usuario.role),
      },
    },
    { status: 200 }
  );
}