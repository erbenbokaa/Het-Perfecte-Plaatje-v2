"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  HomeIllustration,
  CameraIllustration,
  GalleryIllustration,
  StarIllustration,
  TrophyIllustration,
  CogIllustration,
} from "@/components/illustrations";

const ITEMS = [
  { href: "/dashboard", label: "Home", Illu: HomeIllustration },
  { href: "/upload", label: "Uploaden", Illu: CameraIllustration },
  { href: "/gallery", label: "Galerij", Illu: GalleryIllustration },
  { href: "/vote", label: "Stemmen", Illu: StarIllustration },
  { href: "/results", label: "Uitslag", Illu: TrophyIllustration },
];

export default function BottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  // Tab die net is aangetikt — geeft directe visuele reactie tijdens het laden.
  const [pending, setPending] = useState<string | null>(null);

  // Zodra de nieuwe pagina geladen is, valt de "pending"-staat weg.
  useEffect(() => {
    setPending(null);
  }, [pathname]);

  const items = isAdmin
    ? [...ITEMS, { href: "/admin", label: "Beheer", Illu: CogIllustration }]
    : ITEMS;

  const target = pending ?? pathname;

  return (
    <nav className="bottom-nav">
      <ul className="mx-auto flex max-w-2xl items-stretch justify-around">
        {items.map(({ href, label, Illu }) => {
          const active = target === href || target.startsWith(href + "/");
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                prefetch
                onClick={() => setPending(href)}
                className="flex flex-col items-center gap-1 py-2"
              >
                <Illu
                  className={
                    "h-7 w-7 transition " + (active ? "" : "opacity-40 grayscale")
                  }
                />
                <span
                  className={
                    "text-[10px] font-medium leading-none transition-colors " +
                    (active ? "text-stone-800" : "text-stone-400")
                  }
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
