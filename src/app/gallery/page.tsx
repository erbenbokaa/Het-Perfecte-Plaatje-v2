import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
  getSettings,
  getCategories,
  getPhotos,
  getPhotosByParticipant,
} from "@/lib/db";
import { photoPublicUrl } from "@/lib/supabase";

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
  const withPhotos = categories
    .map((c) => ({
      category: c,
      photos: allPhotos.filter((p) => p.category_id === c.id),
    }))
    .filter((g) => g.photos.length > 0);

  return (
    <div className="space-y-5">
      <div className="card">
        <h1 className="text-xl font-bold">Galerij</h1>
        <p className="text-sm text-stone-600">
          Alle ingeleverde foto's ({allPhotos.length}), per categorie. Wie welke
          foto maakte blijft geheim tot de uitslag. 🤫
        </p>
      </div>

      {withPhotos.length === 0 && (
        <div className="card text-sm text-stone-500">
          Er zijn nog geen foto's ingeleverd.
        </div>
      )}

      {withPhotos.map(({ category, photos }) => (
        <div key={category.id} className="card">
          <h2 className="font-bold">{category.name}</h2>
          {category.description && (
            <p className="mb-3 text-xs text-stone-400">{category.description}</p>
          )}
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((p) => (
              <div
                key={p.id}
                className="overflow-hidden rounded-2xl bg-white/60"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPublicUrl(p.storage_path)}
                  alt={category.name}
                  className="h-36 w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
