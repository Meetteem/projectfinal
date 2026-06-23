import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptContent } from "@/lib/encryption";
import { generateSummary, summaryToMermaid } from "@/lib/ai";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note || note.userId !== (session.user as { id: string }).id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const decrypted = decryptContent(note.content, session.user.email!);
  const summary = await generateSummary(decrypted);
  const mermaid = summaryToMermaid(summary);

  return NextResponse.json({ content: decrypted, summary, mermaid });
}
