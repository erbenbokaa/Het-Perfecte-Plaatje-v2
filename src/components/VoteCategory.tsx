"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveVotesAction } from "@/app/actions/votes";

export interface VotePhoto {
  id: string;
  url: string;
  caption: string;
}

const RANK_LABEL: Record<number, string> = { 1: "🥇 1e", 2: "🥈 2e", 3: "🥉 3e" };

export default function VoteCategory({
  categoryId,
  categoryName,
  description,
  photos,
  initialRanking,
}: {
  categoryId: string;
  categoryName: string;
  description: string;
  photos: VotePhoto[];
  initialRanking: string[]; // geordend [1e, 2e, 3e]
}) {
  const router = useRouter();
  // photoId -> rank (1,2,3). Afgeleid uit initialRanking.
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
      // Als deze foto die rank al had -> deselecteren.
      if (next[photoId] === rank) {
        delete next[photoId];
        return next;
      }
      // Verwijder de rank bij een eventuele andere foto (rank is uniek).
      for (const id of Object.keys(next)) {
        if (next[id] === rank) delete next[id];
      }
      next[photoId] = rank;
      return next;
    });
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    // Bouw geordende lijst [1e, 2e, 3e].
    const ordered: string[] = [];
    for (let r = 1; r <= 3; r++) {
      const found = Object.keys(ranks).find((id) => ranks[id] === r);
      if (found) ordered.push(found);
    }
    const res = await saveVotesAction(categoryId, ordered);
    setBusy(false);
    if (res?.ok) {
      setMsg({ type: "ok", text: "Stem opgeslagen ✓" });
      router.refresh();
    } else {
      setMsg({ type: "err", text: res?.error ?? "Er ging iets mis." });
    }
  }

  const chosen = Object.keys(ranks).length;

  return (
    <div className="card">
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <h2 className="text-lg font-semibold">{categoryName}</h2>
        <span className="text-xs text-stone-500">{chosen}/3 gekozen</span>
      </div>
      {description && <p className="text-sm text-stone-500 mb-3">{description}</p>}

      {photos.length === 0 ? (
        <p className="text-sm text-stone-500">
          Geen foto's om op te stemmen (je eigen foto's tellen niet mee).
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((p) => {
              const r = ranks[p.id];
              return (
                <div
                  key={p.id}
                  className={
                    "rounded-lg overflow-hidden border-2 " +
                    (r ? "border-sunset" : "border-stone-200")
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.caption || "foto"} className="w-full h-40 object-cover" />
                  {p.caption && (
                    <div className="px-2 py-1 text-xs text-stone-500 italic truncate">
                      {p.caption}
                    </div>
                  )}
                  <div className="flex">
                    {[1, 2, 3].map((rank) => (
                      <button
                        key={rank}
                        type="button"
                        onClick={() => setRank(p.id, rank)}
                        className={
                          "flex-1 py-1.5 text-xs font-medium border-t border-stone-200 transition " +
                          (r === rank
                            ? "bg-sunset text-white"
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
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-700")
              }
            >
              {msg.text}
            </div>
          )}

          <button onClick={save} className="btn-primary mt-4" disabled={busy}>
            {busy ? "Opslaan…" : "Stem opslaan"}
          </button>
        </>
      )}
    </div>
  );
}
