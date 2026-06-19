"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addCleaningContribution,
  deleteCleaningContribution,
} from "../actions";
import { MONTHS, peso } from "@/lib/monthly";

export type Contribution = {
  id: number;
  monthIndex: number;
  type: "cash" | "item";
  itemName: string | null;
  value: number | null;
  contributor: string;
  remarks: string;
};

export function CleaningLog({
  contributions,
  canEdit,
  defaultMonth,
}: {
  contributions: Contribution[];
  canEdit: boolean;
  defaultMonth: number;
}) {
  const router = useRouter();
  const [month, setMonth] = useState(defaultMonth);
  const [modalOpen, setModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const forMonth = contributions.filter((c) => c.monthIndex === month);
  const cashTotal = forMonth
    .filter((c) => c.type === "cash")
    .reduce((sum, c) => sum + (c.value ?? 0), 0);

  function onDelete(id: number) {
    startTransition(async () => {
      await deleteCleaningContribution(id);
      router.refresh();
    });
  }

  return (
    <section>
      <p className="cr-section-label">Other contributions</p>

      <div className="subtabs" role="tablist">
        {MONTHS.map((m, i) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={i === month}
            className={i === month ? "subtab active" : "subtab"}
            onClick={() => setMonth(i)}
          >
            {m}
          </button>
        ))}
      </div>

      <div
        className="cleaning-panel"
        data-pending={isPending ? "" : undefined}
      >
        <div className="cleaning-head">
          <div className="summary-stat">
            Cash total — {MONTHS[month]}
            <strong>{peso.format(cashTotal)}</strong>
          </div>
          {canEdit ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => setModalOpen(true)}
            >
              Add Contribution
            </button>
          ) : null}
        </div>

        {forMonth.length === 0 ? (
          <p className="empty">No contributions yet for {MONTHS[month]}.</p>
        ) : (
          <ul className="contrib-list">
            {forMonth.map((c) => (
              <li key={c.id} className="contrib-row">
                <span className={`contrib-tag ${c.type}`}>
                  {c.type === "cash" ? "Cash" : "Item"}
                </span>
                <span className="contrib-main">
                  <strong>
                    {c.type === "cash" ? peso.format(c.value ?? 0) : c.itemName}
                  </strong>
                  <span className="contrib-by">{c.contributor}</span>
                </span>
                {c.remarks ? (
                  <span className="contrib-remarks">{c.remarks}</span>
                ) : (
                  <span className="contrib-remarks" />
                )}
                {canEdit ? (
                  <button
                    type="button"
                    className="contrib-del"
                    aria-label="Delete contribution"
                    onClick={() => onDelete(c.id)}
                  >
                    ✕
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {modalOpen ? (
        <AddModal
          month={month}
          onClose={() => setModalOpen(false)}
          onAdded={() => {
            setModalOpen(false);
            router.refresh();
          }}
        />
      ) : null}
    </section>
  );
}

function AddModal({
  month,
  onClose,
  onAdded,
}: {
  month: number;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [type, setType] = useState<"cash" | "item">("item");
  const [itemName, setItemName] = useState("");
  const [value, setValue] = useState("");
  const [contributor, setContributor] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await addCleaningContribution({
        monthIndex: month,
        type,
        itemName: type === "item" ? itemName : undefined,
        value: type === "cash" ? Number(value) : undefined,
        contributor,
        remarks,
      });
      if (res.error) setError(res.error);
      else onAdded();
    });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Add contribution for ${MONTHS[month]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Add Contribution — {MONTHS[month]}</h2>

        <form onSubmit={submit}>
          <div className="radio-row">
            <label className={type === "item" ? "radio on" : "radio"}>
              <input
                type="radio"
                name="type"
                checked={type === "item"}
                onChange={() => setType("item")}
              />
              Item
            </label>
            <label className={type === "cash" ? "radio on" : "radio"}>
              <input
                type="radio"
                name="type"
                checked={type === "cash"}
                onChange={() => setType("cash")}
              />
              Cash
            </label>
          </div>

          {type === "item" ? (
            <div className="field">
              <label htmlFor="itemName">Item</label>
              <input
                id="itemName"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                autoFocus
                required
              />
            </div>
          ) : (
            <div className="field">
              <label htmlFor="value">Value</label>
              <input
                id="value"
                type="number"
                min="0.01"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
                required
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="contributor">Contributor</label>
            <input
              id="contributor"
              value={contributor}
              onChange={(e) => setContributor(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="remarks">Remarks</label>
            <input
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          {error ? <p className="error">{error}</p> : null}

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={pending}>
              {pending ? "Adding…" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
