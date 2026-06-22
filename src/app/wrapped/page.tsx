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
import WrappedView from "@/components/WrappedView";

export const dynamic = "force-dynamic";

export default async function WrappedPage() {
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
        <h1 className="mb-2 text-xl font-bold">Jouw Wrapped</h1>
        <p className="text-stone-600">
          Jouw persoonlijke overzicht verschijnt zodra de uitslag bekend is.
        </p>
      </div>
    );
  }

  const catResults = computeCategoryResults(categories, photos, votes, participants);
  const leaderboard = computeLeaderboard(catResults, participants);

  const pointsOf = (photoId: string) =>
    votes.filter((v) => v.photo_id === photoId).reduce((s, v) => s + v.points, 0);

  const catName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? "?";

  const myPhotos = photos.filter((p) => p.participant_id === user.id);
  const myStats = myPhotos
    .map((p) => ({
      url: photoPublicUrl(p.storage_path),
      category: catName(p.category_id),
      points: pointsOf(p.id),
    }))
    .sort((a, b) => b.points - a.points);

  const myEntry = leaderboard.find((e) => e.participantId === user.id);
  const rank =
    leaderboard.findIndex((e) => e.participantId === user.id) + 1 || leaderboard.length;
  const totalPoints = myEntry?.totalPoints ?? 0;
  const wins = myEntry?.categoryWins ?? 0;
  const bestPhoto = myStats[0] ?? null;

  // Een grappige titel op basis van de prestaties.
  let title = "De Deelnemer";
  let titleEmoji = "📸";
  if (rank === 1) {
    title = "De Kampioen";
    titleEmoji = "👑";
  } else if (wins >= 2) {
    title = "Categorie-koning";
    titleEmoji = "🏅";
  } else if (wins === 1) {
    title = "Categoriewinnaar";
    titleEmoji = "🥇";
  } else if (rank <= 3 && leaderboard.length > 3) {
    title = "Podiumganger";
    titleEmoji = "🏆";
  } else if (myPhotos.length > 0) {
    title = "Trouwe Fotograaf";
    titleEmoji = "🌟";
  }

  return (
    <WrappedView
      competition={settings.competition_name}
      name={user.name}
      photosCount={myPhotos.length}
      totalPoints={totalPoints}
      wins={wins}
      rank={rank}
      totalParticipants={leaderboard.length}
      bestPhoto={bestPhoto}
      title={title}
      titleEmoji={titleEmoji}
    />
  );
}
