import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getString(value: unknown): string | undefined {
  return isNonEmptyString(value) ? value.trim() : undefined;
}

type Payload = {
  rfc?: string;
  razonSocial?: string;
  direccionFiscal?: string;
  correoAdmin?: string;
  passwordAdmin?: string;
  nombreAdmin?: string;
  telefonoAdmin?: string;
};

export async function handleRegistrarEmpresa(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const payload = (body ?? {}) as Payload;

  const rfc = getString(payload.rfc);
  const razonSocial = getString(payload.razonSocial);
  const direccionFiscal = getString(payload.direccionFiscal);
  const correoAdmin = getString(payload.correoAdmin);
  const passwordAdmin = getString(payload.passwordAdmin);
  const nombreAdmin = getString(payload.nombreAdmin);
  const telefonoAdmin = getString(payload.telefonoAdmin);

  if (!rfc) {
    return Response.json({ error: "rfc es requerido" }, { status: 400 });
  }
  if (!razonSocial) {
    return Response.json({ error: "razonSocial es requerido" }, { status: 400 });
  }
  if (!direccionFiscal) {
    return Response.json({ error: "direccionFiscal es requerido" }, { status: 400 });
  }
  if (!correoAdmin) {
    return Response.json({ error: "correoAdmin es requerido" }, { status: 400 });
  }
  if (!passwordAdmin || passwordAdmin.length < 8) {
    return Response.json(
      { error: "passwordAdmin es requerido (mínimo 8 caracteres)" },
      { status: 400 }
    );
  }
  if (!nombreAdmin) {
    return Response.json({ error: "nombreAdmin es requerido" }, { status: 400 });
  }

  try {
    const passwordHash = bcrypt.hashSync(passwordAdmin, 10);

    const empresa = await prisma.$transaction(
      async (tx: TransactionClient) => {
        const admin = await tx.usuario.create({
          data: {
            correo: correoAdmin.toLowerCase(),
            passwordHash,
            role: "COMPANY_ADMIN",
            nombre: nombreAdmin,
            telefono: telefonoAdmin,
          },
        });

        return await tx.empresa.create({
          data: {
            rfc: rfc.toUpperCase(),
            razonSocial,
            direccionFiscal,
            adminUsuarioId: admin.id,
          },
          select: {
            id: true,
            rfc: true,
            razonSocial: true,
            adminUsuario: {
              select: { id: true, correo: true, role: true },
            },
          },
        });
      }
    );

    return Response.json({ empresa }, { status: 201 });
  } catch (err: unknown) {
    console.error(err);

    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: unknown }).code === "P2002"
    ) {
      return Response.json(
        { error: "El RFC o correo ya está registrado" },
        { status: 409 }
      );
    }

    return Response.json({ error: "Error inesperado" }, { status: 500 });
  }
}