"use client";

import { useState } from "react";

export function ReclassifyButton() {
  const [state, setState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [result, setResult] = useState<string | null>(null);

  async function run() {
    setState("running");
    setResult(null);
    try {
      const res = await fetch("/api/admin/reclassify", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setResult(data.message);
      setState("done");
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Unknown error");
      setState("error");
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <button
        onClick={run}
        disabled={state === "running"}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
      >
        {state === "running" ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Reclassifying…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reclassify All Items
          </>
        )}
      </button>

      {result && (
        <p className={`text-sm ${state === "error" ? "text-red-600" : "text-slate-500"}`}>
          {state === "done" && <span className="text-green-600 mr-1">✓</span>}
          {result}
        </p>
      )}
    </div>
  );
}
