# PTA Contributions

A small Next.js app of Parent-Teacher Association contribution sheets.
Built with the App Router, Drizzle ORM, and libSQL (SQLite).

## Editing & login

The app is **view-only** by default — anyone can read the sheets. Making changes
requires logging in via the **Log in** button (top right), which opens a modal.

Credentials live in the `users` table in the same database (hashed, never
plaintext) and are seeded from env vars:

```bash
npm run db:seed   # upserts APP_USERNAME / APP_PASSWORD into the users table
```

Editing is enforced server-side: every save action rejects unauthenticated
callers, and the inputs render disabled until you log in.

## Tabs

- **Monthly Contribution** — a grid of the member roster (alphabetical) × 10
  months from June. Each ticked cell is a ₱50 payment ("CR Upkeep — labor for
  maintenance, and water jugs in the classroom"). Per-member, per-month, and
  grand totals update live as cells are ticked.
- **Project Contribution** — "for painting the chairs": the same roster with one
  amount field each, in a responsive 3-column grid, with a live total on top.
- **CR Maintenance** — one-time purchases (Water containers, Doorknob/Padlock)
  at the top, then a box per month (June→March) for the cleaning materials
  (Muriatic Acid, Rags, Tissues, Toilet deodorizer). Each item has a checkbox
  and a remarks field.

The roster, month list, and ₱50 rate live in
[`src/lib/monthly.ts`](src/lib/monthly.ts).

## Stack

- **Next.js 15** (App Router, server actions)
- **Drizzle ORM** over **libSQL**
- **Local dev:** a plain SQLite file (`local.db`)
- **Production (Vercel):** [Turso](https://turso.tech) — hosted libSQL

> ⚠️ Vercel's serverless filesystem is ephemeral, so a plain SQLite file does
> **not** persist in production. Use Turso (or another hosted DB) when deployed.

## Getting started

```bash
nvm use            # Node 22
npm install
cp .env.example .env   # already created for local dev
npm run db:push        # create tables in local.db
npm run dev            # http://localhost:3000
```

## Database

The schema lives in [`src/db/schema.ts`](src/db/schema.ts).

```bash
npm run db:generate   # generate SQL migrations from the schema
npm run db:push       # apply the schema directly to the database
npm run db:studio     # browse data with Drizzle Studio
```

## Deploying to Vercel

1. Create a Turso database:
   ```bash
   turso db create pta-contributions
   turso db show pta-contributions --url        # -> DATABASE_URL
   turso db tokens create pta-contributions     # -> DATABASE_AUTH_TOKEN
   ```
2. Push the schema to it:
   ```bash
   DATABASE_URL="libsql://…" DATABASE_AUTH_TOKEN="…" npm run db:push
   ```
3. In Vercel, set the `DATABASE_URL` and `DATABASE_AUTH_TOKEN` environment
   variables, then deploy.

## Environment variables

| Variable               | Description                                        |
| ---------------------- | -------------------------------------------------- |
| `DATABASE_URL`         | `file:./local.db` in dev; `libsql://…` in prod     |
| `DATABASE_AUTH_TOKEN`  | Turso auth token (empty for local file)            |
