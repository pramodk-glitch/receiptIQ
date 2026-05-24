import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ReceiptUpload } from "@/components/receipts/ReceiptUpload";

export default function UploadPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Upload Receipt</h1>
        <p className="text-slate-500 mt-1">
          Upload a receipt image and let AI extract the line items automatically
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Receipt Image</CardTitle>
          <CardDescription>
            Our AI will analyze the image and extract store name, date, items, prices, and categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReceiptUpload />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">How it works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-slate-50">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold mb-2">
                  1
                </div>
                <p className="text-sm font-medium text-slate-700">Upload Image</p>
                <p className="text-xs text-slate-400 mt-1">Drag & drop or select a photo</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-slate-50">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold mb-2">
                  2
                </div>
                <p className="text-sm font-medium text-slate-700">AI Processes</p>
                <p className="text-xs text-slate-400 mt-1">Claude Vision extracts all data</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-slate-50">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold mb-2">
                  3
                </div>
                <p className="text-sm font-medium text-slate-700">Review & Track</p>
                <p className="text-xs text-slate-400 mt-1">See categorized line items</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
