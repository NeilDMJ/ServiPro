import { EstadoOrden } from "./EstadoOrden";
import { Pendiente } from "./estados/Pendiente";
import { EnDisputa } from "./estados/EnDisputa";

export class OrdenServicio {
  private idOrden: number;
  private fecha: Date;
  private estado: EstadoOrden;

  constructor(idOrden: number) {
    this.idOrden = idOrden;
    this.fecha = new Date();
    // Toda orden comienza en estado Pendiente al crearse — crearOrden()
    this.estado = new Pendiente();
  }

  // Método central del patrón State: permite a los estados cambiar el estado de la orden
  cambiarEstado(estado: EstadoOrden): void {
    this.estado = estado;
  }

  // --- Métodos públicos que delegan al estado actual ---

  aceptar(): void {
    this.estado.aceptar(this);
  }

  iniciarServicio(): void {
    this.estado.iniciarServicio(this);
  }

  completarServicio(): void {
    this.estado.completarServicio(this);
  }

  reportarProblema(): void {
    // reportarProblema() en el diagrama de estados equivale a disputar() en la interfaz
    this.estado.disputar(this);
  }

  cancelar(): void {
    this.estado.cancelar(this);
  }

  // resolverDisputa y cerrarDisputa son exclusivos del estado EnDisputa
  resolverDisputa(): void {
    if (this.estado instanceof EnDisputa) {
      this.estado.resolverDisputa(this);
    } else {
      console.log("No hay disputa activa en esta orden.");
    }
  }

  cerrarDisputa(): void {
    if (this.estado instanceof EnDisputa) {
      this.estado.cerrarDisputa(this);
    } else {
      console.log("No hay disputa activa en esta orden.");
    }
  }

  // --- Getters ---

  getIdOrden(): number {
    return this.idOrden;
  }

  getFecha(): Date {
    return this.fecha;
  }

  getEstado(): EstadoOrden {
    return this.estado;
  }

  getNombreEstado(): string {
    return this.estado.constructor.name;
  }
}