"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2 } from "lucide-react";

const CATEGORIES = [
  "Groceries",
  "Electronics",
  "Dining",
  "Medicine",
  "Household",
  "Personal Care",
  "Travel",
  "Entertainment",
  "General",
];

interface LineItem {
  id: string;
  itemName: string;
  quantity: string;
  unitPrice: string;
  category: string;
}

function newItem(): LineItem {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    itemName: "",
    quantity: "1",
    unitPrice: "",
    category: "General",
  };
}

export default function ManualEntryPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [storeName, setStoreName] = useState("");
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split("T")[0]);
  const [items, setItems] = useState<LineItem[]>([newItem()]);
  const [submitting, setSubmitting] = useState(false);

  const addItem = () => setItems((prev) => [...prev, newItem()]);

  const removeItem = (id: string) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));

  const updateItem = (id: string, field: keyof LineItem, value: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const totalAmount = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 1;
    const price = parseFloat(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeName.trim()) {
      toast({ title: "Store name is required", variant: "destructive" });
      return;
    }

    const validItems = items.filter(
      (i) => i.itemName.trim() && parseFloat(i.unitPrice) > 0
    );

    if (validItems.length === 0) {
      toast({ title: "Add at least one item with a name and price", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: storeName.trim(),
          receiptDate,
          totalAmount,
          source: "manual",
          items: validItems.map((i) => ({
            itemName: i.itemName.trim(),
            quantity: parseFloat(i.quantity) || 1,
            unitPrice: parseFloat(i.unitPrice) || 0,
            lineTotal: (parseFloat(i.quantity) || 1) * (parseFloat(i.unitPrice) || 0),
            category: i.category,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save receipt");
      }

      const data = await res.json();
      toast({ title: "Receipt saved successfully" });
      router.push(`/receipts/${data.id}`);
    } catch (err) {
      toast({
        title: "Failed to save receipt",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manual Entry</h1>
        <p className="text-slate-500 mt-1">Add a receipt by entering the details manually</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Receipt Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Whole Foods, Target"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiptDate">Date</Label>
                <Input
                  id="receiptDate"
                  type="date"
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Line Items</CardTitle>
            <CardDescription>Add each item from the receipt</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-12 sm:col-span-4 space-y-1">
                  {index === 0 && (
                    <Label className="text-xs text-slate-500">Item Name</Label>
                  )}
                  <Input
                    value={item.itemName}
                    onChange={(e) => updateItem(item.id, "itemName", e.target.value)}
                    placeholder="Item name"
                  />
                </div>
                <div className="col-span-3 sm:col-span-2 space-y-1">
                  {index === 0 && <Label className="text-xs text-slate-500">Qty</Label>}
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                    placeholder="1"
                  />
                </div>
                <div className="col-span-4 sm:col-span-2 space-y-1">
                  {index === 0 && <Label className="text-xs text-slate-500">Price ($)</Label>}
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, "unitPrice", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="col-span-4 sm:col-span-3 space-y-1">
                  {index === 0 && <Label className="text-xs text-slate-500">Category</Label>}
                  <Select
                    value={item.category}
                    onValueChange={(v) => updateItem(item.id, "category", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1 space-y-1">
                  {index === 0 && <div className="h-4" />}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              className="w-full border-dashed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-sm font-medium text-slate-600">Total</span>
              <span className="text-lg font-bold text-slate-900">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Saving..." : "Save Receipt"}
        </Button>
      </form>
    </div>
  );
}
