import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getSettings, getCategories, getPhotosByParticipant } from "@/lib/db";
import { currentDayNumber } from "@/lib/competition";
import {
  CameraIcon,
  GalleryIcon,
  StarIcon,
  TrophyIcon,
  CogIcon,
  LockIcon,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const [settings, categories, myPhotos] = await Promise.all([
    getSettings(),
    getCategories(),
    getPhotosByParticipant(user.id),
  ]);

  const started = Boolean(settings.start_date);
  const currentDay = currentDayNumber(settings.start_date, settings.num_days);
  const daysToGo = Math.max(settings.num_days - currentDay, 0);
  const progress = settings.num_days > 0 ? (currentDay / settings.num_days) * 100 : 0;
  const doneCats = new Set(myPhotos.map((p) => p.category_id)).size;
  const showDayCounter =
    settings.phase === "upload" || settings.phase === "voting";

  return (
    <div className="space-y-5">
      {/* Bovenkant */}
      <div className="card">
        <p className="text-sm font-medium text-stone-500">Hoi {user.name}!</p>

        {showDayCounter ? (
          <>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-5xl font-extrabold tracking-tight text-stone-800">
                Dag {currentDay}
              </span>
              <span className="mb-1.5 text-lg font-medium text-stone-400">
                / {settings.num_days}
              </span>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-rose-400"
                style={{ width: `${Math.max(progress, 6)}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-stone-500">
              {daysToGo > 0
                ? `Nog ${daysToGo} ${daysToGo === 1 ? "dag" : "dagen"} te gaan`
                : "Dit is de laatste dag!"}
            </p>
            {user.is_admin && !started && (
              <p className="mt-1 text-xs text-stone-400">
                Tip: stel de startdatum in bij Beheer om de dagen te laten tellen.
              </p>
            )}
          </>
        ) : settings.phase === "results" ? (
          <p className="mt-2 text-stone-600">
            De wedstrijd is afgelopen — bekijk de uitslag!
          </p>
        ) : (
          <p className="mt-2 text-stone-600">
            Welkom! De voorbereidingen zijn nog bezig.
          </p>
        )}

        {categories.length > 0 && settings.phase === "upload" && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/60 px-4 py-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-stone-600">Jouw inzendingen</p>
              <p className="text-xs text-stone-400">
                {doneCats}/{categories.length} categorieën klaar
              </p>
            </div>
            <span className="text-lg font-bold text-orange-500">
              {doneCats}/{categories.length}
            </span>
          </div>
        )}
      </div>

      {/* Tegels */}
      <div className="grid grid-cols-2 gap-4">
        <Tile
          href="/upload"
          label="Uploaden"
          sub="Lever je foto in"
          Icon={CameraIcon}
          tile="from-orange-50 to-rose-50"
          badge="from-orange-400 to-rose-400"
          glow="shadow-rose-300/60"
          active={settings.phase === "upload"}
          lockedSub="Nu niet open"
        />
        <Tile
          href="/gallery"
          label="Galerij"
          sub="Bekijk alle foto's"
          Icon={GalleryIcon}
          tile="from-sky-50 to-cyan-50"
          badge="from-sky-400 to-cyan-500"
          glow="shadow-cyan-300/60"
          active={settings.phase !== "setup"}
          lockedSub="Binnenkort"
        />
        <Tile
          href="/vote"
          label="Stemmen"
          sub="Kies je top 3"
          Icon={StarIcon}
          tile="from-violet-50 to-fuchsia-50"
          badge="from-violet-400 to-fuchsia-500"
          glow="shadow-fuchsia-300/60"
          active={settings.phase === "voting"}
          lockedSub="Nog niet open"
        />
        <Tile
          href="/results"
          label="Uitslag"
          sub="Wie wint?"
          Icon={TrophyIcon}
          tile="from-amber-50 to-orange-50"
          badge="from-amber-400 to-orange-500"
          glow="shadow-amber-300/60"
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
  Icon,
  tile,
  badge,
  glow,
  active,
  lockedSub,
}: {
  href: string;
  label: string;
  sub: string;
  Icon: (p: { className?: string }) => JSX.Element;
  tile: string;
  badge: string;
  glow: string;
  active: boolean;
  lockedSub: string;
}) {
  if (!active) {
    return (
      <div className="rounded-[28px] border border-white/60 bg-white/45 p-5 opacity-80">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-300 text-white">
          <LockIcon className="h-6 w-6" />
        </span>
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
      <span
        className={
          "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg " +
          badge +
          " " +
          glow
        }
      >
        <Icon className="h-7 w-7" />
      </span>
      <div className="mt-3">
        <p className="font-bold text-stone-800">{label}</p>
        <p className="text-xs text-stone-500">{sub}</p>
      </div>
    </Link>
  );
}
