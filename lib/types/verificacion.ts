export type EstadoVerificacion =
  | "PENDIENTE_VERIFICACION"
  | "EN_REVISION"
  | "VERIFICACION_EN_PROCESO"
  | "PENDIENTE_INFORMACION"
  | "ESCALADO_FALSIFICACION"
  | "SUSPENDIDO_TEMPORALMENTE"
  | "VERIFICADO"
  | "RECHAZADO";

export type TipoDocumento =
  | "IDENTIFICACION_OFICIAL"
  | "CERTIFICADO_TECNICO"
  | "CONSTANCIA"
  | "OTRO";

export type MotivoRechazo =
  | "CERTIFICACIONES_VENCIDAS"
  | "DOCUMENTACION_INCOMPLETA"
  | "DATOS_NO_COINCIDEN"
  | "FALSIFICACION_DETECTADA"
  | "INSTITUCION_NO_RECONOCIDA"
  | "OTRO";

export type IniciarRevisionPayload = {
  prestadorId: string;
  verificadorId: string;
};

export type RegistrarDecisionPayload = {
  verificadorId: string;
  aprobado: boolean;
  motivoRechazo?: MotivoRechazo;      // requerido si aprobado=false
  detalleRechazo?: string;            // requerido si aprobado=false (*)
  observaciones?: string;
  documentosEvaluados?: DocumentoEvaluado[];
};

/** Evaluación individual de un documento */
export type DocumentoEvaluado = {
  documentoId: string;
  esAutentico: boolean;
  estaVigente: boolean;
  datosCoinciden: boolean;
  observacion?: string;
};

export type SolicitarInfoPayload = {
  verificadorId: string;
  detalle: string;          // qué información se necesita
};

export type EscalarCasoPayload = {
  verificadorId: string;
  adminId: string;
  motivoEscalamiento: string;
};

// ---- Respuestas ----

export type VerificacionResumen = {
  id: string;
  prestadorId: string;
  estado: EstadoVerificacion;
  intento: number;
  verificadorId: string | null;
  fechaIniciada: string | null;
  fechaLimite: string | null;
  fechaDecision: string | null;
  aprobado: boolean | null;
  motivoRechazo: MotivoRechazo | null;
  detalleRechazo: string | null;
};

export type ApiError = {
  error: string;
  code?: string;
};
