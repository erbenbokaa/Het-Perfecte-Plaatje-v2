import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
  getSettings,
  getCategories,
  getPhotos,
  getPhotosByParticipant,
} from "@/lib/db";
import { photoPublicUrl } from "@/lib/supabase";
import GalleryView from "@/components/GalleryView";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const user = await requireUser();
  const [settings, categories, allPhotos, myPhotos] = await Promise.all([
    getSettings(),
    getCategories(),
    getPhotos(),
    getPhotosByParticipant(user.id),
  ]);

  if (settings.phase === "setup") {
    return (
      <div className="card text-center">
        <h1 className="mb-2 text-xl font-bold">Galerij</h1>
        <p className="text-stone-600">De wedstrijd is nog niet begonnen.</p>
      </div>
    );
  }

  // Tijdens het uploaden: je ziet de galerij pas nadat je zelf hebt ingeleverd.
  if (settings.phase === "upload" && myPhotos.length === 0) {
    return (
      <div className="card text-center">
        <h1 className="mb-2 text-xl font-bold">Galerij</h1>
        <p className="mb-4 text-stone-600">
          Lever eerst zelf een foto in om alle ingeleverde foto's te kunnen
          bekijken.
        </p>
        <Link href="/upload" className="btn-primary">
          Naar uploaden
        </Link>
      </div>
    );
  }

  // Alleen categorieën met inzendingen, in de ingestelde volgorde.
  const groups = categories
    .map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      photos: allPhotos
        .filter((p) => p.category_id === c.id)
        .map((p) => ({ id: p.id, url: photoPublicUrl(p.storage_path) })),
    }))
    .filter((g) => g.photos.length > 0);

  return (
    <div className="space-y-5">
      <div className="card">
        <h1 className="text-xl font-bold">Galerij</h1>
        <p className="text-sm text-stone-600">
          Alle ingeleverde foto's ({allPhotos.length}), per categorie. Tik op een
          foto om 'm groot te zien. Wie welke foto maakte blijft geheim tot de
          uitslag. 🤫
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="card text-sm text-stone-500">
          Er zijn nog geen foto's ingeleverd.
        </div>
      ) : (
        <GalleryView groups={groups} />
      )}
    </div>
  );
}
