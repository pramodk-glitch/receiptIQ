export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/receipts/:path*",
    "/import/:path*",
    "/manual-entry/:path*",
    "/login",
    "/register",
  ],
};
