import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const hash = bcrypt.hashSync("Admin1234!", 10);

await prisma.usuario.upsert({
  where: { correo: "admin@servipro.com" },
  update: { passwordHash: hash },
  create: {
    nombre: "Administrador",
    correo: "admin@servipro.com",
    passwordHash: hash,
    role: "COMPANY_ADMIN",
  },
});

console.log("Admin creado/actualizado correctamente");
await prisma.$disconnect();
