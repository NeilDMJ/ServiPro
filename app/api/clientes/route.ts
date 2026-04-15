import { handleRegistrarCliente } from "@/lib/handlers/registrarCliente";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return await handleRegistrarCliente(request);
}