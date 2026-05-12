// [UC-03] Gestión CRUD de categorías/oficios — página servidor
import { prisma } from "@/lib/prisma";
import { requireSessionForPanel } from "@/lib/session";
import { CategoriasManager } from "./CategoriasManager";

export default async function CategoriasPage() {
  await requireSessionForPanel("administrador");

  const raw = await prisma.categoria.findMany({
    include: { _count: { select: { prestadores: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Serializar Date → string para el componente cliente
  const categorias = raw.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return (
    <section className="section">
      <div className="container">
        <CategoriasManager initialData={categorias} />
      </div>
    </section>
  );
}