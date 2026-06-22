"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  getSettings,
  getPhotosByCategory,
  getVotesByVoter,
  replaceVotesForCategory,
} from "@/lib/db";
import { POINTS_BY_RANK } from "@/lib/types";

/**
 * Slaat de top 3 van een kiezer voor één categorie op.
 * `rankedPhotoIds` is geordend: index 0 = 1e plaats, 1 = 2e, 2 = 3e.
 * Een stem is definitief: opnieuw stemmen in dezelfde categorie wordt geweigerd.
 */
export async function saveVotesAction(
  categoryId: string,
  rankedPhotoIds: string[]
) {
  const user = await requireUser();
  const settings = await getSettings();
  if (settings.phase !== "voting") {
    return { ok: false, error: "Stemmen is op dit moment niet open." };
  }

  // Al gestemd in deze categorie? Dan staat de stem vast.
  const existing = await getVotesByVoter(user.id);
  if (existing.some((v) => v.category_id === categoryId)) {
    return {
      ok: false,
      error: "Je hebt al gestemd in deze categorie. Dat kan niet meer gewijzigd worden.",
    };
  }

  const ids = rankedPhotoIds.filter(Boolean).slice(0, 3);
  if (ids.length === 0) {
    return { ok: false, error: "Kies minstens één foto." };
  }
  if (new Set(ids).size !== ids.length) {
    return { ok: false, error: "Je kunt een foto niet twee keer kiezen." };
  }

  // Valideer dat de foto's bij de categorie horen en niet van de kiezer zijn.
  const photos = await getPhotosByCategory(categoryId);
  const valid = new Set(
    photos.filter((p) => p.participant_id !== user.id).map((p) => p.id)
  );
  for (const id of ids) {
    if (!valid.has(id)) {
      return { ok: false, error: "Ongeldige keuze (eigen foto of niet bestaand)." };
    }
  }

  const ranked = ids.map((photoId, i) => {
    const rank = i + 1;
    return { photoId, rank, points: POINTS_BY_RANK[rank] };
  });

  await replaceVotesForCategory(user.id, categoryId, ranked);
  revalidatePath("/vote");
  revalidatePath("/dashboard");
  return { ok: true };
}
