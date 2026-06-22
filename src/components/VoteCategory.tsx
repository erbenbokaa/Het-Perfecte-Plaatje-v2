"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveVotesAction } from "@/app/actions/votes";
import RankBadge from "@/components/RankBadge";

export interface VotePhoto {
  id: string;
  url: string;
  caption: string;
}

const RANK_LABEL: Record<number, string> = { 1: "1e", 2: "2e", 3: "3e" };
const RANK_COLOR: Record<number, string> = {
  1: "bg-gradient-to-br from-yellow-300 to-amber-500 text-white",
  2: "bg-gradient-to-br from-slate-300 to-slate-500 text-white",
  3: "bg-gradient-to-br from-orange-300 to-amber-700 text-white",
};

export default function VoteCategory({
  categoryId,
  categoryName,
  description,
  photos,
  initialRanking,
  locked,
}: {
  categoryId: string;
  categoryName: string;
  description: string;
  photos: VotePhoto[];
  initialRanking: string[]; // geordend [1e, 2e, 3e]
  locked: boolean;
}) {
  const router = useRouter();
  const initial: Record<string, number> = {};
  initialRanking.forEach((pid, i) => {
    if (pid) initial[pid] = i + 1;
  });

  const [ranks, setRanks] = useState<Record<string, number>>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function setRank(photoId: string, rank: number) {
    setMsg(null);
    setRanks((prev) => {
      const next: Record<string, number> = { ...prev };
      if (next[photoId] === rank) {
        delete next[photoId];
        return next;
      }
      for (const id of Object.keys(next)) {
        if (next[id] === rank) delete next[id];
      }
      next[photoId] = rank;
      return next;
    });
  }

  async function save() {
    const ordered: string[] = [];
    for (let r = 1; r <= 3; r++) {
      const found = Object.keys(ranks).find((id) => ranks[id] === r);
      if (found) ordered.push(found);
    }
    if (ordered.length === 0) {
      setMsg({ type: "err", text: "Kies minstens één foto." });
      return;
    }
    if (
      !window.confirm(
        "Weet je het zeker? Je stem voor deze categorie staat hierna vast en kan niet meer gewijzigd worden."
      )
    ) {
      return;
    }
    setBusy(true);
    setMsg(null);
    const res = await saveVotesAction(categoryId, ordered);
    setBusy(false);
    if (res?.ok) {
      router.refresh();
    } else {
      setMsg({ type: "err", text: res?.error ?? "Er ging iets mis." });
    }
  }

  const chosen = Object.keys(ranks).length;

  // ---- Vergrendelde weergave: al gestemd ----
  if (locked) {
    const chosenPhotos = photos.filter((p) => initial[p.id]);
    return (
      <div className="card">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{categoryName}</h2>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            ✓ gestemd
          </span>
        </div>
        <p className="mb-3 text-sm text-stone-500">Je stem staat vast.</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
          {chosenPhotos
            .sort((a, b) => initial[a.id] - initial[b.id])
            .map((p) => (
              <div key={p.id} className="relative overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="foto" className="h-32 w-full object-cover" />
                <RankBadge
                  rank={initial[p.id]}
                  className="absolute left-1.5 top-1.5 h-7 w-7 text-sm"
                />
              </div>
            ))}
        </div>
      </div>
    );
  }

  // ---- Stemmen ----
  return (
    <div className="card">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">{categoryName}</h2>
        <span className="text-xs text-stone-500">{chosen}/3 gekozen</span>
      </div>
      {description && <p className="mb-3 text-sm text-stone-500">{description}</p>}

      {photos.length === 0 ? (
        <p className="text-sm text-stone-500">
          Geen foto's om op te stemmen (je eigen foto's tellen niet mee).
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((p) => {
              const r = ranks[p.id];
              return (
                <div
                  key={p.id}
                  className={
                    "overflow-hidden rounded-lg border-2 " +
                    (r ? "border-sunset" : "border-stone-200")
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="foto" className="h-40 w-full object-cover" />
                  <div className="flex">
                    {[1, 2, 3].map((rank) => (
                      <button
                        key={rank}
                        type="button"
                        onClick={() => setRank(p.id, rank)}
                        className={
                          "flex-1 border-t border-stone-200 py-2 text-xs font-semibold transition " +
                          (r === rank
                            ? RANK_COLOR[rank]
                            : "bg-white text-stone-600 hover:bg-stone-50")
                        }
                      >
                        {RANK_LABEL[rank]}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {msg && (
            <div
              className={
                "mt-3 rounded-lg px-4 py-2 text-sm " +
                (msg.type === "ok"
                  ? "border border-green-200 bg-green-50 text-green-700"
                  : "border border-red-200 bg-red-50 text-red-700")
              }
            >
              {msg.text}
            </div>
          )}

          <p className="mt-3 text-xs text-amber-700">
            ⚠️ Let op: na opslaan kun je je stem voor deze categorie niet meer wijzigen.
          </p>
          <button onClick={save} className="btn-primary mt-2" disabled={busy}>
            {busy ? "Opslaan…" : "Stem opslaan"}
          </button>
        </>
      )}
    </div>
  );
}
