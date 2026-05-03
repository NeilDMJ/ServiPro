export type EstadoUsuario = "Activo" | "Pendiente" | "Suspendido";
export type RolUsuario = "cliente" | "prestador" | "empresa";

export abstract class Usuario {
  protected id: string;
  protected nombre: string;
  protected correo: string;
  protected contrasena: string;
  protected estado: EstadoUsuario;
  protected rol: RolUsuario;

  constructor(
    id: string,
    nombre: string,
    correo: string,
    contrasena: string,
    rol: RolUsuario,
    estado: EstadoUsuario = "Activo"
  ) {
    this.id = id;
    this.nombre = nombre;
    this.correo = correo;
    this.contrasena = contrasena;
    this.rol = rol;
    this.estado = estado;
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

  // No exponemos la contraseña con un getter público,
  // solo permitimos verificarla para el flujo de login
  verificarContrasena(contrasena: string): boolean {
    return this.contrasena === contrasena;
  }

  setContrasena(nuevaContrasena: string): void {
    this.contrasena = nuevaContrasena;
  }

  getEstado(): EstadoUsuario {
    return this.estado;
  }

  getRol(): RolUsuario {
    return this.rol;
  }

  setEstado(estado: EstadoUsuario): void {
    this.estado = estado;
  }

  estaActivo(): boolean {
    return this.estado === "Activo";
  }
}