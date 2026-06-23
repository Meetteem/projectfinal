import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptContent, decryptContent } from "@/lib/encryption";

async function getOwnedNote(id: string, userId: string) {
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note || note.userId !== userId) return null;
  return note;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const note = await getOwnedNote(id, (session.user as { id: string }).id);
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ...note, content: decryptContent(note.content, session.user.email!) });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getOwnedNote(id, (session.user as { id: string }).id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { title, content, pinned } = await req.json();
  const note = await prisma.note.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(content !== undefined ? { content: encryptContent(content, session.user.email!) } : {}),
      ...(pinned !== undefined ? { pinned } : {}),
    },
  });

  return NextResponse.json({ ...note, content: content ?? decryptContent(note.content, session.user.email!) });
}

/** Soft delete (recycle bin) by default; pass ?permanent=true to hard delete. */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getOwnedNote(id, (session.user as { id: string }).id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = new URL(req.url);
  const permanent = url.searchParams.get("permanent") === "true";

  if (permanent || existing.deletedAt) {
    await prisma.note.delete({ where: { id } });
  } else {
    await prisma.note.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  return NextResponse.json({ message: "Note deleted." });
}
