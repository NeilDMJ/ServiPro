import type { NextRequest } from "next/server";
import { handleAuthRegister } from "@/lib/handlers/register";

// [UC-01] Endpoint POST /api/auth/register para Cliente y Trabajador.
export async function POST(request: NextRequest) {
  return handleAuthRegister(request);
}
