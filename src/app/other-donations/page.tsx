import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  cleaningContributions,
  crMaintenance,
  oneTimePurchases,
} from "@/db/schema";
import { isAuthed } from "@/lib/auth";
import { ONE_TIME_ITEMS, ONE_TIME_MONTH, currentMonthIndex } from "@/lib/cr";
import { OneTimePurchases } from "./one-time-purchases";
import { CleaningLog, type Contribution } from "./cleaning-log";

export const dynamic = "force-dynamic";

// One-time purchases used to be a fixed code list with checkbox/remarks stored
// in cr_maintenance. They now live in their own editable table. Seed the
// defaults once, carrying over any checkbox/remarks already set.
async function ensureOneTimeSeeded() {
  const existing = await db
    .select({ id: oneTimePurchases.id })
    .from(oneTimePurchases)
    .limit(1);
  if (existing.length > 0) return;

  const old = await db
    .select()
    .from(crMaintenance)
    .where(eq(crMaintenance.monthIndex, ONE_TIME_MONTH));
  const byKey = new Map(old.map((r) => [r.itemKey, r]));

  await db.insert(oneTimePurchases).values(
    ONE_TIME_ITEMS.map((item) => ({
      label: item.label,
      checked: byKey.get(item.key)?.checked ?? false,
      remarks: byKey.get(item.key)?.remarks ?? "",
    })),
  );
}

export default async function OtherDonationsPage() {
  await ensureOneTimeSeeded();

  const [items, contribRows, canEdit] = await Promise.all([
    db
      .select({
        id: oneTimePurchases.id,
        label: oneTimePurchases.label,
        checked: oneTimePurchases.checked,
        remarks: oneTimePurchases.remarks,
      })
      .from(oneTimePurchases)
      .orderBy(asc(oneTimePurchases.id)),
    db.select().from(cleaningContributions),
    isAuthed(),
  ]);

  const contributions: Contribution[] = contribRows
    .slice()
    .sort((a, b) => b.id - a.id)
    .map((c) => ({
      id: c.id,
      monthIndex: c.monthIndex,
      type: c.type,
      itemName: c.itemName,
      value: c.value,
      contributor: c.contributor,
      remarks: c.remarks,
    }));

  return (
    <>
      <p className="note">
        One-time purchases plus other contributions for CR and Classroom
        Maintenance.
      </p>
      <OneTimePurchases items={items} canEdit={canEdit} />
      <CleaningLog
        contributions={contributions}
        canEdit={canEdit}
        defaultMonth={currentMonthIndex(new Date())}
      />
    </>
  );
}
