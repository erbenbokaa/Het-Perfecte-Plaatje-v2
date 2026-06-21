import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getSettings } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";

export const metadata: Metadata = {
  title: "Het Perfecte Plaatje",
  description: "Familie fotowedstrijd",
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
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <Link href={user ? "/dashboard" : "/"} className="text-lg font-bold text-ocean">
              📸 {competitionName}
            </Link>
            {user && (
              <nav className="flex items-center gap-3 text-sm">
                <Link href="/upload" className="hover:underline">Uploaden</Link>
                <Link href="/vote" className="hover:underline">Stemmen</Link>
                <Link href="/results" className="hover:underline">Uitslag</Link>
                {user.is_admin && (
                  <Link href="/admin" className="font-medium text-sunset hover:underline">
                    Beheer
                  </Link>
                )}
                <span className="hidden text-stone-400 sm:inline">|</span>
                <span className="hidden text-stone-600 sm:inline">{user.name}</span>
                <LogoutButton />
              </nav>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-4xl px-4 py-8 text-center text-xs text-stone-400">
          Het Perfecte Plaatje · familie fotowedstrijd
        </footer>
      </body>
    </html>
  );
}
