import type { NextRequest } from "next/server";
import { handleSolicitarInfo } from "@/lib/handlers/verificacionCredenciales";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleSolicitarInfo(id, request);
}
