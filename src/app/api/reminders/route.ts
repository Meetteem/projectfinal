import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptContent, decryptContent } from "@/lib/encryption";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reminders = await prisma.reminder.findMany({
    where: { userId: (session.user as { id: string }).id },
    orderBy: { remindAt: "asc" },
  });

  const decrypted = reminders.map((r) => ({
    ...r,
    title: decryptContent(r.title, session.user!.email!),
    content: decryptContent(r.content, session.user!.email!),
  }));

  return NextResponse.json(decrypted);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, remindAt } = await req.json();
  if (!title || !content || !remindAt) {
    return NextResponse.json({ error: "Title, content, and remindAt are required." }, { status: 400 });
  }

  const reminder = await prisma.reminder.create({
    data: {
      title: encryptContent(title, session.user.email!),
      content: encryptContent(content, session.user.email!),
      remindAt: new Date(remindAt),
      userId: (session.user as { id: string }).id,
    },
  });

  return NextResponse.json({ ...reminder, title, content }, { status: 201 });
}
