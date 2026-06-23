"use client";

import { useEffect, useRef, useState } from "react";

export default function FlowchartViewer({ definition }: { definition: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({ startOnLoad: false, theme: "dark" });
        const { svg } = await mermaid.render(`flowchart-${Date.now()}`, definition);
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      } catch {
        if (!cancelled) setError("Could not render flowchart for this summary.");
      }
    }
    render();
    return () => {
      cancelled = true;
    };
  }, [definition]);

  if (error) return <p className="text-sm text-[var(--danger)]">{error}</p>;
  return <div ref={ref} className="overflow-x-auto" />;
}
