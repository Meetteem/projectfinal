"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/notes", label: "Notes" },
  { href: "/reminders", label: "Reminders" },
  { href: "/notifications", label: "Notifications" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <nav className="border-b border-[var(--panel-border)] bg-[var(--panel)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <Link href="/dashboard" className="vault-heading text-lg font-semibold text-[var(--accent)]">
          ⛨ Secure Notes Vault
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                pathname?.startsWith(l.href)
                  ? "text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }
            >
              {l.label}
            </Link>
          ))}
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="btn-secondary text-sm">
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}
