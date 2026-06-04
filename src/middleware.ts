import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight middleware — auth is enforced at the page/API level.
// NextAuth v5 host-checking in Edge runtime is bypassed here.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
