export class Servicio {
  private id: string;
  private nombreOficio: string;
  private tarifaBase: number;
  private descripcion: string;

  constructor(
    id: string,
    nombreOficio: string,
    tarifaBase: number,
    descripcion: string = ""
  ) {
    this.id = id;
    this.nombreOficio = nombreOficio;
    this.tarifaBase = tarifaBase;
    this.descripcion = descripcion;
  }

  getId(): string {
    return this.id;
  }

  getNombreOficio(): string {
    return this.nombreOficio;
  }

  getTarifa(): number {
    return this.tarifaBase;
  }

  getDescripcion(): string {
    return this.descripcion;
  }

  setTarifa(tarifa: number): void {
    this.tarifaBase = tarifa;
  }
}