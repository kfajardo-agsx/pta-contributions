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

/**
 * CR Maintenance sheet.
 *
 * One row per (month, item) cell: whether the item was handled that month and
 * any free-text remarks. `monthIndex` is 0-based from June (0 = Jun … 9 = Mar).
 */
export const crMaintenance = sqliteTable(
  "cr_maintenance",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    monthIndex: integer("month_index").notNull(),
    itemKey: text("item_key").notNull(),
    checked: integer("checked", { mode: "boolean" }).notNull().default(false),
    remarks: text("remarks").notNull().default(""),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => ({
    monthItem: unique("month_item").on(t.monthIndex, t.itemKey),
  }),
);

export type CrMaintenance = typeof crMaintenance.$inferSelect;

/**
 * One-time purchases for CR / classroom maintenance. Each row is a line item
 * with a checkbox (bought?) and remarks. Rows are user-editable: an
 * authenticated user can add or remove entries.
 */
export const oneTimePurchases = sqliteTable("one_time_purchases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  label: text("label").notNull(),
  checked: integer("checked", { mode: "boolean" }).notNull().default(false),
  remarks: text("remarks").notNull().default(""),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export type OneTimePurchase = typeof oneTimePurchases.$inferSelect;

/**
 * Monthly cleaning-supplies contributions log.
 *
 * Each row is one contribution for a month (0 = Jun … 9 = Mar): either a cash
 * amount (`value`) or a donated item (`itemName`). `contributor` is who gave it.
 */
export const cleaningContributions = sqliteTable("cleaning_contributions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  monthIndex: integer("month_index").notNull(),
  type: text("type", { enum: ["cash", "item"] }).notNull(),
  itemName: text("item_name"),
  value: real("value"),
  contributor: text("contributor").notNull(),
  remarks: text("remarks").notNull().default(""),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export type CleaningContribution = typeof cleaningContributions.$inferSelect;
