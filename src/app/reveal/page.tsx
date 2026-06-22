import { requireUser } from "@/lib/auth";
import {
  getSettings,
  getCategories,
  getPhotos,
  getVotes,
  getParticipants,
} from "@/lib/db";
import { computeCategoryResults, computeLeaderboard } from "@/lib/scoring";
import { photoPublicUrl } from "@/lib/supabase";
import RevealShow from "@/components/RevealShow";

export const dynamic = "force-dynamic";

export default async function RevealPage() {
  const user = await requireUser();
  const [settings, categories, photos, votes, participants] = await Promise.all([
    getSettings(),
    getCategories(),
    getPhotos(),
    getVotes(),
    getParticipants(),
  ]);

  if (settings.phase !== "results" && !user.is_admin) {
    return (
      <div className="card text-center">
        <h1 className="mb-2 text-xl font-bold">De grote onthulling</h1>
        <p className="text-stone-600">
          De award-show is beschikbaar zodra de uitslag is vrijgegeven.
        </p>
      </div>
    );
  }

  const catResults = computeCategoryResults(categories, photos, votes, participants);
  const leaderboard = computeLeaderboard(catResults, participants);

  const cats = catResults
    .filter((c) => c.photos.length > 0)
    .map((c) => ({
      name: c.category.name,
      description: c.category.description,
      top: c.photos.slice(0, 3).map((pr) => ({
        url: photoPublicUrl(pr.photo.storage_path),
        name: pr.participantName,
        points: pr.points,
      })),
    }));

  const board = leaderboard.map((e) => ({
    name: e.participantName,
    points: e.totalPoints,
    wins: e.categoryWins,
  }));

  return (
    <RevealShow
      competition={settings.competition_name}
      categories={cats}
      leaderboard={board}
    />
  );
}
