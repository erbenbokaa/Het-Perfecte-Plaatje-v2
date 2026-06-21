"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  CameraIcon,
  GalleryIcon,
  StarIcon,
  TrophyIcon,
  CogIcon,
} from "@/components/icons";

const ITEMS = [
  { href: "/dashboard", label: "Home", Icon: HomeIcon },
  { href: "/upload", label: "Uploaden", Icon: CameraIcon },
  { href: "/gallery", label: "Galerij", Icon: GalleryIcon },
  { href: "/vote", label: "Stemmen", Icon: StarIcon },
  { href: "/results", label: "Uitslag", Icon: TrophyIcon },
];

export default function BottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const items = isAdmin
    ? [...ITEMS, { href: "/admin", label: "Beheer", Icon: CogIcon }]
    : ITEMS;

  return (
    <nav className="bottom-nav">
      <ul className="mx-auto flex max-w-2xl items-stretch justify-around">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={
                  "flex flex-col items-center gap-1 py-2.5 transition " +
                  (active ? "text-ocean" : "text-stone-400 hover:text-stone-600")
                }
              >
                <Icon className="h-6 w-6" />
                <span className="text-[11px] font-medium leading-none">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
