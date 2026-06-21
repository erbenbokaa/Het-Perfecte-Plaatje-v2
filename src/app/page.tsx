import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getParticipants } from "@/lib/db";
import { loginAction, setupAdminAction } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const user = await getSession();
  if (user) redirect("/dashboard");

  let participants: { id: string; name: string }[] = [];
  let dbError = false;
  try {
    participants = await getParticipants();
  } catch {
    dbError = true;
  }

  const error = searchParams.error;

  if (dbError) {
    return (
      <div className="card max-w-lg mx-auto">
        <h1 className="text-xl font-bold mb-2">Bijna klaar 🛠️</h1>
        <p className="text-stone-600 text-sm">
          De app kan de database nog niet bereiken. Stel de
          omgevingsvariabelen in (zie <code>.env.example</code> en de{" "}
          <code>README.md</code>) en voer <code>supabase/schema.sql</code> uit
          in je Supabase-project.
        </p>
      </div>
    );
  }

  const isFirstRun = participants.length === 0;

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-ocean">📸 Het Perfecte Plaatje</h1>
        <p className="text-stone-600 mt-1">De familie fotowedstrijd</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {isFirstRun ? (
        <div className="card">
          <h2 className="text-lg font-semibold mb-1">Welkom! 👋</h2>
          <p className="text-sm text-stone-600 mb-4">
            Er is nog niemand aangemeld. Maak het eerste account aan — jij wordt
            de beheerder en kunt daarna de categorieën en de rest van de familie
            toevoegen.
          </p>
          <form action={setupAdminAction} className="space-y-3">
            <div>
              <label className="label">Jouw naam</label>
              <input name="name" className="input" placeholder="bijv. Erben" required />
            </div>
            <div>
              <label className="label">Kies een persoonlijke code (min. 4 tekens)</label>
              <input name="code" type="password" className="input" required minLength={4} />
            </div>
            <button type="submit" className="btn-primary w-full">
              Beheerder aanmaken
            </button>
          </form>
        </div>
      ) : (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Inloggen</h2>
          <form action={loginAction} className="space-y-3">
            <div>
              <label className="label">Wie ben je?</label>
              <select name="name" className="input" required defaultValue="">
                <option value="" disabled>
                  Kies je naam…
                </option>
                {participants.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Jouw code</label>
              <input name="code" type="password" className="input" required />
            </div>
            <button type="submit" className="btn-primary w-full">
              Inloggen
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
