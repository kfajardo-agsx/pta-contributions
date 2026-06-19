"use client";

import { useState, useTransition } from "react";
import {
  addOneTimePurchase,
  deleteOneTimePurchase,
  setOneTimePurchaseChecked,
  setOneTimePurchaseRemarks,
} from "../actions";

type Row = { id: number; label: string; checked: boolean; remarks: string };

export function OneTimePurchases({
  items,
  canEdit,
}: {
  items: Row[];
  canEdit: boolean;
}) {
  const [rows, setRows] = useState<Row[]>(() => items);
  const [newLabel, setNewLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function setChecked(id: number, checked: boolean) {
    if (!canEdit) return;
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, checked } : r)));
    startTransition(async () => {
      await setOneTimePurchaseChecked(id, checked);
    });
  }

  function changeRemarks(id: number, remarks: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, remarks } : r)));
  }

  function commitRemarks(id: number) {
    if (!canEdit) return;
    const row = rows.find((r) => r.id === id);
    startTransition(async () => {
      await setOneTimePurchaseRemarks(id, row?.remarks ?? "");
    });
  }

  function remove(id: number) {
    if (!canEdit) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
    startTransition(async () => {
      await deleteOneTimePurchase(id);
    });
  }

  function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const label = newLabel.trim();
    if (!label) return;
    startTransition(async () => {
      const res = await addOneTimePurchase(label);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setRows((prev) => [...prev, res]);
      setNewLabel("");
    });
  }

  return (
    <section
      className="cr-box cr-onetime"
      data-pending={isPending ? "" : undefined}
    >
      <h3 className="cr-month">One-time purchases</h3>

      {rows.map((row) => (
        <div className="cr-item" key={row.id}>
          <label className="cr-check-label">
            <input
              type="checkbox"
              checked={row.checked}
              onChange={(e) => setChecked(row.id, e.target.checked)}
              disabled={!canEdit}
            />
            <span>{row.label}</span>
          </label>
          <input
            type="text"
            className="cr-remarks"
            placeholder="Remarks"
            value={row.remarks}
            onChange={(e) => changeRemarks(row.id, e.target.value)}
            onBlur={() => commitRemarks(row.id)}
            disabled={!canEdit}
          />
          {canEdit ? (
            <button
              type="button"
              className="contrib-del"
              aria-label={`Delete ${row.label}`}
              onClick={() => remove(row.id)}
            >
              ✕
            </button>
          ) : null}
        </div>
      ))}

      {canEdit ? (
        <form className="onetime-add" onSubmit={add}>
          <input
            type="text"
            placeholder="New purchase name"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
          />
          <button
            type="submit"
            className="btn-ghost"
            disabled={!newLabel.trim()}
          >
            Add one-time purchase
          </button>
        </form>
      ) : null}

      {error ? <p className="error">{error}</p> : null}
    </section>
  );
}
