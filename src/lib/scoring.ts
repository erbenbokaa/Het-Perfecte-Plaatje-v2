import type { Vote, Photo, Participant, Category } from "./types";

export interface PhotoResult {
  photo: Photo;
  participantName: string;
  points: number;
  voteCount: number;
}

export interface CategoryResult {
  category: Category;
  photos: PhotoResult[]; // gesorteerd op punten (hoog -> laag)
}

export interface LeaderboardEntry {
  participantId: string;
  participantName: string;
  totalPoints: number;
  categoryWins: number;
}

const nameOf = (participants: Participant[], id: string) =>
  participants.find((p) => p.id === id)?.name ?? "Onbekend";

/** Resultaten per categorie: punten optellen per foto en sorteren. */
export function computeCategoryResults(
  categories: Category[],
  photos: Photo[],
  votes: Vote[],
  participants: Participant[]
): CategoryResult[] {
  return categories
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((category) => {
      const catPhotos = photos.filter((p) => p.category_id === category.id);
      const results: PhotoResult[] = catPhotos.map((photo) => {
        const photoVotes = votes.filter((v) => v.photo_id === photo.id);
        const points = photoVotes.reduce((sum, v) => sum + v.points, 0);
        return {
          photo,
          participantName: nameOf(participants, photo.participant_id),
          points,
          voteCount: photoVotes.length,
        };
      });
      results.sort((a, b) => b.points - a.points || b.voteCount - a.voteCount);
      return { category, photos: results };
    });
}

/** Totaalklassement over alle categorieën heen. */
export function computeLeaderboard(
  categoryResults: CategoryResult[],
  participants: Participant[]
): LeaderboardEntry[] {
  const totals = new Map<string, { points: number; wins: number }>();
  for (const p of participants) totals.set(p.id, { points: 0, wins: 0 });

  for (const cat of categoryResults) {
    cat.photos.forEach((pr, index) => {
      const entry = totals.get(pr.photo.participant_id);
      if (!entry) return;
      entry.points += pr.points;
      // Winnaar van de categorie krijgt een "win" (alleen bij echte punten).
      if (index === 0 && pr.points > 0) entry.wins += 1;
    });
  }

  return participants
    .map((p) => {
      const t = totals.get(p.id)!;
      return {
        participantId: p.id,
        participantName: p.name,
        totalPoints: t.points,
        categoryWins: t.wins,
      };
    })
    .sort(
      (a, b) =>
        b.totalPoints - a.totalPoints || b.categoryWins - a.categoryWins
    );
}
