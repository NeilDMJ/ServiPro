import { Usuario } from "./Usuario";

export class Cliente extends Usuario {
  solicitarServicio() {
    console.log(`${this.getNombre()} está solicitando un servicio`);
  }
}