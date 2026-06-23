"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid username or password.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-20">
      <h1 className="vault-heading mb-6 text-2xl font-semibold">Log in</h1>
      <form onSubmit={handleSubmit} className="panel space-y-4 p-6">
        <div>
          <label className="label">Email</label>
          <input className="field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="field" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        <button className="btn-primary w-full" disabled={loading} type="submit">
          {loading ? "Logging in…" : "Log in"}
        </button>
        <p className="text-center text-sm text-[var(--muted)]">
          <Link href="/forgot-password" className="text-[var(--accent)]">Forgot password?</Link>
        </p>
        <p className="text-center text-sm text-[var(--muted)]">
          No account? <Link href="/register" className="text-[var(--accent)]">Register</Link>
        </p>
      </form>
    </div>
  );
}
