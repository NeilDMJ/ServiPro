-- CreateEnum
CREATE TYPE "EstadoVerificacionPrestador" AS ENUM ('PENDIENTE_DE_VERIFICACION', 'VERIFICADO', 'RECHAZADO');

-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "ramo" TEXT,
ADD COLUMN     "ubicacion" TEXT;

-- AlterTable
ALTER TABLE "Prestador" ADD COLUMN     "estadoVerificacion" "EstadoVerificacionPrestador" NOT NULL DEFAULT 'PENDIENTE_DE_VERIFICACION',
ADD COLUMN     "fechaVerificacion" TIMESTAMP(3),
ADD COLUMN     "notasVerificacion" TEXT;

-- CreateTable
CREATE TABLE "Documento" (
    "id" TEXT NOT NULL,
    "nombreArchivo" TEXT NOT NULL,
    "tipoDocumento" TEXT NOT NULL,
    "rutaArchivo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'CARGADO',
    "prestadorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Documento_prestadorId_idx" ON "Documento"("prestadorId");

-- CreateIndex
CREATE INDEX "Documento_estado_idx" ON "Documento"("estado");

-- CreateIndex
CREATE INDEX "Prestador_estadoVerificacion_idx" ON "Prestador"("estadoVerificacion");

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "Prestador"("id") ON DELETE CASCADE ON UPDATE CASCADE;
