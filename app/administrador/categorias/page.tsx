import { prisma } from "@/lib/prisma";
import { requireSessionForPanel } from "@/lib/session";
import { CategoriasManager } from "./CategoriasManager";

export default async function CategoriasPage() {
  await requireSessionForPanel("administrador");

  const categorias = await prisma.categoria.findMany({
    include: { _count: { select: { prestadores: true } } },
    orderBy: { createdAt: "desc" },
  });

  const data = categorias.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return (
    <section className="section">
      <div className="container">
        <h1>Gestión de Categorías</h1>
        <CategoriasManager initialData={data} />
      </div>
    </section>
  );
}