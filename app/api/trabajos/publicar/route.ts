import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getString(value: unknown): string | undefined {
  return isNonEmptyString(value) ? value.trim() : undefined;
}

export async function POST(request: NextRequest) {
  let body: any;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const titulo = getString(body.titulo);
  const descripcion = getString(body.descripcion);
  const habilidad = getString(body.habilidad);
  const direccion = getString(body.direccion);

  if (!titulo || !habilidad || !direccion) {
    return Response.json({ error: "Campos obligatorios faltantes (titulo, habilidad, direccion)" }, { status: 400 });
  }

  try {
    // 1. Simular la creación de la orden (en un flujo real se crearía el registro en la DB)
    // En este proyecto, UC-04 implica notificar trabajadores.
    
    // 2. Buscar trabajadores que tengan la habilidad (oficio)
    const trabajadores = await prisma.prestador.findMany({
      where: {
        oficios: {
          some: {
            nombreOficio: {
              contains: habilidad,
              mode: 'insensitive'
            }
          }
        },
        estadoVerificacion: "VERIFICADO",
        isDisponible: true
      },
      include: {
        usuario: true
      }
    });

    const idTrabajo = Math.floor(1000 + Math.random() * 9000).toString();

    // 3. Simular el algoritmo de notificaciones push (Log en consola)
    console.log(`[Push Notification] Trabajo #${idTrabajo} publicado.`);
    console.log(`[Push Notification] Notificando a ${trabajadores.length} trabajadores con la habilidad "${habilidad}".`);
    
    trabajadores.forEach(t => {
      console.log(`[Push Alerta] Enviando alerta a: ${t.usuario.nombre} (${t.usuario.correo})`);
    });

    return Response.json({ 
      success: true, 
      idTrabajo,
      notificados: trabajadores.length,
      mensaje: "confirmarPublicaciónExitosa"
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return Response.json({ error: "Error al publicar la necesidad" }, { status: 500 });
  }
}
