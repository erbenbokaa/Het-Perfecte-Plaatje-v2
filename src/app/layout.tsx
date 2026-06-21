import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getSettings } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import BottomNav from "@/components/BottomNav";
import { CameraIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Het Perfecte Plaatje",
  description: "De familie fotowedstrijd",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HPP",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fdeede",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  let competitionName = "Het Perfecte Plaatje";
  try {
    if (user) competitionName = (await getSettings()).competition_name;
  } catch {
    // Database nog niet geconfigureerd; toon de standaardtitel.
  }

  return (
    <html lang="nl">
      <body>
        <header className="app-header">
          <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
            <Link
              href={user ? "/dashboard" : "/"}
              className="flex min-w-0 items-center gap-2"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-400 text-white">
                <CameraIcon className="h-5 w-5" />
              </span>
              <span className="truncate font-semibold text-stone-800">
                {competitionName}
              </span>
            </Link>
            {user && <LogoutButton />}
          </div>
        </header>

        <main
          className={
            "mx-auto max-w-2xl px-4 pt-5 " + (user ? "pb-28" : "pb-12")
          }
        >
          {children}
        </main>

        {user && <BottomNav isAdmin={user.is_admin} />}
      </body>
    </html>
  );
}
