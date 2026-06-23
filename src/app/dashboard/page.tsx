import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const [noteCount, reminderCount, notificationCount] = await Promise.all([
    prisma.note.count({ where: { userId, deletedAt: null } }),
    prisma.reminder.count({ where: { userId } }),
    prisma.notification.count({ where: { userId } }),
  ]);

  const cards = [
    { href: "/notes", label: "Notes", count: noteCount, hint: "Encrypted notes with AI summaries" },
    { href: "/reminders", label: "Reminders", count: reminderCount, hint: "Scheduled, encrypted reminders" },
    { href: "/notifications", label: "Notifications", count: notificationCount, hint: "Encrypted alerts and logs" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="vault-heading text-2xl font-semibold">Welcome back, {session.user.email}</h1>
      <p className="mt-1 text-[var(--muted)]">Everything here is encrypted at rest with a key unique to your account.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="panel block p-5 hover:border-[var(--accent-dim)]">
            <p className="text-sm text-[var(--muted)]">{c.label}</p>
            <p className="vault-heading mt-1 text-3xl font-semibold">{c.count}</p>
            <p className="mt-2 text-xs text-[var(--muted)]">{c.hint}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
