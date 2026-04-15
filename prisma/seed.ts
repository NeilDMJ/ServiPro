import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const OFICIOS_INICIALES = [
  { nombreOficio: "Carpintería", descripcion: "Trabajos en madera y carpintería en general", tarifaBase: 0 },
  { nombreOficio: "Plomería",    descripcion: "Instalación y reparación de tuberías y sanitarios", tarifaBase: 0 },
  { nombreOficio: "Electricidad", descripcion: "Instalaciones y reparaciones eléctricas", tarifaBase: 0 },
  { nombreOficio: "Pintura",     descripcion: "Pintura de interiores y exteriores", tarifaBase: 0 },
];

async function main() {
  console.log("Insertando catálogo inicial de oficios...");

  for (const oficio of OFICIOS_INICIALES) {
    const result = await prisma.servicio.upsert({
      where:  { nombreOficio: oficio.nombreOficio },
      update: {},          // si ya existe, no modificar nada
      create: oficio,
    });
    console.log(`  ✓ ${result.nombreOficio} (id: ${result.id})`);
  }

  console.log("Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });