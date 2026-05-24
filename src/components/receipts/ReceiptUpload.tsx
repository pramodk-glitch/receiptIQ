"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import crypto from "crypto";

type UploadState = "idle" | "reading" | "presigning" | "uploading" | "saving" | "done" | "error";

export function ReceiptUpload() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

  const handleFile = useCallback((file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrorMessage("Please upload a JPEG, PNG, WebP, or GIF image.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage("File is too large. Maximum size is 20 MB.");
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
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

  const computeFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadState("reading");
    setProgress(10);
    setErrorMessage(null);

    try {
      const contentHash = await computeFileHash(selectedFile);

      setUploadState("presigning");
      setProgress(25);

      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: selectedFile.type,
          fileName: selectedFile.name,
        }),
      });

      if (!presignRes.ok) {
        const err = await presignRes.json();
        throw new Error(err.error ?? "Failed to get upload URL");
      }

      const { presignedUrl, s3Key, imageUrl } = await presignRes.json();

      setUploadState("uploading");
      setProgress(50);

      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        body: selectedFile,
        headers: { "Content-Type": selectedFile.type },
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload file to storage");
      }

      setUploadState("saving");
      setProgress(80);

      const saveRes = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: "Processing...",
          receiptDate: new Date().toISOString(),
          totalAmount: 0,
          imageUrl,
          s3Key,
          source: "upload",
          contentHashInput: contentHash,
        }),
      });

      if (!saveRes.ok) {
        const err = await saveRes.json();
        if (saveRes.status === 409) {
          throw new Error(
            `Duplicate receipt detected. This receipt has already been uploaded. (ID: ${err.existingId})`
          );
        }
        throw new Error(err.error ?? "Failed to save receipt");
      }

      const { id } = await saveRes.json();

      setProgress(100);
      setUploadState("done");

      toast({
        title: "Receipt uploaded successfully",
        description:
          "Your receipt is being processed with AI OCR. Line items will appear shortly.",
      });

      router.push(`/receipts/${id}`);
    } catch (err) {
      setUploadState("error");
      setErrorMessage(err instanceof Error ? err.message : "Upload failed");
      setProgress(0);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setPreview(null);
    setUploadState("idle");
    setProgress(0);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const stateMessages: Record<UploadState, string> = {
    idle: "",
    reading: "Reading file...",
    presigning: "Preparing upload...",
    uploading: "Uploading to storage...",
    saving: "Saving receipt...",
    done: "Done!",
    error: "",
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
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            <div>
              <p className="text-lg font-semibold text-slate-700">
                {dragOver ? "Drop your receipt here" : "Drag & drop your receipt"}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                or <span className="text-indigo-600 font-medium">click to browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-2">
                JPEG, PNG, WebP, GIF — up to 20 MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
            {preview && (
              <img
                src={preview}
                alt="Receipt preview"
                className="w-full max-h-96 object-contain"
              />
            )}
            <button
              onClick={resetUpload}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">{selectedFile.name}</p>
              <p className="text-xs text-slate-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {uploadState !== "idle" && uploadState !== "error" && uploadState !== "done" && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">{stateMessages[uploadState]}</span>
            <span className="text-slate-400">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {selectedFile && (
        <Button
          onClick={handleUpload}
          disabled={uploadState !== "idle" && uploadState !== "error"}
          className="w-full"
          size="lg"
        >
          {uploadState === "idle" || uploadState === "error"
            ? "Upload Receipt"
            : uploadState === "done"
              ? "Uploaded!"
              : "Uploading..."}
        </Button>
      )}
    </div>
  );
}
