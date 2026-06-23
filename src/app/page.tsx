import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-5 py-24 text-center">
      <span className="rounded-full border border-[var(--panel-border)] px-3 py-1 text-xs uppercase tracking-wide text-[var(--muted)]">
        Encrypted · AI-assisted · Free to run
      </span>
      <h1 className="vault-heading text-4xl font-semibold sm:text-5xl">
        A private vault for notes, reminders, and notifications.
      </h1>
      <p className="max-w-xl text-[var(--muted)]">
        Every note is encrypted with a key unique to your account. Summarize
        long notes and turn them into flowcharts in one click — nothing
        leaves the vault unencrypted.
      </p>
      <div className="flex gap-3">
        <Link href="/register" className="btn-primary">
          Create an account
        </Link>
        <Link href="/login" className="btn-secondary">
          Log in
        </Link>
      </div>
    </div>
  );
}
