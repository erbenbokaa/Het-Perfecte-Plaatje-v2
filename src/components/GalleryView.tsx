"use client";

import { useState, useEffect } from "react";

export interface GalleryGroup {
  id: string;
  name: string;
  description: string;
  photos: { id: string; url: string }[];
}

export default function GalleryView({ groups }: { groups: GalleryGroup[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  // Sluit met Escape en zet scroll vast als de lightbox open is.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selected]);

  return (
    <>
      <div className="space-y-5">
        {groups.map((g) => (
          <div key={g.id} className="card">
            <h2 className="font-bold">{g.name}</h2>
            {g.description && (
              <p className="mb-3 text-xs text-stone-400">{g.description}</p>
            )}
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {g.photos.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p.url)}
                  className="aspect-square overflow-hidden rounded-xl bg-white/60 transition active:scale-95"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt={g.name}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          style={{
            paddingTop: "calc(env(safe-area-inset-top) + 1rem)",
            paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)",
          }}
        >
          <button
            onClick={() => setSelected(null)}
            aria-label="Sluiten"
            className="absolute right-4 top-[calc(env(safe-area-inset-top)+1rem)] flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white"
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selected}
            alt="Foto"
            className="max-h-full max-w-full rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
