import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Toaster } from "@/components/ui/toaster";
import NavMenu from "@/components/NavMenu";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-foreground text-lg">ReceiptIQ</span>
              </Link>

              <div className="hidden md:flex items-center gap-6">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/receipts"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Receipts
                </Link>
                <Link
                  href="/receipts/upload"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Upload
                </Link>
                <Link
                  href="/manual-entry"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Manual Entry
                </Link>
                <Link
                  href="/price-compare"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Price Intel
                </Link>
              </div>
              <div className="md:hidden">
                <NavMenu />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {session.user?.email}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      <Toaster />
    </div>
  );
}
