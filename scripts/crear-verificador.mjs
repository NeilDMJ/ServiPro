import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://servipro_user:servipro_password@localhost:5432/servipro_db?schema=public",
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const hash = bcrypt.hashSync("Ver1234", 10);

await prisma.usuario.upsert({
  where:  { correo: "ver@servipro.com" },
  update: { passwordHash: hash },
  create: {
    nombre:       "Verificador",
    correo:       "ver@servipro.com",
    passwordHash: hash,
    role:         "VERIFICADOR",
  },
});

console.log("Verificador creado/actualizado: ver@servipro.com / Ver1234");
await prisma.$disconnect();
await pool.end();