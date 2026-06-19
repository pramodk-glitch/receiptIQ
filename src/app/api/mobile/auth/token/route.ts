import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { prisma } from "@/lib/db";
import { signMobileToken } from "@/lib/mobile-auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });

    if (!user || !(await bcryptjs.compare(String(password), user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const payload = { id: user.id, email: user.email, name: user.displayName ?? user.email };
    const token   = signMobileToken(payload);

    return NextResponse.json({ token, user: payload });
  } catch (e) {
    console.error("[mobile/auth/token]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
