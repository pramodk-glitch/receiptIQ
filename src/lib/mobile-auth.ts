import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.NEXTAUTH_SECRET!;

export interface MobileTokenPayload {
  id: string;
  email: string;
  name: string;
}

export function signMobileToken(payload: MobileTokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "90d" });
}

export function verifyMobileToken(token: string): MobileTokenPayload | null {
  try {
    return jwt.verify(token, SECRET) as MobileTokenPayload;
  } catch {
    return null;
  }
}

// Returns the authenticated user from a Bearer token, or null.
export function getMobileUser(req: NextRequest): MobileTokenPayload | null {
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  return verifyMobileToken(auth.slice(7));
}
