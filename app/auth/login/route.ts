import type { NextRequest } from "next/server";
import { handleLogin } from "@/lib/handlers/login";

// [UC-01] Endpoint POST /auth/login con JWT.
export async function POST(request: NextRequest) {
  return handleLogin(request);
}
