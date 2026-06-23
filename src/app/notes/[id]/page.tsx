"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FlowchartViewer from "@/components/FlowchartViewer";

type Note = { id: string; title: string; content: string };

export default function NoteDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [mermaid, setMermaid] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    fetch(`/api/notes/${params.id}`).then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setNote(data);
        setTitle(data.title);
        setContent(data.content);
      }
    });
  }, [params.id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/notes/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    setSaving(false);
  }

  async function handleDelete() {
    await fetch(`/api/notes/${params.id}`, { method: "DELETE" });
    router.push("/notes");
  }

  async function handleSummarize() {
    setSummarizing(true);
    setSummary(null);
    setMermaid(null);
    const res = await fetch(`/api/notes/${params.id}/summarize`);
    if (res.ok) {
      const data = await res.json();
      setSummary(data.summary);
      setMermaid(data.mermaid);
    }
    setSummarizing(false);
  }

  if (!note) return <div className="mx-auto max-w-2xl px-5 py-12 text-[var(--muted)]">Loading…</div>;

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <form onSubmit={handleSave} className="panel space-y-4 p-6">
        <div>
          <label className="label">Title</label>
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="label">Content</label>
          <textarea className="field min-h-40" value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" disabled={saving} type="submit">
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button type="button" onClick={handleSummarize} className="btn-secondary" disabled={summarizing}>
            {summarizing ? "Summarizing…" : "Summarize & generate flowchart"}
          </button>
          <button type="button" onClick={handleDelete} className="btn-danger">
            Delete note
          </button>
        </div>
      </form>

      {summary && (
        <div className="panel mt-6 p-6">
          <h2 className="label">AI summary</h2>
          <p className="mb-4">{summary}</p>
          <h2 className="label">Flowchart</h2>
          {mermaid && <FlowchartViewer definition={mermaid} />}
        </div>
      )}
    </div>
  );
}
