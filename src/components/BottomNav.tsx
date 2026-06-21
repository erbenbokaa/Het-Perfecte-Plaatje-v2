"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const items = isAdmin
    ? [...ITEMS, { href: "/admin", label: "Beheer", Illu: CogIllustration }]
    : ITEMS;

  return (
    <nav className="bottom-nav">
      <ul className="mx-auto flex max-w-2xl items-stretch justify-around">
        {items.map(({ href, label, Illu }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className="flex flex-col items-center gap-1 py-2"
              >
                <Illu
                  className={
                    "h-7 w-7 transition " +
                    (active ? "" : "opacity-40 grayscale")
                  }
                />
                <span
                  className={
                    "text-[10px] font-medium leading-none " +
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
