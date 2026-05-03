import { Usuario } from "./Usuario";
import { Servicio } from "./Servicio";

export class Prestador extends Usuario {
  private especialidad: string;
  private documentosVerificados: boolean;
  private servicios: Servicio[];

  constructor(
    id: string,
    nombre: string,
    correo: string,
    contrasena: string,
    especialidad: string,
    servicios: Servicio[] = []
  ) {
    // Según el diagrama de secuencia, Prestador inicia como "Pendiente"
    // hasta que sus documentos sean verificados
    super(id, nombre, correo, contrasena, "prestador", "Pendiente");
    this.especialidad = especialidad;
    this.documentosVerificados = false;
    this.servicios = servicios;
  }

  verificarDocumentos(): void {
    this.documentosVerificados = true;
    this.setEstado("Activo");
    console.log(`Documentos de ${this.getNombre()} verificados. Cuenta activada.`);
  }

  agregarServicio(servicio: Servicio): void {
    this.servicios.push(servicio);
  }

  obtenerServicios(): Servicio[] {
    return this.servicios;
  }

  getEspecialidad(): string {
    return this.especialidad;
  }

  isVerificado(): boolean {
    return this.documentosVerificados;
  }

  trabajar(): void {
    if (!this.estaActivo()) {
      console.log(
        `${this.getNombre()} no puede ofrecer servicios, cuenta pendiente de verificación.`
      );
      return;
    }
    console.log(
      `${this.getNombre()} está ofreciendo servicios como ${this.especialidad}.`
    );
  }
}