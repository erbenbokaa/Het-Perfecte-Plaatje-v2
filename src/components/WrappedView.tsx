"use client";

import { useState } from "react";
import Link from "next/link";

interface Slide {
  bg: string;
  node: React.ReactNode;
}

export default function WrappedView({
  competition,
  name,
  photosCount,
  totalPoints,
  wins,
  rank,
  totalParticipants,
  bestPhoto,
  title,
  titleEmoji,
}: {
  competition: string;
  name: string;
  photosCount: number;
  totalPoints: number;
  wins: number;
  rank: number;
  totalParticipants: number;
  bestPhoto: { url: string; category: string; points: number } | null;
  title: string;
  titleEmoji: string;
}) {
  const big = "text-6xl font-extrabold text-white drop-shadow";
  const slides: Slide[] = [];

  slides.push({
    bg: "from-orange-400 to-rose-500",
    node: (
      <>
        <p className="text-lg font-semibold text-white/90">{competition}</p>
        <h1 className="mt-3 text-4xl font-extrabold text-white">
          {name}, dit was<br />jouw jaar 📸
        </h1>
        <p className="mt-4 text-white/80">Tik om door te gaan →</p>
      </>
    ),
  });

  slides.push({
    bg: "from-sky-400 to-cyan-500",
    node: (
      <>
        <p className="text-white/90">Je leverde maar liefst</p>
        <p className={big}>{photosCount}</p>
        <p className="text-xl font-semibold text-white">
          foto{photosCount === 1 ? "" : "'s"} in
        </p>
      </>
    ),
  });

  slides.push({
    bg: "from-violet-500 to-fuchsia-500",
    node: (
      <>
        <p className="text-white/90">Samen goed voor</p>
        <p className={big}>{totalPoints}</p>
        <p className="text-xl font-semibold text-white">punten</p>
      </>
    ),
  });

  if (bestPhoto) {
    slides.push({
      bg: "from-amber-400 to-orange-500",
      node: (
        <>
          <p className="text-lg font-semibold text-white/90">Je sterkste plaatje</p>
          <div className="mx-auto mt-4 overflow-hidden rounded-3xl shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bestPhoto.url}
              alt="beste foto"
              className="max-h-[44vh] w-full object-cover"
            />
          </div>
          <p className="mt-4 font-bold text-white">{bestPhoto.category}</p>
          <p className="text-white/90">{bestPhoto.points} punten</p>
        </>
      ),
    });
  }

  if (wins > 0) {
    slides.push({
      bg: "from-yellow-400 to-amber-500",
      node: (
        <>
          <p className="text-white/90">Je won</p>
          <p className={big}>{wins}</p>
          <p className="text-xl font-semibold text-white">
            categorie{wins === 1 ? "" : "ën"} 🏅
          </p>
        </>
      ),
    });
  }

  slides.push({
    bg: "from-teal-500 to-emerald-600",
    node: (
      <>
        <p className="text-white/90">Je eindigde als</p>
        <p className={big}>#{rank}</p>
        <p className="text-xl font-semibold text-white">van {totalParticipants}</p>
      </>
    ),
  });

  slides.push({
    bg: "from-rose-500 to-purple-600",
    node: (
      <>
        <p className="text-white/90">Jouw titel dit jaar</p>
        <p className="mt-3 text-6xl">{titleEmoji}</p>
        <p className="mt-2 text-3xl font-extrabold text-white">{title}</p>
        <Link
          href="/results"
          className="mt-8 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-stone-800"
        >
          Bekijk de uitslag
        </Link>
      </>
    ),
  });

  const [i, setI] = useState(0);
  const last = slides.length - 1;

  function tap(e: React.MouseEvent) {
    const x = e.clientX;
    const w = window.innerWidth;
    if (x < w * 0.3) setI((v) => Math.max(v - 1, 0));
    else setI((v) => Math.min(v + 1, last));
  }

  return (
    <div
      onClick={tap}
      className={"fixed inset-0 z-50 flex flex-col bg-gradient-to-br " + slides[i].bg}
    >
      {/* Voortgangsbalkjes */}
      <div className="flex gap-1.5 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        {slides.map((_, idx) => (
          <div key={idx} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
            <div
              className={"h-full bg-white transition-all " + (idx <= i ? "w-full" : "w-0")}
            />
          </div>
        ))}
      </div>

      <div className="absolute right-4 top-[calc(env(safe-area-inset-top)+1.25rem)] z-10">
        <Link
          href="/results"
          onClick={(e) => e.stopPropagation()}
          className="rounded-full bg-white/20 px-3 py-1.5 text-sm text-white"
        >
          ✕
        </Link>
      </div>

      <div
        key={i}
        className="flex flex-1 animate-[fadeIn_0.4s_ease] flex-col items-center justify-center px-8 text-center"
      >
        {slides[i].node}
      </div>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
