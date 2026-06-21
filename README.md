# 📸 Het Perfecte Plaatje

Een webapp voor de jaarlijkse familie-fotowedstrijd op vakantie. Iedereen
uploadt elke dag een foto in een zelfgekozen categorie, aan het eind stem je
**anoniem** per categorie op je top 3, en de app berekent automatisch de score.

## Hoe het werkt

De competitie kent vier fases die de beheerder beheert:

1. **Voorbereiden** – beheerder maakt de categorieën en voegt de familieleden toe.
2. **Uploaden** – iedereen stuurt per dag een foto in, in een gekozen categorie.
3. **Stemmen** – iedereen kiest per categorie een top 3 (🥇 3 pt, 🥈 2 pt, 🥉 1 pt).
   Stemmen is anoniem en je ziet je eigen foto's niet.
4. **Uitslag** – de app toont de winnaar per categorie en het totaalklassement.

**Inloggen** gaat met je naam + een persoonlijke code (geen e-mail/wachtwoord-gedoe).

## Techniek

- [Next.js](https://nextjs.org/) (App Router, TypeScript, Tailwind CSS)
- [Supabase](https://supabase.com/) voor de database (Postgres) en foto-opslag
- Te hosten op [Vercel](https://vercel.com/) — alles past op de gratis tiers

Alle database-toegang loopt server-side via de Supabase service-role key; de
browser krijgt die key nooit te zien.

## Opzetten (eenmalig, ~15 min)

### 1. Supabase-project

1. Maak gratis een project op [supabase.com](https://supabase.com/).
2. Ga naar **SQL Editor → New query**, plak de inhoud van
   [`supabase/schema.sql`](supabase/schema.sql) en voer hem uit. Dit maakt de
   tabellen én de opslag-bucket `photos` aan.
3. Ga naar **Project Settings → API** en noteer:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` key (onder "Project API keys") → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Lokaal draaien

```bash
cp .env.example .env.local      # vul de waarden in
# genereer een SESSION_SECRET:
openssl rand -base64 32

npm install
npm run dev                     # http://localhost:3000
```

De eerste keer dat je de app opent vraagt hij om een **beheerdersaccount** aan
te maken. Daarna kun je in **Beheer** de categorieën en de rest van de familie
toevoegen.

### 3. Online zetten (Vercel)

1. Push deze repo naar GitHub.
2. Importeer het project op [vercel.com](https://vercel.com/).
3. Zet de drie omgevingsvariabelen (`NEXT_PUBLIC_SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`) in de Vercel-projectinstellingen.
4. Deploy en deel de link met de familie. 🎉

## Omgevingsvariabelen

| Variabele | Omschrijving |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL van je Supabase-project |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key (server-side, geheim houden!) |
| `SESSION_SECRET` | Lange willekeurige string voor het ondertekenen van login-cookies |

## Spelregels & scoring

- Punten per stem: 🥇 = 3, 🥈 = 2, 🥉 = 1.
- Je kunt **niet op je eigen foto's stemmen** (ze worden verborgen bij het stemmen).
- Per categorie tellen alle punten per foto op; de hoogste wint de categorie.
- Het totaalklassement telt alle punten over alle categorieën bij elkaar op.
- Je mag per categorie meerdere foto's insturen; voor het stemmen worden ze los
  beoordeeld.

Veel plezier en moge het perfecte plaatje winnen! 📷
