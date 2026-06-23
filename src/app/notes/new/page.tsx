"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewNotePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Could not save note.");
      return;
    }
    router.push("/notes");
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="vault-heading mb-6 text-2xl font-semibold">New note</h1>
      <form onSubmit={handleSubmit} className="panel space-y-4 p-6">
        <div>
          <label className="label">Title</label>
          <input className="field" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="label">Content</label>
          <textarea className="field min-h-40" required value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        <button className="btn-primary" disabled={loading} type="submit">
          {loading ? "Saving…" : "Save note"}
        </button>
      </form>
    </div>
  );
}
