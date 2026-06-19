"use server";

import { redirect } from "next/navigation";
import { login, logout } from "@/lib/auth";

export type LoginState = { error?: string; ok?: boolean };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const ok = await login(username, password);
  if (!ok) {
    return { error: "Incorrect username or password." };
  }
  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  await logout();
  redirect("/");
}
