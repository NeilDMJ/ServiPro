import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type {
  IniciarRevisionPayload,
  RegistrarDecisionPayload,
  SolicitarInfoPayload,
  EscalarCasoPayload,
} from "@/lib/types/verificacion";

function getString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : undefined;
}

/** Calcula la fecha límite de 48 horas hábiles (L–V, 08:00–20:00 MX) */
function calcularFechaLimite(desde: Date): Date {
  const HORAS_HABILES = 48;
  let horasPendientes = HORAS_HABILES;
  const fecha = new Date(desde);

  while (horasPendientes > 0) {
    fecha.setHours(fecha.getHours() + 1);
    const diaSemana = fecha.getDay(); // 0=Dom, 6=Sáb
    const hora = fecha.getHours();
    if (diaSemana >= 1 && diaSemana <= 5 && hora >= 8 && hora < 20) {
      horasPendientes--;
    }
  }
  return fecha;
}

type TxClient = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/** Registra una entrada en el log de auditoría.*/
async function registrarLog(
  tx: TxClient,
  verificacionId: string,
  accion: string,
  realizadoPor: string,
  rol: string,
  detalle?: string
) {
  await tx.logAuditoria.create({
    data: {
      accion,
      realizadoPor,
      rol,
      detalle,
      verificacion: { connect: { id: verificacionId } },
    },
  });
}

// Lista prestadores pendientes de verificación (paso 3)

