import { db } from "@/db";
import { monthlyChecks } from "@/db/schema";
import { cellKey, MONTHLY_NOTE } from "@/lib/monthly";
import { MonthlyGrid } from "./monthly-grid";

export const dynamic = "force-dynamic";

export default async function MonthlyPage() {
  const rows = await db
    .select({
      member: monthlyChecks.member,
      monthIndex: monthlyChecks.monthIndex,
    })
    .from(monthlyChecks);

  const initialChecked = rows.map((r) => cellKey(r.member, r.monthIndex));

  return (
    <>
      <p className="note">{MONTHLY_NOTE}</p>
      <MonthlyGrid initialChecked={initialChecked} />
    </>
  );
}
