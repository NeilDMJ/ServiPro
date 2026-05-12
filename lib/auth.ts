import bcrypt from "bcryptjs";
import { createHmac, timingSafeEqual } from "node:crypto";

// [UC-01] Autenticacion: generar y validar JWT de sesion para rutas protegidas.

export type AppRole = "CLIENTE" | "PRESTADOR" | "COMPANY_ADMIN";

const SESSION_SECRET =
  process.env.SESSION_SECRET ?? "servipro-dev-session-secret";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export const sessionCookieName = "servipro_session";

export const userTypeToRole = {
  cliente: "CLIENTE",
  trabajador: "PRESTADOR",
  administrador: "COMPANY_ADMIN",
} as const satisfies Record<string, AppRole>;

export type UserType = keyof typeof userTypeToRole;

export type SessionPayload = {
  sub: string;
  role: AppRole;
  nombre: string;
  correo: string;
  exp: number;
};

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  return bcrypt.compareSync(password, passwordHash);
}

export function getRoleFromUserType(value: unknown): AppRole | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim().toLowerCase() as UserType;
  return userTypeToRole[normalizedValue];
}

export function getUserTypeFromRole(role: AppRole): UserType {
  switch (role) {
    case "CLIENTE":
      return "cliente";
    case "PRESTADOR":
      return "trabajador";
    case "COMPANY_ADMIN":
      return "administrador";
  }
}

export function getPanelPathForRole(role: AppRole): string {
  return `/panel/${getUserTypeFromRole(role)}`;
}

function createSessionSignature(value: string): string {
  return createHmac("sha256", SESSION_SECRET).update(value).digest("base64url");
}

const JWT_HEADER_BASE64 = Buffer.from(
  JSON.stringify({ alg: "HS256", typ: "JWT" })
).toString("base64url");

function verifySignedValue(value: string, signature: string): boolean {
  const expectedSignature = createSessionSignature(value);
  const received = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (received.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(received, expected);
}

function parseSessionPayload(encodedPayload: string): SessionPayload | null {
  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as SessionPayload;

    if (
      typeof payload.sub !== "string" ||
      typeof payload.nombre !== "string" ||
      typeof payload.correo !== "string" ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }

    if (![
      "CLIENTE",
      "PRESTADOR",
      "COMPANY_ADMIN",
    ].includes(payload.role)) {
      return null;
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function createSessionToken(payload: {
  sub: string;
  role: AppRole;
  nombre: string;
  correo: string;
}): string {
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
    })
  ).toString("base64url");

  const signingInput = `${JWT_HEADER_BASE64}.${body}`;
  const signature = createSessionSignature(signingInput);

  return `${signingInput}.${signature}`;
}

export function verifySessionToken(token?: string): SessionPayload | null {
  if (!token) {
    return null;
  }

  const parts = token.split(".");

  // JWT actual: header.payload.signature
  if (parts.length === 3) {
    const [header, payload, signature] = parts;
    if (!header || !payload || !signature) {
      return null;
    }

    const signingInput = `${header}.${payload}`;
    if (!verifySignedValue(signingInput, signature)) {
      return null;
    }

    try {
      const decodedHeader = JSON.parse(
        Buffer.from(header, "base64url").toString("utf8")
      ) as { alg?: string; typ?: string };
      if (decodedHeader.alg !== "HS256" || decodedHeader.typ !== "JWT") {
        return null;
      }
    } catch {
      return null;
    }

    return parseSessionPayload(payload);
  }

  // Compatibilidad legacy: body.signature
  if (parts.length === 2) {
    const [legacyPayload, legacySignature] = parts;
    if (!legacyPayload || !legacySignature) {
      return null;
    }

    if (!verifySignedValue(legacyPayload, legacySignature)) {
      return null;
    }

    return parseSessionPayload(legacyPayload);
  }

  return null;
}

export function isValidSessionJwt(token?: string): boolean {
  if (!token) {
    return false;
  }

  return verifySessionToken(token) !== null;
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}