import type { NextRequest } from "next/server";
import { handleRegistrarPrestadorEmpresa } from "@/lib/handlers/registrarPrestadorEmpresa";

// Ruta legacy (inglés) mantenida por compatibilidad.
export async function POST(request: NextRequest) {
  return await handleRegistrarPrestadorEmpresa(request);
}
