import { sql } from "drizzle-orm";
import {
  integer,
  real,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";

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

/**
 * Project Contribution sheet (e.g. painting the chairs).
 *
 * One row per member who has contributed, holding the single amount they gave.
 * A row is absent (or deleted) when the amount is zero.
 */
export const projectContributions = sqliteTable("project_contributions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  member: text("member").notNull().unique(),
  amount: real("amount").notNull().default(0),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export type ProjectContribution = typeof projectContributions.$inferSelect;
