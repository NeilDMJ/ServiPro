import { EstadoOrden } from "../EstadoOrden";
import { OrdenServicio } from "../OrdenServicio";
import { EnProceso } from "./EnProceso";
import { Cancelado } from "./Cancelado";

export class Aceptado implements EstadoOrden {
  aceptar(orden: OrdenServicio): void {
    console.log("La orden ya está en estado Aceptado.");
  }

  iniciarServicio(orden: OrdenServicio): void {
    console.log("Servicio iniciado. Pasando a estado EnProceso.");
    orden.cambiarEstado(new EnProceso());
  }

  completarServicio(orden: OrdenServicio): void {
    console.log("No se puede completar el servicio. El servicio aún no ha iniciado.");
  }

  disputar(orden: OrdenServicio): void {
    console.log("No se puede disputar. El servicio aún no ha iniciado.");
  }

  cancelar(orden: OrdenServicio): void {
    console.log("Orden cancelada desde estado Aceptado.");
    orden.cambiarEstado(new Cancelado());
  }
}
