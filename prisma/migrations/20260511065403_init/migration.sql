-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENTE', 'PRESTADOR', 'COMPANY_ADMIN');

-- CreateEnum
CREATE TYPE "TipoRegistroPrestador" AS ENUM ('INDEPENDIENTE', 'EMPRESA');

-- CreateEnum
CREATE TYPE "EstadoOrden" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'FINALIZADA');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('TARJETA', 'EFECTIVO', 'TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "EstadoCategoria" AS ENUM ('ACTIVA', 'INACTIVA');

-- CreateEnum
CREATE TYPE "EstadoVerificacion" AS ENUM ('PENDIENTE_VERIFICACION', 'EN_REVISION', 'VERIFICACION_EN_PROCESO', 'PENDIENTE_INFORMACION', 'ESCALADO_FALSIFICACION', 'SUSPENDIDO_TEMPORALMENTE', 'VERIFICADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('IDENTIFICACION_OFICIAL', 'CERTIFICADO_TECNICO', 'CONSTANCIA', 'OTRO');

-- CreateEnum
CREATE TYPE "MotivoRechazo" AS ENUM ('CERTIFICACIONES_VENCIDAS', 'DOCUMENTACION_INCOMPLETA', 'DATOS_NO_COINCIDEN', 'FALSIFICACION_DETECTADA', 'INSTITUCION_NO_RECONOCIDA', 'OTRO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "telefono" TEXT,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "direccionDefault" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "rfc" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "direccionFiscal" TEXT NOT NULL,
    "ramo" TEXT,
    "ubicacion" TEXT,
    "adminUsuarioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prestador" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "calificacionPromedio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isDisponible" BOOLEAN NOT NULL DEFAULT true,
    "tipoRegistro" "TipoRegistroPrestador" NOT NULL,
    "empresaId" TEXT,
    "categoriaId" TEXT,
    "estadoVerificacion" "EstadoVerificacion" NOT NULL DEFAULT 'PENDIENTE_VERIFICACION',
    "intentosVerificacion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prestador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Servicio" (
    "id" TEXT NOT NULL,
    "nombreOficio" TEXT NOT NULL,
    "descripcion" TEXT,
    "tarifaBase" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orden" (
    "id" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaAgendada" TIMESTAMP(3),
    "estado" "EstadoOrden" NOT NULL DEFAULT 'PENDIENTE',
    "direccionServicio" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "prestadorId" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Orden_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "metodoPago" "MetodoPago" NOT NULL,
    "estado" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "ordenId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Factura" (
    "id" TEXT NOT NULL,
    "folioFiscal" TEXT NOT NULL,
    "rfcEmisor" TEXT NOT NULL,
    "rfcReceptor" TEXT NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "urlXML" TEXT NOT NULL,
    "pagoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Factura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "icono" TEXT,
    "estado" "EstadoCategoria" NOT NULL DEFAULT 'ACTIVA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogAuditoria" (
    "id" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detalle" TEXT,
    "entidad" TEXT,
    "entidadId" TEXT,
    "usuarioId" TEXT,
    "categoriaId" TEXT,
    "realizadoPor" TEXT,
    "rol" TEXT,
    "verificacionId" TEXT,

    CONSTRAINT "LogAuditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" TEXT NOT NULL,
    "prestadorId" TEXT NOT NULL,
    "tipo" "TipoDocumento" NOT NULL,
    "nombreArchivo" TEXT NOT NULL,
    "urlArchivo" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "esAutentico" BOOLEAN,
    "estaVigente" BOOLEAN,
    "datosCoinciden" BOOLEAN,
    "observacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificacionCredenciales" (
    "id" TEXT NOT NULL,
    "prestadorId" TEXT NOT NULL,
    "estado" "EstadoVerificacion" NOT NULL DEFAULT 'PENDIENTE_VERIFICACION',
    "intento" INTEGER NOT NULL DEFAULT 1,
    "verificadorId" TEXT,
    "aprobado" BOOLEAN,
    "motivoRechazo" "MotivoRechazo",
    "detalleRechazo" TEXT,
    "observaciones" TEXT,
    "fechaIniciada" TIMESTAMP(3),
    "fechaDecision" TIMESTAMP(3),
    "fechaLimite" TIMESTAMP(3),
    "escaladoAdminId" TEXT,
    "fechaEscalamiento" TIMESTAMP(3),
    "motivoEscalamiento" TEXT,
    "infAdicionalSolicitada" BOOLEAN NOT NULL DEFAULT false,
    "infAdicionalDetalle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificacionCredenciales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PrestadorToServicio" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PrestadorToServicio_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE INDEX "Usuario_role_idx" ON "Usuario"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_usuarioId_key" ON "Cliente"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_rfc_key" ON "Empresa"("rfc");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_adminUsuarioId_key" ON "Empresa"("adminUsuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Prestador_usuarioId_key" ON "Prestador"("usuarioId");

-- CreateIndex
CREATE INDEX "Prestador_tipoRegistro_idx" ON "Prestador"("tipoRegistro");

-- CreateIndex
CREATE INDEX "Prestador_empresaId_idx" ON "Prestador"("empresaId");

-- CreateIndex
CREATE INDEX "Prestador_estadoVerificacion_idx" ON "Prestador"("estadoVerificacion");

-- CreateIndex
CREATE UNIQUE INDEX "Servicio_nombreOficio_key" ON "Servicio"("nombreOficio");

-- CreateIndex
CREATE INDEX "Orden_estado_idx" ON "Orden"("estado");

-- CreateIndex
CREATE INDEX "Orden_clienteId_idx" ON "Orden"("clienteId");

-- CreateIndex
CREATE INDEX "Orden_prestadorId_idx" ON "Orden"("prestadorId");

-- CreateIndex
CREATE INDEX "Orden_servicioId_idx" ON "Orden"("servicioId");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_ordenId_key" ON "Pago"("ordenId");

-- CreateIndex
CREATE UNIQUE INDEX "Factura_folioFiscal_key" ON "Factura"("folioFiscal");

-- CreateIndex
CREATE UNIQUE INDEX "Factura_pagoId_key" ON "Factura"("pagoId");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");

-- CreateIndex
CREATE INDEX "Categoria_estado_idx" ON "Categoria"("estado");

-- CreateIndex
CREATE INDEX "LogAuditoria_verificacionId_idx" ON "LogAuditoria"("verificacionId");

-- CreateIndex
CREATE INDEX "LogAuditoria_timestamp_idx" ON "LogAuditoria"("timestamp");

-- CreateIndex
CREATE INDEX "LogAuditoria_categoriaId_idx" ON "LogAuditoria"("categoriaId");

-- CreateIndex
CREATE INDEX "Documento_prestadorId_idx" ON "Documento"("prestadorId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificacionCredenciales_prestadorId_key" ON "VerificacionCredenciales"("prestadorId");

-- CreateIndex
CREATE INDEX "VerificacionCredenciales_estado_idx" ON "VerificacionCredenciales"("estado");

-- CreateIndex
CREATE INDEX "VerificacionCredenciales_verificadorId_idx" ON "VerificacionCredenciales"("verificadorId");

-- CreateIndex
CREATE INDEX "_PrestadorToServicio_B_index" ON "_PrestadorToServicio"("B");

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empresa" ADD CONSTRAINT "Empresa_adminUsuarioId_fkey" FOREIGN KEY ("adminUsuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prestador" ADD CONSTRAINT "Prestador_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prestador" ADD CONSTRAINT "Prestador_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prestador" ADD CONSTRAINT "Prestador_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orden" ADD CONSTRAINT "Orden_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orden" ADD CONSTRAINT "Orden_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "Prestador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orden" ADD CONSTRAINT "Orden_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "Orden"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_pagoId_fkey" FOREIGN KEY ("pagoId") REFERENCES "Pago"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogAuditoria" ADD CONSTRAINT "LogAuditoria_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogAuditoria" ADD CONSTRAINT "LogAuditoria_verificacionId_fkey" FOREIGN KEY ("verificacionId") REFERENCES "VerificacionCredenciales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "Prestador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificacionCredenciales" ADD CONSTRAINT "VerificacionCredenciales_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "Prestador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PrestadorToServicio" ADD CONSTRAINT "_PrestadorToServicio_A_fkey" FOREIGN KEY ("A") REFERENCES "Prestador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PrestadorToServicio" ADD CONSTRAINT "_PrestadorToServicio_B_fkey" FOREIGN KEY ("B") REFERENCES "Servicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
