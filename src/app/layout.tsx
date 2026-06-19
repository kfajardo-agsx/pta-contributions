import type { Metadata } from "next";
import { AuthControls } from "./auth-controls";
import { Tabs } from "./tabs";
import { isAuthed } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "PTA Contributions",
  description: "Parent-Teacher Association contribution sheets.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthed();

  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="app-header">
            <h1>PTA Contributions</h1>
            <AuthControls authed={authed} />
          </header>
          <Tabs />
          {!authed ? (
            <p className="readonly-banner">
              👁️ View-only. Use the <strong>Log in</strong> button (top right) to
              make changes.
            </p>
          ) : null}
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
