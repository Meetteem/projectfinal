import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptContent, decryptContent } from "@/lib/encryption";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { userId: (session.user as { id: string }).id },
    orderBy: { createdAt: "desc" },
  });

  const decrypted = notifications.map((n) => ({
    ...n,
    title: decryptContent(n.title, session.user!.email!),
    content: decryptContent(n.content, session.user!.email!),
  }));

  return NextResponse.json(decrypted);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content } = await req.json();
  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
  }

  const notification = await prisma.notification.create({
    data: {
      title: encryptContent(title, session.user.email!),
      content: encryptContent(content, session.user.email!),
      userId: (session.user as { id: string }).id,
    },
  });

  return NextResponse.json({ ...notification, title, content }, { status: 201 });
}
