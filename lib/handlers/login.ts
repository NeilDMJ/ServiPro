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
};

export async function handleLogin(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const payload = (body ?? {}) as Payload;

  const correo = getString(payload.correo);
  const password = getString(payload.password);

  if (!correo) {
    return Response.json({ error: "correo es requerido" }, { status: 400 });
  }
  if (!password) {
    return Response.json({ error: "password es requerido" }, { status: 400 });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { correo: correo.toLowerCase() },
    select: {
      id: true,
      correo: true,
      passwordHash: true,
      nombre: true,
      role: true,
      cliente:   { select: { id: true } },
      prestador: { select: { id: true, tipoRegistro: true, empresaId: true } },
    },
  });

  // Mismo mensaje para usuario no encontrado y contraseña incorrecta
  // para no revelar qué correos existen en el sistema
  if (!usuario) {
    return Response.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  const passwordValido = bcrypt.compareSync(password, usuario.passwordHash);
  if (!passwordValido) {
    return Response.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  // No devolver el hash en la respuesta
  const { passwordHash: _, ...usuarioSinHash } = usuario;

  return Response.json({ usuario: usuarioSinHash }, { status: 200 });
}