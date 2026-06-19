import type { Metadata } from "next";
import { Tabs } from "./tabs";
import "./globals.css";

export const metadata: Metadata = {
  title: "PTA Contributions",
  description: "Parent-Teacher Association contribution sheets.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header>
            <h1>PTA Contributions</h1>
          </header>
          <Tabs />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
