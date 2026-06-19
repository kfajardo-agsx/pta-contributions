# PTA Contributions

A small Next.js app of Parent-Teacher Association contribution sheets.
Built with the App Router, Drizzle ORM, and libSQL (SQLite).

## Tabs

- **Monthly Contribution** — a grid of the member roster (alphabetical) × 10
  months from June. Each ticked cell is a ₱50 payment ("CR Upkeep — labor for
  maintenance, and water jugs in the classroom"). Per-member, per-month, and
  grand totals update live as cells are ticked.
- **Project Contribution** — placeholder, structure TBD.
- **CR Maintenance** — placeholder, structure TBD.

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
