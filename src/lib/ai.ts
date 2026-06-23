/**
 * Summarization.
 *
 * Primary: Hugging Face's free Inference API (https://huggingface.co/inference-api).
 * Requires a free HF account + access token (HUGGINGFACE_API_KEY) — no credit
 * card, no paid tier needed for this model.
 *
 * Fallback: if no token is configured, falls back to a simple local
 * extractive summarizer (first N sentences) so the feature still works with
 * zero external services / zero signups.
 */

const HF_MODEL = "sshleifer/distilbart-cnn-12-6";

function localExtractiveSummary(text: string, maxSentences = 3): string {
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0);
  if (sentences.length <= maxSentences) return sentences.join(" ");
  return sentences.slice(0, maxSentences).join(" ");
}

export async function generateSummary(noteText: string): Promise<string> {
  const text = noteText.trim();
  if (!text) return "No content to summarize.";

  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return localExtractiveSummary(text);
  }

  try {
    const res = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text,
        parameters: { max_length: 60, min_length: 20, do_sample: false },
      }),
    });

    if (!res.ok) {
      // Model may be cold-loading on the free tier; fall back gracefully.
      return localExtractiveSummary(text);
    }

    const data = await res.json();
    const summary = Array.isArray(data) ? data[0]?.summary_text : data?.summary_text;
    return summary || localExtractiveSummary(text);
  } catch {
    return localExtractiveSummary(text);
  }
}

/** Turns a summary into Mermaid flowchart syntax (rendered client-side, no external service). */
export function summaryToMermaid(summary: string): string {
  const steps = summary
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (steps.length === 0) {
    return "flowchart TD\n  A[No content]";
  }

  const sanitize = (s: string) =>
    s.replace(/"/g, "'").replace(/\n/g, " ").slice(0, 80);

  const lines = ["flowchart TD"];
  steps.forEach((step, i) => {
    lines.push(`  N${i}["${sanitize(step)}"]`);
  });
  for (let i = 0; i < steps.length - 1; i++) {
    lines.push(`  N${i} --> N${i + 1}`);
  }
  return lines.join("\n");
}
