import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getSettings, getCategories, getPhotosByParticipant } from "@/lib/db";
import { photoPublicUrl } from "@/lib/supabase";
import { currentDayNumber, nlDate, todayInNL } from "@/lib/competition";
import { CheckIcon } from "@/components/icons";
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
        <h1 className="mb-2 text-xl font-bold">Uploaden</h1>
        <p className="text-stone-600">Uploaden is op dit moment niet open.</p>
      </div>
    );
  }

  const photoByCategory = new Map(myPhotos.map((p) => [p.category_id, p]));
  const remaining = categories.filter((c) => !photoByCategory.has(c.id));
  const done = categories.filter((c) => photoByCategory.has(c.id));
  // Nog te doen bovenaan, al gedaan onderaan.
  const orderedCategories = [...remaining, ...done];
  const doneCount = done.length;
  const currentDay = currentDayNumber(settings.start_date, settings.num_days);
  const uploadedToday = myPhotos.some(
    (p) => nlDate(p.created_at) === todayInNL()
  );
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "?";

  return (
    <div className="space-y-5">
      {/* Uploadformulier of dagstatus */}
      {categories.length > 0 && (
        <div className="card">
          <h1 className="mb-1 text-xl font-bold">Foto inleveren</h1>
          {remaining.length === 0 ? (
            <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
              Je hebt voor elke categorie een foto ingeleverd. Helemaal klaar! 🎉
            </div>
          ) : uploadedToday ? (
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Je hebt vandaag al een foto ingeleverd. Morgen mag je er weer één
              kiezen!
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-stone-600">
                Eén foto per dag. Kies een categorie die je nog moet doen.
              </p>
              <UploadForm remainingCategories={remaining} currentDay={currentDay} />
            </>
          )}
        </div>
      )}

      {/* Checklist */}
      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Mijn categorieën</h2>
          <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-600">
            {doneCount}/{categories.length} klaar
          </span>
        </div>
        {categories.length === 0 ? (
          <p className="text-sm text-stone-500">
            Er zijn nog geen categorieën aangemaakt. Vraag de beheerder.
          </p>
        ) : (
          <ul className="space-y-2">
            {orderedCategories.map((c) => {
              const photo = photoByCategory.get(c.id);
              const isDone = Boolean(photo);
              return (
                <li
                  key={c.id}
                  className={
                    "flex items-start gap-3 rounded-2xl px-3 py-3 " +
                    (isDone ? "bg-green-50/70" : "bg-white/60")
                  }
                >
                  <span
                    className={
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full " +
                      (isDone
                        ? "bg-green-500 text-white"
                        : "border-2 border-stone-300")
                    }
                  >
                    {isDone && <CheckIcon className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-medium text-stone-800">{c.name}</span>
                    {c.description && (
                      <span className="block text-xs text-stone-400">
                        {c.description}
                      </span>
                    )}
                  </span>
                  {isDone && (
                    <span className="shrink-0 whitespace-nowrap text-xs font-medium text-green-600">
                      dag {photo!.day_number}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Mijn inzendingen */}
      {myPhotos.length > 0 && (
        <div className="card">
          <h2 className="mb-3 font-bold">Mijn inzendingen ({myPhotos.length})</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {myPhotos.map((p) => (
              <div key={p.id} className="overflow-hidden rounded-2xl bg-white/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPublicUrl(p.storage_path)}
                  alt={catName(p.category_id)}
                  className="h-32 w-full object-cover"
                />
                <div className="p-2 text-xs">
                  <div className="font-medium">{catName(p.category_id)}</div>
                  <div className="text-stone-400">Dag {p.day_number}</div>
                </div>
              </div>
            ))}
          </div>
          <Link href="/gallery" className="btn-secondary mt-4 w-full">
            Bekijk alle ingeleverde foto's
          </Link>
        </div>
      )}
    </div>
  );
}
