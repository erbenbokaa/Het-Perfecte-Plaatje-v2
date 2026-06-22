const TZ = "Europe/Amsterdam";

/** Huidige datum in NL-tijd als YYYY-MM-DD. */
export function todayInNL(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

/** De kalenderdatum (NL-tijd) van een tijdstempel, als YYYY-MM-DD. */
export function nlDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ });
}

/**
 * Bepaalt automatisch welke wedstrijddag het vandaag is op basis van de
 * startdatum. Dag 1 = de startdatum. Wordt begrensd tussen 1 en numDays.
 * Zonder startdatum vallen we terug op dag 1.
 */
export function currentDayNumber(
  startDate: string | null,
  numDays: number
): number {
  const max = Math.max(numDays, 1);
  if (!startDate) return 1;
  const today = Date.parse(todayInNL() + "T00:00:00Z");
  const start = Date.parse(startDate + "T00:00:00Z");
  if (Number.isNaN(today) || Number.isNaN(start)) return 1;
  const diff = Math.floor((today - start) / 86_400_000) + 1;
  return Math.min(Math.max(diff, 1), max);
}
