import { cookies } from "next/headers";

import { getSessionCookieOptions, sessionCookieName } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });

  return Response.json({ ok: true }, { status: 200 });
}