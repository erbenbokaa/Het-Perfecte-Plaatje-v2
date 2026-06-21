"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  updateSettings,
  createCategory,
  deleteCategory,
  getCategories,
  createParticipant,
  deleteParticipant,
  getParticipantWithCode,
} from "@/lib/db";
import type { Phase } from "@/lib/types";

const PHASES: Phase[] = ["setup", "upload", "voting", "results"];

export async function updateSettingsAction(formData: FormData) {
  await requireAdmin();
  const competition_name = String(formData.get("competition_name") ?? "").trim();
  const num_days = Number(formData.get("num_days") ?? 7);
  const phase = String(formData.get("phase") ?? "setup") as Phase;

  await updateSettings({
    competition_name: competition_name || "Het Perfecte Plaatje",
    num_days: Number.isFinite(num_days) && num_days > 0 ? Math.min(num_days, 60) : 7,
    phase: PHASES.includes(phase) ? phase : "setup",
  });
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function setPhaseAction(formData: FormData) {
  await requireAdmin();
  const phase = String(formData.get("phase") ?? "") as Phase;
  if (!PHASES.includes(phase)) return;
  await updateSettings({ phase });
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function addCategoryAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!name) return;
  const existing = await getCategories();
  await createCategory(name, description, existing.length);
  revalidatePath("/admin");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await deleteCategory(id);
  revalidatePath("/admin");
}

export async function addParticipantAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "");
  const is_admin = formData.get("is_admin") === "on";
  if (name.length < 2 || code.length < 4) return;
  if (await getParticipantWithCode(name)) return; // naam bestaat al
  const codeHash = await bcrypt.hash(code, 10);
  await createParticipant(name, codeHash, is_admin);
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function deleteParticipantAction(formData: FormData) {
  const me = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id && id !== me.id) await deleteParticipant(id);
  revalidatePath("/admin");
}
