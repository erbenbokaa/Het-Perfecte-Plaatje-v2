import { requireAdmin } from "@/lib/auth";
import {
  getSettings,
  getCategories,
  getParticipants,
  getPhotos,
} from "@/lib/db";
import type { Phase } from "@/lib/types";
import {
  updateSettingsAction,
  setPhaseAction,
  addCategoryAction,
  deleteCategoryAction,
  addParticipantAction,
  deleteParticipantAction,
} from "@/app/actions/admin";

export const dynamic = "force-dynamic";

const PHASES: { value: Phase; label: string; hint: string }[] = [
  { value: "setup", label: "1. Voorbereiden", hint: "Categorieën en deelnemers instellen" },
  { value: "upload", label: "2. Uploaden", hint: "Iedereen stuurt foto's in" },
  { value: "voting", label: "3. Stemmen", hint: "Anoniem stemmen per categorie" },
  { value: "results", label: "4. Uitslag", hint: "Resultaten zichtbaar voor iedereen" },
];

export default async function AdminPage() {
  await requireAdmin();
  const [settings, categories, participants, photos] = await Promise.all([
    getSettings(),
    getCategories(),
    getParticipants(),
    getPhotos(),
  ]);

  const photoCount = (pid: string) =>
    photos.filter((p) => p.participant_id === pid).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">⚙️ Beheer</h1>

      {/* Fase besturen */}
      <div className="card">
        <h2 className="font-semibold mb-3">Fase van de competitie</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {PHASES.map((p) => (
            <form action={setPhaseAction} key={p.value}>
              <input type="hidden" name="phase" value={p.value} />
              <button
                className={
                  "w-full text-left rounded-lg border px-4 py-3 transition " +
                  (settings.phase === p.value
                    ? "border-ocean bg-teal-50 ring-1 ring-ocean"
                    : "border-stone-200 hover:bg-stone-50")
                }
              >
                <div className="font-medium">{p.label}</div>
                <div className="text-xs text-stone-500">{p.hint}</div>
                {settings.phase === p.value && (
                  <div className="text-xs font-semibold text-ocean mt-1">● Actief</div>
                )}
              </button>
            </form>
          ))}
        </div>
      </div>

      {/* Algemene instellingen */}
      <div className="card">
        <h2 className="font-semibold mb-3">Instellingen</h2>
        <form action={updateSettingsAction} className="space-y-3">
          <div>
            <label className="label">Naam van de competitie</label>
            <input
              name="competition_name"
              className="input"
              defaultValue={settings.competition_name}
            />
          </div>
          <div>
            <label className="label">Aantal dagen</label>
            <input
              name="num_days"
              type="number"
              min={1}
              max={60}
              className="input"
              defaultValue={settings.num_days}
            />
          </div>
          <div>
            <label className="label">Startdatum (dag 1)</label>
            <input
              name="start_date"
              type="date"
              className="input"
              defaultValue={settings.start_date ?? ""}
            />
            <p className="mt-1 text-xs text-stone-400">
              Hiermee bepaalt de app automatisch welke dag het is bij het uploaden.
            </p>
          </div>
          <input type="hidden" name="phase" value={settings.phase} />
          <button className="btn-primary">Opslaan</button>
        </form>
      </div>

      {/* Categorieën */}
      <div className="card">
        <h2 className="font-semibold mb-3">Categorieën ({categories.length})</h2>
        <ul className="space-y-2 mb-4">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2"
            >
              <span className="text-sm">
                <span className="font-medium">{c.name}</span>
                {c.description && <span className="text-stone-500"> — {c.description}</span>}
              </span>
              <form action={deleteCategoryAction}>
                <input type="hidden" name="id" value={c.id} />
                <button className="text-red-600 text-sm hover:underline">verwijderen</button>
              </form>
            </li>
          ))}
          {categories.length === 0 && (
            <li className="text-sm text-stone-500">Nog geen categorieën.</li>
          )}
        </ul>
        <form action={addCategoryAction} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input name="name" className="input" placeholder="Naam (bijv. Mooiste zonsondergang)" required />
          <input name="description" className="input" placeholder="Omschrijving (optioneel)" />
          <button className="btn-secondary">Toevoegen</button>
        </form>
      </div>

      {/* Deelnemers */}
      <div className="card">
        <h2 className="font-semibold mb-3">Deelnemers ({participants.length})</h2>
        <ul className="space-y-2 mb-4">
          {participants.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2"
            >
              <span className="text-sm">
                <span className="font-medium">{p.name}</span>
                {p.is_admin && <span className="ml-2 text-xs text-sunset">beheerder</span>}
                <span className="ml-2 text-xs text-stone-500">{photoCount(p.id)} foto's</span>
              </span>
              <form action={deleteParticipantAction}>
                <input type="hidden" name="id" value={p.id} />
                <button className="text-red-600 text-sm hover:underline">verwijderen</button>
              </form>
            </li>
          ))}
        </ul>
        <form action={addParticipantAction} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] items-center">
          <input name="name" className="input" placeholder="Naam" required minLength={2} />
          <input name="code" className="input" placeholder="Code (min. 4 tekens)" required minLength={4} />
          <button className="btn-secondary">Toevoegen</button>
          <label className="flex items-center gap-2 text-sm text-stone-600 sm:col-span-3">
            <input type="checkbox" name="is_admin" /> Ook beheerder maken
          </label>
        </form>
        <p className="text-xs text-stone-400 mt-2">
          Tip: geef iedereen een eigen code en deel die persoonlijk. Een code
          kan niet teruggelezen worden; verwijder en maak opnieuw aan om te
          wijzigen.
        </p>
      </div>
    </div>
  );
}
