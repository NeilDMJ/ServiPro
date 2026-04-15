import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  getPanelPathForRole,
  sessionCookieName,
  verifySessionToken,
} from "@/lib/auth";

const publicAuthPaths = new Set([
  "/iniciar-sesion",
  "/registro",
  "/registro/cliente",
  "/registro/trabajador",
]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(sessionCookieName)?.value;
  const session = verifySessionToken(sessionToken);

  if (publicAuthPaths.has(pathname) && session) {
    return NextResponse.redirect(new URL(getPanelPathForRole(session.role), request.url));
  }

  if (pathname.startsWith("/cuenta") || pathname.startsWith("/panel/")) {
    if (!session) {
      const loginUrl = new URL("/iniciar-sesion", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/panel/")) {
      const requestedType = pathname.split("/")[2];
      const expectedPath = getPanelPathForRole(session.role);

      if (expectedPath !== `/panel/${requestedType}`) {
        return NextResponse.redirect(new URL(expectedPath, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/cuenta/:path*",
    "/panel/:path*",
    "/iniciar-sesion",
    "/registro",
    "/registro/cliente",
    "/registro/trabajador",
  ],
};