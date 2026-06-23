import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isStrongPassword } from "@/lib/validators";

export async function POST(req: Request) {
  const { token, password } = await req.json();
  if (!token || !password) {
    return NextResponse.json({ error: "Token and password are required." }, { status: 400 });
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
  }

  if (!isStrongPassword(password)) {
    return NextResponse.json(
      { error: "Password must meet the required strength." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash },
  });
  await prisma.passwordResetToken.delete({ where: { token } });

  return NextResponse.json({ message: "Password successfully reset." });
}
