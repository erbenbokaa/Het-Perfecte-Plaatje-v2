"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import {
  countParticipants,
  createParticipant,
  getParticipantWithCode,
} from "@/lib/db";
import { createSession, clearSession } from "@/lib/session";

export async function loginAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "");

  if (!name || !code) {
    redirect("/?error=" + encodeURIComponent("Vul je naam en code in."));
  }

  const participant = await getParticipantWithCode(name);
  if (!participant || !(await bcrypt.compare(code, participant.code_hash))) {
    redirect("/?error=" + encodeURIComponent("Naam of code klopt niet."));
  }

  await createSession({
    id: participant!.id,
    name: participant!.name,
    is_admin: participant!.is_admin,
  });
  redirect("/dashboard");
}

/** Eerste opstart: als er nog geen deelnemers zijn, maak de eerste (admin) aan. */
export async function setupAdminAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "");

  if ((await countParticipants()) > 0) {
    redirect("/");
  }
  if (name.length < 2 || code.length < 4) {
    redirect(
      "/?error=" +
        encodeURIComponent("Naam minimaal 2 tekens, code minimaal 4 tekens.")
    );
  }

  const codeHash = await bcrypt.hash(code, 10);
  await createParticipant(name, codeHash, true);

  const created = await getParticipantWithCode(name);
  await createSession({
    id: created!.id,
    name: created!.name,
    is_admin: true,
  });
  redirect("/admin");
}

export async function logoutAction() {
  clearSession();
  redirect("/");
}
