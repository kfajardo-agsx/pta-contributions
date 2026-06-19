"use client";

import { useOptimistic, useState, useTransition } from "react";
import { toggleMonthlyCheck } from "./actions";
import {
  AMOUNT_PER_CHECK,
  MEMBERS,
  MONTHS,
  cellKey,
  peso,
} from "@/lib/monthly";

export function MonthlyGrid({ initialChecked }: { initialChecked: string[] }) {
  const [checked, setChecked] = useState(() => new Set(initialChecked));
  const [optimisticChecked, applyOptimistic] = useOptimistic(
    checked,
    (state: Set<string>, key: string) => {
      const next = new Set(state);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    },
  );
  const [isPending, startTransition] = useTransition();

  function toggle(member: string, monthIndex: number) {
    const key = cellKey(member, monthIndex);
    startTransition(async () => {
      applyOptimistic(key);
      const nowChecked = await toggleMonthlyCheck(member, monthIndex);
      setChecked((prev) => {
        const next = new Set(prev);
        if (nowChecked) next.add(key);
        else next.delete(key);
        return next;
      });
    });
  }

  const totalChecks = optimisticChecked.size;
  const grandTotal = totalChecks * AMOUNT_PER_CHECK;

  const columnTotals = MONTHS.map(
    (_, m) =>
      MEMBERS.filter((member) => optimisticChecked.has(cellKey(member, m)))
        .length,
  );

  return (
    <div className="sheet-wrap" data-pending={isPending ? "" : undefined}>
      <table className="sheet">
        <thead>
          <tr>
            <th className="name-col">Member</th>
            {MONTHS.map((month) => (
              <th key={month} className="month-col">
                {month}
              </th>
            ))}
            <th className="total-col">Paid</th>
          </tr>
        </thead>
        <tbody>
          {MEMBERS.map((member) => {
            const rowCount = MONTHS.reduce(
              (n, _, m) =>
                optimisticChecked.has(cellKey(member, m)) ? n + 1 : n,
              0,
            );
            return (
              <tr key={member}>
                <th scope="row" className="name-col">
                  {member}
                </th>
                {MONTHS.map((month, m) => {
                  const key = cellKey(member, m);
                  const isChecked = optimisticChecked.has(key);
                  return (
                    <td key={month} className="check-cell">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isChecked}
                        aria-label={`${member}, ${month}`}
                        className={isChecked ? "check on" : "check"}
                        onClick={() => toggle(member, m)}
                      >
                        {isChecked ? "✓" : ""}
                      </button>
                    </td>
                  );
                })}
                <td className="total-col">{peso.format(rowCount * AMOUNT_PER_CHECK)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" className="name-col">
              Total
            </th>
            {columnTotals.map((count, m) => (
              <td key={m} className="total-col">
                {peso.format(count * AMOUNT_PER_CHECK)}
              </td>
            ))}
            <td className="total-col grand">{peso.format(grandTotal)}</td>
          </tr>
        </tfoot>
      </table>

      <p className="grand-total">
        {totalChecks} {totalChecks === 1 ? "payment" : "payments"} ·{" "}
        <strong>{peso.format(grandTotal)}</strong> collected
      </p>
    </div>
  );
}
