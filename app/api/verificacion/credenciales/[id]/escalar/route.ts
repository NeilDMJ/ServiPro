import type { NextRequest } from "next/server";
import { handleEscalarCaso } from "@/lib/handlers/verificacionCredenciales";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleEscalarCaso(id, request);
}
