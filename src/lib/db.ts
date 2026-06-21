import { getSupabaseAdmin } from "./supabase";
import type {
  Category,
  Participant,
  Photo,
  Settings,
  Vote,
} from "./types";

export async function getSettings(): Promise<Settings> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from("settings").select("*").eq("id", 1).single();
  if (error) throw error;
  return data as Settings;
}

export async function updateSettings(
  patch: Partial<
    Pick<Settings, "competition_name" | "num_days" | "phase" | "start_date">
  >
): Promise<void> {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("settings").update(patch).eq("id", 1);
  if (error) throw error;
}

export async function getParticipants(): Promise<Participant[]> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("participants")
    .select("id, name, is_admin, created_at")
    .order("name");
  if (error) throw error;
  return (data ?? []) as Participant[];
}

export async function countParticipants(): Promise<number> {
  const sb = getSupabaseAdmin();
  const { count, error } = await sb
    .from("participants")
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

export async function getParticipantWithCode(name: string) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("participants")
    .select("id, name, is_admin, code_hash")
    .eq("name", name)
    .maybeSingle();
  if (error) throw error;
  return data as
    | { id: string; name: string; is_admin: boolean; code_hash: string }
    | null;
}

export async function createParticipant(
  name: string,
  codeHash: string,
  isAdmin: boolean
): Promise<void> {
  const sb = getSupabaseAdmin();
  const { error } = await sb
    .from("participants")
    .insert({ name, code_hash: codeHash, is_admin: isAdmin });
  if (error) throw error;
}

export async function deleteParticipant(id: string): Promise<void> {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("participants").delete().eq("id", id);
  if (error) throw error;
}

export async function getCategories(): Promise<Category[]> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("categories")
    .select("*")
    .order("sort_order")
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function createCategory(
  name: string,
  description: string,
  sortOrder: number
): Promise<void> {
  const sb = getSupabaseAdmin();
  const { error } = await sb
    .from("categories")
    .insert({ name, description, sort_order: sortOrder });
  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function getPhotos(): Promise<Photo[]> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("photos")
    .select("*")
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as Photo[];
}

export async function getPhotosByParticipant(
  participantId: string
): Promise<Photo[]> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("photos")
    .select("*")
    .eq("participant_id", participantId)
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as Photo[];
}

export async function getPhotosByCategory(
  categoryId: string
): Promise<Photo[]> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("photos")
    .select("*")
    .eq("category_id", categoryId)
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as Photo[];
}

export async function insertPhoto(photo: {
  participant_id: string;
  category_id: string;
  day_number: number;
  storage_path: string;
  caption: string;
}): Promise<void> {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("photos").insert(photo);
  if (error) throw error;
}

export async function deletePhoto(id: string, participantId: string) {
  const sb = getSupabaseAdmin();
  // Verwijder alleen je eigen foto.
  const { error } = await sb
    .from("photos")
    .delete()
    .eq("id", id)
    .eq("participant_id", participantId);
  if (error) throw error;
}

export async function getVotes(): Promise<Vote[]> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from("votes").select("*");
  if (error) throw error;
  return (data ?? []) as Vote[];
}

export async function getVotesByVoter(voterId: string): Promise<Vote[]> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("votes")
    .select("*")
    .eq("voter_id", voterId);
  if (error) throw error;
  return (data ?? []) as Vote[];
}

/** Vervang alle stemmen van een kiezer in één categorie in één transactie-achtige reeks. */
export async function replaceVotesForCategory(
  voterId: string,
  categoryId: string,
  rankedPhotoIds: { photoId: string; rank: number; points: number }[]
): Promise<void> {
  const sb = getSupabaseAdmin();
  const { error: delErr } = await sb
    .from("votes")
    .delete()
    .eq("voter_id", voterId)
    .eq("category_id", categoryId);
  if (delErr) throw delErr;

  if (rankedPhotoIds.length === 0) return;

  const rows = rankedPhotoIds.map((r) => ({
    voter_id: voterId,
    category_id: categoryId,
    photo_id: r.photoId,
    rank: r.rank,
    points: r.points,
  }));
  const { error: insErr } = await sb.from("votes").insert(rows);
  if (insErr) throw insErr;
}
