import { requireUser } from "@/lib/auth";
import {
  getSettings,
  getCategories,
  getPhotos,
  getVotesByVoter,
} from "@/lib/db";
import { photoPublicUrl } from "@/lib/supabase";
import VoteCategory from "@/components/VoteCategory";

export const dynamic = "force-dynamic";

export default async function VotePage() {
  const user = await requireUser();
  const [settings, categories, allPhotos, myVotes] = await Promise.all([
    getSettings(),
    getCategories(),
    getPhotos(),
    getVotesByVoter(user.id),
  ]);

  if (settings.phase !== "voting") {
    return (
      <div className="card text-center">
        <h1 className="text-xl font-bold mb-2">Stemmen</h1>
        <p className="text-stone-600">
          Stemmen is op dit moment niet open. Status:{" "}
          <span className="font-medium">{settings.phase}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-xl font-bold mb-1">Stemmen</h1>
        <p className="text-sm text-stone-600">
          Kies per categorie je top 3. Je 1e plek krijgt 3 punten, je 2e 2 punten
          en je 3e 1 punt. Je stemt anoniem en je eigen foto's zie je hier niet.
          Je kunt je keuze aanpassen zolang het stemmen open is.
        </p>
      </div>

      {categories.length === 0 && (
        <div className="card text-stone-500 text-sm">Er zijn nog geen categorieën.</div>
      )}

      {categories.map((cat) => {
        const photos = allPhotos
          .filter((p) => p.category_id === cat.id && p.participant_id !== user.id)
          .map((p) => ({
            id: p.id,
            url: photoPublicUrl(p.storage_path),
            caption: p.caption,
          }));

        const initialRanking = [1, 2, 3].map((rank) => {
          const v = myVotes.find(
            (vote) => vote.category_id === cat.id && vote.rank === rank
          );
          return v?.photo_id ?? "";
        });

        return (
          <VoteCategory
            key={cat.id}
            categoryId={cat.id}
            categoryName={cat.name}
            description={cat.description}
            photos={photos}
            initialRanking={initialRanking}
          />
        );
      })}
    </div>
  );
}
