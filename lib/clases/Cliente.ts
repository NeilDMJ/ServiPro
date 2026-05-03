import { Usuario } from "./Usuario";

export class Cliente extends Usuario {
  private historialOrdenes: string[]; // IDs de órdenes

  constructor(
    id: string,
    nombre: string,
    correo: string,
    contrasena: string
  ) {
    // Según el diagrama de secuencia, el Cliente se activa directamente al registrarse
    super(id, nombre, correo, contrasena, "cliente", "Activo");
    this.historialOrdenes = [];
  }

  solicitarServicio(): void {
    if (!this.estaActivo()) {
      console.log(`${this.getNombre()} no puede solicitar servicios, cuenta inactiva.`);
      return;
    }
    console.log(`${this.getNombre()} está solicitando un servicio.`);
  }

  agregarOrden(idOrden: string): void {
    this.historialOrdenes.push(idOrden);
  }

  getHistorialOrdenes(): string[] {
    return this.historialOrdenes;
  }
}