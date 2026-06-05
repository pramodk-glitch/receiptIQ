"use client";

import { useState } from "react";
import Link from "next/link";

export default function NavMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        aria-label="Open navigation"
        onClick={() => setOpen((s) => !s)}
        className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground bg-transparent hover:bg-muted/10"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 left-0 mt-2 w-56 bg-card border border-border rounded-md shadow-md p-3 flex flex-col gap-2">
          <Link href="/dashboard" onClick={() => setOpen(false)} className="text-sm font-medium text-foreground">Dashboard</Link>
          <Link href="/receipts" onClick={() => setOpen(false)} className="text-sm font-medium text-foreground">Receipts</Link>
          <Link href="/receipts/upload" onClick={() => setOpen(false)} className="text-sm font-medium text-foreground">Upload</Link>
          <Link href="/manual-entry" onClick={() => setOpen(false)} className="text-sm font-medium text-foreground">Manual Entry</Link>
          <Link href="/price-compare" onClick={() => setOpen(false)} className="text-sm font-medium text-primary">Price Intel</Link>
        </div>
      )}
    </div>
  );
}
