import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getSettings, getCategories, getPhotosByParticipant } from "@/lib/db";
import { currentDayNumber } from "@/lib/competition";
import { CogIcon, LockIcon } from "@/components/icons";
import {
  CameraIllustration,
  GalleryIllustration,
  StarIllustration,
  TrophyIllustration,
} from "@/components/illustrations";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const [settings, categories, myPhotos] = await Promise.all([
    getSettings(),
    getCategories(),
    getPhotosByParticipant(user.id),
  ]);

  const currentDay = currentDayNumber(settings.start_date, settings.num_days);
  const daysToGo = Math.max(settings.num_days - currentDay, 0);
  const progress = settings.num_days > 0 ? (currentDay / settings.num_days) * 100 : 0;
  const doneCats = new Set(myPhotos.map((p) => p.category_id)).size;
  const showDayCounter =
    settings.phase === "upload" || settings.phase === "voting";

  return (
    <div className="space-y-5">
      {/* Compacte bovenkant */}
      <div className="card !p-4">
        {showDayCounter ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xl font-extrabold tracking-tight text-stone-800">
                Dag {currentDay}
                <span className="ml-1 text-sm font-medium text-stone-400">
                  / {settings.num_days}
                </span>
              </p>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600">
                {daysToGo > 0 ? `nog ${daysToGo} ${daysToGo === 1 ? "dag" : "dagen"}` : "laatste dag"}
              </span>
            </div>
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-white/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-rose-400"
                style={{ width: `${Math.max(progress, 6)}%` }}
              />
            </div>
          </>
        ) : (
          <p className="font-semibold text-stone-700">
            {settings.phase === "results"
              ? "De uitslag is bekend!"
              : `Hoi ${user.name}!`}
          </p>
        )}
      </div>

      {/* Tegels met 3D-illustraties */}
      <div className="grid grid-cols-2 gap-4">
        <Tile
          href="/upload"
          label="Uploaden"
          sub={
            settings.phase === "upload"
              ? `${doneCats}/${categories.length} categorieën klaar`
              : "Lever je foto in"
          }
          Illu={CameraIllustration}
          tile="from-orange-50 to-rose-50"
          active={settings.phase === "upload"}
          lockedSub="Nu niet open"
        />
        <Tile
          href="/gallery"
          label="Galerij"
          sub="Bekijk alle foto's"
          Illu={GalleryIllustration}
          tile="from-sky-50 to-cyan-50"
          active={settings.phase !== "setup"}
          lockedSub="Binnenkort"
        />
        <Tile
          href="/vote"
          label="Stemmen"
          sub="Kies je top 3"
          Illu={StarIllustration}
          tile="from-violet-50 to-fuchsia-50"
          active={settings.phase === "voting"}
          lockedSub="Nog niet open"
        />
        <Tile
          href="/results"
          label="Uitslag"
          sub="Wie wint?"
          Illu={TrophyIllustration}
          tile="from-amber-50 to-orange-50"
          active={settings.phase === "results"}
          lockedSub="Volgt later"
        />
      </div>

      {user.is_admin && (
        <Link
          href="/admin"
          className="flex items-center gap-3 rounded-[28px] bg-white/60 px-5 py-4 text-stone-600 transition hover:bg-white/80"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-400 to-slate-600 text-white">
            <CogIcon className="h-5 w-5" />
          </span>
          <span className="font-semibold">Beheer</span>
          <span className="ml-auto text-stone-300">›</span>
        </Link>
      )}
    </div>
  );
}

function Tile({
  href,
  label,
  sub,
  Illu,
  tile,
  active,
  lockedSub,
}: {
  href: string;
  label: string;
  sub: string;
  Illu: (p: { className?: string }) => JSX.Element;
  tile: string;
  active: boolean;
  lockedSub: string;
}) {
  if (!active) {
    return (
      <div className="rounded-[28px] border border-white/60 bg-white/45 p-5 opacity-90">
        <div className="relative h-16 w-16">
          <div className="opacity-30 grayscale">
            <Illu className="h-16 w-16" />
          </div>
          <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-stone-300 text-white">
            <LockIcon className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-3">
          <p className="font-bold text-stone-400">{label}</p>
          <p className="text-xs text-stone-400">{lockedSub}</p>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={
        "rounded-[28px] border border-white/70 bg-gradient-to-br p-5 shadow-[0_12px_30px_-18px_rgba(80,60,40,0.4)] transition active:scale-[0.97] " +
        tile
      }
    >
      <Illu className="h-16 w-16 drop-shadow-sm" />
      <div className="mt-3">
        <p className="font-bold text-stone-800">{label}</p>
        <p className="text-xs text-stone-500">{sub}</p>
      </div>
    </Link>
  );
}
