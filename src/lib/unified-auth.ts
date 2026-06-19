import { NextRequest } from "next/server";
import { auth } from "./auth";
import { getMobileUser } from "./mobile-auth";

// Returns the authenticated userId from either a NextAuth session cookie
// or a mobile Bearer JWT. Use this in API routes that serve both web and mobile.
export async function getAuthUserId(req: NextRequest): Promise<string | null> {
  // Try Bearer token first (fast, no DB round-trip)
  const mobileUser = getMobileUser(req);
  if (mobileUser) return mobileUser.id;

  // Fall back to NextAuth session (cookie-based, web)
  const session = await auth();
  return session?.user?.id ?? null;
}
