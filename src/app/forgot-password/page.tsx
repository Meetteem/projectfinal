"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    setMessage(data.message || data.error);
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-20">
      <h1 className="vault-heading mb-6 text-2xl font-semibold">Forgot password</h1>
      <form onSubmit={handleSubmit} className="panel space-y-4 p-6">
        <div>
          <label className="label">Email</label>
          <input className="field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {message && <p className="text-sm text-[var(--muted)]">{message}</p>}
        <button className="btn-primary w-full" disabled={loading} type="submit">
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </div>
  );
}
