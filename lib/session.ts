import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  getPanelPathForRole,
  sessionCookieName,
  verifySessionToken,
} from "@/lib/auth";

export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(sessionCookieName)?.value;
  return verifySessionToken(sessionToken);
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/iniciar-sesion");
  }

  return session;
}

export async function requireSessionForPanel(panelType: string) {
  const session = await requireSession();
  const expectedPath = getPanelPathForRole(session.role);

  if (expectedPath !== `/panel/${panelType}`) {
    redirect(expectedPath);
  }

  return session;
}