import { Usuario } from "./Usuario";
import { Prestador } from "./Prestador";
import { Servicio } from "./Servicio";

export class Empresa extends Usuario {
  private razonSocial: string;
  private rfc: string;
  private responsable: string; // Nombre del responsable registrado al crear la cuenta
  private prestadores: Prestador[];
  private servicios: Servicio[];

  constructor(
    id: string,
    correo: string,
    contrasena: string,
    razonSocial: string,
    rfc: string,
    responsable: string
  ) {
    // Igual que el Prestador, la Empresa inicia como "Pendiente"
    // hasta verificar sus documentos — diagrama de secuencia rama [es Prestador o Empresa]
    super(id, razonSocial, correo, contrasena, "empresa", "Pendiente");
    this.razonSocial = razonSocial;
    this.rfc = rfc;
    this.responsable = responsable;
    this.prestadores = [];
    this.servicios = [];
  }

  verificarEmpresa(): void {
    this.setEstado("Activo");
    console.log(`Empresa ${this.razonSocial} verificada y activada.`);
  }

  // Una Empresa puede tener varios Prestadores trabajando bajo ella,
  // a diferencia de un Freelancer que trabaja de forma independiente
  agregarPrestador(prestador: Prestador): void {
    this.prestadores.push(prestador);
  }

  getPrestadores(): Prestador[] {
    return this.prestadores;
  }

  agregarServicio(servicio: Servicio): void {
    this.servicios.push(servicio);
  }

  getServicios(): Servicio[] {
    return this.servicios;
  }

  getRazonSocial(): string {
    return this.razonSocial;
  }

  getRFC(): string {
    return this.rfc;
  }

  getResponsable(): string {
    return this.responsable;
  }
}