export async function handleListarPendientes(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page  = Math.max(1, Number(searchParams.get("page")  ?? 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const skip  = (page - 1) * limit;

  const [total, prestadores] = await Promise.all([
    prisma.prestador.count({
      where: { estadoVerificacion: "PENDIENTE_VERIFICACION" },
    }),
    prisma.prestador.findMany({
      where: { estadoVerificacion: "PENDIENTE_VERIFICACION" },
      skip,
      take: limit,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        createdAt: true,
        estadoVerificacion: true,
        usuario:   { select: { nombre: true, correo: true } },
        oficios:   { select: { nombreOficio: true } },
        documentos: {
          select: { id: true, tipo: true, nombreArchivo: true, createdAt: true },
        },
      },
    }),
  ]);

  return Response.json({ total, page, limit, prestadores });
}

// Detalle de documentos de un prestador (pasos 4-5)

export async function handleObtenerDetalle(prestadorId: string) {
  const prestador = await prisma.prestador.findUnique({
    where: { id: prestadorId },
    select: {
      id: true,
      estadoVerificacion: true,
      intentosVerificacion: true,
      usuario:   { select: { nombre: true, correo: true, telefono: true } },
      oficios:   { select: { nombreOficio: true } },
      documentos: true,
      verificacion: {
        select: {
          id: true,
          estado: true,
          intento: true,
          verificadorId: true,
          observaciones: true,
          fechaIniciada: true,
          fechaLimite: true,
          infAdicionalSolicitada: true,
          infAdicionalDetalle: true,
          logAuditoria: { orderBy: { timestamp: "asc" } },
        },
      },
    },
  });

  if (!prestador) {
    return Response.json({ error: "Prestador no encontrado" }, { status: 404 });
  }

  return Response.json({ prestador });
}

// Iniciar revisión (pasos 2-5)

export async function handleIniciarRevision(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const payload      = (body ?? {}) as IniciarRevisionPayload;
  const prestadorId  = getString(payload.prestadorId);
  const verificadorId = getString(payload.verificadorId);

  if (!prestadorId)   return Response.json({ error: "prestadorId requerido" },   { status: 400 });
  if (!verificadorId) return Response.json({ error: "verificadorId requerido" }, { status: 400 });

  const prestador = await prisma.prestador.findUnique({
    where: { id: prestadorId },
    select: {
      id: true,
      estadoVerificacion: true,
      intentosVerificacion: true,
      documentos: { select: { id: true, tipo: true, estaVigente: true } },
    },
  });

  if (!prestador) {
    return Response.json({ error: "Prestador no encontrado" }, { status: 404 });
  }

  // Solo se puede iniciar si está en PENDIENTE_VERIFICACION
  if (prestador.estadoVerificacion !== "PENDIENTE_VERIFICACION") {
    return Response.json(
      { error: `El prestador ya está en estado: ${prestador.estadoVerificacion}` },
      { status: 409 }
    );
  }

  // Regla de negocio: máximo 2 intentos
  if (prestador.intentosVerificacion >= 2) {
    return Response.json(
      { error: "El prestador ya agotó sus 2 intentos de verificación" },
      { status: 422 }
    );
  }

  // S3 / E2: Detección automática de certificaciones vencidas
  const certVencida = prestador.documentos.some(
    (d) => d.tipo === "CERTIFICADO_TECNICO" && d.estaVigente === false
  );

  if (certVencida) {
    const verificacion = await prisma.$transaction(async (tx) => {
      const ahora = new Date();

      const v = await tx.verificacionCredenciales.upsert({
        where: { prestadorId },
        update: {
          estado:          "RECHAZADO",
          verificadorId,
          aprobado:        false,
          motivoRechazo:   "CERTIFICACIONES_VENCIDAS",
          detalleRechazo:  "Certificaciones vencidas detectadas automáticamente (S3/E2)",
          fechaIniciada:   ahora,
          fechaDecision:   ahora,
          intento:         prestador.intentosVerificacion + 1,
        },
        create: {
          prestador:       { connect: { id: prestadorId } },
          estado:          "RECHAZADO",
          verificadorId,
          aprobado:        false,
          motivoRechazo:   "CERTIFICACIONES_VENCIDAS",
          detalleRechazo:  "Certificaciones vencidas detectadas automáticamente (S3/E2)",
          fechaIniciada:   ahora,
          fechaDecision:   ahora,
          intento:         prestador.intentosVerificacion + 1,
        },
      });

      await tx.prestador.update({
        where: { id: prestadorId },
        data: {
          estadoVerificacion:   "RECHAZADO",
          intentosVerificacion: { increment: 1 },
        },
      });

      await registrarLog(
        tx, v.id,
        "RECHAZADO_CERT_VENCIDAS", "SISTEMA", "SISTEMA",
        "Rechazo automático por certificaciones vencidas"
      );

      return v;
    });

    // SistemaNotificaciones.notificarRenovacion(prestadorId)
    return Response.json({ verificacion, autoRechazado: true }, { status: 200 });
  }

  // iniciar revisión
  const ahora      = new Date();
  const fechaLimite = calcularFechaLimite(ahora);

  const verificacion = await prisma.$transaction(async (tx) => {
    const v = await tx.verificacionCredenciales.upsert({
      where: { prestadorId },
      update: {
        estado:         "EN_REVISION",
        verificadorId,
        fechaIniciada:  ahora,
        fechaLimite,
        intento:        prestador.intentosVerificacion + 1,
        aprobado:       null,
        motivoRechazo:  null,
        detalleRechazo: null,
      },
      create: {
        prestador:     { connect: { id: prestadorId } },
        estado:        "EN_REVISION",
        verificadorId,
        fechaIniciada: ahora,
        fechaLimite,
        intento:       prestador.intentosVerificacion + 1,
      },
    });

    await tx.prestador.update({
      where: { id: prestadorId },
      data:  { estadoVerificacion: "EN_REVISION" },
    });

    await registrarLog(
      tx, v.id,
      "REVISION_INICIADA", verificadorId, "VERIFICADOR",
      `Revisión iniciada. Fecha límite: ${fechaLimite.toISOString()}`
    );

    return v;
  });

  return Response.json({ verificacion }, { status: 200 });
}

// Registrar decisión: Aprobar o Rechazar (pasos 8-16)

export async function handleRegistrarDecision(
  verificacionId: string,
  request: NextRequest
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const payload = (body ?? {}) as RegistrarDecisionPayload;

  const verificadorId = getString(payload.verificadorId);
  if (!verificadorId) {
    return Response.json({ error: "verificadorId requerido" }, { status: 400 });
  }
  if (typeof payload.aprobado !== "boolean") {
    return Response.json({ error: "aprobado (boolean) es requerido" }, { status: 400 });
  }

  // Si rechaza, motivoRechazo y detalleRechazo son obligatorios (*)
  if (!payload.aprobado) {
    if (!payload.motivoRechazo) {
      return Response.json({ error: "motivoRechazo es requerido al rechazar" }, { status: 400 });
    }
    if (!getString(payload.detalleRechazo)) {
      return Response.json({ error: "detalleRechazo es requerido al rechazar (*)" }, { status: 400 });
    }
  }

  const verificacion = await prisma.verificacionCredenciales.findUnique({
    where:  { id: verificacionId },
    select: { id: true, prestadorId: true, estado: true },
  });

  if (!verificacion) {
    return Response.json({ error: "Verificación no encontrada" }, { status: 404 });
  }

  const estadosPermitidos = [
    "EN_REVISION",
    "VERIFICACION_EN_PROCESO",
    "PENDIENTE_INFORMACION",
  ];

  if (!estadosPermitidos.includes(verificacion.estado)) {
    return Response.json(
      { error: `No se puede decidir en estado: ${verificacion.estado}` },
      { status: 409 }
    );
  }

  const nuevoEstado = payload.aprobado ? "VERIFICADO" : "RECHAZADO";
  const ahora       = new Date();

  const resultado = await prisma.$transaction(async (tx) => {
    // Actualizar evaluación de documentos si se enviaron
    if (Array.isArray(payload.documentosEvaluados)) {
      for (const doc of payload.documentosEvaluados) {
        await tx.documento.update({
          where: { id: doc.documentoId },
          data: {
            esAutentico:    doc.esAutentico,
            estaVigente:    doc.estaVigente,
            datosCoinciden: doc.datosCoinciden,
            observacion:    doc.observacion,
          },
        });
      }
    }

    const v = await tx.verificacionCredenciales.update({
      where: { id: verificacionId },
      data: {
        estado:         nuevoEstado,
        aprobado:       payload.aprobado,
        motivoRechazo:  payload.motivoRechazo  ?? null,
        detalleRechazo: getString(payload.detalleRechazo) ?? null,
        observaciones:  getString(payload.observaciones)  ?? null,
        fechaDecision:  ahora,
      },
    });

    await tx.prestador.update({
      where: { id: verificacion.prestadorId },
      data: {
        estadoVerificacion:   nuevoEstado,
        intentosVerificacion: { increment: 1 },
      },
    });

    await registrarLog(
      tx, verificacionId,
      payload.aprobado ? "APROBADO" : "RECHAZADO",
      verificadorId, "VERIFICADOR",
      payload.aprobado
        ? "Credenciales verificadas y aprobadas"
        : `Rechazo: ${payload.motivoRechazo} — ${payload.detalleRechazo}`
    );

    return v;
  });

  // SistemaNotificaciones.enviarEmailResultado(verificacion.prestadorId, resultado)

  return Response.json({ verificacion: resultado });
}

// Documentación incompleta

export async function handleSolicitarInfo(
  verificacionId: string,
  request: NextRequest
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const payload       = (body ?? {}) as SolicitarInfoPayload;
  const verificadorId = getString(payload.verificadorId);
  const detalle       = getString(payload.detalle);

  if (!verificadorId) return Response.json({ error: "verificadorId requerido" }, { status: 400 });
  if (!detalle)       return Response.json({ error: "detalle requerido" },       { status: 400 });

  const verificacion = await prisma.verificacionCredenciales.findUnique({
    where:  { id: verificacionId },
    select: { id: true, prestadorId: true, estado: true },
  });

  if (!verificacion) {
    return Response.json({ error: "Verificación no encontrada" }, { status: 404 });
  }

  const resultado = await prisma.$transaction(async (tx) => {
    const v = await tx.verificacionCredenciales.update({
      where: { id: verificacionId },
      data: {
        estado:                 "PENDIENTE_INFORMACION",
        infAdicionalSolicitada: true,
        infAdicionalDetalle:    detalle,
      },
    });

    await tx.prestador.update({
      where: { id: verificacion.prestadorId },
      data:  { estadoVerificacion: "PENDIENTE_INFORMACION" },
    });

    await registrarLog(
      tx, verificacionId,
      "INFO_ADICIONAL_SOLICITADA", verificadorId, "VERIFICADOR",
      detalle
    );

    return v;
  });

  // SistemaNotificaciones.notificarPrestador(verificacion.prestadorId, "Documentación incompleta")

  return Response.json({ verificacion: resultado });
}

// Posible falsificación

export async function handleEscalarCaso(
  verificacionId: string,
  request: NextRequest
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const payload            = (body ?? {}) as EscalarCasoPayload;
  const verificadorId      = getString(payload.verificadorId);
  const adminId            = getString(payload.adminId);
  const motivoEscalamiento = getString(payload.motivoEscalamiento);

  if (!verificadorId)      return Response.json({ error: "verificadorId requerido" },      { status: 400 });
  if (!adminId)            return Response.json({ error: "adminId requerido" },            { status: 400 });
  if (!motivoEscalamiento) return Response.json({ error: "motivoEscalamiento requerido" }, { status: 400 });

  const verificacion = await prisma.verificacionCredenciales.findUnique({
    where:  { id: verificacionId },
    select: { id: true, prestadorId: true, estado: true },
  });

  if (!verificacion) {
    return Response.json({ error: "Verificación no encontrada" }, { status: 404 });
  }

  const ahora = new Date();

  const resultado = await prisma.$transaction(async (tx) => {
    const v = await tx.verificacionCredenciales.update({
      where: { id: verificacionId },
      data: {
        estado:              "ESCALADO_FALSIFICACION",
        escaladoAdminId:     adminId,
        fechaEscalamiento:   ahora,
        motivoEscalamiento,
      },
    });

    // S2: Suspender perfil temporalmente
    await tx.prestador.update({
      where: { id: verificacion.prestadorId },
      data:  { estadoVerificacion: "SUSPENDIDO_TEMPORALMENTE" },
    });

    await registrarLog(
      tx, verificacionId,
      "ESCALADO_FALSIFICACION", verificadorId, "VERIFICADOR",
      `Escalado al admin ${adminId}: ${motivoEscalamiento}`
    );

    await registrarLog(
      tx, verificacionId,
      "PERFIL_SUSPENDIDO", "SISTEMA", "SISTEMA",
      "Perfil suspendido temporalmente por posible falsificación"
    );

    return v;
  });

  // SistemaNotificaciones.alertarAdministrador(adminId, verificacionId)

  return Response.json({ verificacion: resultado });
}

// resolver-escalamiento — Admin confirma o descarta fraude

export async function handleResolverEscalamiento(
  verificacionId: string,
  request: NextRequest
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { adminId, esFraude, detalle } = (body ?? {}) as {
    adminId?:  string;
    esFraude?: boolean;
    detalle?:  string;
  };

  if (!getString(adminId))          return Response.json({ error: "adminId requerido" },             { status: 400 });
  if (typeof esFraude !== "boolean") return Response.json({ error: "esFraude (boolean) requerido" }, { status: 400 });

  const verificacion = await prisma.verificacionCredenciales.findUnique({
    where:  { id: verificacionId },
    select: { id: true, prestadorId: true, estado: true },
  });

  if (!verificacion) {
    return Response.json({ error: "Verificación no encontrada" }, { status: 404 });
  }

  if (verificacion.estado !== "ESCALADO_FALSIFICACION") {
    return Response.json(
      { error: "Solo se puede resolver un caso en estado ESCALADO_FALSIFICACION" },
      { status: 409 }
    );
  }

  const nuevoEstado          = esFraude ? "RECHAZADO"             : "EN_REVISION";
  const nuevoEstadoPrestador = esFraude ? "RECHAZADO"             : "PENDIENTE_VERIFICACION";

  const resultado = await prisma.$transaction(async (tx) => {
    const v = await tx.verificacionCredenciales.update({
      where: { id: verificacionId },
      data: {
        estado:         nuevoEstado,
        aprobado:       esFraude ? false : null,
        motivoRechazo:  esFraude ? "FALSIFICACION_DETECTADA" : null,
        detalleRechazo: esFraude
          ? (getString(detalle) ?? "Fraude confirmado por administrador")
          : null,
        fechaDecision:  esFraude ? new Date() : null,
      },
    });

    await tx.prestador.update({
      where: { id: verificacion.prestadorId },
      data: {
        estadoVerificacion: nuevoEstadoPrestador,
        // Regla de negocio: fraude = bloqueo permanente
        ...(esFraude ? { isDisponible: false } : {}),
      },
    });

    await registrarLog(
      tx, verificacionId,
      esFraude ? "FRAUDE_CONFIRMADO" : "ESCALAMIENTO_DESCARTADO",
      adminId!, "ADMINISTRADOR",
      getString(detalle) ?? (
        esFraude
          ? "Fraude confirmado, perfil bloqueado permanentemente"
          : "Sin evidencia de fraude, retornado a revisión"
      )
    );

    return v;
  });

  // SistemaNotificaciones.notificarResultadoEscalamiento(verificacion.prestadorId, esFraude)

  return Response.json({ verificacion: resultado });
}