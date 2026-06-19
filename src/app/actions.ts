"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { monthlyChecks, projectContributions } from "@/db/schema";
import { MEMBERS, MONTHS } from "@/lib/monthly";

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
