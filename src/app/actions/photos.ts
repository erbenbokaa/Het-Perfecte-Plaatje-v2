"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  getSettings,
  insertPhoto,
  getPhotosByParticipant,
  getCategories,
} from "@/lib/db";
import { getSupabaseAdmin, PHOTO_BUCKET } from "@/lib/supabase";
import { currentDayNumber } from "@/lib/competition";

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export async function uploadPhotoAction(formData: FormData) {
  const user = await requireUser();
  const settings = await getSettings();
  if (settings.phase !== "upload") {
    return { ok: false, error: "Uploaden is op dit moment niet open." };
  }

  const categoryId = String(formData.get("category_id") ?? "");
  const file = formData.get("photo") as File | null;

  if (!categoryId) return { ok: false, error: "Kies een categorie." };

  // Geldige categorie?
  const categories = await getCategories();
  if (!categories.some((c) => c.id === categoryId)) {
    return { ok: false, error: "Onbekende categorie." };
  }

  // Dag wordt automatisch bepaald op basis van de startdatum (wisselt om middernacht).
  const dayNumber = currentDayNumber(settings.start_date, settings.num_days);

  const mine = await getPhotosByParticipant(user.id);

  // Maximaal één foto per dag.
  if (mine.some((p) => p.day_number === dayNumber)) {
    return {
      ok: false,
      error: "Je hebt vandaag al een foto ingeleverd. Kom morgen terug voor de volgende dag!",
    };
  }

  // Elke categorie maar één keer, en definitief.
  if (mine.some((p) => p.category_id === categoryId)) {
    return {
      ok: false,
      error: "Je hebt voor deze categorie al een foto ingeleverd.",
    };
  }

  if (!file || file.size === 0) return { ok: false, error: "Kies een foto." };
  if (file.size > MAX_BYTES) return { ok: false, error: "Foto is te groot (max 15 MB)." };
  if (!ALLOWED.includes(file.type)) {
    return { ok: false, error: "Alleen JPG, PNG, WEBP of HEIC." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  // Willekeurige bestandsnaam zodat de URL de inzender niet verraadt.
  const path = `${crypto.randomUUID()}.${ext}`;

  const sb = getSupabaseAdmin();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: upErr } = await sb.storage
    .from(PHOTO_BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (upErr) return { ok: false, error: "Uploaden mislukt: " + upErr.message };

  await insertPhoto({
    participant_id: user.id,
    category_id: categoryId,
    day_number: dayNumber,
    storage_path: path,
    caption: "",
  });

  revalidatePath("/upload");
  revalidatePath("/gallery");
  revalidatePath("/dashboard");
  return { ok: true };
}
