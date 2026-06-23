"use client";

import { useEffect, useState } from "react";

type Notification = { id: string; title: string; content: string; createdAt: string };

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/notifications");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    setTitle("");
    setContent("");
    setSaving(false);
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="vault-heading text-2xl font-semibold">Notifications</h1>

      <form onSubmit={handleAdd} className="panel mt-6 space-y-3 p-5">
        <div>
          <label className="label">Title</label>
          <input className="field" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="label">Message</label>
          <textarea className="field" required value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
        <button className="btn-primary" disabled={saving} type="submit">
          {saving ? "Saving…" : "Add notification"}
        </button>
      </form>

      {loading ? (
        <p className="mt-6 text-[var(--muted)]">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-[var(--muted)]">No notifications yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((n) => (
            <div key={n.id} className="panel flex items-start justify-between gap-3 p-4">
              <div>
                <p className="font-semibold">{n.title}</p>
                <p className="text-sm text-[var(--muted)]">{n.content}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => remove(n.id)} className="btn-danger">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
