import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptContent } from "@/lib/encryption";

async function getOwned(id: string, userId: string) {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== userId) return null;
  return notification;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getOwned(id, (session.user as { id: string }).id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { title, content } = await req.json();
  const notification = await prisma.notification.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title: encryptContent(title, session.user.email!) } : {}),
      ...(content !== undefined ? { content: encryptContent(content, session.user.email!) } : {}),
    },
  });

  return NextResponse.json({ ...notification, title: title ?? "", content: content ?? "" });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getOwned(id, (session.user as { id: string }).id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.notification.delete({ where: { id } });
  return NextResponse.json({ message: "Notification deleted." });
}
