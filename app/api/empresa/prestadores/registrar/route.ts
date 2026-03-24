import type { NextRequest } from "next/server";
import { handleRegistrarPrestadorEmpresa } from "@/lib/handlers/registrarPrestadorEmpresa";

// Ruta preferida (ServiPro): /api/empresa/prestadores/registrar
export async function POST(request: NextRequest) {
  return await handleRegistrarPrestadorEmpresa(request);
}
