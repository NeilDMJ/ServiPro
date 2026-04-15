import type { NextRequest } from "next/server";
import { handleRegistrarPrestadorIndependiente } from "@/lib/handlers/registrarPrestadorIndependiente";

export async function POST(request: NextRequest) {
  return await handleRegistrarPrestadorIndependiente(request);
}