"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords must match.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: params.token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not reset password.");
      return;
    }
    router.push("/login");
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-20">
      <h1 className="vault-heading mb-6 text-2xl font-semibold">Reset password</h1>
      <form onSubmit={handleSubmit} className="panel space-y-4 p-6">
        <div>
          <label className="label">New password</label>
          <input className="field" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <label className="label">Confirm password</label>
          <input className="field" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        <button className="btn-primary w-full" disabled={loading} type="submit">
          {loading ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </div>
  );
}
