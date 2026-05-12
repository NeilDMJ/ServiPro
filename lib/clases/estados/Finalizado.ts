import { EstadoOrden } from "../EstadoOrden";
import { OrdenServicio } from "../OrdenServicio";

export class Finalizado implements EstadoOrden {
  aceptar(orden: OrdenServicio): void {
    console.log("La orden ya está Finalizada.");
  }

  iniciarServicio(orden: OrdenServicio): void {
    console.log("La orden ya está Finalizada.");
  }

  // Según el diagrama, Finalizado tiene completarServicio() como único método propio
  completarServicio(orden: OrdenServicio): void {
    console.log("La orden ya está Finalizada.");
  }

  disputar(orden: OrdenServicio): void {
    console.log("No se puede disputar una orden Finalizada.");
  }

  cancelar(orden: OrdenServicio): void {
    console.log("No se puede cancelar una orden Finalizada.");
  }
}
