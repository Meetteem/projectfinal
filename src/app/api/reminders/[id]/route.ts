import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptContent } from "@/lib/encryption";

async function getOwned(id: string, userId: string) {
  const reminder = await prisma.reminder.findUnique({ where: { id } });
  if (!reminder || reminder.userId !== userId) return null;
  return reminder;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getOwned(id, (session.user as { id: string }).id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { title, content, remindAt } = await req.json();
  const reminder = await prisma.reminder.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title: encryptContent(title, session.user.email!) } : {}),
      ...(content !== undefined ? { content: encryptContent(content, session.user.email!) } : {}),
      ...(remindAt !== undefined ? { remindAt: new Date(remindAt) } : {}),
    },
  });

  return NextResponse.json({ ...reminder, title: title ?? "", content: content ?? "" });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getOwned(id, (session.user as { id: string }).id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.reminder.delete({ where: { id } });
  return NextResponse.json({ message: "Reminder deleted." });
}
