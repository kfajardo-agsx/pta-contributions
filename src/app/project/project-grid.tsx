"use client";

import { useState, useTransition } from "react";
import { setProjectAmount } from "../actions";
import { MEMBERS, peso } from "@/lib/monthly";

export function ProjectGrid({
  initialAmounts,
  canEdit,
}: {
  initialAmounts: Record<string, number>;
  canEdit: boolean;
}) {
  const [amounts, setAmounts] = useState<Record<string, number>>(
    () => ({ ...initialAmounts }),
  );
  const [isPending, startTransition] = useTransition();

  const total = MEMBERS.reduce((sum, m) => sum + (amounts[m] || 0), 0);
  const contributors = MEMBERS.filter((m) => (amounts[m] || 0) > 0).length;

  function onChange(member: string, raw: string) {
    const value = raw === "" ? 0 : Number(raw);
    setAmounts((prev) => ({ ...prev, [member]: Number.isFinite(value) ? value : 0 }));
  }

  function onCommit(member: string) {
    if (!canEdit) return;
    const value = amounts[member] || 0;
    startTransition(async () => {
      const stored = await setProjectAmount(member, value);
      setAmounts((prev) => ({ ...prev, [member]: stored }));
    });
  }

  return (
    <div data-pending={isPending ? "" : undefined}>
      <div className="summary">
        <div className="summary-stat">
          Total contributions
          <strong>{peso.format(total)}</strong>
        </div>
        <div className="summary-stat muted">
          Contributors
          <strong>{contributors}</strong>
        </div>
      </div>

      <div className="project-grid">
        {MEMBERS.map((member) => (
          <label key={member} className="project-row">
            <span className="pname">{member}</span>
            <span className="pamount">
              <span className="peso-sign">₱</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                placeholder="0"
                value={amounts[member] ? String(amounts[member]) : ""}
                onChange={(e) => onChange(member, e.target.value)}
                onBlur={() => onCommit(member)}
                disabled={!canEdit}
              />
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
