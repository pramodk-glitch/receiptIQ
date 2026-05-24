"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface DeleteReceiptButtonProps {
  receiptId: string;
}

export function DeleteReceiptButton({ receiptId }: DeleteReceiptButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/receipts/${receiptId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete receipt");
      }

      toast({
        title: "Receipt deleted",
        description: "The receipt has been removed from your account.",
      });

      router.push("/receipts");
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete receipt. Please try again.",
        variant: "destructive",
      });
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (!showConfirm) {
    return (
      <Button
        variant="outline"
        onClick={() => setShowConfirm(true)}
        className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
      >
        Delete Receipt
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-600">Are you sure?</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowConfirm(false)}
        disabled={isDeleting}
      >
        Cancel
      </Button>
      <Button
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        {isDeleting ? "Deleting..." : "Yes, Delete"}
      </Button>
    </div>
  );
}
