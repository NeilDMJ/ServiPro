export class Empresa {
  private id: string;
  private razonSocial: string;

  constructor(id: string, razonSocial: string) {
    this.id = id;
    this.razonSocial = razonSocial;
  }

  getNombre(): string {
    return this.razonSocial;
  }
}