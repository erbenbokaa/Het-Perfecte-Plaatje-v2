import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
  getSettings,
  getCategories,
  getPhotosByParticipant,
  getParticipants,
  getVotesByVoter,
} from "@/lib/db";
import type { Phase } from "@/lib/types";

export const dynamic = "force-dynamic";

const PHASE_LABEL: Record<Phase, string> = {
  setup: "Voorbereiden",
  upload: "Foto's uploaden",
  voting: "Stemmen",
  results: "Uitslag bekend",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const [settings, categories, myPhotos, participants, myVotes] =
    await Promise.all([
      getSettings(),
      getCategories(),
      getPhotosByParticipant(user.id),
      getParticipants(),
      getVotesByVoter(user.id),
    ]);

  const votedCategories = new Set(myVotes.map((v) => v.category_id));

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold tracking-tight">Hoi {user.name}! 👋</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ocean/10 px-3 py-1 text-sm font-semibold text-ocean">
            <span className="h-1.5 w-1.5 rounded-full bg-ocean" />
            {PHASE_LABEL[settings.phase]}
          </span>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-500">
            {participants.length} deelnemers
          </span>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-500">
            {categories.length} categorieën · {settings.num_days} dagen
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard
          title="📤 Uploaden"
          active={settings.phase === "upload"}
          href="/upload"
          stat={`${myPhotos.length} foto's ingestuurd`}
          disabledText="Uploaden is nu niet open"
        />
        <DashboardCard
          title="🗳️ Stemmen"
          active={settings.phase === "voting"}
          href="/vote"
          stat={`${votedCategories.size}/${categories.length} categorieën gestemd`}
          disabledText="Stemmen is nog niet open"
        />
        <DashboardCard
          title="🏆 Uitslag"
          active={settings.phase === "results"}
          href="/results"
          stat="Bekijk wie gewonnen heeft"
          disabledText="Uitslag volgt later"
        />
      </div>

      {categories.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-3">Categorieën dit jaar</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {categories.map((c) => (
              <li key={c.id} className="rounded-lg bg-stone-50 px-3 py-2 text-sm">
                <span className="font-medium">{c.name}</span>
                {c.description && (
                  <span className="text-stone-500"> — {c.description}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {user.is_admin && (
        <div className="text-center">
          <Link href="/admin" className="btn-secondary">
            ⚙️ Naar beheer
          </Link>
        </div>
      )}
    </div>
  );
}

function DashboardCard({
  title,
  active,
  href,
  stat,
  disabledText,
}: {
  title: string;
  active: boolean;
  href: string;
  stat: string;
  disabledText: string;
}) {
  if (active) {
    return (
      <Link href={href} className="card hover:shadow-md transition block">
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-stone-600">{stat}</p>
        <p className="mt-2 text-xs font-medium text-ocean">Nu open →</p>
      </Link>
    );
  }
  return (
    <div className="card opacity-60">
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-stone-500">{disabledText}</p>
    </div>
  );
}
