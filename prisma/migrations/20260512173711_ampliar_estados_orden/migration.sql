/*
  Warnings:

  - The values [FINALIZADA] on the enum `EstadoOrden` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstadoOrden_new" AS ENUM ('PENDIENTE', 'ACEPTADO', 'EN_PROCESO', 'EN_DISPUTA', 'FINALIZADO', 'CANCELADO');
ALTER TABLE "public"."Orden" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "Orden" ALTER COLUMN "estado" TYPE "EstadoOrden_new" USING ("estado"::text::"EstadoOrden_new");
ALTER TYPE "EstadoOrden" RENAME TO "EstadoOrden_old";
ALTER TYPE "EstadoOrden_new" RENAME TO "EstadoOrden";
DROP TYPE "public"."EstadoOrden_old";
ALTER TABLE "Orden" ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE';
COMMIT;
