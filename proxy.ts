import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  getPanelPathForRole,
  isValidSessionJwt,
  sessionCookieName,
  verifySessionToken,
} from "@/lib/auth";

// [UC-01] Middleware de autenticacion: validar JWT en rutas protegidas.

const publicAuthPaths = new Set([
  "/iniciar-sesion",
  "/registro",
  "/registro/cliente",
  "/registro/trabajador",
]);

const publicApiPaths = new Set([
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/clientes",
  "/api/clientes/registrar",
  "/api/trabajadores/registrar",
  "/api/empresa/listar",
  "/api/empresa/verificar",
  "/api/empresa/prestadores/registrar",
  "/api/company/workers/register",
  "/api/company/workers/register-independent",
]);

const adminOnlyApiPrefixes = [
  "/api/administrador",
  "/api/verificacion/credenciales",
];

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(sessionCookieName)?.value;

  // API: valida JWT y aplica autorizacion por rol en endpoints protegidos.
  if (pathname.startsWith("/api/")) {
    if (publicApiPaths.has(pathname)) {
      return NextResponse.next();
    }

    if (!isValidSessionJwt(sessionToken)) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const session = verifySessionToken(sessionToken);
    if (!session) {
      return NextResponse.json(
        { error: "Token invalido" },
        { status: 401 }
      );
    }

    const requiresAdmin = adminOnlyApiPrefixes.some((prefix) =>
      matchesPrefix(pathname, prefix)
    );

    if (requiresAdmin && session.role !== "COMPANY_ADMIN") {
      return NextResponse.json(
        { error: "Prohibido" },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

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
    "/api/:path*",
    "/cuenta/:path*",
    "/panel/:path*",
    "/iniciar-sesion",
    "/registro",
    "/registro/cliente",
    "/registro/trabajador",
  ],
};