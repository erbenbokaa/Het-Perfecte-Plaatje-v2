"use client";

import { useState } from "react";
import Link from "next/link";
import RankBadge from "@/components/RankBadge";
import { TrophyIllustration } from "@/components/illustrations";

interface Cat {
  name: string;
  description: string;
  top: { url: string; name: string; points: number }[];
}
interface Board {
  name: string;
  points: number;
  wins: number;
}

function fireConfetti() {
  import("canvas-confetti").then((m) => {
    const confetti = m.default;
    confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
    setTimeout(
      () => confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0 } }),
      150
    );
    setTimeout(
      () => confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1 } }),
      300
    );
  });
}

type Stage = "intro" | "category" | "overall" | "end";

export default function RevealShow({
  competition,
  categories,
  leaderboard,
}: {
  competition: string;
  categories: Cat[];
  leaderboard: Board[];
}) {
  const [stage, setStage] = useState<Stage>("intro");
  const [catIndex, setCatIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  // Aantal onthulde podiumplekken in het eindklassement.
  const [podium, setPodium] = useState(0);

  const cat = categories[catIndex];
  const podiumList = leaderboard.slice(0, 3);

  function startShow() {
    if (categories.length > 0) {
      setStage("category");
      setCatIndex(0);
      setRevealed(false);
    } else {
      setStage("overall");
    }
  }

  function revealWinner() {
    setRevealed(true);
    fireConfetti();
  }

  function nextCategory() {
    if (catIndex + 1 < categories.length) {
      setCatIndex(catIndex + 1);
      setRevealed(false);
    } else {
      setStage("overall");
      setPodium(0);
    }
  }

  function revealNextPodium() {
    const next = podium + 1;
    setPodium(next);
    if (next >= Math.min(podiumList.length, 3)) {
      fireConfetti();
      setTimeout(() => fireConfetti(), 500);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-gradient-to-b from-[#ffe9d3] via-[#fdf4ea] to-[#cfe9dd]">
      <div className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <span className="text-sm font-semibold text-stone-500">{competition}</span>
        <Link
          href="/results"
          className="rounded-full bg-white/70 px-3 py-1.5 text-sm text-stone-600"
        >
          Sluiten ✕
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
        {/* INTRO */}
        {stage === "intro" && (
          <div className="animate-[fadeIn_0.5s_ease]">
            <TrophyIllustration className="mx-auto h-24 w-24" />
            <h1 className="mt-4 text-3xl font-extrabold text-stone-800">
              De grote onthulling
            </h1>
            <p className="mt-2 max-w-sm text-stone-500">
              Tijd voor de prijsuitreiking! We lopen alle categorieën langs en
              eindigen met het algemeen klassement.
            </p>
            <button onClick={startShow} className="btn-primary mt-6 text-lg">
              Start de show
            </button>
          </div>
        )}

        {/* CATEGORIE */}
        {stage === "category" && cat && (
          <div key={catIndex} className="w-full max-w-lg animate-[fadeIn_0.4s_ease]">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
              Categorie {catIndex + 1} / {categories.length}
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-stone-800">{cat.name}</h2>
            {cat.description && (
              <p className="mt-1 text-sm text-stone-500">{cat.description}</p>
            )}

            <div className="relative mx-auto mt-5 overflow-hidden rounded-3xl shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.top[0].url}
                alt="winnende foto"
                className="max-h-[46vh] w-full object-cover"
              />
              {revealed && (
                <span className="absolute left-3 top-3">
                  <RankBadge rank={1} className="h-9 w-9 text-base" />
                </span>
              )}
            </div>

            {!revealed ? (
              <button onClick={revealWinner} className="btn-primary mt-6 text-lg">
                Onthul de winnaar 🎉
              </button>
            ) : (
              <div className="mt-5 animate-[fadeIn_0.4s_ease]">
                <p className="text-stone-500">De winnaar is…</p>
                <p className="text-3xl font-extrabold text-stone-800">
                  {cat.top[0].name}
                </p>
                <p className="font-semibold text-orange-500">
                  {cat.top[0].points} punten
                </p>

                {cat.top.length > 1 && (
                  <div className="mt-4 flex justify-center gap-2 text-sm text-stone-500">
                    {cat.top.slice(1).map((t, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1"
                      >
                        <RankBadge rank={i + 2} className="h-5 w-5 text-[11px]" />
                        {t.name} · {t.points}p
                      </span>
                    ))}
                  </div>
                )}

                <button onClick={nextCategory} className="btn-primary mt-6">
                  {catIndex + 1 < categories.length ? "Volgende categorie →" : "Naar het klassement →"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* OVERALL */}
        {stage === "overall" && (
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-extrabold text-stone-800">Het eindklassement</h2>
            <p className="mt-1 text-sm text-stone-500">Wie wordt Het Perfecte Plaatje-kampioen?</p>

            <div className="mt-6 space-y-3">
              {podiumList.map((entry, i) => {
                const place = i + 1;
                const isShown = podium >= podiumList.length - i; // 3e eerst, 1e laatst
                return (
                  <div
                    key={entry.name}
                    className={
                      "flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-500 " +
                      (isShown
                        ? "bg-white/80 opacity-100"
                        : "bg-white/30 opacity-40 blur-[2px]") +
                      (isShown && place === 1 ? " ring-2 ring-amber-300" : "")
                    }
                  >
                    <RankBadge rank={place} className="h-9 w-9 text-base" />
                    <span className="flex-1 text-left font-bold text-stone-800">
                      {isShown ? entry.name : "???"}
                    </span>
                    {isShown && (
                      <span className="font-extrabold text-orange-500">
                        {entry.points}p
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {podium < Math.min(podiumList.length, 3) ? (
              <button onClick={revealNextPodium} className="btn-primary mt-6 text-lg">
                {podium === 0 ? "Onthul het podium 🥁" : "Volgende plek"}
              </button>
            ) : (
              <button onClick={() => setStage("end")} className="btn-primary mt-6">
                Afronden →
              </button>
            )}
          </div>
        )}

        {/* EINDE */}
        {stage === "end" && (
          <div className="w-full max-w-md animate-[fadeIn_0.5s_ease]">
            <h2 className="text-3xl font-extrabold text-stone-800">🎉 Gefeliciteerd!</h2>
            {leaderboard[0] && (
              <p className="mt-2 text-stone-600">
                <span className="font-bold">{leaderboard[0].name}</span> is dit jaar
                Het Perfecte Plaatje-kampioen!
              </p>
            )}
            <div className="mt-5 space-y-2 text-left">
              {leaderboard.map((e, i) => (
                <div
                  key={e.name}
                  className="flex items-center gap-3 rounded-xl bg-white/70 px-4 py-2"
                >
                  {i < 3 ? (
                    <RankBadge rank={i + 1} className="h-6 w-6 text-xs" />
                  ) : (
                    <span className="w-6 text-center text-sm text-stone-400">{i + 1}</span>
                  )}
                  <span className="flex-1 font-medium text-stone-800">{e.name}</span>
                  <span className="font-semibold text-orange-500">{e.points}p</span>
                </div>
              ))}
            </div>
            <Link href="/results" className="btn-secondary mt-6 inline-flex">
              Terug naar de uitslag
            </Link>
          </div>
        )}
      </div>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
