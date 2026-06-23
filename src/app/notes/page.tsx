"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Note = {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  updatedAt: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/notes");
    if (res.ok) setNotes(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function togglePin(note: Note) {
    await fetch(`/api/notes/${note.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !note.pinned }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <div className="flex items-center justify-between">
        <h1 className="vault-heading text-2xl font-semibold">Notes</h1>
        <Link href="/notes/new" className="btn-primary">+ Add note</Link>
      </div>

      {loading ? (
        <p className="mt-6 text-[var(--muted)]">Loading…</p>
      ) : notes.length === 0 ? (
        <p className="mt-6 text-[var(--muted)]">No notes yet. Create your first one.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {notes.map((n) => (
            <div key={n.id} className="panel p-5">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/notes/${n.id}`} className="vault-heading font-semibold hover:text-[var(--accent)]">
                  {n.title}
                </Link>
                <button onClick={() => togglePin(n)} className="text-xs text-[var(--muted)] hover:text-[var(--accent)]">
                  {n.pinned ? "★ Pinned" : "☆ Pin"}
                </button>
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-[var(--muted)]">{n.content}</p>
              <div className="mt-4 flex gap-2 text-sm">
                <Link href={`/notes/${n.id}`} className="btn-secondary">Open</Link>
                <button onClick={() => remove(n.id)} className="btn-danger">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
