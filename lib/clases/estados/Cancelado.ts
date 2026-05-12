import { EstadoOrden } from "../EstadoOrden";
import { OrdenServicio } from "../OrdenServicio";

export class Cancelado implements EstadoOrden {
  aceptar(orden: OrdenServicio): void {
    console.log("No se puede aceptar una orden Cancelada.");
  }

  iniciarServicio(orden: OrdenServicio): void {
    console.log("No se puede iniciar una orden Cancelada.");
  }

  completarServicio(orden: OrdenServicio): void {
    console.log("No se puede completar una orden Cancelada.");
  }

  disputar(orden: OrdenServicio): void {
    console.log("No se puede disputar una orden Cancelada.");
  }

  // Según el diagrama, Cancelado tiene cancelar() como único método propio
  cancelar(orden: OrdenServicio): void {
    console.log("La orden ya está Cancelada.");
  }
}
