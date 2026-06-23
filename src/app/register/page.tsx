"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Registration failed.");
      return;
    }
    router.push("/login");
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-20">
      <h1 className="vault-heading mb-6 text-2xl font-semibold">Create account</h1>
      <form onSubmit={handleSubmit} className="panel space-y-4 p-6">
        <div>
          <label className="label">Email</label>
          <input className="field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="field" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <p className="mt-1 text-xs text-[var(--muted)]">
            8+ characters, with uppercase, lowercase, a number, and a special character.
          </p>
        </div>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        <button className="btn-primary w-full" disabled={loading} type="submit">
          {loading ? "Creating…" : "Register"}
        </button>
        <p className="text-center text-sm text-[var(--muted)]">
          Already have an account? <Link href="/login" className="text-[var(--accent)]">Log in</Link>
        </p>
      </form>
    </div>
  );
}
