"use client";

import { useState, useTransition } from "react";
import { setCrMaintenance } from "../actions";
import { ONE_TIME_ITEMS, ONE_TIME_MONTH, crKey, type CrItem } from "@/lib/cr";

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

  function cellOf(itemKey: string): Cell {
    return cells[crKey(ONE_TIME_MONTH, itemKey)] ?? { checked: false, remarks: "" };
  }

  function persist(itemKey: string, next: Cell) {
    startTransition(async () => {
      await setCrMaintenance(ONE_TIME_MONTH, itemKey, next.checked, next.remarks);
    });
  }

  function toggle(itemKey: string) {
    if (!canEdit) return;
    const next = { ...cellOf(itemKey), checked: !cellOf(itemKey).checked };
    setCells((prev) => ({ ...prev, [crKey(ONE_TIME_MONTH, itemKey)]: next }));
    persist(itemKey, next);
  }

  function changeRemarks(itemKey: string, remarks: string) {
    setCells((prev) => ({
      ...prev,
      [crKey(ONE_TIME_MONTH, itemKey)]: { ...cellOf(itemKey), remarks },
    }));
  }

  function commitRemarks(itemKey: string) {
    if (!canEdit) return;
    persist(itemKey, cellOf(itemKey));
  }

  function itemRow(item: CrItem) {
    const cell = cellOf(item.key);
    return (
      <div className="cr-item" key={item.key}>
        <label className="cr-check-label">
          <input
            type="checkbox"
            checked={cell.checked}
            onChange={() => toggle(item.key)}
            disabled={!canEdit}
          />
          <span>{item.label}</span>
        </label>
        <input
          type="text"
          className="cr-remarks"
          placeholder="Remarks"
          value={cell.remarks}
          onChange={(e) => changeRemarks(item.key, e.target.value)}
          onBlur={() => commitRemarks(item.key)}
          disabled={!canEdit}
        />
      </div>
    );
  }

  return (
    <section
      className="cr-box cr-onetime"
      data-pending={isPending ? "" : undefined}
    >
      <h3 className="cr-month">One-time purchases</h3>
      {ONE_TIME_ITEMS.map((item) => itemRow(item))}
    </section>
  );
}
