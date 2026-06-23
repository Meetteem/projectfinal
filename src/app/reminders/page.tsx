"use client";

import { useEffect, useState } from "react";

type Reminder = { id: string; title: string; content: string; remindAt: string };

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [remindAt, setRemindAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/reminders");
    if (res.ok) setReminders(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, remindAt }),
    });
    setTitle("");
    setContent("");
    setRemindAt("");
    setSaving(false);
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/reminders/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="vault-heading text-2xl font-semibold">Reminders</h1>

      <form onSubmit={handleAdd} className="panel mt-6 space-y-3 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Title</label>
            <input className="field" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="label">Remind at</label>
            <input className="field" type="datetime-local" required value={remindAt} onChange={(e) => setRemindAt(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Content</label>
          <textarea className="field" required value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
        <button className="btn-primary" disabled={saving} type="submit">
          {saving ? "Saving…" : "Add reminder"}
        </button>
      </form>

      {loading ? (
        <p className="mt-6 text-[var(--muted)]">Loading…</p>
      ) : reminders.length === 0 ? (
        <p className="mt-6 text-[var(--muted)]">No reminders yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {reminders.map((r) => (
            <div key={r.id} className="panel flex items-start justify-between gap-3 p-4">
              <div>
                <p className="font-semibold">{r.title}</p>
                <p className="text-sm text-[var(--muted)]">{r.content}</p>
                <p className="mt-1 text-xs text-[var(--accent)]">{new Date(r.remindAt).toLocaleString()}</p>
              </div>
              <button onClick={() => remove(r.id)} className="btn-danger">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
