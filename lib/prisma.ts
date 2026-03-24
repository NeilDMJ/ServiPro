import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

type GlobalForPrisma = typeof globalThis & {
  prisma?: PrismaClient;
};

const globalForPrisma = globalThis as GlobalForPrisma;

function getSqliteDbPath(databaseUrl: string | undefined): string {
  if (!databaseUrl) return "./dev.db";
  const trimmed = databaseUrl.trim();
  if (trimmed.startsWith("file:")) return trimmed.slice("file:".length);
  return trimmed;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: getSqliteDbPath(process.env.DATABASE_URL),
    }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
