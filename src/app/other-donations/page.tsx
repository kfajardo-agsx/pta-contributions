import { db } from "@/db";
import { cleaningContributions, crMaintenance } from "@/db/schema";
import { isAuthed } from "@/lib/auth";
import { crKey, currentMonthIndex } from "@/lib/cr";
import { CrGrid } from "./cr-grid";
import { CleaningLog, type Contribution } from "./cleaning-log";

export const dynamic = "force-dynamic";

export default async function CrMaintenancePage() {
  const [oneTimeRows, contribRows, canEdit] = await Promise.all([
    db
      .select({
        monthIndex: crMaintenance.monthIndex,
        itemKey: crMaintenance.itemKey,
        checked: crMaintenance.checked,
        remarks: crMaintenance.remarks,
      })
      .from(crMaintenance),
    db.select().from(cleaningContributions),
    isAuthed(),
  ]);

  const initial: Record<string, { checked: boolean; remarks: string }> = {};
  for (const row of oneTimeRows) {
    initial[crKey(row.monthIndex, row.itemKey)] = {
      checked: row.checked,
      remarks: row.remarks,
    };
  }

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
      <CrGrid initial={initial} canEdit={canEdit} />
      <CleaningLog
        contributions={contributions}
        canEdit={canEdit}
        defaultMonth={currentMonthIndex(new Date())}
      />
    </>
  );
}
