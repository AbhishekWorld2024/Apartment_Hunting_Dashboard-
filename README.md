# Apartment Hunting Dashboard — Dwell

An apartment hunting workspace built with the Next.js App Router and React. Sites deployment uses the supplied Vinext/Vite compatibility runtime. Application pages and route handlers use standard Next.js conventions.

## Features

- Budget, neighborhood, bedroom and amenity filters; keyword search; sorting.
- Saved places, add-your-own listings, three-place comparison, itemized fees.
- Explainable preference scoring and optional OpenAI Responses API structured rankings with pros, cons and potential red flags.
- Google Maps JavaScript API with clickable markers; labeled illustrative map when no key is configured.
- Browser persistence by default; authenticated PostgreSQL workspace persistence through Neon's HTTPS SQL adapter when configured.
- Responsive layouts, keyboard focus trapping and escape-to-close dialogs.

## Run

Node 22.13+ is required. Install with `npm run install:ci`, then `npm run dev` (http://localhost:5173). Build with `npm run build`. Run type checking with `npx tsc --noEmit`.

Copy `.env.example` to `.env.local` for local credentials. Hosted production credentials must be set as Site runtime environment variables. Never commit credentials.

1. PostgreSQL: create a Neon database, run `db/schema.sql`, and set its connection string as `DATABASE_URL`. The HTTPS adapter requires a `.neon.tech` host. No cloud persistence is claimed until a successful database read. Site identity scopes all reads and writes.
2. OpenAI: set `OPENAI_API_KEY` and optionally `OPENAI_MODEL` (default `gpt-4.1-mini`). AI generation requires Site authentication. Without a key, the API returns explicitly labeled deterministic preference analysis. API errors preserve existing rule-based scores. OpenAI Docs: https://developers.openai.com/api/docs/guides/structured-outputs
3. Maps: enable Maps JavaScript API and billing, set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, and restrict the browser key to your Site origin. `/api/config` exposes only this public Maps key and capability booleans. No database or OpenAI secrets reach the client.

## Data and scoring

Eight fictional San Francisco listings and illustrative Unsplash photos ship with the app. They are not live offers. New manually added listings use a sample photo and approximate coordinates. Availability, policies, costs, and property details require independent verification.

Preference scores start at 94, gain 3 points for at least 780 sq ft, and subtract for budget overage including listed fees, rent below the budget floor, bedroom or neighborhood mismatches, missing requested amenities, and monthly fees above $100. Scores are bounded to 20–99 and are a fit heuristic, not a probability or property quality assessment. Filters use base rent; total cost is shown separately. An OpenAI response replaces scores only when schema and ID validation succeed.

Workspace data (preferences, saved IDs, comparison IDs, and custom listings) is stored in browser localStorage. With PostgreSQL configured it also syncs per authenticated Site user. Run production behind the owner-private Sites authentication boundary; public hosting would require explicit access controls and distributed AI rate limiting before enabling paid AI endpoints.
