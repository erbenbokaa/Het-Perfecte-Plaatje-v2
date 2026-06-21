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
        <h1 className="text-xl font-bold mb-2">🖼️ Galerij</h1>
        <p className="text-stone-600">De wedstrijd is nog niet begonnen.</p>
      </div>
    );
  }

  // Tijdens het uploaden: je ziet de galerij pas nadat je zelf hebt ingeleverd.
  if (settings.phase === "upload" && myPhotos.length === 0) {
    return (
      <div className="card text-center">
        <h1 className="text-xl font-bold mb-2">🖼️ Galerij</h1>
        <p className="text-stone-600 mb-4">
          Lever eerst zelf een foto in om alle ingeleverde foto's te kunnen bekijken.
        </p>
        <Link href="/upload" className="btn-primary">
          Naar uploaden
        </Link>
      </div>
    );
  }

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "?";

  // Groepeer per dag (oplopend).
  const days = Array.from(new Set(allPhotos.map((p) => p.day_number))).sort(
    (a, b) => a - b
  );

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-xl font-bold">🖼️ Galerij</h1>
        <p className="text-sm text-stone-600">
          Alle ingeleverde foto's tot nu toe ({allPhotos.length}). Wie welke foto
          heeft gemaakt blijft geheim — dat hoor je pas bij de uitslag. 🤫
        </p>
      </div>

      {allPhotos.length === 0 && (
        <div className="card text-sm text-stone-500">
          Er zijn nog geen foto's ingeleverd.
        </div>
      )}

      {days.map((day) => {
        const photos = allPhotos.filter((p) => p.day_number === day);
        return (
          <div key={day} className="card">
            <h2 className="mb-3 font-semibold">Dag {day}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((p) => (
                <div
                  key={p.id}
                  className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPublicUrl(p.storage_path)}
                    alt={catName(p.category_id)}
                    className="h-36 w-full object-cover"
                  />
                  <div className="p-2 text-xs font-medium text-stone-600">
                    {catName(p.category_id)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
