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

  return (
    <div className="space-y-5">
      {/* Dag-aftellen */}
      <div className="card">
        <p className="text-sm font-medium text-stone-500">Hoi {user.name}!</p>

        {started && settings.phase !== "setup" ? (
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
          </>
        ) : (
          <p className="mt-2 text-stone-600">
            {settings.phase === "results"
              ? "De wedstrijd is afgelopen — bekijk de uitslag!"
              : "De wedstrijd is nog niet begonnen."}
            {user.is_admin && !started && (
              <span className="mt-1 block text-sm text-stone-400">
                Stel de startdatum in bij Beheer om de dagen te laten tellen.
              </span>
            )}
          </p>
        )}

        {categories.length > 0 && settings.phase === "upload" && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/60 px-4 py-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-stone-600">
                Jouw inzendingen
              </p>
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
          gradient="from-orange-400 to-rose-400"
          active={settings.phase === "upload"}
          lockedSub="Nu niet open"
        />
        <Tile
          href="/gallery"
          label="Galerij"
          sub="Bekijk alle foto's"
          Icon={GalleryIcon}
          gradient="from-sky-400 to-cyan-500"
          active={settings.phase !== "setup"}
          lockedSub="Binnenkort"
        />
        <Tile
          href="/vote"
          label="Stemmen"
          sub="Kies je top 3"
          Icon={StarIcon}
          gradient="from-violet-400 to-fuchsia-500"
          active={settings.phase === "voting"}
          lockedSub="Nog niet open"
        />
        <Tile
          href="/results"
          label="Uitslag"
          sub="Wie wint?"
          Icon={TrophyIcon}
          gradient="from-amber-400 to-orange-500"
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
  gradient,
  active,
  lockedSub,
}: {
  href: string;
  label: string;
  sub: string;
  Icon: (p: { className?: string }) => JSX.Element;
  gradient: string;
  active: boolean;
  lockedSub: string;
}) {
  const inner = (
    <>
      <span
        className={
          "flex h-12 w-12 items-center justify-center rounded-2xl text-white " +
          (active ? `bg-gradient-to-br ${gradient}` : "bg-stone-300")
        }
      >
        {active ? <Icon className="h-6 w-6" /> : <LockIcon className="h-5 w-5" />}
      </span>
      <div className="mt-3">
        <p className={"font-bold " + (active ? "text-stone-800" : "text-stone-400")}>
          {label}
        </p>
        <p className="text-xs text-stone-400">{active ? sub : lockedSub}</p>
      </div>
    </>
  );

  if (!active) {
    return <div className="card !p-5 opacity-70">{inner}</div>;
  }
  return (
    <Link href={href} className="card !p-5 transition active:scale-[0.98]">
      {inner}
    </Link>
  );
}
