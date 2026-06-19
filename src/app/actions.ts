"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  crMaintenance,
  monthlyChecks,
  projectContributions,
} from "@/db/schema";
import { MEMBERS, MONTHS } from "@/lib/monthly";
import { MONTHLY_KEYS, ONE_TIME_KEYS, ONE_TIME_MONTH } from "@/lib/cr";
import { requireAuth } from "@/lib/auth";

function assertMember(member: string) {
  if (!MEMBERS.includes(member as (typeof MEMBERS)[number])) {
    throw new Error(`Unknown member: ${member}`);
  }
}

/**
 * Toggle a single cell in the Monthly Contribution sheet.
 * Returns the new checked state.
 */
export async function toggleMonthlyCheck(
  member: string,
  monthIndex: number,
): Promise<boolean> {
  await requireAuth();
  assertMember(member);
  if (!Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex >= MONTHS.length) {
    throw new Error(`Invalid month index: ${monthIndex}`);
  }

  const where = and(
    eq(monthlyChecks.member, member),
    eq(monthlyChecks.monthIndex, monthIndex),
  );

  const existing = await db.select().from(monthlyChecks).where(where).limit(1);

  if (existing.length > 0) {
    await db.delete(monthlyChecks).where(where);
    revalidatePath("/");
    return false;
  }

  await db.insert(monthlyChecks).values({ member, monthIndex });
  revalidatePath("/");
  return true;
}

/**
 * Set a member's Project Contribution amount. A zero/negative/invalid amount
 * removes their row. Returns the stored amount.
 */
export async function setProjectAmount(
  member: string,
  amount: number,
): Promise<number> {
  await requireAuth();
  assertMember(member);

  const value = Number.isFinite(amount) && amount > 0 ? amount : 0;

  if (value === 0) {
    await db
      .delete(projectContributions)
      .where(eq(projectContributions.member, member));
    revalidatePath("/project");
    return 0;
  }

  await db
    .insert(projectContributions)
    .values({ member, amount: value })
    .onConflictDoUpdate({
      target: projectContributions.member,
      set: { amount: value, updatedAt: sql`(datetime('now'))` },
    });

  revalidatePath("/project");
  return value;
}

/**
 * Upsert a CR Maintenance cell (a given item for a given month).
 */
export async function setCrMaintenance(
  monthIndex: number,
  itemKey: string,
  checked: boolean,
  remarks: string,
): Promise<void> {
  await requireAuth();

  const isOneTime = ONE_TIME_KEYS.includes(itemKey);
  const isMonthly = MONTHLY_KEYS.includes(itemKey);
  if (!isOneTime && !isMonthly) {
    throw new Error(`Unknown CR item: ${itemKey}`);
  }
  if (isOneTime) {
    if (monthIndex !== ONE_TIME_MONTH) {
      throw new Error(`One-time item must use month ${ONE_TIME_MONTH}`);
    }
  } else if (
    !Number.isInteger(monthIndex) ||
    monthIndex < 0 ||
    monthIndex >= MONTHS.length
  ) {
    throw new Error(`Invalid month index: ${monthIndex}`);
  }

  const trimmed = remarks.trim();

  await db
    .insert(crMaintenance)
    .values({ monthIndex, itemKey, checked, remarks: trimmed })
    .onConflictDoUpdate({
      target: [crMaintenance.monthIndex, crMaintenance.itemKey],
      set: { checked, remarks: trimmed, updatedAt: sql`(datetime('now'))` },
    });

  revalidatePath("/cr-maintenance");
}
