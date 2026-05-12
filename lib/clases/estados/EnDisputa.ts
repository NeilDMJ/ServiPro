import { EstadoOrden } from "../EstadoOrden";
import { OrdenServicio } from "../OrdenServicio";
import { EnProceso } from "./EnProceso";
import { Finalizado } from "./Finalizado";

export class EnDisputa implements EstadoOrden {
  aceptar(orden: OrdenServicio): void {
    console.log("No se puede aceptar. La orden está EnDisputa.");
  }

  iniciarServicio(orden: OrdenServicio): void {
    console.log("No se puede iniciar. La orden está EnDisputa.");
  }

  completarServicio(orden: OrdenServicio): void {
    console.log("No se puede completar directamente. Primero resuelve la disputa.");
  }

  disputar(orden: OrdenServicio): void {
    console.log("La orden ya está EnDisputa.");
  }

  cancelar(orden: OrdenServicio): void {
    console.log("No se puede cancelar. La orden está EnDisputa.");
  }

  // Métodos propios del estado EnDisputa según el diagrama
  resolverDisputa(orden: OrdenServicio): void {
    console.log("Disputa resuelta. Regresando a estado EnProceso.");
    orden.cambiarEstado(new EnProceso());
  }

  cerrarDisputa(orden: OrdenServicio): void {
    console.log("Disputa cerrada. Pasando a estado Finalizado.");
    orden.cambiarEstado(new Finalizado());
  }
}
