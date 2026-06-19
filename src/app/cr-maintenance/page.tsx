import { db } from "@/db";
import { crMaintenance } from "@/db/schema";
import { isAuthed } from "@/lib/auth";
import { crKey } from "@/lib/cr";
import { CrGrid } from "./cr-grid";

export const dynamic = "force-dynamic";

export default async function CrMaintenancePage() {
  const [rows, canEdit] = await Promise.all([
    db
      .select({
        monthIndex: crMaintenance.monthIndex,
        itemKey: crMaintenance.itemKey,
        checked: crMaintenance.checked,
        remarks: crMaintenance.remarks,
      })
      .from(crMaintenance),
    isAuthed(),
  ]);

  const initial: Record<string, { checked: boolean; remarks: string }> = {};
  for (const row of rows) {
    initial[crKey(row.monthIndex, row.itemKey)] = {
      checked: row.checked,
      remarks: row.remarks,
    };
  }

  return (
    <>
      <p className="note">
        Monthly CR maintenance checklist — tick each item as it’s handled and add
        remarks.
      </p>
      <CrGrid initial={initial} canEdit={canEdit} />
    </>
  );
}
