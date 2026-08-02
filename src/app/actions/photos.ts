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
import { currentDayNumber, nlDate, todayInNL } from "@/lib/competition";

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB (alleen voor de fallback-route)
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const ALLOWED_EXT = ["jpg", "jpeg", "png", "webp", "heic", "heif"];

type UploadCheck = { error: string } | { dayNumber: number };

/**
 * Controleert of deze deelnemer nu een foto mag inleveren in deze categorie.
 * Geeft het dagnummer terug als het mag.
 */
async function checkCanUpload(
  userId: string,
  categoryId: string
): Promise<UploadCheck> {
  const settings = await getSettings();
  if (settings.phase !== "upload") {
    return { error: "Uploaden is op dit moment niet open." };
  }
  if (!categoryId) return { error: "Kies een categorie." };

  const categories = await getCategories();
  if (!categories.some((c) => c.id === categoryId)) {
    return { error: "Onbekende categorie." };
  }

  const mine = await getPhotosByParticipant(userId);

  // Maximaal één foto per (echte) kalenderdag, los van de startdatum.
  const today = todayInNL();
  if (mine.some((p) => nlDate(p.created_at) === today)) {
    return {
      error: "Je hebt vandaag al een foto ingeleverd. Kom morgen terug voor de volgende dag!",
    };
  }

  // Elke categorie maar één keer, en definitief.
  if (mine.some((p) => p.category_id === categoryId)) {
    return { error: "Je hebt voor deze categorie al een foto ingeleverd." };
  }

  return {
    dayNumber: currentDayNumber(settings.start_date, settings.num_days),
  };
}

/**
 * Stap 1 van de directe upload: controleert de spelregels en geeft een
 * eenmalige upload-link terug. De browser stuurt de foto daarmee rechtstreeks
 * naar de opslag, zodat de originele kwaliteit behouden blijft.
 */
export async function prepareUploadAction(
  categoryId: string,
  ext: string
): Promise<
  | { ok: true; signedUrl: string; path: string }
  | { ok: false; error: string }
> {
  const user = await requireUser();
  const check = await checkCanUpload(user.id, categoryId);
  if ("error" in check) return { ok: false, error: check.error };

  const safeExt = ALLOWED_EXT.includes(ext.toLowerCase()) ? ext.toLowerCase() : "jpg";
  // Willekeurige bestandsnaam zodat de URL de inzender niet verraadt.
  const path = `${crypto.randomUUID()}.${safeExt}`;

  const sb = getSupabaseAdmin();
  const { data, error } = await sb.storage
    .from(PHOTO_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    return { ok: false, error: "Kon de upload niet voorbereiden." };
  }
  return { ok: true, signedUrl: data.signedUrl, path };
}

/**
 * Stap 2: nadat de foto in de opslag staat, leggen we de inzending vast.
 * De spelregels worden opnieuw gecontroleerd; is er intussen toch al een foto
 * ingeleverd, dan ruimen we het geüploade bestand weer op.
 */
export async function finalizePhotoAction(
  categoryId: string,
  path: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireUser();
  const sb = getSupabaseAdmin();

  const check = await checkCanUpload(user.id, categoryId);
  if ("error" in check) {
    await sb.storage.from(PHOTO_BUCKET).remove([path]);
    return { ok: false, error: check.error };
  }

  try {
    await insertPhoto({
      participant_id: user.id,
      category_id: categoryId,
      day_number: check.dayNumber,
      storage_path: path,
      caption: "",
    });
  } catch (err) {
    await sb.storage.from(PHOTO_BUCKET).remove([path]);
    const detail = err instanceof Error ? err.message : "onbekende fout";
    return { ok: false, error: "Opslaan mislukt: " + detail };
  }

  revalidatePath("/upload");
  revalidatePath("/gallery");
  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Reserve-route: upload via de server. Wordt alleen gebruikt als de directe
 * upload niet lukt. De browser verkleint de foto dan eerst.
 */
export async function uploadPhotoAction(formData: FormData) {
  const user = await requireUser();

  const categoryId = String(formData.get("category_id") ?? "");
  const check = await checkCanUpload(user.id, categoryId);
  if ("error" in check) return { ok: false, error: check.error };

  const file = formData.get("photo") as File | null;
  if (!file || file.size === 0) return { ok: false, error: "Kies een foto." };
  if (file.size > MAX_BYTES) return { ok: false, error: "Foto is te groot (max 15 MB)." };
  if (!ALLOWED.includes(file.type)) {
    return { ok: false, error: "Alleen JPG, PNG, WEBP of HEIC." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  try {
    const sb = getSupabaseAdmin();
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error: upErr } = await sb.storage
      .from(PHOTO_BUCKET)
      .upload(path, bytes, { contentType: file.type, upsert: false });
    if (upErr) return { ok: false, error: "Uploaden mislukt: " + upErr.message };

    await insertPhoto({
      participant_id: user.id,
      category_id: categoryId,
      day_number: check.dayNumber,
      storage_path: path,
      caption: "",
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "onbekende fout";
    return { ok: false, error: "Opslaan mislukt: " + detail };
  }

  revalidatePath("/upload");
  revalidatePath("/gallery");
  revalidatePath("/dashboard");
  return { ok: true };
}
