import { OrdenServicio } from "./OrdenServicio";

export interface EstadoOrden {
  aceptar(orden: OrdenServicio): void;
  iniciarServicio(orden: OrdenServicio): void;
  completarServicio(orden: OrdenServicio): void;
  disputar(orden: OrdenServicio): void;
  cancelar(orden: OrdenServicio): void;
}