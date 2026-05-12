import { Usuario } from "./Usuario";
import { Servicio } from "./Servicio";
import { Empresa } from "./Empresa";

export class Prestador extends Usuario {
  private servicios: Servicio[];
  private empresa?: Empresa;

  constructor(
    id: string,
    nombre: string,
    correo: string,
    servicios: Servicio[],
    empresa?: Empresa
  ) {
    super(id, nombre, correo);
    this.servicios = servicios;
    this.empresa = empresa;
  }

  agregarServicio(servicio: Servicio) {
    this.servicios.push(servicio);
  }

  obtenerServicios(): Servicio[] {
    return this.servicios;
  }

  getEmpresa(): Empresa | undefined {
    return this.empresa;
  }

  trabajar() {
    console.log(`${this.getNombre()} está ofreciendo servicios`);
  }
}