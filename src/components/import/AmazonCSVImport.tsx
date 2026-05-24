"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

type ImportState = "idle" | "uploading" | "processing" | "done" | "error";

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export function AmazonCSVImport() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importState, setImportState] = useState<ImportState>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    const isCSV =
      file.name.endsWith(".csv") ||
      file.type === "text/csv" ||
      file.type === "application/csv" ||
      file.type === "application/vnd.ms-excel";

    if (!isCSV) {
      setErrorMessage("Please select a CSV file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File is too large. Maximum size is 10 MB.");
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    setResult(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setImportState("uploading");
    setProgress(30);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      setImportState("processing");
      setProgress(60);

      const res = await fetch("/api/import/amazon-csv", {
        method: "POST",
        body: formData,
      });

      setProgress(90);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Import failed");
      }

      setResult(data);
      setProgress(100);
      setImportState("done");

      toast({
        title: "Import complete",
        description: `${data.imported} orders imported, ${data.skipped} already existed.`,
      });

      router.refresh();
    } catch (err) {
      setImportState("error");
      setErrorMessage(err instanceof Error ? err.message : "Import failed");
      setProgress(0);
    }
  };

  const resetImport = () => {
    setSelectedFile(null);
    setImportState("idle");
    setProgress(0);
    setResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
            ${dragOver
              ? "border-indigo-400 bg-indigo-50"
              : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".csv,text/csv,application/csv"
            onChange={handleFileInput}
          />

          <div className="flex flex-col items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              dragOver ? "bg-indigo-100" : "bg-slate-100"
            }`}>
              <svg
                className={`w-8 h-8 ${dragOver ? "text-indigo-600" : "text-slate-400"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            <div>
              <p className="text-lg font-semibold text-slate-700">
                {dragOver ? "Drop your CSV here" : "Select Amazon Order CSV"}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                or <span className="text-indigo-600 font-medium">click to browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-2">
                CSV files only — up to 10 MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">{selectedFile.name}</p>
              <p className="text-xs text-slate-400">
                {(selectedFile.size / 1024).toFixed(1)} KB · CSV file
              </p>
            </div>
            {importState === "idle" || importState === "error" ? (
              <button
                onClick={resetImport}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {importState !== "idle" && importState !== "error" && importState !== "done" && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">
              {importState === "uploading" ? "Uploading file..." : "Processing orders..."}
            </span>
            <span className="text-slate-400">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {result && importState === "done" && (
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-green-50 border-b border-green-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-semibold text-green-800">Import Complete</p>
            </div>
          </div>

          <div className="px-5 py-4 space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600">{result.imported}</p>
                <p className="text-xs text-slate-500 mt-0.5">Orders Imported</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-400">{result.skipped}</p>
                <p className="text-xs text-slate-500 mt-0.5">Already Existed</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-red-500">{result.errors.length}</p>
                <p className="text-xs text-slate-500 mt-0.5">Errors</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm font-medium text-red-700 mb-2">Errors:</p>
                <ul className="text-xs text-red-600 space-y-1">
                  {result.errors.slice(0, 10).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {result.errors.length > 10 && (
                    <li>...and {result.errors.length - 10} more errors</li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={() => router.push("/receipts")} className="flex-1">
                View Receipts
              </Button>
              <Button variant="outline" onClick={resetImport}>
                Import Another
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedFile && (importState === "idle" || importState === "error") && (
        <Button
          onClick={handleImport}
          disabled={importState !== "idle" && importState !== "error"}
          className="w-full"
          size="lg"
        >
          Import Orders
        </Button>
      )}
    </div>
  );
}
