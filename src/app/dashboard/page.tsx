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
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold">Hoi {user.name}! 👋</h1>
            <p className="text-stone-600">
              Status:{" "}
              <span className="font-semibold text-ocean">
                {PHASE_LABEL[settings.phase]}
              </span>
            </p>
          </div>
          <div className="text-right text-sm text-stone-500">
            <div>{participants.length} deelnemers</div>
            <div>{categories.length} categorieën · {settings.num_days} dagen</div>
          </div>
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
