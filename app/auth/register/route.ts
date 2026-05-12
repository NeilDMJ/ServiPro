import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

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
  const nombre = getString(body.nombre);
  const password = getString(body.password ?? body.contraseña);
  const rolInput = getString(body.rol);
  const telefono = getString(body.telefono);

  if (!correo || !nombre || !password || !rolInput) {
    return Response.json({ error: "Campos obligatorios faltantes (correo, nombre, contraseña, rol)" }, { status: 400 });
  }

  const rol = rolInput.toUpperCase();

  try {
    const existing = await prisma.usuario.findUnique({ where: { correo } });
    if (existing) {
      return Response.json({ error: "El correo ya está registrado" }, { status: 409 });
    }

    let newUser;

    if (rol === "CLIENTE") {
      const direccion = getString(body.direccion);
      if (!direccion) return Response.json({ error: "Dirección requerida para cliente" }, { status: 400 });

      newUser = await prisma.usuario.create({
        data: {
          correo,
          nombre,
          telefono: telefono || "",
          passwordHash: hashPassword(password),
          role: "CLIENTE",
          cliente: {
            create: {
              direccionDefault: direccion,
            },
          },
        },
        include: { cliente: true },
      });
    } else if (rol === "PRESTADOR" || rol === "TRABAJADOR" || rol === "FREELANCER") {
      newUser = await prisma.usuario.create({
        data: {
          correo,
          nombre,
          telefono: telefono || "",
          passwordHash: hashPassword(password),
          role: "PRESTADOR",
          prestador: {
            create: {
              tipoRegistro: "INDEPENDIENTE",
              estadoVerificacion: "PENDIENTE_DE_VERIFICACION",
            },
          },
        },
        include: { prestador: true },
      });
    } else if (rol === "EMPRESA") {
      const rfc = getString(body.rfc);
      const razonSocial = getString(body.razonSocial ?? body.nombre);
      const responsable = getString(body.responsable);

      if (!rfc || !razonSocial) {
        return Response.json({ error: "RFC y Razón Social son requeridos para empresa" }, { status: 400 });
      }

      newUser = await prisma.usuario.create({
        data: {
          correo,
          nombre: responsable || razonSocial,
          telefono: telefono || "",
          passwordHash: hashPassword(password),
          role: "COMPANY_ADMIN",
          empresaAdministrada: {
            create: {
              rfc,
              razonSocial,
              direccionFiscal: getString(body.direccion) || "No especificada",
            },
          },
        },
        include: { empresaAdministrada: true },
      });
    } else {
      return Response.json({ error: "Rol no válido" }, { status: 400 });
    }

    const { passwordHash, ...usuarioSinPassword } = newUser as any;
    return Response.json({ usuario: usuarioSinPassword }, { status: 201 });

  } catch (error) {
    console.error(error);
    return Response.json({ error: "Error al registrar usuario" }, { status: 500 });
  }
}
