"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getSettings, insertPhoto, deletePhoto, getPhotosByParticipant } from "@/lib/db";
import { getSupabaseAdmin, PHOTO_BUCKET } from "@/lib/supabase";

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export async function uploadPhotoAction(formData: FormData) {
  const user = await requireUser();
  const settings = await getSettings();
  if (settings.phase !== "upload") {
    return { ok: false, error: "Uploaden is op dit moment niet open." };
  }

  const categoryId = String(formData.get("category_id") ?? "");
  const dayNumber = Number(formData.get("day_number") ?? 1);
  const caption = String(formData.get("caption") ?? "").trim().slice(0, 200);
  const file = formData.get("photo") as File | null;

  if (!categoryId) return { ok: false, error: "Kies een categorie." };
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
    day_number: Number.isFinite(dayNumber) && dayNumber > 0 ? dayNumber : 1,
    storage_path: path,
    caption,
  });

  revalidatePath("/upload");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deletePhotoAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const settings = await getSettings();
  // Verwijderen kan alleen tijdens de upload-fase en alleen je eigen foto's.
  if (settings.phase !== "upload") return;

  const photoId = String(formData.get("photo_id") ?? "");
  const mine = await getPhotosByParticipant(user.id);
  const photo = mine.find((p) => p.id === photoId);
  if (!photo) return;

  const sb = getSupabaseAdmin();
  await sb.storage.from(PHOTO_BUCKET).remove([photo.storage_path]);
  await deletePhoto(photoId, user.id);

  revalidatePath("/upload");
  revalidatePath("/dashboard");
}
