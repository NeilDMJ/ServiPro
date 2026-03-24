import type { NextRequest } from "next/server";
import { handleLogin } from "@/lib/handlers/login";

export async function POST(request: NextRequest) {
  return await handleLogin(request);
}
