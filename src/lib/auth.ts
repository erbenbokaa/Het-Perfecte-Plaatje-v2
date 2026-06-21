import { redirect } from "next/navigation";
import { getSession } from "./session";
import type { SessionUser } from "./types";

export async function requireUser(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect("/");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (!user.is_admin) redirect("/");
  return user;
}
