import { requireUser } from "@/lib/auth";
import { getSettings, getCategories, getPhotosByParticipant } from "@/lib/db";
import { photoPublicUrl } from "@/lib/supabase";
import { deletePhotoAction } from "@/app/actions/photos";
import UploadForm from "@/components/UploadForm";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const user = await requireUser();
  const [settings, categories, myPhotos] = await Promise.all([
    getSettings(),
    getCategories(),
    getPhotosByParticipant(user.id),
  ]);

  if (settings.phase !== "upload") {
    return (
      <div className="card text-center">
        <h1 className="text-xl font-bold mb-2">📤 Uploaden</h1>
        <p className="text-stone-600">
          Uploaden is op dit moment niet open. Status:{" "}
          <span className="font-medium">{settings.phase}</span>.
        </p>
      </div>
    );
  }

  const catName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? "?";

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-xl font-bold mb-1">📤 Foto uploaden</h1>
        <p className="text-sm text-stone-600 mb-4">
          Kies een categorie en de dag waarop je de foto gemaakt hebt. Je kunt
          per categorie meerdere foto's insturen.
        </p>
        {categories.length === 0 ? (
          <p className="text-stone-500 text-sm">
            Er zijn nog geen categorieën aangemaakt. Vraag de beheerder.
          </p>
        ) : (
          <UploadForm categories={categories} numDays={settings.num_days} />
        )}
      </div>

      <div className="card">
        <h2 className="font-semibold mb-3">
          Mijn foto's ({myPhotos.length})
        </h2>
        {myPhotos.length === 0 ? (
          <p className="text-stone-500 text-sm">Nog niets ingestuurd.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {myPhotos.map((p) => (
              <div key={p.id} className="rounded-lg overflow-hidden border border-stone-200 bg-stone-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPublicUrl(p.storage_path)}
                  alt={p.caption || catName(p.category_id)}
                  className="w-full h-32 object-cover"
                />
                <div className="p-2 text-xs">
                  <div className="font-medium">{catName(p.category_id)}</div>
                  <div className="text-stone-500">Dag {p.day_number}</div>
                  {p.caption && <div className="text-stone-500 italic">{p.caption}</div>}
                  <form action={deletePhotoAction} className="mt-1">
                    <input type="hidden" name="photo_id" value={p.id} />
                    <button className="text-red-600 hover:underline">verwijderen</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
