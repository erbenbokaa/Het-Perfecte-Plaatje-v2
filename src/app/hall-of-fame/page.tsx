import { requireUser } from "@/lib/auth";
import { getHallOfFame } from "@/lib/db";
import { photoPublicUrl } from "@/lib/supabase";
import { TrophyIllustration } from "@/components/illustrations";
import type { HallOfFameEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HallOfFamePage() {
  await requireUser();
  const entries = await getHallOfFame();

  const years = Array.from(new Set(entries.map((e) => e.year))).sort((a, b) => b - a);

  return (
    <div className="space-y-5">
      <div className="card text-center">
        <TrophyIllustration className="mx-auto h-16 w-16" />
        <h1 className="mt-2 text-2xl font-extrabold">Hall of Fame</h1>
        <p className="text-sm text-stone-500">De winnaars door de jaren heen.</p>
      </div>

      {years.length === 0 && (
        <div className="card text-center text-sm text-stone-500">
          Nog geen winnaars vastgelegd. De beheerder kan een afgeronde wedstrijd
          archiveren bij Beheer.
        </div>
      )}

      {years.map((year) => {
        const champion = entries.find((e) => e.year === year && e.kind === "champion");
        const cats = entries.filter((e) => e.year === year && e.kind === "category");
        return (
          <div key={year} className="card">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-extrabold">{year}</h2>
            </div>

            {champion && (
              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-gradient-to-br from-yellow-300 to-amber-500 px-4 py-3 text-white shadow">
                <span className="text-2xl">👑</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                    Algemeen kampioen
                  </p>
                  <p className="text-lg font-extrabold">{champion.winner_name}</p>
                </div>
                <span className="font-bold">{champion.points}p</span>
              </div>
            )}

            {cats.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {cats.map((c: HallOfFameEntry) => (
                  <div key={c.id} className="overflow-hidden rounded-2xl bg-white/60">
                    {c.photo_path && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoPublicUrl(c.photo_path)}
                        alt={c.title}
                        className="h-28 w-full object-cover"
                      />
                    )}
                    <div className="p-2">
                      <p className="text-xs font-bold text-stone-700">{c.title}</p>
                      <p className="text-xs text-stone-500">
                        {c.winner_name} · {c.points}p
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
