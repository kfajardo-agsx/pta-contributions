import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

/**
 * Monthly Contribution sheet.
 *
 * Each row is a single ticked cell in the grid: a given member paid for a
 * given month. The presence of a row means "checked" (₱50); deleting the row
 * un-checks it. `monthIndex` is 0-based from June (0 = Jun … 9 = Mar).
 */
export const monthlyChecks = sqliteTable(
  "monthly_checks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    member: text("member").notNull(),
    monthIndex: integer("month_index").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => ({
    memberMonth: unique("member_month").on(t.member, t.monthIndex),
  }),
);

export type MonthlyCheck = typeof monthlyChecks.$inferSelect;
