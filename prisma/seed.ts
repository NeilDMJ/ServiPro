import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://servipro_user:servipro_password@localhost:5432/servipro_db?schema=public",
});

const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  // Prestador A — flujo normal (aprobar)
  const uA = await prisma.usuario.upsert({
    where:  { correo: "juan@test.com" },
    update: {},
    create: { nombre: "Juan Pérez", correo: "juan@test.com", passwordHash: "hash", role: "PRESTADOR" },
  });
  const pA = await prisma.prestador.upsert({
    where:  { usuarioId: uA.id },
    update: {},
    create: { usuarioId: uA.id, tipoRegistro: "INDEPENDIENTE" },
  });
  await prisma.documento.createMany({ skipDuplicates: true, data: [
    { prestadorId: pA.id, tipo: "IDENTIFICACION_OFICIAL", nombreArchivo: "ine.pdf",  urlArchivo: "/uploads/ine.pdf",  mimeType: "application/pdf" },
    { prestadorId: pA.id, tipo: "CERTIFICADO_TECNICO",    nombreArchivo: "cert.pdf", urlArchivo: "/uploads/cert.pdf", mimeType: "application/pdf", estaVigente: true },
  ]});

  // Prestador B — certificación vencida (S3)
  const uB = await prisma.usuario.upsert({
    where:  { correo: "maria@test.com" },
    update: {},
    create: { nombre: "María López", correo: "maria@test.com", passwordHash: "hash", role: "PRESTADOR" },
  });
  const pB = await prisma.prestador.upsert({
    where:  { usuarioId: uB.id },
    update: {},
    create: { usuarioId: uB.id, tipoRegistro: "INDEPENDIENTE" },
  });
  await prisma.documento.createMany({ skipDuplicates: true, data: [
    { prestadorId: pB.id, tipo: "CERTIFICADO_TECNICO", nombreArchivo: "cert_vencido.pdf", urlArchivo: "/uploads/cert_v.pdf", mimeType: "application/pdf", estaVigente: false },
  ]});

  // Prestador C — docs incompletos (S1)
  const uC = await prisma.usuario.upsert({
    where:  { correo: "pedro@test.com" },
    update: {},
    create: { nombre: "Pedro García", correo: "pedro@test.com", passwordHash: "hash", role: "PRESTADOR" },
  });
  const pC = await prisma.prestador.upsert({
    where:  { usuarioId: uC.id },
    update: {},
    create: { usuarioId: uC.id, tipoRegistro: "INDEPENDIENTE" },
  });
  await prisma.documento.create({ data:
    { prestadorId: pC.id, tipo: "IDENTIFICACION_OFICIAL", nombreArchivo: "ine.pdf", urlArchivo: "/uploads/ine_c.pdf", mimeType: "application/pdf" },
  });

  // Prestador D — posible falsificación (S2)
  const uD = await prisma.usuario.upsert({
    where:  { correo: "luis@test.com" },
    update: {},
    create: { nombre: "Luis Torres", correo: "luis@test.com", passwordHash: "hash", role: "PRESTADOR" },
  });
  const pD = await prisma.prestador.upsert({
    where:  { usuarioId: uD.id },
    update: {},
    create: { usuarioId: uD.id, tipoRegistro: "INDEPENDIENTE" },
  });
  await prisma.documento.createMany({ skipDuplicates: true, data: [
    { prestadorId: pD.id, tipo: "IDENTIFICACION_OFICIAL", nombreArchivo: "ine.pdf",  urlArchivo: "/uploads/ine_d.pdf",  mimeType: "application/pdf" },
    { prestadorId: pD.id, tipo: "CERTIFICADO_TECNICO",    nombreArchivo: "cert.pdf", urlArchivo: "/uploads/cert_d.pdf", mimeType: "application/pdf", estaVigente: true },
  ]});

  console.log("✅ Prestador A (aprobar):",   pA.id);
  console.log("✅ Prestador B (cert vencida):", pB.id);
  console.log("✅ Prestador C (docs incompletos):", pC.id);
  console.log("✅ Prestador D (posible fraude):", pD.id);
}

main()
  .catch(console.error)
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });