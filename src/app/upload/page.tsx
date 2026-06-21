import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getSettings, getCategories, getPhotosByParticipant } from "@/lib/db";
import { photoPublicUrl } from "@/lib/supabase";
import { currentDayNumber } from "@/lib/competition";
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
          Uploaden is op dit moment niet open.
        </p>
      </div>
    );
  }

  const dayByCategory = new Map(myPhotos.map((p) => [p.category_id, p]));
  const remaining = categories.filter((c) => !dayByCategory.has(c.id));
  const doneCount = categories.length - remaining.length;
  const currentDay = currentDayNumber(settings.start_date, settings.num_days);
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "?";

  return (
    <div className="space-y-6">
      {/* Checklist */}
      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">Mijn categorieën</h1>
          <span className="rounded-full bg-ocean/10 px-3 py-1 text-sm font-semibold text-ocean">
            {doneCount}/{categories.length} klaar
          </span>
        </div>
        {categories.length === 0 ? (
          <p className="text-sm text-stone-500">
            Er zijn nog geen categorieën aangemaakt. Vraag de beheerder.
          </p>
        ) : (
          <ul className="space-y-2">
            {categories.map((c) => {
              const photo = dayByCategory.get(c.id);
              const done = Boolean(photo);
              return (
                <li
                  key={c.id}
                  className={
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 " +
                    (done ? "bg-green-50" : "bg-stone-50")
                  }
                >
                  <span
                    className={
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm " +
                      (done ? "bg-green-500 text-white" : "border-2 border-stone-300 text-transparent")
                    }
                  >
                    ✓
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={"font-medium " + (done ? "text-stone-700" : "text-stone-800")}>
                      {c.name}
                    </span>
                    {c.description && (
                      <span className="block truncate text-xs text-stone-400">{c.description}</span>
                    )}
                  </span>
                  {done && (
                    <span className="shrink-0 text-xs text-green-600">
                      dag {photo!.day_number}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Uploadformulier */}
      {categories.length > 0 && (
        <div className="card">
          <h2 className="mb-1 text-lg font-semibold">📤 Foto inleveren</h2>
          {remaining.length === 0 ? (
            <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
              🎉 Je hebt voor elke categorie een foto ingeleverd. Helemaal klaar!
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-stone-600">
                Kies een categorie die je nog moet doen en lever je foto in.
              </p>
              <UploadForm remainingCategories={remaining} currentDay={currentDay} />
            </>
          )}
        </div>
      )}

      {/* Mijn inzendingen (definitief) */}
      <div className="card">
        <h2 className="mb-3 font-semibold">Mijn inzendingen ({myPhotos.length})</h2>
        {myPhotos.length === 0 ? (
          <p className="text-sm text-stone-500">Nog niets ingeleverd.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {myPhotos.map((p) => (
              <div key={p.id} className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPublicUrl(p.storage_path)}
                  alt={catName(p.category_id)}
                  className="h-32 w-full object-cover"
                />
                <div className="p-2 text-xs">
                  <div className="font-medium">{catName(p.category_id)}</div>
                  <div className="text-stone-500">Dag {p.day_number}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {myPhotos.length > 0 && (
          <Link href="/gallery" className="btn-secondary mt-4 w-full">
            Bekijk alle ingeleverde foto's →
          </Link>
        )}
      </div>
    </div>
  );
}
