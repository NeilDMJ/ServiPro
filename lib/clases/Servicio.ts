export class Servicio {
  private nombreOficio: string;
  private tarifaBase: number;

  constructor(nombreOficio: string, tarifaBase: number) {
    this.nombreOficio = nombreOficio;
    this.tarifaBase = tarifaBase;
  }

  getNombreOficio(): string {
    return this.nombreOficio;
  }

  getTarifa(): number {
    return this.tarifaBase;
  }
}