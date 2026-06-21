import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "./types";

const COOKIE_NAME = "hpp_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 dagen

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s) {
    throw new Error(
      "SESSION_SECRET ontbreekt. Zet een lange willekeurige waarde in je omgevingsvariabelen."
    );
  }
  return new TextEncoder().encode(s);
}

export async function createSession(user: SessionUser): Promise<void> {
  const token = await new SignJWT({
    name: user.name,
    is_admin: user.is_admin,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      id: payload.sub as string,
      name: payload.name as string,
      is_admin: Boolean(payload.is_admin),
    };
  } catch {
    return null;
  }
}

export function clearSession(): void {
  cookies().delete(COOKIE_NAME);
}
