export abstract class Usuario {
  protected id: string;
  protected nombre: string;
  protected correo: string;

  constructor(id: string, nombre: string, correo: string) {
    this.id = id;
    this.nombre = nombre;
    this.correo = correo;
  }

  getId(): string {
    return this.id;
  }

  getNombre(): string {
    return this.nombre;
  }

  getCorreo(): string {
    return this.correo;
  }
}