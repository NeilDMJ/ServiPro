import { EstadoOrden } from "../EstadoOrden";
import { OrdenServicio } from "../OrdenServicio";
import { Finalizado } from "./Finalizado";
import { EnDisputa } from "./EnDisputa";

export class EnProceso implements EstadoOrden {
  aceptar(orden: OrdenServicio): void {
    console.log("No se puede aceptar. La orden ya está EnProceso.");
  }

  iniciarServicio(orden: OrdenServicio): void {
    console.log("El servicio ya está en proceso.");
  }

  completarServicio(orden: OrdenServicio): void {
    console.log("Servicio completado. Pasando a estado Finalizado.");
    orden.cambiarEstado(new Finalizado());
  }

  disputar(orden: OrdenServicio): void {
    console.log("Disputa reportada. Pasando a estado EnDisputa.");
    orden.cambiarEstado(new EnDisputa());
  }

  cancelar(orden: OrdenServicio): void {
    console.log("No se puede cancelar. La orden ya está en proceso.");
  }
}
