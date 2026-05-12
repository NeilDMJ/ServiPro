import { EstadoOrden } from "../EstadoOrden";
import { OrdenServicio } from "../OrdenServicio";
import { Aceptado } from "./Aceptado";
import { Cancelado } from "./Cancelado";

export class Pendiente implements EstadoOrden {
  aceptar(orden: OrdenServicio): void {
    console.log("Orden aceptada. Pasando a estado Aceptado.");
    orden.cambiarEstado(new Aceptado());
  }

  iniciarServicio(orden: OrdenServicio): void {
    console.log("No se puede iniciar el servicio. La orden aún está Pendiente.");
  }

  completarServicio(orden: OrdenServicio): void {
    console.log("No se puede completar el servicio. La orden aún está Pendiente.");
  }

  disputar(orden: OrdenServicio): void {
    console.log("No se puede disputar. La orden aún está Pendiente.");
  }

  cancelar(orden: OrdenServicio): void {
    console.log("Orden cancelada desde estado Pendiente.");
    orden.cambiarEstado(new Cancelado());
  }
}
