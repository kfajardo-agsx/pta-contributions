import { db } from "@/db";
import { projectContributions } from "@/db/schema";
import { PROJECT_NOTE } from "@/lib/project";
import { ProjectGrid } from "./project-grid";

export const dynamic = "force-dynamic";

export default async function ProjectPage() {
  const rows = await db
    .select({
      member: projectContributions.member,
      amount: projectContributions.amount,
    })
    .from(projectContributions);

  const initialAmounts: Record<string, number> = {};
  for (const row of rows) {
    initialAmounts[row.member] = row.amount;
  }

  return (
    <>
      <p className="note">{PROJECT_NOTE}</p>
      <ProjectGrid initialAmounts={initialAmounts} />
    </>
  );
}
