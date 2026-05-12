import type { NextRequest } from "next/server";
import {
  handleObtenerDetalle,
  handleRegistrarDecision,
} from "@/lib/handlers/verificacionCredenciales";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleObtenerDetalle(id);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleRegistrarDecision(id, request);
}
