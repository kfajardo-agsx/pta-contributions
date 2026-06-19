"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Monthly Contribution" },
  { href: "/project", label: "Project Contribution" },
  { href: "/other-donations", label: "Other Donations" },
];

export function Tabs() {
  const pathname = usePathname();

  return (
    <nav className="tabs">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={active ? "tab active" : "tab"}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
