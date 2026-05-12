import type { NextRequest } from "next/server";
import {
  handleListarPendientes,
  handleIniciarRevision,
} from "@/lib/handlers/verificacionCredenciales";

export async function GET(request: NextRequest) {
  return handleListarPendientes(request);
}

export async function POST(request: NextRequest) {
  return handleIniciarRevision(request);
}
