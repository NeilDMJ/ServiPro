import { requireSessionForPanel } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { VerificacionManager } from "./VerificacionManager";

export default async function VerificacionPage() {
  // Solo COMPANY_ADMIN puede entrar
  await requireSessionForPanel("administrador");

  // Carga inicial: prestadores pendientes de verificación
  const prestadores = await prisma.prestador.findMany({
    where: {
      estadoVerificacion: {
        in: [
          "PENDIENTE_VERIFICACION",
          "EN_REVISION",
          "VERIFICACION_EN_PROCESO",
          "PENDIENTE_INFORMACION",
          "ESCALADO_FALSIFICACION",
          "SUSPENDIDO_TEMPORALMENTE",
        ],
      },
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      estadoVerificacion: true,
      intentosVerificacion: true,
      createdAt: true,
      usuario: { select: { nombre: true, correo: true } },
      oficios: { select: { nombreOficio: true } },
      documentos: {
        select: {
          id: true,
          tipo: true,
          nombreArchivo: true,
          urlArchivo: true,
          mimeType: true,
          esAutentico: true,
          estaVigente: true,
          datosCoinciden: true,
          observacion: true,
        },
      },
      verificacion: {
        select: {
          id: true,
          estado: true,
          intento: true,
          fechaIniciada: true,
          fechaLimite: true,
          infAdicionalSolicitada: true,
          infAdicionalDetalle: true,
          observaciones: true,
        },
      },
    },
  });

  // Serializar fechas para pasar como prop al Client Component
  const data = prestadores.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    verificacion: p.verificacion
      ? {
          ...p.verificacion,
          fechaIniciada: p.verificacion.fechaIniciada?.toISOString() ?? null,
          fechaLimite: p.verificacion.fechaLimite?.toISOString() ?? null,
        }
      : null,
  }));

  return <VerificacionManager initialData={data} />;
}
