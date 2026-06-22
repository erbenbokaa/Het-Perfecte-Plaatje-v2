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
  getPhotos,
  getVotes,
  getParticipants,
  replaceHallOfFameYear,
} from "@/lib/db";
import { computeCategoryResults, computeLeaderboard } from "@/lib/scoring";
import type { Phase, HallOfFameEntry } from "@/lib/types";

const PHASES: Phase[] = ["setup", "upload", "voting", "results"];

export async function updateSettingsAction(formData: FormData) {
  await requireAdmin();
  const competition_name = String(formData.get("competition_name") ?? "").trim();
  const num_days = Number(formData.get("num_days") ?? 7);
  const phase = String(formData.get("phase") ?? "setup") as Phase;
  const startRaw = String(formData.get("start_date") ?? "").trim();
  // Verwacht YYYY-MM-DD; leeg betekent geen startdatum.
  const start_date = /^\d{4}-\d{2}-\d{2}$/.test(startRaw) ? startRaw : null;

  await updateSettings({
    competition_name: competition_name || "Het Perfecte Plaatje",
    num_days: Number.isFinite(num_days) && num_days > 0 ? Math.min(num_days, 60) : 7,
    phase: PHASES.includes(phase) ? phase : "setup",
    start_date,
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

/** Archiveert de huidige uitslag (kampioen + categoriewinnaars) in de Hall of Fame. */
export async function archiveToHallOfFameAction(formData: FormData) {
  await requireAdmin();
  const year = Number(formData.get("year"));
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return;

  const [categories, photos, votes, participants] = await Promise.all([
    getCategories(),
    getPhotos(),
    getVotes(),
    getParticipants(),
  ]);
  const catResults = computeCategoryResults(categories, photos, votes, participants);
  const leaderboard = computeLeaderboard(catResults, participants);

  const rows: Omit<HallOfFameEntry, "id">[] = [];
  const champ = leaderboard[0];
  if (champ && champ.totalPoints > 0) {
    rows.push({
      year,
      kind: "champion",
      title: "Algemeen kampioen",
      winner_name: champ.participantName,
      points: champ.totalPoints,
      photo_path: null,
      sort_order: 0,
    });
  }
  let order = 1;
  for (const cr of catResults) {
    const top = cr.photos[0];
    if (top && top.points > 0) {
      rows.push({
        year,
        kind: "category",
        title: cr.category.name,
        winner_name: top.participantName,
        points: top.points,
        photo_path: top.photo.storage_path,
        sort_order: order++,
      });
    }
  }

  await replaceHallOfFameYear(year, rows);
  revalidatePath("/hall-of-fame");
  revalidatePath("/admin");
}
