export type Phase = "setup" | "upload" | "voting" | "results";

export interface Participant {
  id: string;
  name: string;
  is_admin: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  sort_order: number;
  created_at: string;
}

export interface Photo {
  id: string;
  participant_id: string;
  category_id: string;
  day_number: number;
  storage_path: string;
  caption: string;
  created_at: string;
}

export interface Vote {
  id: string;
  voter_id: string;
  category_id: string;
  photo_id: string;
  rank: number;
  points: number;
  created_at: string;
}

export interface Settings {
  id: number;
  competition_name: string;
  num_days: number;
  phase: Phase;
  start_date: string | null;
}

export interface SessionUser {
  id: string;
  name: string;
  is_admin: boolean;
}

// Punten per positie in je top 3.
export const POINTS_BY_RANK: Record<number, number> = { 1: 3, 2: 2, 3: 1 };
