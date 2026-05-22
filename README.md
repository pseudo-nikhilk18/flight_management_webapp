# Flight Management System

Flight Management System is a production-style web application built for the internship technical assignment. The app will support flight search, booking, interactive seat selection, rescheduling, cancellations, Supabase-backed persistence, and an installable PWA experience.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase Auth, Postgres, Realtime, RLS, and RPC functions
- Zustand with `persist` middleware
- Zod for validation
- lucide-react for interface icons

## Current Status

- App foundation (shell, dependencies, env contract)
- Database migration SQL (`supabase/migrations/001_initial_schema.sql`)
- Seed SQL (`supabase/seed/seed.sql`) — apply in Supabase after migration

Next: Supabase Auth wiring, then Task 01 (search and booking flow).

## Supabase Setup

See [`supabase/README.md`](./supabase/README.md) for step-by-step instructions.

1. Run `migrations/001_initial_schema.sql` in the Supabase SQL Editor.
2. Run `seed/seed.sql`.
3. Create a test user under **Authentication → Users** (auto-confirm for local dev).
4. Document test credentials in this README before submission.

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Only `NEXT_PUBLIC_*` values are safe to expose to the browser. The service role key is server-only and must never be shipped to client components.

## Development Commands

```bash
npm run dev
npm run lint
npm run build
```

## Architecture Notes

- `src/app` contains App Router pages, layouts, and global CSS.
- `src/components` contains reusable UI building blocks.
- `src/lib` contains application constants and shared helpers.
- `supabase/migrations` will contain schema, RLS, trigger, and RPC SQL.
- `supabase/seed` will contain repeatable seed data.
