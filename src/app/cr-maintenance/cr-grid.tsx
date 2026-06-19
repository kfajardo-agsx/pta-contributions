"use client";

import { useState, useTransition } from "react";
import { setCrMaintenance } from "../actions";
import {
  MONTHLY_ITEMS,
  ONE_TIME_ITEMS,
  ONE_TIME_MONTH,
  crKey,
  type CrItem,
} from "@/lib/cr";
import { MONTHS } from "@/lib/monthly";

type Cell = { checked: boolean; remarks: string };

export function CrGrid({
  initial,
  canEdit,
}: {
  initial: Record<string, Cell>;
  canEdit: boolean;
}) {
  const [cells, setCells] = useState<Record<string, Cell>>(() => ({
    ...initial,
  }));
  const [isPending, startTransition] = useTransition();

  function cellOf(month: number, itemKey: string): Cell {
    return cells[crKey(month, itemKey)] ?? { checked: false, remarks: "" };
  }

  function persist(month: number, itemKey: string, next: Cell) {
    startTransition(async () => {
      await setCrMaintenance(month, itemKey, next.checked, next.remarks);
    });
  }

  function toggle(month: number, itemKey: string) {
    if (!canEdit) return;
    const key = crKey(month, itemKey);
    const next = { ...cellOf(month, itemKey), checked: !cellOf(month, itemKey).checked };
    setCells((prev) => ({ ...prev, [key]: next }));
    persist(month, itemKey, next);
  }

  function changeRemarks(month: number, itemKey: string, remarks: string) {
    const key = crKey(month, itemKey);
    setCells((prev) => ({
      ...prev,
      [key]: { ...cellOf(month, itemKey), remarks },
    }));
  }

  function commitRemarks(month: number, itemKey: string) {
    if (!canEdit) return;
    persist(month, itemKey, cellOf(month, itemKey));
  }

  // Plain render helper (not a component) so inputs keep focus across keystrokes.
  function itemRow(month: number, item: CrItem) {
    const cell = cellOf(month, item.key);
    return (
      <div className="cr-item" key={`${month}:${item.key}`}>
        <label className="cr-check-label">
          <input
            type="checkbox"
            checked={cell.checked}
            onChange={() => toggle(month, item.key)}
            disabled={!canEdit}
          />
          <span>{item.label}</span>
        </label>
        <input
          type="text"
          className="cr-remarks"
          placeholder="Remarks"
          value={cell.remarks}
          onChange={(e) => changeRemarks(month, item.key, e.target.value)}
          onBlur={() => commitRemarks(month, item.key)}
          disabled={!canEdit}
        />
      </div>
    );
  }

  return (
    <div data-pending={isPending ? "" : undefined}>
      <section className="cr-box cr-onetime">
        <h3 className="cr-month">One-time purchases</h3>
        {ONE_TIME_ITEMS.map((item) => itemRow(ONE_TIME_MONTH, item))}
      </section>

      <p className="cr-section-label">Cleaning Supplies — monthly</p>
      <div className="cr-grid">
        {MONTHS.map((month, m) => (
          <section key={month} className="cr-box">
            <h3 className="cr-month">{month}</h3>
            {MONTHLY_ITEMS.map((item) => itemRow(m, item))}
          </section>
        ))}
      </div>
    </div>
  );
}
