import { requireUser } from "@/lib/auth";
import {
  getSettings,
  getCategories,
  getPhotos,
  getVotes,
  getParticipants,
} from "@/lib/db";
import { photoPublicUrl } from "@/lib/supabase";
import { computeCategoryResults, computeLeaderboard } from "@/lib/scoring";
import RankBadge from "@/components/RankBadge";
import { TrophyIllustration } from "@/components/illustrations";

export const dynamic = "force-dynamic";


export default async function ResultsPage() {
  const user = await requireUser();
  const [settings, categories, photos, votes, participants] = await Promise.all([
    getSettings(),
    getCategories(),
    getPhotos(),
    getVotes(),
    getParticipants(),
  ]);

  const isPreview = settings.phase !== "results";
  if (isPreview && !user.is_admin) {
    return (
      <div className="card text-center">
        <h1 className="text-xl font-bold mb-2">🏆 Uitslag</h1>
        <p className="text-stone-600">
          De uitslag is nog niet bekendgemaakt. Even geduld tot het stemmen
          gesloten is!
        </p>
      </div>
    );
  }

  const categoryResults = computeCategoryResults(categories, photos, votes, participants);
  const leaderboard = computeLeaderboard(categoryResults, participants);

  return (
    <div className="space-y-6">
      {isPreview && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 text-sm">
          👀 Voorvertoning (alleen beheerder). De uitslag is nog niet vrijgegeven
          voor de familie.
        </div>
      )}

      <div className="card">
        <h1 className="mb-4 flex items-center gap-2 text-2xl font-bold">
          <TrophyIllustration className="h-8 w-8" />
          Totaalklassement
        </h1>
        <ol className="space-y-2">
          {leaderboard.map((entry, i) => (
            <li
              key={entry.participantId}
              className={
                "flex items-center justify-between rounded-lg px-4 py-3 " +
                (i === 0 ? "bg-yellow-50 border border-yellow-200" : "bg-stone-50")
              }
            >
              <span className="flex items-center gap-3">
                {i < 3 ? (
                  <RankBadge rank={i + 1} />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center text-sm font-semibold text-stone-400">
                    {i + 1}
                  </span>
                )}
                <span className="font-medium">{entry.participantName}</span>
                {entry.categoryWins > 0 && (
                  <span className="text-xs text-stone-500">
                    {entry.categoryWins}× categorie gewonnen
                  </span>
                )}
              </span>
              <span className="font-bold text-ocean">{entry.totalPoints} pt</span>
            </li>
          ))}
        </ol>
      </div>

      {categoryResults.map(({ category, photos: results }) => (
        <div key={category.id} className="card">
          <h2 className="text-lg font-semibold mb-1">{category.name}</h2>
          {category.description && (
            <p className="text-sm text-stone-500 mb-3">{category.description}</p>
          )}
          {results.length === 0 ? (
            <p className="text-sm text-stone-500">Geen inzendingen.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {results.map((r, i) => (
                <div
                  key={r.photo.id}
                  className={
                    "rounded-lg overflow-hidden border-2 " +
                    (i === 0 && r.points > 0 ? "border-yellow-400" : "border-stone-200")
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPublicUrl(r.photo.storage_path)}
                    alt={r.photo.caption || category.name}
                    className="w-full h-36 object-cover"
                  />
                  <div className="p-2 text-xs">
                    <div className="flex items-center justify-between gap-1">
                      <span className="flex min-w-0 items-center gap-1.5 font-medium">
                        {i < 3 && <RankBadge rank={i + 1} className="h-5 w-5 text-[11px]" />}
                        <span className="truncate">{r.participantName}</span>
                      </span>
                      <span className="shrink-0 font-bold text-ocean">{r.points} pt</span>
                    </div>
                    {r.photo.caption && (
                      <div className="text-stone-500 italic truncate">{r.photo.caption}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
