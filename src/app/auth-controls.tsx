"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction, logoutAction, type LoginState } from "./login/actions";

const initial: LoginState = {};

export function AuthControls({ authed }: { authed: boolean }) {
  const [open, setOpen] = useState(false);

  if (authed) {
    return (
      <form action={logoutAction}>
        <button type="submit" className="btn-ghost">
          Log out
        </button>
      </form>
    );
  }

  return (
    <>
      <button
        type="button"
        className="btn-primary"
        onClick={() => setOpen(true)}
      >
        Log in
      </button>
      {open ? <LoginModal onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function LoginModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(loginAction, initial);

  useEffect(() => {
    if (state.ok) {
      router.refresh();
      onClose();
    }
  }, [state.ok, router, onClose]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Log in to edit"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Log in to edit</h2>
        <p className="login-hint">Viewing is open. Log in to make changes.</p>
        <form action={formAction}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              autoFocus
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {state.error ? <p className="error">{state.error}</p> : null}
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={pending}>
              {pending ? "Logging in…" : "Log in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
