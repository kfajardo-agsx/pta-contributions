"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { monthlyChecks } from "@/db/schema";
import { MEMBERS, MONTHS } from "@/lib/monthly";

/**
 * Toggle a single cell in the Monthly Contribution sheet.
 * Returns the new checked state.
 */
export async function toggleMonthlyCheck(
  member: string,
  monthIndex: number,
): Promise<boolean> {
  if (!MEMBERS.includes(member as (typeof MEMBERS)[number])) {
    throw new Error(`Unknown member: ${member}`);
  }
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
