// Seeds the edit user into the database from env vars.
// Idempotent: re-running updates the password hash.
//
// Local:  npm run db:seed                  (reads .env via --env-file)
// Turso:  DATABASE_URL=libsql://… DATABASE_AUTH_TOKEN=… APP_USERNAME=… \
//         APP_PASSWORD=… AUTH_SECRET=… node scripts/seed.mjs
import { createClient } from "@libsql/client";
import { createHmac } from "node:crypto";

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;
const username = process.env.APP_USERNAME;
const password = process.env.APP_PASSWORD;
const secret = process.env.AUTH_SECRET ?? "dev-insecure-secret";

if (!url) throw new Error("DATABASE_URL is required");
if (!username || !password) {
  throw new Error("APP_USERNAME and APP_PASSWORD are required");
}

// Must match hashPassword() in src/lib/auth.ts
const passwordHash = createHmac("sha256", secret).update(password).digest("hex");

const client = createClient({ url, authToken });

await client.execute({
  sql: `INSERT INTO users (username, password_hash) VALUES (?, ?)
        ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash`,
  args: [username, passwordHash],
});

console.log(`Seeded edit user '${username}'.`);
